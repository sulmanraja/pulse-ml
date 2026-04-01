import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Incident } from '@pulseml/shared';
import { apiFetch } from '../../../components/api';

type IncidentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function IncidentDetailPage({ params }: IncidentDetailPageProps) {
  const { id } = await params;

  let incident: Incident;
  try {
    incident = await apiFetch<Incident>(`/incidents/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Request failed: 404') {
      notFound();
    }

    throw error;
  }

  return (
    <div className="grid incident-detail-page" style={{ gap: 20 }}>
      <div className="detail-back-link">
        <Link href="/incidents" className="button button-secondary">Back to incidents</Link>
      </div>

      <header className="card incident-detail-hero">
        <div className="incident-detail-heading">
          <div>
            <div className="eyebrow">Incident detail</div>
            <h2 className="title">{incident.title}</h2>
            <p className="subtitle">Detailed triage context for the impacted model and its nearest deployment change.</p>
          </div>
          <div className="incident-detail-badges">
            <span className={`badge ${incident.severity === 'critical' ? 'critical' : incident.severity === 'warning' ? 'warn' : 'info'}`}>{incident.severity}</span>
            <span className="badge info">{incident.status}</span>
          </div>
        </div>
      </header>

      <section className="grid grid-2 incident-detail-grid">
        <div className="card">
          <div className="section-heading">
            <div>
              <h3>Incident Context</h3>
              <p className="muted section-subtitle">Core timestamps, ownership, and suspected root-cause signal.</p>
            </div>
            <div className="section-chip">Triage</div>
          </div>

          <div className="kv incident-detail-kv">
            <div className="muted">Incident ID</div><div>{incident.id}</div>
            <div className="muted">Impacted model</div><div>{incident.modelName}</div>
            <div className="muted">Owner</div><div>{incident.owner}</div>
            <div className="muted">Started at</div><div>{incident.startedAt}</div>
            <div className="muted">Status</div><div>{incident.status}</div>
            <div className="muted">Suspected cause</div><div>{incident.suspectedCause}</div>
          </div>

          <div className="incident-detail-copy">
            <div className="muted incident-label">Summary</div>
            <p>{incident.description}</p>
          </div>
        </div>

        <div className="card">
          <div className="section-heading">
            <div>
              <h3>Deployment Correlation</h3>
              <p className="muted section-subtitle">Nearest related deployment surfaced by the backend correlation helper.</p>
            </div>
            <div className="section-chip">Change context</div>
          </div>

          {incident.relatedDeployment ? (
            <div className="grid" style={{ gap: 16 }}>
              <div className="deployment-detail-banner">
                <span className={`badge ${incident.relatedDeployment.riskLevel === 'critical' ? 'critical' : incident.relatedDeployment.riskLevel === 'warning' ? 'warn' : 'ok'}`}>
                  {incident.relatedDeployment.version}
                </span>
                <span className="muted">Nearest deployment for this incident</span>
              </div>

              <div className="kv incident-detail-kv">
                <div className="muted">Deployment time</div><div>{incident.relatedDeployment.deployedAt}</div>
                <div className="muted">Rollout</div><div>{incident.relatedDeployment.rolloutPercent}%</div>
                <div className="muted">Risk level</div><div>{incident.relatedDeployment.riskLevel}</div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No nearby deployment found</h3>
              <p className="muted">This incident does not have a correlated deployment in the demo dataset.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
