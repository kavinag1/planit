export default function KanbanSidebar({
  onOpenSettings,
  onOpenAddTask,
  onOpenBrainDump,
  isLoggedIn,
  activeScreen,
  onChangeScreen,
}) {
  return (
    <aside className="kanban-sidebar">
      <div className="kanban-logo">
        <div className="kanban-logo__text">📌 Planit</div>
        <div className="kanban-logo__sub">Your planning board</div>
      </div>

      <nav className="kanban-nav">
        <div className="kanban-nav__section-label">Board</div>
        <button
          className={`kanban-nav__item ${activeScreen === 'board' ? 'active' : ''}`}
          onClick={() => onChangeScreen('board')}
        >
          <span className="kanban-nav__icon">B</span> My Board
        </button>

        <div className="kanban-nav__section-label">Productivity</div>
        <button
          className={`kanban-nav__item ${activeScreen === 'dashboard' ? 'active' : ''}`}
          onClick={() => onChangeScreen('dashboard')}
        >
          <span className="kanban-nav__icon">D</span> Dashboard
        </button>

        <div className="kanban-nav__section-label">Quick Actions</div>
        <button className="kanban-nav__item kanban-nav__item--add" onClick={onOpenAddTask}>
          <span className="kanban-nav__icon">+</span> Add Task
        </button>
        <button className="kanban-nav__item" onClick={onOpenBrainDump}>
          <span className="kanban-nav__icon">T</span> Brain Dump
        </button>
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
