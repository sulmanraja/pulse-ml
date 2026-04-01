export function MetricCard({
  title,
  value,
  subtitle,
  tone = 'neutral'
}: {
  title: string;
  value: string;
  subtitle: string;
  tone?: 'neutral' | 'ok' | 'warn' | 'critical' | 'info';
}) {
  return (
    <section className={`card metric-card metric-card-${tone}`}>
      <div className="metric-card-head">
        <div className="muted metric-label">{title}</div>
        <div className={`metric-dot metric-dot-${tone}`} />
      </div>
      <div className="metric">{value}</div>
      <div className="muted metric-subtitle">{subtitle}</div>
    </section>
  );
}
