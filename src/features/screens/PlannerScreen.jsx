import CalendarPanel from '../calendar/CalendarPanel.jsx'
import FocusPanel from '../focus/FocusPanel.jsx'
import PlannerPanel from '../planner/PlannerPanel.jsx'

function PlannerScreen({ tasks, plan, overload, heatmap, onTrackMinutes }) {
  return (
    <div className="screen screen--planner">
      <header className="screen__header">
        <h1>Planner & Focus</h1>
        <p>Schedule your day and track focus sessions</p>
      </header>

      <div className="screen__content">
        <div className="grid grid--bottom">
          <PlannerPanel plan={plan} overload={overload} heatmap={heatmap} />
          <FocusPanel tasks={tasks} onTrackMinutes={onTrackMinutes} />
          <CalendarPanel plan={plan} />
        </div>
      </div>
    </div>
  )
}

export default PlannerScreen
