// Google OAuth 2.0 Authentication Service using Google Identity Services

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID || ''

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ')

let tokenClient = null
let token = null

// Load the Google Identity Services script
function loadGisScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

// Initialize the token client
export async function initGoogleAuth() {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not configured')
    return null
  }

  try {
    await loadGisScript()

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          token = response.access_token
          localStorage.setItem('google_calendar_token', response.access_token)
          localStorage.setItem('google_calendar_token_expiry', Date.now() + response.expires_in * 1000)
        }
      },
    })

    // Check for stored token
    const storedToken = localStorage.getItem('google_calendar_token')
    const expiry = localStorage.getItem('google_calendar_token_expiry')
    if (storedToken && expiry && Date.now() < parseInt(expiry)) {
      token = storedToken
    }

    return tokenClient
  } catch (error) {
    console.error('Failed to initialize Google Auth:', error)
    return null
  }
}

// Request access token
export function requestGoogleAuth(callback) {
  if (!tokenClient) {
    console.error('Token client not initialized. Call initGoogleAuth first.')
    return
  }

  // If we have a valid token, try to use it first
  if (token) {
    const expiry = localStorage.getItem('google_calendar_token_expiry')
    if (expiry && Date.now() < parseInt(expiry)) {
      callback(token)
      return
    }
  }

  tokenClient.requestAccessToken({
    prompt: token ? '' : 'consent',
  })
}

// Get current token
export function getGoogleToken() {
  const expiry = localStorage.getItem('google_calendar_token_expiry')
  if (token && expiry && Date.now() < parseInt(expiry)) {
    return token
  }
  token = null
  localStorage.removeItem('google_calendar_token')
  return null
}

// Check if user is authenticated
export function isGoogleAuthenticated() {
  return !!getGoogleToken()
}

// Revoke access
export function revokeGoogleAccess() {
  const storedToken = localStorage.getItem('google_calendar_token')
  if (storedToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(storedToken, () => {
      localStorage.removeItem('google_calendar_token')
      localStorage.removeItem('google_calendar_token_expiry')
    })
  } else {
    localStorage.removeItem('google_calendar_token')
    localStorage.removeItem('google_calendar_token_expiry')
  }
  token = null
}

// Fetch events from Google Calendar
export async function fetchGoogleCalendarEvents(startDate, endDate) {
  const authToken = getGoogleToken()
  if (!authToken) {
    throw new Error('Not authenticated with Google')
  }

  const timeMin = startDate.toISOString()
  const timeMax = endDate.toISOString()

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&orderBy=startTime&singleEvents=true`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear it
        revokeGoogleAccess()
        throw new Error('Authentication expired')
      }
      throw new Error(`Failed to fetch events: ${response.status}`)
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error)
    throw error
  }
}

// Create event in Google Calendar
export async function createGoogleCalendarEvent(eventData) {
  const authToken = getGoogleToken()
  if (!authToken) {
    throw new Error('Not authenticated with Google')
  }

  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      if (response.status === 401) {
        revokeGoogleAccess()
        throw new Error('Authentication expired')
      }
      throw new Error(`Failed to create event: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating Google Calendar event:', error)
    throw error
  }
}

// Delete event from Google Calendar
export async function deleteGoogleCalendarEvent(eventId) {
  const authToken = getGoogleToken()
  if (!authToken) {
    throw new Error('Not authenticated with Google')
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        revokeGoogleAccess()
        throw new Error('Authentication expired')
      }
      throw new Error(`Failed to delete event: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error)
    throw error
  }
}
