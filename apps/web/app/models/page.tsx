import { ModelSummary } from '@pulseml/shared';
import { apiFetch } from '../../components/api';
import { EmptyState } from '../../components/EmptyState';

export default async function ModelsPage() {
  const models = await apiFetch<ModelSummary[]>('/models');

  return (
    <div className="grid" style={{ gap: 24 }}>
      <header>
        <h2 className="title">Models</h2>
        <p className="subtitle">Operational health by model with latency, drift, and cost signals.</p>
      </header>
      {models.length === 0 ? (
        <EmptyState
          title="No models available"
          message="Demo mode is running, but there are no model summaries to display yet."
        />
      ) : (
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th className="tooltip-label" title="The production model currently being monitored.">Model</th>
              <th className="tooltip-label" title="The primary use case or ML task handled by the model.">Use case</th>
              <th className="tooltip-label" title="95th percentile inference latency for this model.">Latency P95</th>
              <th className="tooltip-label" title="Observed request volume in queries per second.">Traffic</th>
              <th className="tooltip-label" title="A high-level drift score summarizing distribution shift from baseline.">Drift</th>
              <th className="tooltip-label" title="Estimated hourly serving cost for the model.">Cost/hr</th>
              <th className="tooltip-label" title="Overall health classification derived from operational signals.">Status</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.id}>
                <td>{model.name}</td>
                <td>{model.useCase}</td>
                <td>{model.latencyP95Ms} ms</td>
                <td>{model.qps}</td>
                <td>
                  <div>{model.driftScore.toFixed(2)}</div>
                  <div className="spark" />
                </td>
                <td>${model.costPerHour.toFixed(2)}</td>
                <td><span className={`badge ${model.status === 'critical' ? 'critical' : model.status === 'warning' ? 'warn' : 'ok'}`}>{model.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
