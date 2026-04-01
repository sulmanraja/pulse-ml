import Link from 'next/link';

export default function IncidentNotFound() {
  return (
    <div className="card">
      <h2 className="title">Incident not found</h2>
      <p className="subtitle" style={{ marginBottom: 16 }}>
        The requested incident does not exist in the current demo dataset.
      </p>
      <Link href="/incidents" className="button button-secondary">Return to incidents</Link>
    </div>
  );
}
