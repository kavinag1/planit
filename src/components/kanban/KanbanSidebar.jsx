export default function KanbanSidebar({ onOpenSettings, onOpenAddTask, onOpenBrainDump, isLoggedIn }) {
  return (
    <aside className="kanban-sidebar">
      <div className="kanban-logo">
        <div className="kanban-logo__text">📌 Planit</div>
        <div className="kanban-logo__sub">Your planning board</div>
      </div>

      <nav className="kanban-nav">
        <div className="kanban-nav__section-label">Board</div>
        <div className="kanban-nav__item active">
          <span className="kanban-nav__icon">📋</span> My Board
        </div>

        <div className="kanban-nav__section-label">Quick Actions</div>
        <div className="kanban-nav__item" onClick={onOpenAddTask} style={{ cursor: 'pointer' }}>
          <span className="kanban-nav__icon">✨</span> Add Task
        </div>
        <div className="kanban-nav__item" onClick={onOpenBrainDump} style={{ cursor: 'pointer' }}>
          <span className="kanban-nav__icon">🧠</span> Brain Dump
        </div>
      </nav>

      <div className="kanban-sidebar-footer">
        <div className="kanban-user-avatar" onClick={onOpenSettings} style={{ cursor: 'pointer' }}>
          <div className="kanban-avatar-circle">P</div>
          <div>
            <div className="kanban-user-name">{isLoggedIn ? 'Signed In' : 'Guest User'}</div>
            <div className="kanban-user-role" onClick={onOpenSettings} style={{ cursor: 'pointer' }}>
              Settings →
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
