import { DashboardSnapshot } from '@pulseml/shared';
import { MetricCard } from '../components/MetricCard';
import { apiFetch } from '../components/api';
import { EmptyState } from '../components/EmptyState';

export default async function OverviewPage() {
  const data = await apiFetch<DashboardSnapshot>('/dashboard');
  const criticalModels = data.models.filter((model) => model.status === 'critical').length;
  const degradedModels = data.models.filter((model) => model.status !== 'healthy').length;

  return (
    <div className="grid overview-page" style={{ gap: 20 }}>
      <header className="header">
        <div className="overview-title">
          <div className="eyebrow">Model observability control plane</div>
          <h2 className="title">Overview</h2>
          <p className="subtitle">System-wide model health, active incidents, and release risk in one operating view.</p>
        </div>
        <div className="overview-header-meta">
          <div className="badge info">Demo mode · seeded data</div>
          <div className="muted">Local API snapshot</div>
        </div>
      </header>

      <section className="grid grid-4 overview-summary-grid">
        <MetricCard
          title="Fleet health"
          value={`${data.summary.healthyModels}/${data.summary.totalModels}`}
          subtitle={`${degradedModels} models need attention`}
          tone={degradedModels > 0 ? 'warn' : 'ok'}
        />
        <MetricCard
          title="Open incidents"
          value={`${data.summary.openIncidents}`}
          subtitle="Investigating and mitigating now"
          tone={data.summary.openIncidents > 0 ? 'critical' : 'ok'}
        />
        <MetricCard
          title="Critical exposure"
          value={`${criticalModels}`}
          subtitle="Models in critical health state"
          tone={criticalModels > 0 ? 'critical' : 'ok'}
        />
        <MetricCard
          title="Hourly cost"
          value={`$${data.summary.hourlyCost.toFixed(0)}`}
          subtitle="Estimated aggregate inference spend"
          tone="info"
        />
      </section>

      <section className="grid grid-2 overview-main-grid">
        <div className="card overview-card">
          <div className="section-heading">
            <div>
              <h3>Model Health Snapshot</h3>
              <p className="muted section-subtitle">Fast scan of latency, reliability, drift, and cost.</p>
            </div>
            <div className="section-chip">Operational view</div>
          </div>
          {data.models.length === 0 ? (
            <EmptyState
              title="No model health signals"
              message="Add seeded model summaries to populate the overview."
            />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Use case</th>
                  <th>Latency</th>
                  <th>Error</th>
                  <th>Drift</th>
                  <th>Cost/hr</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.models.map((model) => (
                  <tr key={model.id}>
                    <td>
                      <div className="table-primary">{model.name}</div>
                    </td>
                    <td className="muted">{model.useCase}</td>
                    <td>{model.latencyP95Ms} ms</td>
                    <td>{model.errorRatePct.toFixed(2)}%</td>
                    <td>
                      <div className="table-primary">{model.driftScore.toFixed(2)}</div>
                      <div className="spark" />
                    </td>
                    <td>${model.costPerHour.toFixed(2)}</td>
                    <td><span className={`badge ${model.status === 'critical' ? 'critical' : model.status === 'warning' ? 'warn' : 'ok'}`}>{model.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="grid overview-side-stack">
          <div className="card overview-card">
            <div className="section-heading">
              <div>
                <h3>Recent Incidents</h3>
                <p className="muted section-subtitle">Ownership and suspected causes for active issues.</p>
              </div>
              <div className="section-chip">Triage</div>
            </div>
            {data.incidents.length === 0 ? (
              <EmptyState
                title="No recent incidents"
                message="The demo dataset currently has no incidents in flight."
              />
            ) : (
              <div className="stack-list">
                {data.incidents.map((incident) => (
                  <article key={incident.id} className="stack-item">
                    <div className="stack-row">
                      <div className="stack-title">{incident.title}</div>
                      <span className={`badge ${incident.severity === 'critical' ? 'critical' : incident.severity === 'warning' ? 'warn' : 'info'}`}>{incident.severity}</span>
                    </div>
                    <div className="stack-meta">
                      <span>{incident.modelName}</span>
                      <span>{incident.owner}</span>
                      <span>{incident.startedAt}</span>
                    </div>
                    <div className="stack-detail">
                      <span className="badge info">{incident.status}</span>
                      <span className="muted">{incident.suspectedCause}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="card overview-card">
            <div className="section-heading">
              <div>
                <h3>Recent Deployments</h3>
                <p className="muted section-subtitle">Release timing and rollout risk for recent changes.</p>
              </div>
              <div className="section-chip">Change log</div>
            </div>
            {data.deployments.length === 0 ? (
              <EmptyState
                title="No recent deployments"
                message="Deployment correlation will appear here when demo events are available."
              />
            ) : (
              <div className="stack-list">
                {data.deployments.map((deployment) => (
                  <article key={deployment.id} className="stack-item">
                    <div className="stack-row">
                      <div className="stack-title">{deployment.modelName}</div>
                      <span className={`badge ${deployment.riskLevel === 'critical' ? 'critical' : deployment.riskLevel === 'warning' ? 'warn' : 'ok'}`}>{deployment.riskLevel}</span>
                    </div>
                    <div className="stack-meta">
                      <span>{deployment.version}</span>
                      <span>{deployment.deployedAt}</span>
                      <span>{deployment.rolloutPercent}% rollout</span>
                    </div>
                    <p className="muted stack-note">{deployment.notes}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
