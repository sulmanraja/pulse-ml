import Link from 'next/link';
import { DriftAnalysisSnapshot, DriftTimeframe, ModelSummary } from '@pulseml/shared';
import { apiFetch } from '../../components/api';
import { EmptyState } from '../../components/EmptyState';
import { buildRoleHref, getDemoRole, getDemoRoleMeta } from '../../components/demoRole';

type DriftPageProps = {
  searchParams?: Promise<{
    modelId?: string;
    timeframe?: string;
    metricType?: string;
    metricKey?: string;
    role?: string;
  }>;
};

export default async function DriftPage({ searchParams }: DriftPageProps) {
  const params = (await searchParams) ?? {};
  const timeframe = getTimeframe(params.timeframe);
  const modelId = typeof params.modelId === 'string' ? params.modelId : undefined;
  const metricType = params.metricType === 'prediction' ? 'prediction' : params.metricType === 'feature' ? 'feature' : undefined;
  const metricKey = typeof params.metricKey === 'string' ? params.metricKey : undefined;
  const role = getDemoRole(params.role);
  const roleMeta = getDemoRoleMeta(role);

  const query = new URLSearchParams();
  if (modelId) {
    query.set('modelId', modelId);
  }
  if (timeframe) {
    query.set('timeframe', timeframe);
  }
  if (metricType) {
    query.set('metricType', metricType);
  }
  if (metricKey) {
    query.set('metricKey', metricKey);
  }

  const [snapshot, models] = await Promise.all([
    apiFetch<DriftAnalysisSnapshot>(`/drift${query.toString() ? `?${query.toString()}` : ''}`),
    apiFetch<ModelSummary[]>('/models')
  ]);

  return (
    <div className="grid drift-page" style={{ gap: 20 }}>
      <header className="header">
        <div>
          <div className="eyebrow">Shift detection</div>
          <h2 className="title">Drift Analysis</h2>
          <p className="subtitle">Feature and prediction drift with model-level filtering and metric drill-down.</p>
        </div>
        <div className="overview-header-meta">
          <div className="badge info">Demo mode · seeded drift data</div>
          <div className="muted">{roleMeta.label}</div>
        </div>
      </header>

      <section className="card filter-card">
        <form className="drift-filters" method="get">
          <input type="hidden" name="role" value={role} />
          <label className="filter-field">
            <span
              className="muted tooltip-label"
              title="Select which model's drift metrics to inspect. Demo mode loads a seeded snapshot for the chosen model."
            >
              Model
            </span>
            <select name="modelId" defaultValue={snapshot.modelId} className="select">
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span
              className="muted tooltip-label"
              title="Changes the comparison window used to scale the seeded drift metrics. Use shorter windows for fresh regressions and longer windows for sustained shifts."
            >
              Timeframe
            </span>
            <select name="timeframe" defaultValue={snapshot.timeframe} className="select">
              <option value="24h">24h</option>
              <option value="7d">7d</option>
              <option value="30d">30d</option>
            </select>
          </label>

          <div className="filter-actions">
            <button className="button" type="submit">Apply filters</button>
          </div>
        </form>
      </section>

      {role === 'data-scientist' || role === 'admin' ? null : (
        <section className="card">
          <div className="section-heading">
            <div>
              <h3 className="tooltip-label" title="This note explains how Drift Analysis is positioned for the currently selected demo role.">Role-aware analysis note</h3>
              <p className="muted section-subtitle">
                {role === 'ml-engineer'
                  ? 'ML Engineers can inspect drift to connect behavior changes with active incidents.'
                  : 'Platform Engineers can review drift context here, but the main operational path stays centered on incidents and deployments.'}
              </p>
            </div>
            <div className="section-chip">{roleMeta.label}</div>
          </div>
        </section>
      )}

      <section className="grid grid-2 drift-main-grid">
        <div className="card">
          <div className="section-heading">
            <div>
              <h3
                className="tooltip-label"
                title="Feature drift measures how much incoming feature distributions differ from the baseline data the model was calibrated or trained on."
              >
                Feature Drift
              </h3>
              <p className="muted section-subtitle">Operational question: which input features are drifting away from baseline?</p>
            </div>
            <div className="section-chip">{snapshot.timeframe}</div>
          </div>
          {snapshot.featureDrift.length === 0 ? (
            <EmptyState title="No feature drift data" message="The current demo selection does not have feature drift metrics." />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th className="tooltip-label" title="The input column or derived signal being monitored for distribution shift.">Feature</th>
                  <th className="tooltip-label" title="Population Stability Index. Higher values indicate a larger distribution change from baseline.">PSI</th>
                  <th className="tooltip-label" title="The most important traffic or data segment change contributing to this feature's drift.">Top shift</th>
                  <th className="tooltip-label" title="A quick severity label derived from the backend drift thresholds.">Status</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.featureDrift.map((metric) => (
                  <tr key={metric.feature}>
                    <td>
                      <Link
                        className="table-link"
                        href={buildDriftHref(snapshot.modelId, snapshot.timeframe, 'feature', metric.feature, role)}
                      >
                        {metric.feature}
                      </Link>
                    </td>
                    <td>{metric.psi.toFixed(2)}</td>
                    <td>{metric.topShift}</td>
                    <td><span className={`badge ${getHealthClass(metric.status)}`}>{metric.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="section-heading">
            <div>
              <h3
                className="tooltip-label"
                title="Prediction drift tracks changes in model outputs or model behavior compared with a stable baseline window."
              >
                Prediction Drift
              </h3>
              <p className="muted section-subtitle">Operational question: which model outputs are moving away from expected behavior?</p>
            </div>
            <div className="section-chip">{snapshot.modelName}</div>
          </div>
          {snapshot.predictionDrift.length === 0 ? (
            <EmptyState title="No prediction drift data" message="The current demo selection does not have prediction drift metrics." />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th className="tooltip-label" title="The output behavior being tracked, such as approval rate or genre entropy.">Metric</th>
                  <th className="tooltip-label" title="The value observed in the selected timeframe.">Current</th>
                  <th className="tooltip-label" title="The comparison value from the seeded reference window.">Baseline</th>
                  <th className="tooltip-label" title="Percent change between the current value and baseline.">Delta</th>
                  <th className="tooltip-label" title="A quick severity label based on the magnitude of prediction change.">Status</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.predictionDrift.map((metric) => (
                  <tr key={metric.metric}>
                    <td>
                      <Link
                        className="table-link"
                        href={buildDriftHref(snapshot.modelId, snapshot.timeframe, 'prediction', metric.metric, role)}
                      >
                        {metric.metric}
                      </Link>
                    </td>
                    <td>{metric.currentValue}</td>
                    <td>{metric.baselineValue}</td>
                    <td>{metric.deltaPct > 0 ? '+' : ''}{metric.deltaPct.toFixed(1)}%</td>
                    <td><span className={`badge ${getHealthClass(metric.status)}`}>{metric.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="grid grid-2 drift-main-grid">
        <div className="card">
          <div className="section-heading">
            <div>
              <h3
                className="tooltip-label"
                title="A compressed view of how feature and prediction drift have been moving over recent intervals within the selected timeframe."
              >
                Trend Snapshot
              </h3>
              <p className="muted section-subtitle">High-level feature and prediction movement against alert thresholds.</p>
            </div>
            <div className="section-chip">Drill-down ready</div>
          </div>

          <div className="drift-trend-grid">
            <div className="trend-block">
              <div
                className="muted trend-label tooltip-label"
                title="Trend line for the highest-priority feature drift signal. The bar length shows relative PSI magnitude over time."
              >
                Feature PSI
              </div>
              {snapshot.featureTrend.map((point) => (
                <div key={point.label} className="trend-row">
                  <span>{point.label}</span>
                  <div className="trend-bar-track">
                    <div className="trend-bar-fill" style={{ width: `${Math.min(point.value / 0.6, 1) * 100}%` }} />
                  </div>
                  <span>{point.value.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="trend-block">
              <div
                className="muted trend-label tooltip-label"
                title="Trend line for output drift. Larger percentages mean model behavior is moving farther away from baseline."
              >
                Prediction delta
              </div>
              {snapshot.predictionTrend.map((point) => (
                <div key={point.label} className="trend-row">
                  <span>{point.label}</span>
                  <div className="trend-bar-track">
                    <div className="trend-bar-fill warn" style={{ width: `${Math.min(point.value / 30, 1) * 100}%` }} />
                  </div>
                  <span>{point.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-heading">
            <div>
              <h3
                className="tooltip-label"
                title="A deeper view of one chosen drift metric, including the slices most affected and the next recommended action."
              >
                Selected Metric Drill-down
              </h3>
              <p className="muted section-subtitle">Drill-down is selected from the query and resolved by the API snapshot helper.</p>
            </div>
            <div className="section-chip">{snapshot.drilldown.metricType}</div>
          </div>

          <div className="drift-drilldown">
            <div className="drilldown-banner">
              <div>
                <div className="table-primary">{snapshot.drilldown.title}</div>
                <div className="muted">{snapshot.drilldown.metricKey}</div>
              </div>
              <span className="badge info">Focused metric</span>
            </div>

            <p className="drilldown-copy">{snapshot.drilldown.summary}</p>

            <table className="table">
              <thead>
                <tr>
                  <th className="tooltip-label" title="A subgroup of traffic or data where the selected drift signal is especially pronounced.">Slice</th>
                  <th className="tooltip-label" title="The observed drift-related value for that slice.">Value</th>
                  <th className="tooltip-label" title="How far this slice moved relative to its baseline comparison.">Delta</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.drilldown.affectedSlices.map((slice) => (
                  <tr key={slice.slice}>
                    <td>{slice.slice}</td>
                    <td>{slice.value}</td>
                    <td>{slice.deltaPct > 0 ? '+' : ''}{slice.deltaPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="drilldown-action">
              <div className="muted incident-label">Recommended next step</div>
              <p>{snapshot.drilldown.recommendedAction}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getTimeframe(value?: string): DriftTimeframe | undefined {
  return value === '24h' || value === '7d' || value === '30d' ? value : undefined;
}

function buildDriftHref(
  modelId: string,
  timeframe: DriftTimeframe,
  metricType: 'feature' | 'prediction',
  metricKey: string,
  role: ReturnType<typeof getDemoRole>
) {
  return buildRoleHref('/drift', role, {
    modelId,
    timeframe,
    metricType,
    metricKey
  });
}

function getHealthClass(status: 'healthy' | 'warning' | 'critical'): 'ok' | 'warn' | 'critical' {
  if (status === 'critical') {
    return 'critical';
  }

  if (status === 'warning') {
    return 'warn';
  }

  return 'ok';
}
