import cors from 'cors';
import express from 'express';
import {
  CreateSavedDashboardViewInput,
  DashboardViewState,
  IncidentFilters,
  IncidentSeverity,
  IncidentStatus
} from '@pulseml/shared';
import { getDashboard, getDeployments, getIncidentById, getIncidents, getModels } from './data';
import { savedDashboardViewsRepository } from './savedViews';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, mode: 'demo' });
});

app.get('/dashboard', (_req, res) => {
  res.json(getDashboard());
});

app.get('/models', (_req, res) => {
  res.json(getModels());
});

app.get('/incidents', (req, res) => {
  const filters = getIncidentFilters(req.query);
  if (!filters) {
    res.status(400).json({ error: 'Invalid incident filters' });
    return;
  }

  res.json(getIncidents(filters));
});

app.get('/incidents/:id', (req, res) => {
  const incident = getIncidentById(req.params.id);
  if (!incident) {
    res.status(404).json({ error: 'Incident not found' });
    return;
  }

  res.json(incident);
});

app.get('/deployments', (_req, res) => {
  res.json(getDeployments());
});

app.get('/saved-views', (_req, res) => {
  res.json(savedDashboardViewsRepository.list());
});

app.post('/saved-views', (req, res) => {
  const input = getCreateSavedDashboardViewInput(req.body);
  if (!input) {
    res.status(400).json({ error: 'Invalid saved view payload' });
    return;
  }

  res.status(201).json(savedDashboardViewsRepository.create(input));
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`PulseML API listening on http://localhost:${port}`);
});

function getIncidentFilters(query: {
  severity?: unknown;
  status?: unknown;
  modelId?: unknown;
}): IncidentFilters | null {
  const severity = getEnumValue<IncidentSeverity>(query.severity, ['info', 'warning', 'critical']);
  const status = getEnumValue<IncidentStatus>(query.status, ['investigating', 'mitigating', 'resolved']);
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

function getCreateSavedDashboardViewInput(value: unknown): CreateSavedDashboardViewInput | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const payload = value as {
    name?: unknown;
    state?: DashboardViewState;
  };
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

function getEnumValue<T extends string>(value: unknown, allowed: readonly T[]): T | null | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    return null;
  }

  return allowed.includes(value as T) ? (value as T) : null;
}

function getOptionalString(value: unknown): string | null | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  return typeof value === 'string' ? value : null;
}
