import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(weekOfYear)

function NativeCalendar({ tasks, googleEvents = [], onDateClick, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [view, setView] = useState('month')

  const calendarData = useMemo(() => {
    if (view === 'month') {
      return generateMonthView(currentDate)
    }
    if (view === 'week') {
      return generateWeekView(currentDate)
    }
    if (view === 'day') {
      return generateDayView(currentDate)
    }
    return generateMonthView(currentDate)
  }, [currentDate, view, tasks, googleEvents])

  function generateMonthView(date) {
    const startOfMonth = date.startOf('month')
    const startOfCalendar = startOfMonth.startOf('week')
    const endOfCalendar = startOfMonth.endOf('month').endOf('week')

    const days = []
    let current = startOfCalendar

    while (current.isBefore(endOfCalendar)) {
      const dayTasks = tasks.filter((task) => {
        const taskDate = task.deadline ? dayjs(task.deadline) : dayjs(task.createdAt)
        return taskDate.isSame(current, 'day')
      })

      const dayGoogleEvents = googleEvents.filter((event) => {
        const eventStart = dayjs(event.start?.dateTime || event.start?.date)
        const eventEnd = dayjs(event.end?.dateTime || event.end?.date)
        return current.isSameOrAfter(eventStart, 'day') && current.isSameOrBefore(eventEnd, 'day')
      })

      days.push({
        date: current.clone(),
        isCurrentMonth: current.month() === date.month(),
        isToday: current.isSame(dayjs(), 'day'),
        tasks: dayTasks,
        googleEvents: dayGoogleEvents,
      })
      current = current.add(1, 'day')
    }

    return {
      type: 'month',
      days,
      monthName: date.format('MMMM YYYY'),
    }
  }

  function generateWeekView(date) {
    const startOfWeek = date.startOf('week')
    const days = []

    for (let i = 0; i < 7; i++) {
      const current = startOfWeek.add(i, 'day')
      const dayTasks = tasks.filter((task) => {
        const taskDate = task.deadline ? dayjs(task.deadline) : dayjs(task.createdAt)
        return taskDate.isSame(current, 'day')
      })

      const dayGoogleEvents = googleEvents.filter((event) => {
        const eventStart = dayjs(event.start?.dateTime || event.start?.date)
        const eventEnd = dayjs(event.end?.dateTime || event.end?.date)
        return current.isSameOrAfter(eventStart, 'day') && current.isSameOrBefore(eventEnd, 'day')
      })

      days.push({
        date: current.clone(),
        isToday: current.isSame(dayjs(), 'day'),
        tasks: dayTasks,
        googleEvents: dayGoogleEvents,
      })
    }

    return {
      type: 'week',
      days,
      weekName: `Week ${date.format('W')} ${date.format('YYYY')}`,
    }
  }

  function generateDayView(date) {
    const dayTasks = tasks.filter((task) => {
      const taskDate = task.deadline ? dayjs(task.deadline) : dayjs(task.createdAt)
      return taskDate.isSame(date, 'day')
    })

    const dayGoogleEvents = googleEvents.filter((event) => {
      const eventStart = dayjs(event.start?.dateTime || event.start?.date)
      const eventEnd = dayjs(event.end?.dateTime || event.end?.date)
      return date.isSameOrAfter(eventStart, 'day') && date.isSameOrBefore(eventEnd, 'day')
    })

    // Create hourly slots for the day
    const hours = []
    for (let hour = 0; hour < 24; hour++) {
      const slotStart = date.clone().hour(hour).minute(0)
      const slotEnd = date.clone().hour(hour).minute(59)

      const eventsInSlot = dayGoogleEvents.filter((event) => {
        const eventStart = dayjs(event.start?.dateTime)
        return eventStart.hour() === hour
      })

      hours.push({
        hour,
        label: formatHourLabel(hour),
        events: eventsInSlot,
        tasks: dayTasks,
      })
    }

    return {
      type: 'day',
      date: date.clone(),
      hours,
      tasks: dayTasks,
      googleEvents: dayGoogleEvents,
      dayName: date.format('dddd, MMMM D, YYYY'),
    }
  }

  function formatHourLabel(hour) {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  function handlePrev() {
    if (view === 'month') {
      setCurrentDate(currentDate.subtract(1, 'month'))
    } else if (view === 'week') {
      setCurrentDate(currentDate.subtract(1, 'week'))
    } else {
      setCurrentDate(currentDate.subtract(1, 'day'))
    }
  }

  function handleNext() {
    if (view === 'month') {
      setCurrentDate(currentDate.add(1, 'month'))
    } else if (view === 'week') {
      setCurrentDate(currentDate.add(1, 'week'))
    } else {
      setCurrentDate(currentDate.add(1, 'day'))
    }
  }

  function handleToday() {
    setCurrentDate(dayjs())
  }

  function handleDateClick(date) {
    setCurrentDate(date)
    setView('day')
    if (onDateClick) {
      onDateClick(date)
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'critical':
        return '#be3d32'
      case 'high':
        return '#bf5b1d'
      case 'medium':
        return '#2d769f'
      case 'low':
        return '#4e7d45'
      default:
        return '#5f6774'
    }
  }

  return (
    <div className="native-calendar">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="btn btn--ghost" onClick={handlePrev}>
            ←
          </button>
          <button className="btn btn--ghost" onClick={handleToday}>
            Today
          </button>
          <button className="btn btn--ghost" onClick={handleNext}>
            →
          </button>
        </div>
        <h2 className="calendar-title">{calendarData.monthName || calendarData.weekName || calendarData.dayName}</h2>
        <div className="calendar-view-switcher">
          <button
            className={`view-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button
            className={`view-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button
            className={`view-btn ${view === 'day' ? 'active' : ''}`}
            onClick={() => setView('day')}
          >
            Day
          </button>
        </div>
      </div>

      {view === 'month' && (
        <div className="calendar-month">
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-days-grid">
            {calendarData.days.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
                onClick={() => handleDateClick(day.date)}
              >
                <div className="day-number">{day.date.format('D')}</div>
                <div className="day-events">
                  {day.tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="day-event task"
                      style={{ borderLeftColor: getPriorityColor(task.priority) }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(task, 'task')
                      }}
                    >
                      {task.title}
                    </div>
                  ))}
                  {day.googleEvents.slice(0, 2).map((event, idx) => (
                    <div
                      key={idx}
                      className="day-event google"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event, 'google')
                      }}
                    >
                      {event.summary}
                    </div>
                  ))}
                  {day.tasks.length > 3 || day.googleEvents.length > 2 ? (
                    <div className="day-more">
                      +{day.tasks.length + day.googleEvents.length - 5} more
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div className="calendar-week">
          <div className="calendar-weekdays">
            {calendarData.days.map((day, index) => (
              <div
                key={index}
                className={`weekday-column ${day.isToday ? 'today' : ''}`}
                onClick={() => handleDateClick(day.date)}
              >
                <div className="weekday-header">
                  <span className="weekday-name">{day.date.format('ddd')}</span>
                  <span className={`weekday-number ${day.isToday ? 'today-highlight' : ''}`}>
                    {day.date.format('D')}
                  </span>
                </div>
                <div className="weekday-events">
                  {day.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="week-event task"
                      style={{ borderLeftColor: getPriorityColor(task.priority) }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(task, 'task')
                      }}
                    >
                      <span className="event-title">{task.title}</span>
                    </div>
                  ))}
                  {day.googleEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className="week-event google"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event, 'google')
                      }}
                    >
                      <span className="event-title">{event.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'day' && (
        <div className="calendar-day-view">
          <div className="day-view-header">
            <h3>{calendarData.dayName}</h3>
            <p className="day-stats">
              {calendarData.tasks.length} tasks · {calendarData.googleEvents.length} events
            </p>
          </div>
          <div className="day-view-hours">
            {calendarData.hours.map((hourSlot) => (
              <div key={hourSlot.hour} className="hour-row">
                <div className="hour-label">{hourSlot.label}</div>
                <div className="hour-events">
                  {hourSlot.events.map((event, idx) => (
                    <div
                      key={idx}
                      className="hour-event google"
                      onClick={() => onEventClick?.(event, 'google')}
                    >
                      <span className="event-time">
                        {dayjs(event.start?.dateTime).format('h:mm A')}
                      </span>
                      <span className="event-title">{event.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="day-tasks-section">
            <h4>Tasks for this day</h4>
            {calendarData.tasks.length === 0 ? (
              <p className="no-tasks">No tasks scheduled</p>
            ) : (
              <div className="day-tasks-list">
                {calendarData.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="day-task-item"
                    onClick={() => onEventClick?.(task, 'task')}
                  >
                    <div
                      className="task-priority-dot"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    />
                    <span className="task-title">{task.title}</span>
                    <span className="task-status">{task.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NativeCalendar
