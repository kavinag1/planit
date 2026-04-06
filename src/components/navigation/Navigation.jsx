import { useState } from 'react'

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'tasks', label: 'Tasks', icon: '📝' },
  { id: 'kanban', label: 'Board', icon: '📌' },
  { id: 'calendar', label: 'Calendar', icon: '🗓️' },
  { id: 'planner', label: 'Planner', icon: '📅' },
  { id: 'account', label: 'Account', icon: '👤' },
]

function Navigation({ currentScreen, onNavigate, isLoggedIn, isLoggingIn, onSignIn, onSignOut }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleNavigate(screenId) {
    onNavigate(screenId)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <span className="nav-logo__icon">🚀</span>
          <span className="nav-logo__text">PlanIT</span>
        </div>

        <div className={`nav-menu ${mobileMenuOpen ? 'nav-menu--open' : ''}`}>
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentScreen === item.id ? 'nav-item--active' : ''}`}
              onClick={() => handleNavigate(item.id)}
            >
              <span className="nav-item__icon">{item.icon}</span>
              <span className="nav-item__label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="nav-auth">
          {isLoggedIn ? (
            <button className="btn btn--ghost" onClick={onSignOut}>
              Sign Out
            </button>
          ) : (
            <button className="btn btn--primary" onClick={onSignIn} disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
            </button>
          )}
        </div>

        <button className="nav-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation
