import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { requirePlan } from '../middleware/entitlement'
import { registerWatchChannel } from '../services/calendar'

const app = new Hono()

// ── OAuth callback (exchanges code for refresh token) ──────
app.get('/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')   // user ID or session

  if (!code) return c.json({ error: 'Missing authorization code' }, 400)

  const redirectUri = 'https://meetingmind-api-production.intellicaai-ai.workers.dev/api/calendar/callback'

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    return c.json({ error: 'OAuth token exchange failed', detail: err }, 500)
  }

  const tokens = await tokenRes.json()
  const refreshToken = tokens.refresh_token
  const accessToken = tokens.access_token

  if (!refreshToken) {
    return c.json({
      error: 'No refresh token returned. If you previously authorized, revoke access and try again.',
      detail: 'Google only sends the refresh token on the first authorization.'
    }, 400)
  }

  const userId = state

  if (userId) {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
    await supabase
      .from('profiles')
      .update({
        google_calendar_refresh_token: refreshToken,
        google_calendar_sync_enabled: true,
      })
      .eq('id', userId)

    if (accessToken) {
      try {
        await registerWatchChannel(c.env, userId, accessToken)
      } catch (err) {
        console.error('Failed to register watch channel:', err)
      }
    }
  }

  return c.redirect('https://meetingmind-v3.pages.dev/settings?calendar=connected')
})

// ── Manual connect (stores a refresh token directly) ───────
app.post('/connect', requirePlan('pro'), async (c) => {
  const user = c.get('user')
  const { refreshToken, accessToken } = await c.req.json()
  if (!refreshToken) return c.json({ error: 'Refresh token required' }, 400)

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  await supabase
    .from('profiles')
    .update({
      google_calendar_refresh_token: refreshToken,
      google_calendar_sync_enabled: true,
    })
    .eq('id', user.id)

  if (accessToken) {
    try {
      await registerWatchChannel(c.env, user.id, accessToken)
    } catch (err) {
      console.error('Failed to register watch channel:', err)
    }
  }

  return c.json({ success: true })
})

// ── Google Calendar push notification webhook (public) ────
app.post('/webhook', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  const channelId = c.req.header('X-Goog-Channel-ID')
  const channelToken = c.req.header('X-Goog-Channel-Token')
  const resourceState = c.req.header('X-Goog-Resource-State')
  const resourceId = c.req.header('X-Goog-Resource-ID')

  if (!channelId || !channelToken) {
    return c.json({ error: 'Missing required headers' }, 400)
  }

  const userId = channelToken
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, subscription_tier, subscription_status')
    .eq('id', userId)
    .single()

  if (!profile) return c.json({ error: 'Unknown user' }, 404)

  const { data: storedChannel } = await supabase
    .from('profiles')
    .select('google_calendar_channel_id')
    .eq('id', userId)
    .single()

  if (storedChannel?.google_calendar_channel_id !== channelId) {
    return c.json({ error: 'Channel ID mismatch' }, 403)
  }

  if (resourceState === 'exists' || resourceState === 'sync') {
    const { pollCalendarEvents } = await import('../services/calendar')
    ctx.waitUntil(pollCalendarEvents(c.env))
  }

  return c.json({ status: 'ok' })
})

// ── Status ─────────────────────────────────────────────────
app.get('/status', requirePlan('pro'), async (c) => {
  const user = c.get('user')
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: profile } = await supabase
    .from('profiles')
    .select('google_calendar_sync_enabled')
    .eq('id', user.id)
    .single()

  return c.json({
    enabled: profile?.google_calendar_sync_enabled || false,
  })
})

// ── Upcoming Events (NEW) ──────────────────────────────────
app.get('/upcoming', requirePlan('pro'), async (c) => {
  const user = c.get('user')
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  // 1. Get refresh token from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('google_calendar_refresh_token, google_calendar_sync_enabled')
    .eq('id', user.id)
    .single()

  if (!profile?.google_calendar_refresh_token || !profile?.google_calendar_sync_enabled) {
    return c.json({ events: [], connected: false })
  }

  // 2. Check KV cache (5 minutes)
  const cacheKey = `calendar:upcoming:${user.id}`
  let cached: string | null = null
  try {
    if (c.env.MEETING_JOBS) {
      cached = await c.env.MEETING_JOBS.get(cacheKey)
    }
  } catch {}

  if (cached) {
    try {
      return c.json(JSON.parse(cached))
    } catch {}
  }

  // 3. Refresh access token
  let accessToken: string
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        refresh_token: profile.google_calendar_refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenRes.ok) {
      console.error('Google token refresh failed', await tokenRes.text())
      return c.json({ error: 'Failed to refresh Google token. Please reconnect your calendar.' }, 502)
    }

    const tokens = await tokenRes.json()
    accessToken = tokens.access_token
  } catch (err: any) {
    console.error('Google token refresh exception', err.message)
    return c.json({ error: 'Failed to communicate with Google. Please try again later.' }, 502)
  }

  // 4. Fetch upcoming events
  let events: any[] = []
  try {
    const now = new Date().toISOString()
    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({
        timeMin: now,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '100',
      }),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!calRes.ok) {
      const errText = await calRes.text()
      console.error('Google Calendar events fetch failed', errText)
      return c.json({ error: 'Failed to fetch calendar events. Please try again.' }, 502)
    }

    const data = await calRes.json()
    events = (data.items || []).map((event: any) => ({
      id: event.id,
      title: event.summary || '(No title)',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      attendees: event.attendees?.map((a: any) => a.email) || [],
      hangoutLink: event.hangoutLink || null,
      conferenceData: event.conferenceData || null,
    }))
  } catch (err: any) {
    console.error('Google Calendar fetch exception', err.message)
    return c.json({ error: 'Failed to fetch calendar events. Please try again.' }, 502)
  }

  const response = { events, connected: true }

  // 5. Cache for 5 minutes
  try {
    if (c.env.MEETING_JOBS) {
      await c.env.MEETING_JOBS.put(cacheKey, JSON.stringify(response), { expirationTtl: 300 })
    }
  } catch {}

  return c.json(response)
})

export default app