import { useState, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import NativeCalendar from './NativeCalendar'
import {
  initGoogleAuth,
  requestGoogleAuth,
  getGoogleToken,
  isGoogleAuthenticated,
  revokeGoogleAccess,
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
} from '../../services/calendar/googleAuth'
import { planToCalendarEvents } from '../../services/calendar/googleCalendar'

function CalendarScreen({ tasks, plan, onAddTasks, onUpdateTask, onDeleteTask }) {
  const [googleEvents, setGoogleEvents] = useState([])
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [isAuthInitialized, setIsAuthInitialized] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [syncMessage, setSyncMessage] = useState('')

  // Initialize Google Auth on mount
  useEffect(() => {
    async function initAuth() {
      const tokenClient = await initGoogleAuth()
      setIsAuthInitialized(true)
      if (tokenClient) {
        setIsGoogleConnected(isGoogleAuthenticated())
      }
    }
    initAuth()
  }, [])

  // Fetch Google Calendar events when connected
  useEffect(() => {
    if (isGoogleConnected) {
      fetchEvents()
    }
  }, [isGoogleConnected])

  async function fetchEvents() {
    try {
      const startDate = dayjs().startOf('month').subtract(1, 'month')
      const endDate = dayjs().endOf('month').add(1, 'month')
      const events = await fetchGoogleCalendarEvents(startDate, endDate)
      setGoogleEvents(events)
    } catch (error) {
      console.error('Failed to fetch Google Calendar events:', error)
      setSyncMessage('Failed to fetch events. Please reconnect.')
    }
  }

  function handleConnectGoogle() {
    requestGoogleAuth((accessToken) => {
      if (accessToken) {
        setIsGoogleConnected(true)
        setSyncMessage('Connected to Google Calendar!')
        fetchEvents()
      }
    })
  }

  function handleDisconnectGoogle() {
    revokeGoogleAccess()
    setIsGoogleConnected(false)
    setGoogleEvents([])
    setSyncMessage('Disconnected from Google Calendar')
  }

  function handleDateClick(date) {
    setSelectedDate(date)
    setShowAddTaskModal(true)
  }

  function handleEventClick(event, type) {
    setSelectedEvent({ event, type })
  }

  async function handleSyncToGoogle() {
    if (!isGoogleConnected) {
      setSyncMessage('Please connect to Google Calendar first')
      return
    }

    try {
      const events = planToCalendarEvents(plan)
      let successCount = 0

      for (const event of events) {
        await createGoogleCalendarEvent({
          summary: event.summary,
          description: event.description,
          start: { dateTime: event.start.dateTime },
          end: { dateTime: event.end.dateTime },
        })
        successCount++
      }

      setSyncMessage(`Synced ${successCount} events to Google Calendar!`)
      fetchEvents()
    } catch (error) {
      console.error('Failed to sync to Google Calendar:', error)
      setSyncMessage('Failed to sync. Please try again.')
    }
  }

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((task) => task.deadline && dayjs(task.deadline).isAfter(dayjs()))
      .sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf())
      .slice(0, 5)
  }, [tasks])

  return (
    <div className="screen screen--calendar">
      <header className="screen__header">
        <h1>Calendar</h1>
        <p>View and manage your tasks and events</p>
      </header>

      <div className="screen__content">
        <div className="calendar-panel">
          <NativeCalendar
            tasks={tasks}
            googleEvents={googleEvents}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </div>

        <div className="calendar-sidebar">
          <div className="sidebar-section google-connection">
            <h3>Google Calendar</h3>
            {isAuthInitialized && (
              <>
                {isGoogleConnected ? (
                  <div className="connection-status connected">
                    <span className="status-indicator"></span>
                    <span>Connected</span>
                    <button className="btn btn--danger btn--small" onClick={handleDisconnectGoogle}>
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="connection-status">
                    <p className="connection-description">
                      Connect your Google Calendar to sync events
                    </p>
                    <button className="btn btn--primary" onClick={handleConnectGoogle}>
                      Connect Google Calendar
                    </button>
                  </div>
                )}
              </>
            )}
            {!isAuthInitialized && (
              <p className="loading-auth">Loading Google Auth...</p>
            )}
          </div>

          <div className="sidebar-section sync-section">
            <h3>Sync Options</h3>
            <button
              className="btn btn--secondary"
              onClick={handleSyncToGoogle}
              disabled={!isGoogleConnected}
            >
              Sync Plan to Google Calendar
            </button>
            {syncMessage && <p className="sync-message">{syncMessage}</p>}
          </div>

          <div className="sidebar-section upcoming-section">
            <h3>Upcoming Tasks</h3>
            {upcomingTasks.length === 0 ? (
              <p className="no-upcoming">No upcoming tasks</p>
            ) : (
              <ul className="upcoming-list">
                {upcomingTasks.map((task) => (
                  <li key={task.id} className="upcoming-item">
                    <span className="upcoming-title">{task.title}</span>
                    <span className="upcoming-date">{dayjs(task.deadline).format('MMM D')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && selectedDate && (
        <AddTaskModal
          date={selectedDate}
          onClose={() => setShowAddTaskModal(false)}
          onAddTasks={onAddTasks}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent.event}
          type={selectedEvent.type}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}

function AddTaskModal({ date, onClose, onAddTasks }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [time, setTime] = useState('09:00')

  function handleSubmit(e) {
    e.preventDefault()

    const deadline = date.clone().hour(parseInt(time.split(':')[0])).minute(parseInt(time.split(':')[1])).toDate()

    onAddTasks([{
      title,
      priority,
      deadline,
      status: 'todo',
      createdAt: new Date().toISOString(),
    }])

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Add Task</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <form className="modal__content" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="task-time">Time</label>
              <input
                id="task-time"
                type="time"
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <p className="form-hint">
              Date: {dayjs(date).format('dddd, MMMM D, YYYY')}
            </p>
          </div>
        </form>
        <div className="modal__footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit}>Add Task</button>
        </div>
      </div>
    </div>
  )
}

function EventDetailsModal({ event, type, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{type === 'google' ? 'Event Details' : 'Task Details'}</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__content">
          {type === 'google' ? (
            <>
              <h3>{event.summary}</h3>
              {event.description && <p>{event.description}</p>}
              <p className="event-time">
                {dayjs(event.start?.dateTime || event.start?.date).format('MMM D, YYYY h:mm A')}
                {' - '}
                {dayjs(event.end?.dateTime || event.end?.date).format('h:mm A')}
              </p>
              {event.location && <p className="event-location">📍 {event.location}</p>}
            </>
          ) : (
            <>
              <h3>{event.title}</h3>
              <p className="task-status">Status: {event.status}</p>
              <p className="task-priority">Priority: {event.priority}</p>
              {event.deadline && (
                <p className="task-deadline">
                  Deadline: {dayjs(event.deadline).format('MMM D, YYYY')}
                </p>
              )}
            </>
          )}
        </div>
        <div className="modal__footer">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default CalendarScreen
