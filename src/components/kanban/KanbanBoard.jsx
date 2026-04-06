import KanbanColumn from './KanbanColumn'
import FullCalendar from './FullCalendar'
import { useState } from 'react'

export default function KanbanBoard({ tasksByStatus, onUpdateTask, onDeleteTask, onEditTask, onAddTasks }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const allTasks = Object.values(tasksByStatus).flat()
  const columns = [
    { key: 'todo', label: '📝 To Do', emoji: 'todo' },
    { key: 'in-progress', label: '✏️ In Progress', emoji: 'doing' },
    { key: 'review', label: '👁 Review', emoji: 'review' },
    { key: 'done', label: '✅ Done', emoji: 'done' },
  ]

  return (
    <div className="kanban-board-area">
      <div className="kanban-board-meta">
        <div>
          <div className="kanban-board-label">📌 My Bulletin Board</div>
          <div className="kanban-board-date">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            · {Object.values(tasksByStatus).flat().length} tasks active
          </div>
        </div>
        <div className="kanban-view-toggle">
          <button className="kanban-view-btn on">Board</button>
          <button className="kanban-view-btn" onClick={() => setIsCalendarOpen(true)}>Calendar</button>
        </div>
      </div>

      <div className="kanban-columns">
        {columns.map((column) => (
          <KanbanColumn
            key={column.key}
            label={column.label}
            status={column.key}
            columnType={column.emoji}
            tasks={tasksByStatus[column.key] || []}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onAddTasks={onAddTasks}
          />
        ))}
      </div>

      {isCalendarOpen && (
        <FullCalendar
          tasks={allTasks}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}
    </div>
  )
}
