import { useState, useMemo } from 'react'

export default function FullCalendar({ tasks, onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    // Create array of dates
    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [currentDate])

  const getTasksForDate = (date) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    
    // Get main tasks
    const mainTasks = tasks.filter((task) => {
      if (!task.deadline) return false
      return task.deadline === dateStr
    })
    
    // Get subtasks from all tasks
    const subtasks = []
    tasks.forEach((task) => {
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach((subtask) => {
          if (subtask.deadline === dateStr && subtask.status !== 'done') {
            subtasks.push({
              ...subtask,
              parentTaskTitle: task.title,
              isSubtask: true,
            })
          }
        })
      }
    })
    
    return [...mainTasks, ...subtasks]
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const today = new Date()

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
    }}>
      <div style={{
        background: '#2d2d2d',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <h2 style={{ color: '#fafafa', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            {monthName}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrevMonth}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fafafa',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              style={{
                background: 'rgba(76, 175, 80, 0.2)',
                border: '1px solid rgba(76, 175, 80, 0.4)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'rgba(76, 175, 80, 0.8)',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fafafa',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Next →
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(214, 48, 49, 0.2)',
                border: '1px solid rgba(214, 48, 49, 0.4)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'rgba(214, 48, 49, 0.8)',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '8px',
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
        }}>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} style={{
              textAlign: 'center',
              padding: '12px',
              fontWeight: 'bold',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              {day}
            </div>
          ))}

          {/* Day cells */}
          {monthDays.map((date, idx) => {
            const dayTasks = date ? getTasksForDate(date) : []
            const isToday = date && date.toDateString() === today.toDateString()

            return (
              <div
                key={idx}
                style={{
                  minHeight: '140px',
                  background: date ? (isToday ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.02)') : 'rgba(0,0,0,0.2)',
                  border: date ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {date && (
                  <>
                    <div style={{
                      fontWeight: 'bold',
                      color: isToday ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255,255,255,0.8)',
                      fontSize: '14px',
                      marginBottom: '8px',
                      padding: '4px 6px',
                      background: isToday ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                      borderRadius: '4px',
                      textAlign: 'center',
                    }}>
                      {date.getDate()}
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {dayTasks.map((task) => {
                        const isSubtask = task.isSubtask
                        
                        return (
                          <div
                            key={task.id}
                            style={{
                              fontSize: '11px',
                              padding: '4px 6px',
                              background: isSubtask ? 'rgba(52, 152, 219, 0.25)' :
                                         task.priority === 'critical' ? 'rgba(231, 76, 60, 0.2)' : 
                                         task.priority === 'high' ? 'rgba(214, 48, 49, 0.2)' :
                                         task.priority === 'medium' ? 'rgba(253, 203, 110, 0.2)' :
                                         'rgba(149, 165, 166, 0.2)',
                              borderLeft: `2px solid ${isSubtask ? 'rgba(52, 152, 219, 0.7)' :
                                                        task.priority === 'critical' ? '#e74c3c' : 
                                                        task.priority === 'high' ? '#d63031' :
                                                        task.priority === 'medium' ? '#fdcb6e' :
                                                        '#95a5a6'}`,
                              borderRadius: '3px',
                              color: isSubtask ? 'rgba(52, 211, 153, 0.95)' : 'rgba(255,255,255,0.8)',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              fontWeight: task.status === 'done' ? 'normal' : 'normal',
                              textDecoration: task.status === 'done' ? 'line-through' : 'none',
                              opacity: task.status === 'done' ? 0.6 : 1,
                            }}
                            title={isSubtask ? `${task.parentTaskTitle} > ${task.title}` : task.title}
                          >
                            {isSubtask && '├ '}{task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
