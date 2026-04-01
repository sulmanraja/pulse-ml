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
              <th className="tooltip-label" title="The model affected by the deployment event.">Model</th>
              <th className="tooltip-label" title="The deployed model or prompt version identifier.">Version</th>
              <th className="tooltip-label" title="When the deployment was rolled out in the demo timeline.">Time</th>
              <th className="tooltip-label" title="The percentage of serving traffic receiving the new version.">Rollout</th>
              <th className="tooltip-label" title="A risk estimate attached to the deployment event for release monitoring.">Risk</th>
              <th className="tooltip-label" title="Operator-facing notes describing what changed in the deployment.">Notes</th>
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
