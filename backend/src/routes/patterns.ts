import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

app.get('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const { data, error } = await supabase.from('user_patterns').select('*').eq('user_id', user.id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ patterns: data })
})

app.post('/refresh', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const { data: meetings } = await supabase.from('meetings').select('effectiveness_score, created_at').eq('user_id', user.id).order('created_at', { ascending: true })
  if (meetings && meetings.length >= 5) {
    const recent = meetings.slice(-5)
    const avg = recent.reduce((sum, m) => sum + (m.effectiveness_score || 0), 0) / recent.length
    const baseline = meetings.slice(-10).reduce((sum, m) => sum + (m.effectiveness_score || 0), 0) / Math.min(meetings.length, 10)
    await supabase.from('user_patterns').upsert({ user_id: user.id, pattern_type: 'effectiveness', baseline_value: baseline, current_trend: avg - baseline, confidence_score: Math.min(meetings.length / 20, 1), sample_size: meetings.length, updated_at: new Date().toISOString() }, { onConflict: 'user_id, pattern_type' })
  }
  return c.json({ success: true })
})

export default app