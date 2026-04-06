import { useState } from 'react'
import '../kanban/KanbanModal.css'

export default function TaskModal({ isOpen, onClose, onSubmit, task = null }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    deadline: task?.deadline || '',
    priority: task?.priority || 'medium',
    tags: Array.isArray(task?.tags) ? task.tags : [],
    status: task?.status || 'todo',
    assignee: task?.assignee || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      title: '',
      description: '',
      deadline: '',
      priority: 'medium',
      tags: [],
      status: 'todo',
      assignee: '',
    })
  }

  if (!isOpen) return null

  return (
    <div className="kanban-modal-overlay" onClick={onClose}>
      <div className="kanban-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kanban-modal__header">
          <h2>{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button className="kanban-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="kanban-modal__form">
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add task description"
              rows="3"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assignee</label>
              <input
                type="text"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                placeholder="Assign to..."
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tags: e.target.value.split(',').map((tag) => tag.trim()),
                }))
              }
              placeholder="Design, Dev, Content, etc."
            />
          </div>

          <div className="kanban-modal__footer">
            <button type="button" className="kanban-btn kanban-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="kanban-btn kanban-btn--primary">
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
