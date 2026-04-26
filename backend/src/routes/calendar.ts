import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { requirePlan } from '../middleware/entitlement'

const app = new Hono()

// ── OAuth callback (exchanges code for refresh token) ──────
app.get('/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')   // optional: pass user ID or session

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

  if (!refreshToken) {
    // User may have already granted access; Google only returns refresh_token the first time.
    // If it's missing, we can't store it, so return a meaningful message.
    return c.json({
      error: 'No refresh token returned. If you previously authorized, revoke access and try again.',
      detail: 'Google only sends the refresh token on the first authorization.'
    }, 400)
  }

  // Determine user ID: we expect state to contain the user ID, or we fall back to the authenticated user.
  // For MVP, the state parameter is ignored and we rely on the user being authenticated via a cookie/JWT.
  // Real production flow: pass state={userId} when starting OAuth, verify it here.
  // For now, we store the refresh token associated with the user identified by state.
  const userId = state // ideally state contains the user ID

  if (userId) {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
    await supabase
      .from('profiles')
      .update({
        google_calendar_refresh_token: refreshToken,
        google_calendar_sync_enabled: true,
      })
      .eq('id', userId)
  }

  // Redirect to settings page
  return c.redirect('https://meetingmind-v3.pages.dev/settings?calendar=connected')
})

// ── Manual connect (stores a refresh token directly) ───────
app.post('/connect', requirePlan('pro'), async (c) => {
  const user = c.get('user')
  const { refreshToken } = await c.req.json()
  if (!refreshToken) return c.json({ error: 'Refresh token required' }, 400)

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  await supabase
    .from('profiles')
    .update({
      google_calendar_refresh_token: refreshToken,
      google_calendar_sync_enabled: true,
    })
    .eq('id', user.id)

  return c.json({ success: true })
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