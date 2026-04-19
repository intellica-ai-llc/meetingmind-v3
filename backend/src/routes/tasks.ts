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

app.put('/:id/complete', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const { completion_notes } = await c.req.json()
  const { data, error } = await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString(), completion_notes }).eq('id', id).eq('user_id', user.id).select().single()
  if (error) return c.json({ error: error.message }, 404)
  return c.json({ task: data })
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