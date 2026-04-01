import {
  DriftAnalysisSnapshot,
  DriftDrilldown,
  DriftFilters,
  DriftTimeframe,
  DriftSeriesPoint,
  DashboardSnapshot,
  DeploymentEvent,
  FeatureDriftMetric,
  Incident,
  IncidentFilters,
  IncidentRelatedDeployment,
  ModelSummary,
  PredictionDriftMetric
} from '@pulseml/shared';

const models: ModelSummary[] = [
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

const incidents: Incident[] = [
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

const deployments: DeploymentEvent[] = [
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

const driftSeeds: Record<
  string,
  {
    featureDrift: FeatureDriftMetric[];
    predictionDrift: PredictionDriftMetric[];
    featureTrend: DriftSeriesPoint[];
    predictionTrend: DriftSeriesPoint[];
    featureDrilldowns: Record<string, Omit<DriftDrilldown, 'metricType' | 'metricKey'>>;
    predictionDrilldowns: Record<string, Omit<DriftDrilldown, 'metricType' | 'metricKey'>>;
  }
> = {
  'mdl-home-ranker': {
    featureDrift: [
      { feature: 'session_recency_hours', psi: 0.14, status: 'healthy', topShift: 'New-user traffic mix up 6%' },
      { feature: 'embedding_similarity', psi: 0.22, status: 'warning', topShift: 'Cold-start impressions up 11%' },
      { feature: 'supply_region', psi: 0.09, status: 'healthy', topShift: 'APAC inventory share up 4%' }
    ],
    predictionDrift: [
      { metric: 'click_through_rate', currentValue: 0.084, baselineValue: 0.081, deltaPct: 3.7, status: 'healthy' },
      { metric: 'ranker_score_mean', currentValue: 0.63, baselineValue: 0.58, deltaPct: 8.6, status: 'warning' }
    ],
    featureTrend: [
      { label: 'T-6', value: 0.09, threshold: 0.2 },
      { label: 'T-5', value: 0.1, threshold: 0.2 },
      { label: 'T-4', value: 0.11, threshold: 0.2 },
      { label: 'T-3', value: 0.13, threshold: 0.2 },
      { label: 'T-2', value: 0.16, threshold: 0.2 },
      { label: 'T-1', value: 0.22, threshold: 0.2 }
    ],
    predictionTrend: [
      { label: 'T-6', value: 1.5, threshold: 5 },
      { label: 'T-5', value: 2.2, threshold: 5 },
      { label: 'T-4', value: 2.8, threshold: 5 },
      { label: 'T-3', value: 4.1, threshold: 5 },
      { label: 'T-2', value: 6.4, threshold: 5 },
      { label: 'T-1', value: 8.6, threshold: 5 }
    ],
    featureDrilldowns: {
      embedding_similarity: {
        title: 'Embedding similarity drift',
        summary: 'Similarity scores are widening as cold-start inventory enters ranking traffic more often.',
        recommendedAction: 'Compare cold-start bucket traffic with the March 30 rollout and retrain the freshness normalization layer if the shift holds.',
        affectedSlices: [
          { slice: 'Cold-start visitors', value: 0.31, deltaPct: 18 },
          { slice: 'APAC feed', value: 0.27, deltaPct: 11 },
          { slice: 'Returning power users', value: 0.14, deltaPct: 4 }
        ]
      }
    },
    predictionDrilldowns: {
      ranker_score_mean: {
        title: 'Ranker score mean drift',
        summary: 'Mean ranker confidence is trending upward, suggesting calibration drift in candidate scoring.',
        recommendedAction: 'Review calibration curves by traffic cohort and validate whether candidate scarcity is inflating confidence.',
        affectedSlices: [
          { slice: 'New sessions', value: 0.69, deltaPct: 13 },
          { slice: 'Email referrals', value: 0.66, deltaPct: 9 },
          { slice: 'Signed-in users', value: 0.61, deltaPct: 5 }
        ]
      }
    }
  },
  'mdl-artwork-llm': {
    featureDrift: [
      { feature: 'prompt_token_count', psi: 0.41, status: 'critical', topShift: 'Instruction template expanded 24%' },
      { feature: 'image_resolution_bucket', psi: 0.21, status: 'warning', topShift: 'High-res studio uploads up 9%' },
      { feature: 'language_locale', psi: 0.16, status: 'healthy', topShift: 'EU captions mix up 5%' }
    ],
    predictionDrift: [
      { metric: 'genre_entropy', currentValue: 1.91, baselineValue: 1.62, deltaPct: 17.9, status: 'critical' },
      { metric: 'label_count_mean', currentValue: 7.4, baselineValue: 6.2, deltaPct: 19.4, status: 'warning' }
    ],
    featureTrend: [
      { label: 'T-6', value: 0.18, threshold: 0.2 },
      { label: 'T-5', value: 0.22, threshold: 0.2 },
      { label: 'T-4', value: 0.28, threshold: 0.2 },
      { label: 'T-3', value: 0.31, threshold: 0.2 },
      { label: 'T-2', value: 0.36, threshold: 0.2 },
      { label: 'T-1', value: 0.41, threshold: 0.2 }
    ],
    predictionTrend: [
      { label: 'T-6', value: 4.5, threshold: 5 },
      { label: 'T-5', value: 6.9, threshold: 5 },
      { label: 'T-4', value: 9.2, threshold: 5 },
      { label: 'T-3', value: 11.4, threshold: 5 },
      { label: 'T-2', value: 14.1, threshold: 5 },
      { label: 'T-1', value: 17.9, threshold: 5 }
    ],
    featureDrilldowns: {
      prompt_token_count: {
        title: 'Prompt token count drift',
        summary: 'The latest prompt template increased instruction length and shifted the model toward longer generation contexts.',
        recommendedAction: 'Compare token expansion between prompt-r42 and the prior template, then cap optional style clauses for large images.',
        affectedSlices: [
          { slice: 'Editorial uploads', value: 0.48, deltaPct: 28 },
          { slice: 'Batch catalog ingestion', value: 0.44, deltaPct: 22 },
          { slice: 'Mobile captures', value: 0.27, deltaPct: 9 }
        ]
      }
    },
    predictionDrilldowns: {
      genre_entropy: {
        title: 'Genre entropy drift',
        summary: 'Predicted genre distributions have broadened, indicating less stable label confidence after the prompt update.',
        recommendedAction: 'Inspect prompt outputs for over-broad descriptor lists and re-run evaluation on the style-heavy validation slices.',
        affectedSlices: [
          { slice: 'Illustration assets', value: 2.14, deltaPct: 24 },
          { slice: 'Music cover art', value: 2.02, deltaPct: 19 },
          { slice: 'Photography uploads', value: 1.73, deltaPct: 8 }
        ]
      }
    }
  },
  'mdl-payments-risk': {
    featureDrift: [
      { feature: 'merchant_risk_freshness_minutes', psi: 0.52, status: 'critical', topShift: 'Late freshness joins up 31%' },
      { feature: 'geo_region', psi: 0.29, status: 'warning', topShift: 'LATAM transaction share up 14%' },
      { feature: 'device_trust_score', psi: 0.18, status: 'healthy', topShift: 'Guest checkout traffic up 5%' }
    ],
    predictionDrift: [
      { metric: 'fraud_score_mean', currentValue: 0.74, baselineValue: 0.58, deltaPct: 27.6, status: 'critical' },
      { metric: 'approval_rate', currentValue: 0.82, baselineValue: 0.91, deltaPct: -9.9, status: 'critical' }
    ],
    featureTrend: [
      { label: 'T-6', value: 0.16, threshold: 0.2 },
      { label: 'T-5', value: 0.19, threshold: 0.2 },
      { label: 'T-4', value: 0.25, threshold: 0.2 },
      { label: 'T-3', value: 0.34, threshold: 0.2 },
      { label: 'T-2', value: 0.45, threshold: 0.2 },
      { label: 'T-1', value: 0.52, threshold: 0.2 }
    ],
    predictionTrend: [
      { label: 'T-6', value: 5.1, threshold: 5 },
      { label: 'T-5', value: 8.7, threshold: 5 },
      { label: 'T-4', value: 13.6, threshold: 5 },
      { label: 'T-3', value: 18.2, threshold: 5 },
      { label: 'T-2', value: 22.7, threshold: 5 },
      { label: 'T-1', value: 27.6, threshold: 5 }
    ],
    featureDrilldowns: {
      merchant_risk_freshness_minutes: {
        title: 'Merchant freshness drift',
        summary: 'Freshness joins are arriving later than baseline, especially in the LATAM payment path after the feature rollout.',
        recommendedAction: 'Trace freshness materialization by region and compare the feature join latency against the 08:55 CT deployment.',
        affectedSlices: [
          { slice: 'LATAM card-not-present', value: 0.63, deltaPct: 34 },
          { slice: 'New merchants', value: 0.58, deltaPct: 29 },
          { slice: 'Cross-border orders', value: 0.47, deltaPct: 19 }
        ]
      }
    },
    predictionDrilldowns: {
      approval_rate: {
        title: 'Approval rate drift',
        summary: 'Approval rates dropped sharply as the risk model scored more traffic above the fraud threshold.',
        recommendedAction: 'Compare score distributions before and after the deployment, then validate freshness regressions in the merchant-risk features.',
        affectedSlices: [
          { slice: 'LATAM debit', value: 0.74, deltaPct: -16 },
          { slice: 'Cross-border cards', value: 0.79, deltaPct: -11 },
          { slice: 'Returning buyers', value: 0.86, deltaPct: -6 }
        ]
      }
    }
  },
  'mdl-ads-bandit': {
    featureDrift: [
      { feature: 'auction_density', psi: 0.12, status: 'healthy', topShift: 'Weekend campaign overlap up 5%' },
      { feature: 'bid_floor_bucket', psi: 0.18, status: 'healthy', topShift: 'Premium inventory share up 6%' },
      { feature: 'creative_quality_score', psi: 0.2, status: 'warning', topShift: 'New creative pool up 8%' }
    ],
    predictionDrift: [
      { metric: 'allocation_entropy', currentValue: 0.44, baselineValue: 0.41, deltaPct: 7.3, status: 'warning' },
      { metric: 'ctr_uplift_estimate', currentValue: 0.068, baselineValue: 0.066, deltaPct: 3, status: 'healthy' }
    ],
    featureTrend: [
      { label: 'T-6', value: 0.08, threshold: 0.2 },
      { label: 'T-5', value: 0.11, threshold: 0.2 },
      { label: 'T-4', value: 0.13, threshold: 0.2 },
      { label: 'T-3', value: 0.16, threshold: 0.2 },
      { label: 'T-2', value: 0.18, threshold: 0.2 },
      { label: 'T-1', value: 0.2, threshold: 0.2 }
    ],
    predictionTrend: [
      { label: 'T-6', value: 1.8, threshold: 5 },
      { label: 'T-5', value: 2.4, threshold: 5 },
      { label: 'T-4', value: 3.7, threshold: 5 },
      { label: 'T-3', value: 4.5, threshold: 5 },
      { label: 'T-2', value: 5.9, threshold: 5 },
      { label: 'T-1', value: 7.3, threshold: 5 }
    ],
    featureDrilldowns: {
      creative_quality_score: {
        title: 'Creative quality score drift',
        summary: 'The creative mix shifted toward newly launched campaigns with less historical engagement signal.',
        recommendedAction: 'Audit campaign launch cohorts and increase guardrails for low-history creatives in premium auctions.',
        affectedSlices: [
          { slice: 'Premium video ads', value: 0.24, deltaPct: 10 },
          { slice: 'Weekend campaigns', value: 0.22, deltaPct: 8 },
          { slice: 'Retargeting pools', value: 0.17, deltaPct: 4 }
        ]
      }
    },
    predictionDrilldowns: {
      allocation_entropy: {
        title: 'Allocation entropy drift',
        summary: 'The bandit is spreading traffic across more creatives than baseline, reducing concentration.',
        recommendedAction: 'Review exploration rate by placement and cap exploration for high-revenue premium auctions.',
        affectedSlices: [
          { slice: 'Homepage masthead', value: 0.52, deltaPct: 11 },
          { slice: 'Feed placements', value: 0.46, deltaPct: 7 },
          { slice: 'Search ads', value: 0.39, deltaPct: 3 }
        ]
      }
    }
  }
};

export function getModels(): ModelSummary[] {
  return models;
}

export function getIncidents(filters: IncidentFilters = {}): Incident[] {
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

export function getIncidentById(id: string): Incident | undefined {
  return getCorrelatedIncidents().find((incident) => incident.id === id);
}

export function getDeployments(): DeploymentEvent[] {
  return deployments;
}

export function getDashboard(): DashboardSnapshot {
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

export function getDriftAnalysis(filters: DriftFilters = {}): DriftAnalysisSnapshot {
  const model = getSelectedModel(filters.modelId);
  const timeframe = filters.timeframe ?? '7d';
  const seed = driftSeeds[model.id];

  const featureDrift = scaleFeatureDrift(seed.featureDrift, timeframe);
  const predictionDrift = scalePredictionDrift(seed.predictionDrift, timeframe);
  const featureTrend = scaleTrend(seed.featureTrend, timeframe);
  const predictionTrend = scaleTrend(seed.predictionTrend, timeframe);

  return {
    modelId: model.id,
    modelName: model.name,
    timeframe,
    featureDrift,
    predictionDrift,
    featureTrend,
    predictionTrend,
    drilldown: getDrilldown(seed, {
      metricType: filters.metricType,
      metricKey: filters.metricKey,
      featureDrift,
      predictionDrift
    })
  };
}

function getCorrelatedIncidents(): Incident[] {
  return incidents.map((incident) => ({
    ...incident,
    relatedDeployment: getNearestRelatedDeployment(incident)
  }));
}

function getNearestRelatedDeployment(incident: Incident): IncidentRelatedDeployment | undefined {
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

function parseSeedTimestamp(value: string): number {
  const match = value.match(
    /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2}) (?<hour>\d{2}):(?<minute>\d{2}) [A-Z]{2}$/
  );

  if (!match?.groups) {
    return Number.NEGATIVE_INFINITY;
  }

  const { year, month, day, hour, minute } = match.groups;
  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );
}

function getSelectedModel(modelId?: string): ModelSummary {
  return models.find((model) => model.id === modelId) ?? models[0];
}

function scaleFeatureDrift(metrics: FeatureDriftMetric[], timeframe: DriftTimeframe): FeatureDriftMetric[] {
  const factor = getTimeframeFactor(timeframe);
  return metrics.map((metric) => {
    const psi = Number((metric.psi * factor).toFixed(2));
    return {
      ...metric,
      psi,
      status: getDriftStatus(psi)
    };
  });
}

function scalePredictionDrift(metrics: PredictionDriftMetric[], timeframe: DriftTimeframe): PredictionDriftMetric[] {
  const factor = getTimeframeFactor(timeframe);
  return metrics.map((metric) => {
    const deltaPct = Number((metric.deltaPct * factor).toFixed(1));
    return {
      ...metric,
      deltaPct,
      status: getPredictionStatus(deltaPct)
    };
  });
}

function scaleTrend(points: DriftSeriesPoint[], timeframe: DriftTimeframe): DriftSeriesPoint[] {
  const factor = getTimeframeFactor(timeframe);
  return points.map((point) => ({
    ...point,
    value: Number((point.value * factor).toFixed(2))
  }));
}

function getTimeframeFactor(timeframe: DriftTimeframe): number {
  if (timeframe === '24h') {
    return 0.72;
  }

  if (timeframe === '30d') {
    return 1.18;
  }

  return 1;
}

function getDriftStatus(value: number): ModelSummary['status'] {
  if (value >= 0.35) {
    return 'critical';
  }

  if (value >= 0.2) {
    return 'warning';
  }

  return 'healthy';
}

function getPredictionStatus(deltaPct: number): ModelSummary['status'] {
  const absolute = Math.abs(deltaPct);
  if (absolute >= 15) {
    return 'critical';
  }

  if (absolute >= 5) {
    return 'warning';
  }

  return 'healthy';
}

function getDrilldown(
  seed: (typeof driftSeeds)[string],
  options: {
    metricType?: DriftFilters['metricType'];
    metricKey?: string;
    featureDrift: FeatureDriftMetric[];
    predictionDrift: PredictionDriftMetric[];
  }
): DriftDrilldown {
  if (options.metricType === 'prediction') {
    const selectedPrediction =
      options.predictionDrift.find((metric) => metric.metric === options.metricKey) ?? options.predictionDrift[0];
    const details =
      seed.predictionDrilldowns[selectedPrediction.metric] ??
      seed.predictionDrilldowns[Object.keys(seed.predictionDrilldowns)[0]];

    return {
      metricType: 'prediction',
      metricKey: selectedPrediction.metric,
      ...details
    };
  }

  const selectedFeature =
    options.featureDrift.find((metric) => metric.feature === options.metricKey) ?? options.featureDrift[0];
  const details =
    seed.featureDrilldowns[selectedFeature.feature] ??
    seed.featureDrilldowns[Object.keys(seed.featureDrilldowns)[0]];

  return {
    metricType: 'feature',
    metricKey: selectedFeature.feature,
    ...details
  };
}
