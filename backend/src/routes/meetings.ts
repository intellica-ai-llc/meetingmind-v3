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

// ── Create meeting ──────────────────────────────────────────
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
    discarded: body.discarded || false,
  }

  const { data, error } = await supabase
    .from('meetings')
    .insert(meeting)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ meeting: data })
})

// ── Update meeting (NEW) ────────────────────────────────────
app.put('/:id', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json()

  // Verify ownership
  const { data: existing, error: fetchErr } = await supabase
    .from('meetings')
    .select('id, user_id')
    .eq('id', id)
    .single()
  if (fetchErr || existing.user_id !== user.id) {
    return c.json({ error: 'Meeting not found' }, 404)
  }

  // Map allowed fields (same mapping as create)
  const allowedFields: Record<string, string> = {
    title: 'title',
    meeting_date: 'meeting_date',
    duration_minutes: 'duration_minutes',
    summary: 'summary',
    decisions: 'decisions',
    action_items: 'action_items',
    open_questions: 'open_questions',
    parking_lot: 'parking_lot',
    key_topics: 'key_topics',
    key_quotes: 'key_quotes',
    sentiment: 'sentiment',
    sentiment_reason: 'sentiment_reason',
    effectiveness_score: 'effectiveness_score',
    effectiveness_reason: 'effectiveness_reason',
    next_agenda: 'next_agenda',
    risk_flags: 'risk_flags',
    meeting_type: 'meeting_type',
    discarded: 'discarded',
  }

  const updates: Record<string, any> = {}
  for (const [jsonKey, dbKey] of Object.entries(allowedFields)) {
    if (body[jsonKey] !== undefined) {
      updates[dbKey] = body[jsonKey]
    }
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400)
  }

  const { error } = await supabase
    .from('meetings')
    .update(updates)
    .eq('id', id)

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true, ...updates })
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