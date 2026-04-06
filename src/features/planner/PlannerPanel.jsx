function PlannerPanel({ plan, overload, heatmap }) {
  return (
    <section className="panel">
      <div className="panel__header-row">
        <h2>Smart Planner</h2>
        <span className={`status-chip ${overload.overloaded ? 'status-chip--warn' : 'status-chip--ok'}`}>
          {overload.overloaded
            ? `Overload +${overload.overflowMinutes}m`
            : 'Balanced workload'}
        </span>
      </div>

      <div className="planner-grid">
        <article className="planner-card">
          <h4>Today Blocks</h4>
          <p>
            {plan.usedMinutes}m used / {plan.capacityMinutes}m capacity
          </p>
          <ul>
            {plan.blocks.map((block) => (
              <li key={block.id}>
                {block.title} ({block.minutes}m)
              </li>
            ))}
          </ul>
        </article>

        <article className="planner-card">
          <h4>Weekly Heatmap</h4>
          <div className="heatmap-grid">
            {heatmap.map((day) => (
              <div key={day.day} className={`heat-cell heat-cell--${day.level}`}>
                <span>{day.day.slice(5)}</span>
                <strong>{day.minutes}m</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

export default PlannerPanel
