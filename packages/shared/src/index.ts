export type HealthStatus = 'healthy' | 'warning' | 'critical';

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

export interface Incident {
  id: string;
  title: string;
  modelId: string;
  modelName: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'investigating' | 'mitigating' | 'resolved';
  owner: string;
  startedAt: string;
  suspectedCause: string;
  description: string;
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
