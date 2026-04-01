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
              <th>Model</th>
              <th>Use case</th>
              <th>Latency P95</th>
              <th>Traffic</th>
              <th>Drift</th>
              <th>Cost/hr</th>
              <th>Status</th>
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
