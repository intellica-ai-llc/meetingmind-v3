import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { requirePlan } from '../middleware/entitlement'

const app = new Hono()

// POST /api/calendar/connect — store refresh token and enable sync
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

// GET /api/calendar/status — check if calendar sync is active
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