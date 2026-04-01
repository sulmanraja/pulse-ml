import { DeploymentEvent } from '@pulseml/shared';
import { apiFetch } from '../../components/api';
import { EmptyState } from '../../components/EmptyState';

export default async function DeploymentsPage() {
  const deployments = await apiFetch<DeploymentEvent[]>('/deployments');

  return (
    <div className="grid" style={{ gap: 24 }}>
      <header>
        <h2 className="title">Deployments</h2>
        <p className="subtitle">Recent model releases with correlated risk and rollout notes.</p>
      </header>
      {deployments.length === 0 ? (
        <EmptyState
          title="No deployments found"
          message="There are no deployment events in the demo dataset yet."
        />
      ) : (
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Version</th>
              <th>Time</th>
              <th>Rollout</th>
              <th>Risk</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((deployment) => (
              <tr key={deployment.id}>
                <td>{deployment.modelName}</td>
                <td>{deployment.version}</td>
                <td>{deployment.deployedAt}</td>
                <td>{deployment.rolloutPercent}%</td>
                <td><span className={`badge ${deployment.riskLevel === 'critical' ? 'critical' : deployment.riskLevel === 'warning' ? 'warn' : 'ok'}`}>{deployment.riskLevel}</span></td>
                <td>{deployment.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
