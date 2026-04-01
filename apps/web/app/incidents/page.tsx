import Link from 'next/link';
import { Incident, IncidentSeverity, IncidentStatus, ModelSummary, SavedDashboardView } from '@pulseml/shared';
import { apiFetch } from '../../components/api';
import { EmptyState } from '../../components/EmptyState';
import { SavedViewsPanel } from '../../components/SavedViewsPanel';
import { buildRoleHref, canSaveViews, getDemoRole, getDemoRoleMeta } from '../../components/demoRole';

type IncidentsPageProps = {
  searchParams?: Promise<{
    severity?: string;
    status?: string;
    modelId?: string;
    role?: string;
  }>;
};

export default async function IncidentsPage({ searchParams }: IncidentsPageProps) {
  const params = (await searchParams) ?? {};
  const severity = getValidSeverity(params.severity);
  const status = getValidStatus(params.status);
  const modelId = typeof params.modelId === 'string' ? params.modelId : undefined;
  const role = getDemoRole(params.role);
  const roleMeta = getDemoRoleMeta(role);
  const incidentQuery = new URLSearchParams();
  if (severity) {
    incidentQuery.set('severity', severity);
  }
  if (status) {
    incidentQuery.set('status', status);
  }
  if (modelId) {
    incidentQuery.set('modelId', modelId);
  }
  const queryString = incidentQuery.toString();

  const currentFilters = {
    severity,
    status,
    modelId
  };

  const [incidents, models, savedViews] = await Promise.all([
    apiFetch<Incident[]>(`/incidents${queryString ? `?${queryString}` : ''}`),
    apiFetch<ModelSummary[]>('/models'),
    apiFetch<SavedDashboardView[]>('/saved-views')
  ]);

  return (
    <div className="grid incidents-page" style={{ gap: 20 }}>
      <header className="header">
        <div>
          <h2 className="title">Incidents</h2>
          <p className="subtitle">Filter by severity, status, and impacted model to move from triage to root cause quickly.</p>
        </div>
        <div className="overview-header-meta">
          <div className="badge info">Demo mode · seeded data</div>
          <div className="muted">{roleMeta.label}</div>
        </div>
      </header>

      <section className="card filter-card">
        <form className="incident-filters" method="get">
          <input type="hidden" name="role" value={role} />
          <label className="filter-field">
            <span className="muted tooltip-label" title="Filter incidents by impact level, from informational to critical.">Severity</span>
            <select name="severity" defaultValue={severity ?? ''} className="select">
              <option value="">All severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </label>

          <label className="filter-field">
            <span className="muted tooltip-label" title="Filter by the current workflow stage of the incident response.">Status</span>
            <select name="status" defaultValue={status ?? ''} className="select">
              <option value="">All statuses</option>
              <option value="investigating">Investigating</option>
              <option value="mitigating">Mitigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>

          <label className="filter-field">
            <span className="muted tooltip-label" title="Filter incidents down to a single impacted model.">Model</span>
            <select name="modelId" defaultValue={modelId ?? ''} className="select">
              <option value="">All models</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </label>

          <div className="filter-actions">
            <button className="button" type="submit">Apply filters</button>
            <Link className="button button-secondary" href={buildRoleHref('/incidents', role)}>Clear</Link>
          </div>
        </form>
      </section>

      <SavedViewsPanel currentFilters={currentFilters} initialViews={savedViews} role={role} />

      <section className="card incidents-results-card">
        <div className="section-heading">
          <div>
            <h3 className="tooltip-label" title="The current incident queue after server-side filtering by severity, status, and model.">Incident Queue</h3>
            <p className="muted section-subtitle">{incidents.length} incidents match the current filters.</p>
          </div>
          <div className="section-chip">{canSaveViews(role) ? 'Editable triage' : 'Role-scoped view'}</div>
        </div>

        {incidents.length === 0 ? (
          <EmptyState
            title="No incidents match these filters"
            message="Try widening severity, status, or model filters to inspect more of the demo incident queue."
          />
        ) : (
          <div className="incident-list">
            {incidents.map((incident) => (
              <article key={incident.id} className="incident-row-card">
                <div className="incident-row-top">
                  <div>
                    <div className="incident-row-title">
                      <Link href={buildRoleHref(`/incidents/${incident.id}`, role)} className="incident-link">
                        {incident.title}
                      </Link>
                    </div>
                    <div className="stack-meta">
                      <span>{incident.modelName}</span>
                      <span>{incident.owner}</span>
                      <span>{incident.startedAt}</span>
                    </div>
                  </div>
                  <div className="incident-row-badges">
                    <span className={`badge ${getSeverityClass(incident.severity)}`}>{incident.severity}</span>
                    <span className="badge info">{incident.status}</span>
                  </div>
                </div>

                <div className="incident-row-grid">
                  <div>
                    <div className="muted incident-label tooltip-label" title="The most likely cause currently suspected by responders or backend correlation logic.">Suspected cause</div>
                    <div>{incident.suspectedCause}</div>
                  </div>
                  <div>
                    <div className="muted incident-label tooltip-label" title="The nearest related deployment event for the same model, surfaced by backend correlation logic.">Correlated deployment</div>
                    {incident.relatedDeployment ? (
                      <div className="deployment-correlation">
                        <span className={`badge ${getHealthClass(incident.relatedDeployment.riskLevel)}`}>
                          {incident.relatedDeployment.version}
                        </span>
                        <span className="muted">
                          {incident.relatedDeployment.deployedAt} · {incident.relatedDeployment.rolloutPercent}% rollout
                        </span>
                      </div>
                    ) : (
                      <span className="badge info">No nearby deployment</span>
                    )}
                  </div>
                </div>

                <div className="incident-row-footer">
                  <p className="muted incident-description">{incident.description}</p>
                  <Link href={buildRoleHref(`/incidents/${incident.id}`, role)} className="button button-secondary">
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function getValidSeverity(value?: string): IncidentSeverity | undefined {
  return value === 'info' || value === 'warning' || value === 'critical' ? value : undefined;
}

function getValidStatus(value?: string): IncidentStatus | undefined {
  return value === 'investigating' || value === 'mitigating' || value === 'resolved' ? value : undefined;
}

function getSeverityClass(severity: IncidentSeverity): 'info' | 'warn' | 'critical' {
  if (severity === 'critical') {
    return 'critical';
  }

  if (severity === 'warning') {
    return 'warn';
  }

  return 'info';
}

function getHealthClass(risk: 'healthy' | 'warning' | 'critical'): 'ok' | 'warn' | 'critical' {
  if (risk === 'critical') {
    return 'critical';
  }

  if (risk === 'warning') {
    return 'warn';
  }

  return 'ok';
}
