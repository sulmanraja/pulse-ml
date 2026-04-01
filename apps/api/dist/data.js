"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModels = getModels;
exports.getIncidents = getIncidents;
exports.getIncidentById = getIncidentById;
exports.getDeployments = getDeployments;
exports.getDashboard = getDashboard;
const models = [
    {
        id: 'mdl-home-ranker',
        name: 'Home Ranker',
        useCase: 'Personalization',
        latencyP95Ms: 126,
        errorRatePct: 0.42,
        qps: 18500,
        driftScore: 0.11,
        costPerHour: 214.7,
        status: 'healthy'
    },
    {
        id: 'mdl-artwork-llm',
        name: 'Artwork Metadata LLM',
        useCase: 'Content understanding',
        latencyP95Ms: 845,
        errorRatePct: 1.93,
        qps: 490,
        driftScore: 0.39,
        costPerHour: 162.4,
        status: 'warning'
    },
    {
        id: 'mdl-payments-risk',
        name: 'Payments Risk',
        useCase: 'Commerce risk scoring',
        latencyP95Ms: 201,
        errorRatePct: 3.4,
        qps: 2200,
        driftScore: 0.67,
        costPerHour: 98.1,
        status: 'critical'
    },
    {
        id: 'mdl-ads-bandit',
        name: 'Ads Bandit Controller',
        useCase: 'Ad allocation',
        latencyP95Ms: 159,
        errorRatePct: 0.71,
        qps: 9400,
        driftScore: 0.17,
        costPerHour: 143.2,
        status: 'healthy'
    }
];
const incidents = [
    {
        id: 'inc-1024',
        title: 'Payments risk false positives spiking in LATAM',
        modelId: 'mdl-payments-risk',
        modelName: 'Payments Risk',
        severity: 'critical',
        status: 'investigating',
        owner: 'Fraud Platform',
        startedAt: '2026-03-31 09:18 CT',
        suspectedCause: 'Feature freshness regression after deployment',
        description: 'Charge approvals dropped for multiple LATAM markets after a new feature transformation rollout.'
    },
    {
        id: 'inc-1025',
        title: 'Artwork tagging latency above SLO',
        modelId: 'mdl-artwork-llm',
        modelName: 'Artwork Metadata LLM',
        severity: 'warning',
        status: 'mitigating',
        owner: 'Studio ML Tools',
        startedAt: '2026-03-31 10:02 CT',
        suspectedCause: 'Prompt template expansion increased output tokens',
        description: 'Inference latency regressed after an updated instruction template was rolled out to 50% of traffic.'
    }
];
const deployments = [
    {
        id: 'dep-9001',
        modelId: 'mdl-payments-risk',
        modelName: 'Payments Risk',
        version: 'v2026.03.31.1',
        deployedAt: '2026-03-31 08:55 CT',
        rolloutPercent: 100,
        riskLevel: 'critical',
        notes: 'Added refreshed merchant risk features and stricter fraud thresholds.'
    },
    {
        id: 'dep-9002',
        modelId: 'mdl-artwork-llm',
        modelName: 'Artwork Metadata LLM',
        version: 'prompt-r42',
        deployedAt: '2026-03-31 09:40 CT',
        rolloutPercent: 50,
        riskLevel: 'warning',
        notes: 'Updated instruction template for richer genre and mood extraction.'
    },
    {
        id: 'dep-9003',
        modelId: 'mdl-home-ranker',
        modelName: 'Home Ranker',
        version: 'v2026.03.30.4',
        deployedAt: '2026-03-30 17:15 CT',
        rolloutPercent: 100,
        riskLevel: 'healthy',
        notes: 'Refreshed collaborative features and retrained embeddings.'
    }
];
function getModels() {
    return models;
}
function getIncidents(filters = {}) {
    return getCorrelatedIncidents().filter((incident) => {
        if (filters.severity && incident.severity !== filters.severity) {
            return false;
        }
        if (filters.status && incident.status !== filters.status) {
            return false;
        }
        if (filters.modelId && incident.modelId !== filters.modelId) {
            return false;
        }
        return true;
    });
}
function getIncidentById(id) {
    return getCorrelatedIncidents().find((incident) => incident.id === id);
}
function getDeployments() {
    return deployments;
}
function getDashboard() {
    const healthyModels = models.filter((m) => m.status === 'healthy').length;
    const hourlyCost = models.reduce((sum, model) => sum + model.costPerHour, 0);
    const correlatedIncidents = getCorrelatedIncidents();
    return {
        summary: {
            totalModels: models.length,
            healthyModels,
            openIncidents: correlatedIncidents.filter((i) => i.status !== 'resolved').length,
            criticalAlerts: models.filter((m) => m.status === 'critical').length,
            hourlyCost
        },
        models,
        incidents: correlatedIncidents,
        deployments
    };
}
function getCorrelatedIncidents() {
    return incidents.map((incident) => ({
        ...incident,
        relatedDeployment: getNearestRelatedDeployment(incident)
    }));
}
function getNearestRelatedDeployment(incident) {
    const incidentTime = parseSeedTimestamp(incident.startedAt);
    const matchingDeployments = deployments
        .filter((deployment) => deployment.modelId === incident.modelId)
        .map((deployment) => ({
        deployment,
        distance: Math.abs(parseSeedTimestamp(deployment.deployedAt) - incidentTime)
    }))
        .sort((left, right) => left.distance - right.distance);
    const match = matchingDeployments[0]?.deployment;
    if (!match) {
        return undefined;
    }
    return {
        id: match.id,
        version: match.version,
        deployedAt: match.deployedAt,
        rolloutPercent: match.rolloutPercent,
        riskLevel: match.riskLevel
    };
}
function parseSeedTimestamp(value) {
    const match = value.match(/^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2}) (?<hour>\d{2}):(?<minute>\d{2}) [A-Z]{2}$/);
    if (!match?.groups) {
        return Number.NEGATIVE_INFINITY;
    }
    const { year, month, day, hour, minute } = match.groups;
    return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}
