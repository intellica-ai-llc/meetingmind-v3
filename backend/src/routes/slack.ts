import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { requirePlan } from '../middleware/entitlement'

const app = new Hono()

// GET /api/slack/config
app.get('/config', requirePlan('business'), async (c) => {
  const user = c.get('user')
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data } = await supabase
    .from('slack_configs')
    .select('channel_webhook_url, notify_on_completion')
    .eq('user_id', user.id)
    .maybeSingle()

  return c.json({
    webhookUrl: data?.channel_webhook_url || '',
    notifyEnabled: data?.notify_on_completion ?? true,
  })
})

// POST /api/slack/config
app.post('/config', requirePlan('business'), async (c) => {
  const user = c.get('user')
  const { webhookUrl, notifyEnabled } = await c.req.json()
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  await supabase
    .from('slack_configs')
    .upsert({
      user_id: user.id,
      channel_webhook_url: webhookUrl,
      notify_on_completion: notifyEnabled ?? true,
    }, { onConflict: 'user_id' })

  return c.json({ success: true })
})

export default app