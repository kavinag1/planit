function DashboardPanel({ metrics }) {
  return (
    <section className="panel">
      <div className="panel__header-row">
        <h2>Dashboard</h2>
        <span className="status-chip">Live metrics</span>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Completion</span>
          <strong>{metrics.completionRate}%</strong>
        </article>
        <article className="stat-card">
          <span>Estimate Accuracy</span>
          <strong>{metrics.accuracyRate}%</strong>
        </article>
        <article className="stat-card">
          <span>Total Tasks</span>
          <strong>{metrics.total}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{metrics.completed}</strong>
        </article>
      </div>

      <ul className="category-list">
        {Object.entries(metrics.byCategory).map(([category, count]) => (
          <li key={category}>
            <span>{category}</span>
            <strong>{count}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default DashboardPanel
