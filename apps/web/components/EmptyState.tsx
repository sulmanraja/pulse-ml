export function EmptyState({
  title,
  message
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="card empty-state">
      <h3>{title}</h3>
      <p className="muted">{message}</p>
    </section>
  );
}
