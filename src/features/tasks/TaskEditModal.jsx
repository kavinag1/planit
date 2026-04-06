import { useState } from 'react'

function TaskEditModal({ isOpen, task, onConfirm, onCancel, onDeleteSubtask }) {
  const [formData, setFormData] = useState(task || {})

  // Update form data when task changes
  if (isOpen && task && task.id !== formData.id) {
    setFormData(task)
  }

  if (!isOpen || !task) return null

  function handleFieldChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function handleSubtaskChange(subtaskId, field, value) {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((st) => (st.id === subtaskId ? { ...st, [field]: value } : st)),
    }))
  }

  function handleAddSubtask() {
    setFormData((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        {
          id: crypto.randomUUID(),
          title: '',
          status: 'todo',
          deadline: null,
        },
      ],
    }))
  }

  function handleConfirm() {
    const changes = {
      title: formData.title,
      status: formData.status,
      priority: formData.priority,
      category: formData.category,
      estimatedMinutes: formData.estimatedMinutes,
      deadline: formData.deadline,
      subtasks: formData.subtasks.filter((st) => st.title.trim()),
    }
    onConfirm(task.id, changes)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Edit Task</h2>
          <button className="modal__close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className="modal__content">
          <div className="form-group">
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={formData.status || 'todo'}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="form-input"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={formData.priority || 'medium'}
                onChange={(e) => handleFieldChange('priority', e.target.value)}
                className="form-input"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-category">Category</label>
              <select
                id="task-category"
                value={formData.category || 'personal'}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="form-input"
              >
                <option value="school">School</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="errands">Errands</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-minutes">Est. Minutes</label>
              <input
                id="task-minutes"
                type="number"
                value={formData.estimatedMinutes || 0}
                onChange={(e) => handleFieldChange('estimatedMinutes', parseInt(e.target.value, 10))}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-deadline">Task Deadline</label>
            <input
              id="task-deadline"
              type="date"
              value={formData.deadline || ''}
              onChange={(e) => handleFieldChange('deadline', e.target.value || null)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <label>Milestones</label>
              <button type="button" className="btn btn--small" onClick={handleAddSubtask}>
                Add Milestone
              </button>
            </div>
            {formData.subtasks && formData.subtasks.length > 0 ? (
              <div className="subtasks-editor">
                {formData.subtasks.map((subtask) => (
                  <div key={subtask.id} className="subtask-row">
                    <input
                      type="text"
                      value={subtask.title || ''}
                      onChange={(e) => handleSubtaskChange(subtask.id, 'title', e.target.value)}
                      className="form-input"
                      placeholder="Milestone name (e.g., Start planning)"
                    />
                    <input
                      type="date"
                      value={subtask.deadline || ''}
                      onChange={(e) => handleSubtaskChange(subtask.id, 'deadline', e.target.value || null)}
                      className="form-input"
                      title="Milestone deadline"
                    />
                    <select
                      value={subtask.status || 'todo'}
                      onChange={(e) => handleSubtaskChange(subtask.id, 'status', e.target.value)}
                      className="form-input"
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <button
                      type="button"
                      className="btn btn--danger btn--small"
                      onClick={() => onDeleteSubtask(task.id, subtask.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
                No milestones yet. Click "Add Milestone" to create one.
              </p>
            )}
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn--primary" onClick={handleConfirm}>
            Save Task
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskEditModal

