import { Incident } from '@pulseml/shared';
import { apiFetch } from '../../components/api';
import { EmptyState } from '../../components/EmptyState';

export default async function IncidentsPage() {
  const incidents = await apiFetch<Incident[]>('/incidents');

  return (
    <div className="grid" style={{ gap: 24 }}>
      <header>
        <h2 className="title">Incidents</h2>
        <p className="subtitle">Open and recent incidents with ownership and suspected causes.</p>
      </header>
      {incidents.length === 0 ? (
        <EmptyState
          title="No incidents in the current window"
          message="The local demo has no active or recent incidents to investigate."
        />
      ) : (
      <div className="grid grid-2">
        {incidents.map((incident) => (
          <section key={incident.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <strong>{incident.title}</strong>
              <span className={`badge ${incident.severity === 'critical' ? 'critical' : incident.severity === 'warning' ? 'warn' : 'info'}`}>{incident.severity}</span>
            </div>
            <div className="kv">
              <div className="muted">Model</div><div>{incident.modelName}</div>
              <div className="muted">Owner</div><div>{incident.owner}</div>
              <div className="muted">Status</div><div>{incident.status}</div>
              <div className="muted">Started</div><div>{incident.startedAt}</div>
              <div className="muted">Cause</div><div>{incident.suspectedCause}</div>
            </div>
            <p className="muted" style={{ marginTop: 14 }}>{incident.description}</p>
          </section>
        ))}
      </div>
      )}
    </div>
  );
}
