function AccountScreen({ isLoggedIn, userEmail, onSignIn, onSignOut, isLoggingIn }) {
  return (
    <div className="screen screen--account">
      <header className="screen__header">
        <h1>Account & Settings</h1>
        <p>Manage your account and preferences</p>
      </header>

      <div className="screen__content">
        <section className="panel">
          <div className="panel__header-row">
            <h2>Authentication</h2>
          </div>

          {isLoggedIn ? (
            <div className="auth-box">
              <div className="auth-box__status auth-box__status--signed-in">
                <span className="auth-box__icon">✓</span>
                <span>Signed In</span>
              </div>
              {userEmail && <p className="auth-box__email">{userEmail}</p>}
              <button className="btn btn--danger" onClick={onSignOut}>
                Sign Out
              </button>
            </div>
          ) : (
            <div className="auth-box">
              <div className="auth-box__status">
                <span className="auth-box__icon">🔐</span>
                <span>Not Signed In</span>
              </div>
              <p className="auth-box__description">
                Sign in with Google to sync your tasks across devices and save your progress.
              </p>
              <button
                className="btn btn--primary"
                onClick={onSignIn}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel__header-row">
            <h2>About PlanIT</h2>
          </div>
          <p style={{ color: 'var(--muted)' }}>
            PlanIT is an AI-powered productivity system that helps you organize tasks, 
            predict workload, and execute with focus.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Version 1.0 — Built with React, Firebase, and OpenAI
          </p>
        </section>
      </div>
    </div>
  )
}

export default AccountScreen
