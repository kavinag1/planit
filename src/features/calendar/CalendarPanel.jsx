import { useMemo, useState } from 'react'
import {
  openEventsInGoogleCalendar,
  planToCalendarEvents,
  pushEventsToGoogleCalendar,
} from '../../services/calendar/googleCalendar.js'

function CalendarPanel({ plan }) {
  const [token, setToken] = useState('')
  const [resultMessage, setResultMessage] = useState('')

  const events = useMemo(() => planToCalendarEvents(plan), [plan])

  async function handleApiSync() {
    if (!token.trim()) {
      setResultMessage('Add a Google access token first.')
      return
    }

    const result = await pushEventsToGoogleCalendar(events, token.trim())
    const okCount = result.filter((item) => item.ok).length
    setResultMessage(`${okCount}/${events.length} events synced to Google Calendar API.`)
  }

  return (
    <section className="panel">
      <div className="panel__header-row">
        <h2>Calendar</h2>
        <span className="status-chip">Google integration</span>
      </div>

      <p className="calendar-meta">Generated {events.length} time blocks from today plan.</p>

      <div className="button-row">
        <button className="btn" onClick={() => openEventsInGoogleCalendar(events)}>
          Open in Google Calendar
        </button>
      </div>

      <label className="token-label" htmlFor="google-token">
        Optional OAuth access token for direct Google Calendar API sync:
      </label>
      <input
        id="google-token"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder="ya29..."
      />

      <button className="btn btn--primary" onClick={handleApiSync}>
        Push Events via API
      </button>

      {resultMessage ? <p className="calendar-meta">{resultMessage}</p> : null}
    </section>
  )
}

export default CalendarPanel
