export type HealthStatus = 'healthy' | 'warning' | 'critical';
export type IncidentSeverity = 'info' | 'warning' | 'critical';
export type IncidentStatus = 'investigating' | 'mitigating' | 'resolved';
export type DriftTimeframe = '24h' | '7d' | '30d';
export type DemoRole = 'ml-engineer' | 'data-scientist' | 'platform-engineer' | 'admin';

export interface ModelSummary {
  id: string;
  name: string;
  useCase: string;
  latencyP95Ms: number;
  errorRatePct: number;
  qps: number;
  driftScore: number;
  costPerHour: number;
  status: HealthStatus;
}

export interface IncidentRelatedDeployment {
  id: string;
  version: string;
  deployedAt: string;
  rolloutPercent: number;
  riskLevel: HealthStatus;
}

export interface Incident {
  id: string;
  title: string;
  modelId: string;
  modelName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  owner: string;
  startedAt: string;
  suspectedCause: string;
  description: string;
  relatedDeployment?: IncidentRelatedDeployment;
}

export interface IncidentFilters {
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  modelId?: string;
}

export interface DashboardViewState {
  incidents: IncidentFilters;
}

export interface SavedDashboardView {
  id: string;
  name: string;
  state: DashboardViewState;
  createdAt: string;
}

export interface CreateSavedDashboardViewInput {
  name: string;
  state: DashboardViewState;
}

export interface DriftFilters {
  modelId?: string;
  timeframe?: DriftTimeframe;
  metricType?: 'feature' | 'prediction';
  metricKey?: string;
}

export interface DriftSeriesPoint {
  label: string;
  value: number;
  threshold: number;
}

export interface FeatureDriftMetric {
  feature: string;
  psi: number;
  status: HealthStatus;
  topShift: string;
}

export interface PredictionDriftMetric {
  metric: string;
  currentValue: number;
  baselineValue: number;
  deltaPct: number;
  status: HealthStatus;
}

export interface DriftDrilldownSlice {
  slice: string;
  value: number;
  deltaPct: number;
}

export interface DriftDrilldown {
  metricType: 'feature' | 'prediction';
  metricKey: string;
  title: string;
  summary: string;
  recommendedAction: string;
  affectedSlices: DriftDrilldownSlice[];
}

export interface DriftAnalysisSnapshot {
  modelId: string;
  modelName: string;
  timeframe: DriftTimeframe;
  featureDrift: FeatureDriftMetric[];
  predictionDrift: PredictionDriftMetric[];
  featureTrend: DriftSeriesPoint[];
  predictionTrend: DriftSeriesPoint[];
  drilldown: DriftDrilldown;
}

export interface DeploymentEvent {
  id: string;
  modelId: string;
  modelName: string;
  version: string;
  deployedAt: string;
  rolloutPercent: number;
  riskLevel: HealthStatus;
  notes: string;
}

export interface DashboardSnapshot {
  summary: {
    totalModels: number;
    healthyModels: number;
    openIncidents: number;
    criticalAlerts: number;
    hourlyCost: number;
  };
  models: ModelSummary[];
  incidents: Incident[];
  deployments: DeploymentEvent[];
}
