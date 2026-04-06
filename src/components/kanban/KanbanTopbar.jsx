export default function KanbanTopbar({ searchQuery, onSearchChange, onAddNote }) {
  return (
    <div className="kanban-topbar">
      <div className="kanban-topbar__left">
        <div>
          <div className="kanban-page-title">� My Planning Board</div>
        </div>
        <span className="kanban-breadcrumb">&nbsp;/ All Tasks</span>
      </div>
      <div className="kanban-topbar__actions">
        <input
          className="kanban-search-bar"
          placeholder="🔍  Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button className="kanban-btn kanban-btn--ghost">Filter ▾</button>
        <button className="kanban-btn kanban-btn--primary" onClick={onAddNote}>
          + New Task
        </button>
      </div>
    </div>
  )
}
