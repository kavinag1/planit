import { useState } from 'react'
import TaskEditModal from './TaskEditModal.jsx'

function TaskCard({ task, onUpdateTask, onDeleteTask, onGenerateSubtasks, onDeleteSubtask }) {
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  const editingTask = editingTaskId === task.id ? task : null

  function handleToggleTask() {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    onUpdateTask(task.id, { status: newStatus })
  }

  function handleToggleSubtask(subtaskId) {
    onUpdateTask(task.id, {
      subtasks: task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, status: st.status === 'done' ? 'todo' : 'done' } : st,
      ),
    })
  }

  function handleConfirmEdit(taskId, changes) {
    onUpdateTask(taskId, changes)
    setEditingTaskId(null)
  }

  const isExpanded = expandedTaskId === task.id
  const completedSubtasks = task.subtasks.filter((st) => st.status === 'done').length
  const totalSubtasks = task.subtasks.length

  return (
    <>
      <div className={`sticky-card ${task.status === 'done' ? 'sticky-card--done' : ''}`}>
        {/* Header with checkbox */}
        <div className="sticky-card__header">
          <input
            type="checkbox"
            className="sticky-card__checkbox"
            checked={task.status === 'done'}
            onChange={handleToggleTask}
            title="Mark task as done"
          />
          <h3 className="sticky-card__title">{task.title}</h3>
          <span className={`priority priority--${task.priority}`}>{task.priority}</span>
        </div>

        {/* Meta info */}
        <div className="sticky-card__meta">
          <span className="sticky-card__category">{task.category}</span>
          <span className="sticky-card__time">{task.estimatedMinutes}m</span>
        </div>

        {/* Deadline */}
        {task.deadline && (
          <div className="sticky-card__deadline">
            <span className="deadline-label">Due:</span>
            <span className="deadline-date">{task.deadline}</span>
          </div>
        )}

        {/* Subtasks Preview */}
        {task.subtasks.length > 0 && (
          <div className="sticky-card__subtasks-preview">
            <div className="subtasks-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
                />
              </div>
              <span className="progress-text">
                {completedSubtasks} / {totalSubtasks}
              </span>
            </div>
          </div>
        )}

        {/* Footer with actions */}
        <div className="sticky-card__footer">
          <button
            className="sticky-card__expand-btn"
            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '−' : '+'}
          </button>
          <div className="sticky-card__actions">
            <button className="btn btn--small btn--ghost" onClick={() => setEditingTaskId(task.id)}>
              Edit
            </button>
            <button className="btn btn--small btn--ghost" onClick={() => onDeleteTask(task.id)}>
              Delete
            </button>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="sticky-card__expanded">
            {task.subtasks.length > 0 && (
              <div className="sticky-subtasks">
                <h4>Milestones</h4>
                <div className="subtasks-list">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="subtask-check">
                      <input
                        type="checkbox"
                        className="subtask-checkbox"
                        checked={subtask.status === 'done'}
                        onChange={() => handleToggleSubtask(subtask.id)}
                        id={`subtask-${subtask.id}`}
                      />
                      <label htmlFor={`subtask-${subtask.id}`} className="subtask-label">
                        {subtask.title}
                        {subtask.deadline && <span className="subtask-due"> — {subtask.deadline}</span>}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="sticky-tags">
                <h4>Tags</h4>
                <div className="tags-list">
                  {task.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="sticky-actions">
              <button className="btn btn--small btn--primary" onClick={() => onGenerateSubtasks(task)}>
                AI Milestones
              </button>
              <button
                className="btn btn--small"
                onClick={() => {
                  const tag = window.prompt('Add tag')
                  if (!tag) return
                  const tags = [...new Set([...(task.tags || []), tag.trim()])]
                  onUpdateTask(task.id, { tags })
                }}
              >
                Add Tag
              </button>
            </div>
          </div>
        )}
      </div>

      <TaskEditModal
        isOpen={editingTaskId === task.id}
        task={editingTask}
        onConfirm={handleConfirmEdit}
        onCancel={() => setEditingTaskId(null)}
        onDeleteSubtask={onDeleteSubtask}
      />
    </>
  )
}

export default TaskCard
