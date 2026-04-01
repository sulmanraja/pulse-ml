"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const data_1 = require("./data");
const savedViews_1 = require("./savedViews");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({ ok: true, mode: 'demo' });
});
app.get('/dashboard', (_req, res) => {
    res.json((0, data_1.getDashboard)());
});
app.get('/models', (_req, res) => {
    res.json((0, data_1.getModels)());
});
app.get('/incidents', (req, res) => {
    const filters = getIncidentFilters(req.query);
    if (!filters) {
        res.status(400).json({ error: 'Invalid incident filters' });
        return;
    }
    res.json((0, data_1.getIncidents)(filters));
});
app.get('/incidents/:id', (req, res) => {
    const incident = (0, data_1.getIncidentById)(req.params.id);
    if (!incident) {
        res.status(404).json({ error: 'Incident not found' });
        return;
    }
    res.json(incident);
});
app.get('/deployments', (_req, res) => {
    res.json((0, data_1.getDeployments)());
});
app.get('/saved-views', (_req, res) => {
    res.json(savedViews_1.savedDashboardViewsRepository.list());
});
app.post('/saved-views', (req, res) => {
    const input = getCreateSavedDashboardViewInput(req.body);
    if (!input) {
        res.status(400).json({ error: 'Invalid saved view payload' });
        return;
    }
    res.status(201).json(savedViews_1.savedDashboardViewsRepository.create(input));
});
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
    console.log(`PulseML API listening on http://localhost:${port}`);
});
function getIncidentFilters(query) {
    const severity = getEnumValue(query.severity, ['info', 'warning', 'critical']);
    const status = getEnumValue(query.status, ['investigating', 'mitigating', 'resolved']);
    const modelId = getOptionalString(query.modelId);
    if (query.severity !== undefined && severity === null) {
        return null;
    }
    if (query.status !== undefined && status === null) {
        return null;
    }
    if (query.modelId !== undefined && modelId === null) {
        return null;
    }
    return {
        severity: severity ?? undefined,
        status: status ?? undefined,
        modelId: modelId ?? undefined
    };
}
function getCreateSavedDashboardViewInput(value) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    const payload = value;
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    if (!name) {
        return null;
    }
    const incidents = getIncidentFilters(payload.state?.incidents ?? {});
    if (incidents === null) {
        return null;
    }
    return {
        name,
        state: {
            incidents: incidents ?? {}
        }
    };
}
function getEnumValue(value, allowed) {
    if (value === undefined || value === '') {
        return undefined;
    }
    if (typeof value !== 'string') {
        return null;
    }
    return allowed.includes(value) ? value : null;
}
function getOptionalString(value) {
    if (value === undefined || value === '') {
        return undefined;
    }
    return typeof value === 'string' ? value : null;
}
