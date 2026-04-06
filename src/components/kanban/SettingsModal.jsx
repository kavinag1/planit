import './KanbanModal.css'

export default function SettingsModal({ isOpen, onClose, isLoggedIn, userEmail, onSignIn, onSignOut, onClearAllTasks, isLoggingIn }) {
  if (!isOpen) return null

  const getInitials = (email) => {
    if (!email) return '?'
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return (
    <div className="kanban-modal-overlay" onClick={onClose}>
      <div className="kanban-modal kanban-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kanban-modal__header">
          <h2>Settings</h2>
          <button className="kanban-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="kanban-modal__form">
          {/* ACCOUNT SECTION */}
          <div className="settings-section">
            <h3>👤 Account</h3>

            {isLoggedIn ? (
              <>
                <div className="user-info">
                  <div className="user-info-row">
                    <div className="user-info-avatar">{getInitials(userEmail)}</div>
                    <div className="user-info-text">
                      <div className="name">Logged In</div>
                      <div className="email">{userEmail}</div>
                    </div>
                    <span className="info-badge">Pro</span>
                  </div>
                </div>

                <button className="kanban-btn kanban-btn--ghost" onClick={onSignOut} style={{ width: '100%' }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontSize: '14px' }}>
                  Sign in to sync your tasks and access your board from anywhere.
                </p>
                <button
                  className="kanban-btn kanban-btn--primary"
                  onClick={onSignIn}
                  disabled={isLoggingIn}
                  style={{ width: '100%' }}
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                </button>
              </>
            )}
          </div>

          {/* PREFERENCES */}
          <div className="settings-section">
            <h3>⚙️ Preferences</h3>

            <div className="setting-item">
              <label>Theme</label>
              <select
                value="dark"
                style={{
                  width: '140px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                }}
              >
                <option value="dark">Dark (Cork)</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Notifications</label>
              <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                <span style={{ fontSize: '13px' }}>Enabled</span>
              </label>
            </div>

            <div className="setting-item">
              <label>Email Notifications</label>
              <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                <span style={{ fontSize: '13px' }}>Daily Summary</span>
              </label>
            </div>
          </div>

          {/* ABOUT */}
          <div className="settings-section">
            <h3>ℹ️ About</h3>

            <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <label>Version</label>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                Planit v1.0.0
              </span>
            </div>

            <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: '12px' }}>
              <label>Build Date</label>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                March 29, 2026
              </span>
            </div>
          </div>

          {/* DANGER ZONE */}
          {isLoggedIn && (
            <div className="settings-section">
              <div className="danger-zone">
                <h4>⚠️ Danger Zone</h4>
                <p>Clear all tasks and reset your board. This action cannot be undone.</p>
                <button className="kanban-btn kanban-btn--danger" onClick={() => {
                  onClearAllTasks?.()
                  onClose()
                }}>Clear All Tasks</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
