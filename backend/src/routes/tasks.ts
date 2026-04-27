import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

app.get('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const { status } = c.req.query()
  let query = supabase.from('tasks').select('*, meetings(title)').eq('user_id', user.id).order('due_date', { ascending: true, nullsFirst: false })
  if (status && status !== 'all') query = query.eq('status', status)
  const { data, error } = await query
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ tasks: data })
})

app.post('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const { title, description, owner_name, due_date, priority, meeting_id } = await c.req.json()
  if (!title) return c.json({ error: 'Title is required' }, 400)
  const { data, error } = await supabase.from('tasks').insert({ user_id: user.id, title, description, owner_name, due_date, priority, meeting_id, status: 'pending' }).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ task: data })
})

// ── Update task (NEW) ──────────────────────────────────────
app.put('/:id', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json()

  // Verify ownership
  const { data: existing, error: fetchErr } = await supabase
    .from('tasks')
    .select('id, user_id')
    .eq('id', id)
    .single()
  if (fetchErr || existing.user_id !== user.id) {
    return c.json({ error: 'Task not found' }, 404)
  }

  // Allowed updatable fields
  const allowedFields = ['title', 'description', 'owner_name', 'due_date', 'priority', 'status']
  const updates: Record<string, any> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field]
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400)
  }

  const { error } = await supabase.from('tasks').update(updates).eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

app.put('/:id/complete', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const { completion_notes } = await c.req.json()
  const { data, error } = await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString(), completion_notes }).eq('id', id).eq('user_id', user.id).select().single()
  if (error) return c.json({ error: error.message }, 404)
  return c.json({ task: data })
})

// ── Delete task (NEW) ──────────────────────────────────────
app.delete('/:id', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')

  const { data: existing, error: fetchErr } = await supabase
    .from('tasks')
    .select('id, user_id')
    .eq('id', id)
    .single()
  if (fetchErr || existing.user_id !== user.id) {
    return c.json({ error: 'Task not found' }, 404)
  }

  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

app.post('/bulk/remind', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const { task_ids } = await c.req.json()
  const { data, error } = await supabase.from('tasks').select('*').in('id', task_ids).eq('user_id', user.id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ reminded: data?.length || 0 })
})

export default app