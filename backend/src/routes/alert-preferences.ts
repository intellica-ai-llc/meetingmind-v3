import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { requirePlan } from '../middleware/entitlement'

const app = new Hono()

app.get('/', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')

  const { data, error } = await supabase
    .from('alert_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ preferences: data })
})

app.put('/', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const body = await c.req.json()

  const updates: Record<string, any> = {}
  if (body.risk_escalation_threshold !== undefined) updates.risk_escalation_threshold = body.risk_escalation_threshold
  if (body.stale_thread_days !== undefined) updates.stale_thread_days = body.stale_thread_days
  if (body.overdue_task_reminders !== undefined) updates.overdue_task_reminders = body.overdue_task_reminders
  if (body.coach_digest_frequency !== undefined) updates.coach_digest_frequency = body.coach_digest_frequency
  updates.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('alert_preferences')
    .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

export default app