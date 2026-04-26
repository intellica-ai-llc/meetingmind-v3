import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

// ── List meetings ───────────────────────────────────────────
app.get('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const { limit = 20, offset = 0 } = c.req.query()
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ meetings: data })
})

// ── Search meetings ─────────────────────────────────────────
app.get('/search', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const q = c.req.query('q')
  if (!q) return c.json({ meetings: [] })
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', user.id)
    .or(`summary.ilike.%${q}%,decisions.cs.{${q}},action_items.cs.{${q}}`)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ meetings: data })
})

// ── Get single meeting ──────────────────────────────────────
app.get('/:id', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (error) return c.json({ error: error.message }, 404)
  return c.json({ meeting: data })
})

// ── Create meeting (NEW) ────────────────────────────────────
app.post('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const body = await c.req.json()

  const meeting = {
    user_id: user.id,
    title: body.title || null,
    meeting_date: body.meeting_date || null,
    duration_minutes: body.duration_minutes || null,
    summary: body.summary || null,
    decisions: body.decisions || [],
    action_items: body.action_items || [],
    open_questions: body.open_questions || [],
    parking_lot: body.parking_lot || [],
    key_topics: body.key_topics || [],
    key_quotes: body.key_quotes || [],
    sentiment: body.sentiment || null,
    sentiment_reason: body.sentiment_reason || null,
    effectiveness_score: body.effectiveness_score || null,
    effectiveness_reason: body.effectiveness_reason || null,
    next_agenda: body.next_agenda || [],
    risk_flags: body.risk_flags || [],
    meeting_type: body.meeting_type || null,
  }

  const { data, error } = await supabase
    .from('meetings')
    .insert(meeting)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ meeting: data })
})

// ── Delete meeting ──────────────────────────────────────────
app.delete('/:id', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

export default app