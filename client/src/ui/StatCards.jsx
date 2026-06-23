export function StatCards({ stats }) {
  const cards = [
    { label: 'Total Posts', value: stats?.totals?.all ?? 0 },
    { label: 'Published', value: stats?.totals?.published ?? 0 },
    { label: 'Drafts', value: stats?.totals?.draft ?? 0 },
    { label: 'Categories', value: stats?.totals?.categories ?? 0 },
  ];

  return (
    <section className="stats-grid">
      {cards.map((card) => (
        <article className="card stat-card" key={card.label}>
          <span className="stat-label">{card.label}</span>
          <strong className="stat-value">{card.value}</strong>
        </article>
      ))}
    </section>
  );
}
