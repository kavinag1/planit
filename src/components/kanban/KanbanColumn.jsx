import KanbanCard from './KanbanCard'

export default function KanbanColumn({
  label,
  status,
  columnType,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onAddTasks,
}) {
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    try {
      const taskData = JSON.parse(e.dataTransfer.getData('application/json'))
      if (taskData.id && taskData.status !== status) {
        onUpdateTask(taskData.id, { status })
      }
    } catch (error) {
      console.error('Drop error:', error)
    }
  }

  return (
    <div className="kanban-column">
      <div className={`kanban-col-header ${columnType}`}>
        {label} <span className="kanban-col-count">{tasks.length}</span>
      </div>
      <div
        className="kanban-cards"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          minHeight: '200px',
        }}
      >
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
            onAddTasks={onAddTasks}
          />
        ))}
        <button className="kanban-add-card">+ pin a new note</button>
      </div>
    </div>
  )
}
