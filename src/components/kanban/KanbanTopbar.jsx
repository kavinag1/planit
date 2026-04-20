export default function KanbanTopbar({ searchQuery, onSearchChange, onAddNote, activeScreen, onOpenHelp }) {
  const title = activeScreen === 'dashboard' ? 'My Dashboard' : 'My Planning Board'
  const subtitle = activeScreen === 'dashboard' ? '/ Focus & Productivity' : '/ All Tasks'

  return (
    <div className="kanban-topbar">
      <div className="kanban-topbar__left">
        <div>
          <div className="kanban-page-title">{title}</div>
        </div>
        <span className="kanban-breadcrumb">&nbsp;{subtitle}</span>
      </div>
      <div className="kanban-topbar__actions">
        <input
          className="kanban-search-bar"
          placeholder="🔍  Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button className="kanban-btn kanban-btn--ghost" onClick={onOpenHelp}>
          Help Tour
        </button>
        <button className="kanban-btn kanban-btn--ghost">Filter ▾</button>
        <button className="kanban-btn kanban-btn--primary kanban-btn--add-task" onClick={onAddNote}>
          + Add Task
        </button>
      </div>
    </div>
  )
}
