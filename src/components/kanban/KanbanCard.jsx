import { useState, useMemo } from 'react'

const stickyColors = {
  yellow: 'kanban-sticky-yellow',
  blue: 'kanban-sticky-blue',
  pink: 'kanban-sticky-pink',
  green: 'kanban-sticky-green',
  white: 'kanban-sticky-white',
}

const pinColors = {
  red: 'kanban-pin-red',
  blue: 'kanban-pin-blue',
  yellow: 'kanban-pin-yellow',
  green: 'kanban-pin-green',
}

const tagColors = {
  design: 'kanban-tag-design',
  dev: 'kanban-tag-dev',
  content: 'kanban-tag-content',
  urgent: 'kanban-tag-urgent',
  research: 'kanban-tag-research',
}

export default function KanbanCard({ task, onUpdate, onDelete, onEdit, onAddTasks }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Determine colors based on task properties
  const stickyColor = useMemo(() => {
    const colorArray = Object.keys(stickyColors)
    const index = (task.id ? task.id.charCodeAt(0) : 0) % colorArray.length
    return stickyColors[colorArray[index]]
  }, [task.id])

  const pinColor = useMemo(() => {
    const colorArray = Object.keys(pinColors)
    const index = (task.id ? task.id.charCodeAt(1) : 0) % colorArray.length
    return pinColors[colorArray[index]]
  }, [task.id])

  const tagColor = useMemo(() => {
    const colorArray = Object.keys(tagColors)
    const tagIndex = task.tags?.[0] ? task.tags[0].charCodeAt(0) : 0
    const index = tagIndex % colorArray.length
    return tagColors[colorArray[index]]
  }, [task.tags])

  const isOverdue = useMemo(() => {
    if (task.status === 'done') return false
    if (!task.deadline) return false
    return new Date(task.deadline) < new Date()
  }, [task.deadline, task.status])

  const formattedDate = useMemo(() => {
    if (!task.deadline) return null
    const date = new Date(task.deadline)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }, [task.deadline])

  const getInitials = (name) => {
    if (!name) return ''
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }

  const handleConvertSubtaskToTask = (subtask) => {
    // Create a new task from the subtask
    const newTask = {
      id: crypto.randomUUID(),
      title: subtask.title,
      description: '',
      deadline: subtask.deadline,
      priority: 'medium',
      category: task.category || 'personal',
      tags: task.tags || [],
      status: subtask.status === 'done' ? 'done' : 'todo',
      subtasks: [],
      estimatedMinutes: task.estimatedMinutes || 30,
      actualMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add the new task
    if (onAddTasks) {
      onAddTasks([newTask])
    }

    // Close subtasks panel
    setShowSubtasks(false)
  }

  return (
    <div
      className={`kanban-sticky ${stickyColor}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={(e) => {
        setIsDragging(true)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('application/json', JSON.stringify(task))
      }}
      onDragEnd={() => setIsDragging(false)}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
      }}
    >
      <div className={`kanban-pin ${pinColor}`}></div>

      {task.tags && task.tags.length > 0 && (
        <span className={`kanban-sticky-tag ${tagColor}`}>{task.tags[0].toUpperCase()}</span>
      )}

      <div className="kanban-sticky-title">{task.title}</div>

      {task.description && <div className="kanban-sticky-desc">{task.description}</div>}

      {task.subtasks && task.subtasks.length > 0 && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {task.subtasks.map((subtask) => (
            <div
              key={subtask.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                background: subtask.status === 'done' ? 'rgba(76, 175, 80, 0.25)' : 'rgba(52, 152, 219, 0.25)',
                borderRadius: '4px',
                fontSize: '12px',
                borderLeft: `2px solid ${subtask.status === 'done' ? 'rgba(76, 175, 80, 0.7)' : 'rgba(52, 152, 219, 0.7)'}`,
              }}
            >
              <input
                type="checkbox"
                checked={subtask.status === 'done'}
                onChange={() => {
                  const newSubtasks = task.subtasks.map(st =>
                    st.id === subtask.id ? { ...st, status: st.status === 'done' ? 'todo' : 'done' } : st
                  )
                  onUpdate(task.id, { subtasks: newSubtasks })
                }}
                style={{ cursor: 'pointer', width: '14px', marginRight: '2px' }}
              />
              <div style={{ flex: 1, color: subtask.status === 'done' ? 'rgba(76, 175, 80, 0.95)' : 'rgba(52, 211, 153, 0.95)' }}>
                <div style={{ 
                  textDecoration: subtask.status === 'done' ? 'line-through' : 'none',
                  fontSize: '11px',
                  fontWeight: '500',
                }}>
                  {subtask.title}
                </div>
                {subtask.deadline && (
                  <div style={{ fontSize: '10px', color: subtask.status === 'done' ? 'rgba(76, 175, 80, 0.75)' : 'rgba(52, 211, 153, 0.75)', marginTop: '1px' }}>
                    {subtask.deadline}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  const newSubtasks = task.subtasks.filter(st => st.id !== subtask.id)
                  onUpdate(task.id, { subtasks: newSubtasks })
                }}
                style={{
                  background: 'rgba(214, 48, 49, 0.3)',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 4px',
                  color: 'rgba(214, 48, 49, 0.8)',
                  cursor: 'pointer',
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                  marginLeft: '4px',
                }}
                title="Remove subtask"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="kanban-sticky-footer">
        {task.deadline && (
          <div className={`kanban-sticky-due ${isOverdue ? 'overdue' : ''}`}>
            {formattedDate} {isOverdue ? '!' : ''}
          </div>
        )}
        {task.assignee && (
          <div className="kanban-sticky-assignee" style={{ background: task.assigneeColor || '#6c5ce7' }}>
            {getInitials(task.assignee)}
          </div>
        )}
      </div>

      {isHovered && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            display: 'flex',
            gap: '4px',
          }}
        >
          <button
            onClick={() => onEdit(task)}
            style={{
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: '12px',
              opacity: 0.6,
            }}
            title="Edit task"
          >
            ✎
          </button>
          <button
            onClick={() => {
              if (task.status !== 'done') {
                onUpdate(task.id, { status: 'done' })
              }
            }}
            style={{
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: '12px',
              opacity: 0.6,
            }}
            title="Mark as done"
          >
            ✓
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: '12px',
              opacity: 0.6,
            }}
            title="Delete task"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
