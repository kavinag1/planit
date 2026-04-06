import { useMemo, useState } from 'react'
import TaskEditModal from './TaskEditModal.jsx'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'Todo' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
]

function TaskPanel({ tasks, onUpdateTask, onDeleteTask, onGenerateSubtasks }) {
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingTaskId, setEditingTaskId] = useState(null)

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => (filter === 'all' ? true : task.status === filter))
      .filter((task) => (categoryFilter === 'all' ? true : task.category === categoryFilter))
  }, [categoryFilter, filter, tasks])

  const editingTask = useMemo(() => tasks.find((t) => t.id === editingTaskId), [editingTaskId, tasks])

  function handleEditTask(taskId) {
    setEditingTaskId(taskId)
  }

  function handleConfirmEdit(taskId, changes) {
    onUpdateTask(taskId, changes)
    setEditingTaskId(null)
  }

  function handleDeleteSubtask(taskId, subtaskId) {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const updated = task.subtasks.filter((st) => st.id !== subtaskId)
    onUpdateTask(taskId, { subtasks: updated })
  }

  return (
    <section className="panel">
      <div className="panel__header-row">
        <h2>Tasks</h2>
        <div className="pill-row">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              className={`pill ${filter === item.key ? 'pill--active' : ''}`}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            <option value="school">School</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="errands">Errands</option>
          </select>
        </div>
      </div>

      <div className="task-list">
        {filteredTasks.map((task) => (
          <article className="task-card" key={task.id}>
            <div className="task-card__top">
              <h4>{task.title}</h4>
              <span className={`priority priority--${task.priority}`}>{task.priority}</span>
            </div>

            <p className="task-card__meta">
              {task.category} • {task.estimatedMinutes}m {task.deadline ? `• Deadline: ${task.deadline}` : ''}
            </p>

            {task.deadline && (
              <div className="sticky-note">
                <div className="sticky-note__deadline">Deadline</div>
                <div className="sticky-note__date">{task.deadline}</div>
              </div>
            )}

            <div className="task-card__controls">
              <button className="btn btn--secondary" onClick={() => handleEditTask(task.id)}>
                Edit
              </button>

              <button className="btn" onClick={() => onGenerateSubtasks(task)}>
                AI Subtasks
              </button>
              <button
                className="btn"
                onClick={() => {
                  const tag = window.prompt('Add tag')
                  if (!tag) return
                  const tags = [...new Set([...(task.tags || []), tag.trim()])]
                  onUpdateTask(task.id, { tags })
                }}
              >
                Add Tag
              </button>
              <select
                onChange={(event) => {
                  if (!event.target.value) return
                  const dependencies = [...new Set([...(task.dependencies || []), event.target.value])]
                  onUpdateTask(task.id, { dependencies })
                  event.target.value = ''
                }}
                defaultValue=""
              >
                <option value="">Add dependency</option>
                {tasks
                  .filter((candidate) => candidate.id !== task.id)
                  .map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.title}
                    </option>
                  ))}
              </select>
              <button className="btn btn--ghost" onClick={() => onDeleteTask(task.id)}>
                Delete
              </button>
            </div>

            {task.tags?.length ? (
              <p className="task-card__meta">Tags: {task.tags.join(', ')}</p>
            ) : null}

            {task.dependencies?.length ? (
              <p className="task-card__meta">Dependencies: {task.dependencies.length}</p>
            ) : null}

            {task.subtasks.length ? (
              <ul className="subtask-list">
                {task.subtasks.map((subtask) => (
                  <li key={subtask.id} className="subtask-item">
                    <div className="subtask-content">
                      <span className="subtask-title">{subtask.title}</span>
                      {subtask.deadline && (
                        <span className="subtask-deadline">by {subtask.deadline}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      <TaskEditModal
        isOpen={editingTaskId !== null}
        task={editingTask}
        onConfirm={handleConfirmEdit}
        onCancel={() => setEditingTaskId(null)}
        onDeleteSubtask={handleDeleteSubtask}
      />
    </section>
  )
}

export default TaskPanel
