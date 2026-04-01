import { DashboardSnapshot } from '@pulseml/shared';
import { MetricCard } from '../components/MetricCard';
import { apiFetch } from '../components/api';
import { EmptyState } from '../components/EmptyState';
import { buildRoleHref, getDemoRole, getDemoRoleMeta } from '../components/demoRole';

type OverviewPageProps = {
  searchParams?: Promise<{
    role?: string;
  }>;
};

export default async function OverviewPage({ searchParams }: OverviewPageProps) {
  const params = (await searchParams) ?? {};
  const role = getDemoRole(params.role);
  const roleMeta = getDemoRoleMeta(role);
  const data = await apiFetch<DashboardSnapshot>('/dashboard');
  const criticalModels = data.models.filter((model) => model.status === 'critical').length;
  const degradedModels = data.models.filter((model) => model.status !== 'healthy').length;
  const showModelHealth = role !== 'platform-engineer';
  const showIncidents = role !== 'data-scientist';
  const showDeployments = role !== 'data-scientist';

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
          <div className="muted">{roleMeta.label}</div>
        </div>
      </header>

      <section className="card role-summary-card">
        <div className="section-heading">
          <div>
            <h3 className="tooltip-label" title="This panel explains how the selected demo role changes the visible navigation, sections, and actions.">Role-aware demo view</h3>
            <p className="muted section-subtitle">{roleMeta.summary}</p>
          </div>
          <div className="section-chip">{roleMeta.label}</div>
        </div>
        <div className="stack-meta">
          {role === 'data-scientist' ? <span>Recommended next step: <a href={buildRoleHref('/drift', role)}>Drift Analysis</a></span> : null}
          {role === 'platform-engineer' ? <span>Recommended next step: <a href={buildRoleHref('/incidents', role)}>Incident Queue</a></span> : null}
          {role === 'admin' ? <span>Full demo surface visible for RBAC preview.</span> : null}
          {role === 'ml-engineer' ? <span>Balanced view across model health, drift, and incident response.</span> : null}
        </div>
      </section>

      <section className="grid grid-4 overview-summary-grid">
        <MetricCard
          title="Fleet health"
          value={`${data.summary.healthyModels}/${data.summary.totalModels}`}
          subtitle={`${degradedModels} models need attention`}
          description="Shows how many production models are currently healthy compared with the total monitored fleet."
          tone={degradedModels > 0 ? 'warn' : 'ok'}
        />
        <MetricCard
          title="Open incidents"
          value={`${data.summary.openIncidents}`}
          subtitle="Investigating and mitigating now"
          description="Counts unresolved incidents that are still under investigation or mitigation."
          tone={data.summary.openIncidents > 0 ? 'critical' : 'ok'}
        />
        <MetricCard
          title="Critical exposure"
          value={`${criticalModels}`}
          subtitle="Models in critical health state"
          description="Counts models whose current health status is critical based on backend summary logic."
          tone={criticalModels > 0 ? 'critical' : 'ok'}
        />
        <MetricCard
          title="Hourly cost"
          value={`$${data.summary.hourlyCost.toFixed(0)}`}
          subtitle="Estimated aggregate inference spend"
          description="Estimated total hourly serving cost across all monitored models in the demo snapshot."
          tone="info"
        />
      </section>

      <section className="grid grid-2 overview-main-grid">
        {showModelHealth ? (
          <div className="card overview-card">
            <div className="section-heading">
              <div>
                <h3 className="tooltip-label" title="A compact operational table of the most important health signals for each monitored model.">Model Health Snapshot</h3>
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
                    <th className="tooltip-label" title="The production model currently being monitored.">Model</th>
                    <th className="tooltip-label" title="The business or ML task this model supports.">Use case</th>
                    <th className="tooltip-label" title="P95 inference latency, a practical indicator of tail response performance.">Latency</th>
                    <th className="tooltip-label" title="Observed request error rate for the model endpoint.">Error</th>
                    <th className="tooltip-label" title="A compact drift score summarizing how far current data differs from baseline.">Drift</th>
                    <th className="tooltip-label" title="Estimated hourly serving cost for this model.">Cost/hr</th>
                    <th className="tooltip-label" title="Health severity derived from the model's key operational signals.">Status</th>
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
        ) : (
          <div className="card overview-card">
            <div className="section-heading">
              <div>
                <h3 className="tooltip-label" title="Platform engineers see reliability-oriented actions instead of the full model health table in this demo mode.">Operations Focus</h3>
                <p className="muted section-subtitle">This role prioritizes response workflow and change management over model-level feature analysis.</p>
              </div>
              <div className="section-chip">Role scoped</div>
            </div>
            <div className="stack-list">
              <article className="stack-item">
                <div className="stack-title">Open incident response</div>
                <p className="muted stack-note">Review incident ownership, escalation status, and recent deployment context first.</p>
              </article>
              <article className="stack-item">
                <div className="stack-title">Release coordination</div>
                <p className="muted stack-note">Use deployment risk and rollout coverage to assess whether rollback or mitigation is needed.</p>
              </article>
            </div>
          </div>
        )}

        <div className="grid overview-side-stack">
          {showIncidents ? (
          <div className="card overview-card">
            <div className="section-heading">
              <div>
                <h3 className="tooltip-label" title="Recent active incidents with ownership, status, and deployment context for quick triage.">Recent Incidents</h3>
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
                      {incident.relatedDeployment ? (
                        <span className={`badge ${incident.relatedDeployment.riskLevel === 'critical' ? 'critical' : incident.relatedDeployment.riskLevel === 'warning' ? 'warn' : 'ok'}`}>
                          Deploy {incident.relatedDeployment.version}
                        </span>
                      ) : (
                        <span className="badge info">No nearby deployment</span>
                      )}
                      <span className="muted">{incident.suspectedCause}</span>
                    </div>
                    {incident.relatedDeployment ? (
                      <p className="muted stack-note">
                        Nearest deployment at {incident.relatedDeployment.deployedAt} with {incident.relatedDeployment.rolloutPercent}% rollout.
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
          ) : (
          <div className="card overview-card">
            <div className="section-heading">
              <div>
                <h3 className="tooltip-label" title="Data scientists get a role-scoped recommendation card here instead of the incidents triage stack.">Recommended Analysis Path</h3>
                <p className="muted section-subtitle">This role emphasizes drift interpretation and model behavior analysis.</p>
              </div>
              <div className="section-chip">Role scoped</div>
            </div>
            <div className="stack-list">
              <article className="stack-item">
                <div className="stack-title">Investigate drift first</div>
                <p className="muted stack-note">Use feature and prediction drift to identify which slices are changing before reviewing incident operations.</p>
              </article>
              <article className="stack-item">
                <div className="stack-title">Compare outputs to baseline</div>
                <p className="muted stack-note">Focus on output stability, calibration shifts, and data-distribution changes that explain behavior changes.</p>
              </article>
            </div>
          </div>
          )}

          {showDeployments ? (
          <div className="card overview-card">
            <div className="section-heading">
              <div>
                <h3 className="tooltip-label" title="Recent release events so operators can quickly correlate model health changes with deployments.">Recent Deployments</h3>
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
          ) : null}
        </div>
      </section>
    </div>
  );
}
