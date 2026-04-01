'use client';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card">
      <h2 className="title">Unable to load PulseML</h2>
      <p className="subtitle" style={{ marginBottom: 16 }}>
        The web app could not reach the local API or parse its response.
      </p>
      <p className="muted" style={{ marginBottom: 16 }}>
        {error.message}
      </p>
      <button className="button" onClick={reset} type="button">
        Retry
      </button>
    </div>
  );
}
