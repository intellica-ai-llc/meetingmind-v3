import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

app.get('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const { data, error } = await supabase
    .from('unresolved_threads')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'open')
    .order('severity', { ascending: false })
    .order('mention_count', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ threads: data })
})

// ── Update thread (NEW) ────────────────────────────────────
app.put('/:id', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json()

  // Verify ownership
  const { data: existing, error: fetchErr } = await supabase
    .from('unresolved_threads')
    .select('id, user_id')
    .eq('id', id)
    .single()
  if (fetchErr || existing.user_id !== user.id) {
    return c.json({ error: 'Thread not found' }, 404)
  }

  // Allowed updatable fields
  const allowedFields = ['title', 'description', 'severity', 'status']
  const updates: Record<string, any> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field]
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400)
  }

  const { error } = await supabase
    .from('unresolved_threads')
    .update(updates)
    .eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

// ── Delete thread (NEW) ────────────────────────────────────
app.delete('/:id', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')

  const { data: existing, error: fetchErr } = await supabase
    .from('unresolved_threads')
    .select('id, user_id')
    .eq('id', id)
    .single()
  if (fetchErr || existing.user_id !== user.id) {
    return c.json({ error: 'Thread not found' }, 404)
  }

  const { error } = await supabase
    .from('unresolved_threads')
    .delete()
    .eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

app.post('/:id/resolve', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const { resolution_notes } = await c.req.json()
  const { data, error } = await supabase
    .from('unresolved_threads')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolution_notes,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 404)
  return c.json({ thread: data })
})

export default app