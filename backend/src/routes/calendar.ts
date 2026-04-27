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

  // Exchange code for tokens
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

    // Register a watch channel for push notifications
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

  // Google sends headers: X-Goog-Channel-ID, X-Goog-Channel-Token, X-Goog-Resource-ID, etc.
  const channelId = c.req.header('X-Goog-Channel-ID')
  const channelToken = c.req.header('X-Goog-Channel-Token')
  const resourceState = c.req.header('X-Goog-Resource-State')
  const resourceId = c.req.header('X-Goog-Resource-ID')

  if (!channelId || !channelToken) {
    return c.json({ error: 'Missing required headers' }, 400)
  }

  // Find the user by channel token (we stored channelToken = userId in registration)
  const userId = channelToken
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, subscription_tier, subscription_status')
    .eq('id', userId)
    .single()

  if (!profile) return c.json({ error: 'Unknown user' }, 404)

  // Verify channel ID matches stored value (optional security)
  const { data: storedChannel } = await supabase
    .from('profiles')
    .select('google_calendar_channel_id')
    .eq('id', userId)
    .single()

  if (storedChannel?.google_calendar_channel_id !== channelId) {
    return c.json({ error: 'Channel ID mismatch' }, 403)
  }

  // If resource state is 'sync' or 'exists', we should process the event
  // For delivery of event changes, Google sends 'exists' or 'not_exists'
  if (resourceState === 'exists' || resourceState === 'sync') {
    // The notification indicates that events have changed.
    // In a full implementation we could fetch the changed event using resourceId,
    // but for MVP we can simply trigger the calendar polling function immediately
    // to pick up any new events.
    const { pollCalendarEvents } = await import('../services/calendar')
    ctx.waitUntil(pollCalendarEvents(c.env))
  }

  // Acknowledge receipt
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

export default app