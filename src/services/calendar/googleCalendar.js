import dayjs from 'dayjs'

function toCalendarDate(dateString, hour = 9) {
  const base = dayjs(dateString || new Date().toISOString().slice(0, 10))
  return base.hour(hour).minute(0).second(0).millisecond(0)
}

export function planToCalendarEvents(plan) {
  let currentHour = 9
  return plan.blocks.map((block) => {
    const start = toCalendarDate(plan.date, currentHour)
    const durationHours = Math.max(0.5, block.minutes / 60)
    const end = start.add(durationHours, 'hour')
    currentHour += durationHours

    return {
      summary: block.title,
      description: `Planit task block (${block.category}, ${block.priority})`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    }
  })
}

function buildGoogleEventLink(event) {
  const start = dayjs(event.start.dateTime).utc().format('YYYYMMDDTHHmmss[Z]')
  const end = dayjs(event.end.dateTime).utc().format('YYYYMMDDTHHmmss[Z]')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    details: event.description || '',
    dates: `${start}/${end}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function openEventsInGoogleCalendar(events) {
  events.forEach((event, index) => {
    const url = buildGoogleEventLink(event)
    window.setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer')
    }, index * 300)
  })
}

export async function pushEventsToGoogleCalendar(events, accessToken, calendarId = 'primary') {
  const endpoint = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`

  const results = []
  for (const event of events) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      const text = await response.text()
      results.push({ ok: false, error: text })
      continue
    }

    results.push({ ok: true, value: await response.json() })
  }

  return results
}
