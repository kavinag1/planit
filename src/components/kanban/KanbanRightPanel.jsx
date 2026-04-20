import { useMemo, useState } from 'react'

export default function KanbanRightPanel({ tasks, overdueTasks }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const stats = useMemo(() => {
    return {
      active: tasks.filter((t) => t.status !== 'done').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: overdueTasks.length,
      members: new Set(tasks.filter((t) => t.assignee).map((t) => t.assignee)).size,
    }
  }, [tasks, overdueTasks])

  const sprintProgress = useMemo(() => {
    if (tasks.length === 0) return 0
    const done = tasks.filter((t) => t.status === 'done').length
    return Math.round((done / tasks.length) * 100)
  }, [tasks])

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'done' && t.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 4)
  }, [tasks])

  // Mini calendar - March 2026
  const generateCalendarDays = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      days.push(date)
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const today = new Date()

  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
      if (!task.deadline) return false
      const taskDate = new Date(task.deadline)
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      )
    })
  }

  return (
    <aside className="kanban-right-panel">
      {/* STATS */}
      <div>
        <div className="kanban-panel-section-title">Sprint Stats</div>
        <div className="kanban-stats-grid">
          <div className="kanban-stat-card">
            <div className="kanban-stat-number" style={{ color: '#fdcb6e' }}>
              {stats.active}
            </div>
            <div className="kanban-stat-label">Active</div>
          </div>
          <div className="kanban-stat-card">
            <div className="kanban-stat-number" style={{ color: '#00b894' }}>
              {stats.done}
            </div>
            <div className="kanban-stat-label">Done</div>
          </div>
          <div className="kanban-stat-card">
            <div className="kanban-stat-number" style={{ color: '#d63031' }}>
              {stats.overdue}
            </div>
            <div className="kanban-stat-label">Overdue</div>
          </div>
          <div className="kanban-stat-card">
            <div className="kanban-stat-number" style={{ color: '#74b9ff' }}>
              {stats.members}
            </div>
            <div className="kanban-stat-label">Members</div>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <div className="kanban-progress-label">
            <span>Sprint Progress</span>
            <span>{sprintProgress}%</span>
          </div>
          <div className="kanban-progress-track">
            <div className="kanban-progress-fill" style={{ width: `${sprintProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* MINI CALENDAR */}
      <div>
        <div className="kanban-panel-section-title">
          {today.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <div className="kanban-mini-cal">
          <div className="kanban-cal-grid">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="kanban-cal-day-name">
                {day}
              </div>
            ))}
            {calendarDays.map((date, idx) => {
              const isToday = date.toDateString() === today.toDateString()
              const isCurrentMonth =
                date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
              const dayTasks = getTasksForDate(date)
              const hasTasks = dayTasks.length > 0
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

              return (
                <div
                  key={idx}
                  onClick={() => hasTasks && setSelectedDate(date)}
                  className={`kanban-cal-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'empty' : ''} ${hasTasks ? 'has-task' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{
                    cursor: hasTasks ? 'pointer' : 'default',
                    background: isSelected ? 'rgba(74, 144, 226, 0.2)' : isToday ? 'rgba(76, 175, 80, 0.1)' : '',
                    borderRadius: isSelected ? '6px' : '4px',
                  }}
                >
                  {isCurrentMonth ? date.getDate() : ''}
                  {isCurrentMonth && hasTasks && (
                    <div style={{ fontSize: '8px', marginTop: '2px' }}>
                      {'●'.repeat(Math.min(dayTasks.length, 3))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* SELECTED DATE TASKS */}
        {selectedDate && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(74, 144, 226, 0.1)',
            borderRadius: '6px',
            borderLeft: '3px solid rgba(74, 144, 226, 0.5)',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            {getTasksForDate(selectedDate).map((task) => (
              <div key={task.id} style={{
                fontSize: '12px',
                padding: '6px',
                marginBottom: '4px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '4px',
                color: 'rgba(255,255,255,0.7)',
                borderLeft: `2px solid ${task.priority === 'high' ? '#d63031' : task.priority === 'critical' ? '#e74c3c' : '#fdcb6e'}`,
                paddingLeft: '8px',
              }}>
                {task.title}
              </div>
            ))}
            <button
              onClick={() => setSelectedDate(null)}
              style={{
                fontSize: '11px',
                marginTop: '8px',
                padding: '4px 8px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '4px',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* UPCOMING */}
      <div>
        <div className="kanban-panel-section-title">Coming Up</div>
        {upcomingTasks.length > 0 ? (
          upcomingTasks.map((task, idx) => {
            const taskDate = new Date(task.deadline)
            const today = new Date()
            let dateLabel = ''

            if (taskDate.toDateString() === today.toDateString()) {
              dateLabel = 'Today — overdue!'
            } else {
              dateLabel = taskDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            }

            const colorArray = ['#fdcb6e', '#74b9ff', '#00b894', '#e84393']
            const dotColor =
              new Date(task.deadline) < today
                ? '#d63031'
                : colorArray[idx % colorArray.length]

            return (
              <div key={task.id} className="kanban-upcoming-item">
                <div
                  className="kanban-upcoming-dot"
                  style={{
                    background: dotColor,
                  }}
                ></div>
                <div>
                  <div className="kanban-upcoming-title">{task.title}</div>
                  <div className="kanban-upcoming-date">{dateLabel}</div>
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>No upcoming tasks</div>
        )}
      </div>
    </aside>
  )
}
