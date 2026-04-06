function GamificationPanel({ xp, streakDays, productivityScore }) {
  return (
    <section className="panel">
      <div className="panel__header-row">
        <h2>Gamification</h2>
        <span className="status-chip">Momentum layer</span>
      </div>

      <div className="stats-grid stats-grid--small">
        <article className="stat-card">
          <span>XP</span>
          <strong>{xp}</strong>
        </article>
        <article className="stat-card">
          <span>Streak</span>
          <strong>{streakDays} days</strong>
        </article>
        <article className="stat-card">
          <span>Productivity Score</span>
          <strong>{productivityScore}</strong>
        </article>
      </div>

      <p className="gamification-note">
        Complete high-priority tasks and maintain daily streaks to increase your score.
      </p>
    </section>
  )
}

export default GamificationPanel
