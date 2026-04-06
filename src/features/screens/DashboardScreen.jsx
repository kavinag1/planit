import DashboardPanel from '../dashboard/DashboardPanel.jsx'
import GamificationPanel from '../gamification/GamificationPanel.jsx'

function DashboardScreen({ metrics, xp, streakDays, productivityScore }) {
  return (
    <div className="screen screen--dashboard">
      <header className="screen__header">
        <h1>Dashboard</h1>
        <p>Your productivity overview and achievements</p>
      </header>

      <div className="screen__content">
        <div className="grid grid--top">
          <DashboardPanel metrics={metrics} />
          <GamificationPanel
            xp={xp}
            streakDays={streakDays}
            productivityScore={productivityScore}
          />
        </div>
      </div>
    </div>
  )
}

export default DashboardScreen
