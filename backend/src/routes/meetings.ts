import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

app.get('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const { limit = 20, offset = 0 } = c.req.query()
  const { data, error } = await supabase.from('meetings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ meetings: data })
})

app.get('/search', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const q = c.req.query('q')
  if (!q) return c.json({ meetings: [] })
  const { data, error } = await supabase.from('meetings').select('*').eq('user_id', user.id).or(`summary.ilike.%${q}%,decisions.cs.{${q}},action_items.cs.{${q}}`).order('created_at', { ascending: false }).limit(20)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ meetings: data })
})

app.get('/:id', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const { data, error } = await supabase.from('meetings').select('*').eq('id', id).eq('user_id', user.id).single()
  if (error) return c.json({ error: error.message }, 404)
  return c.json({ meeting: data })
})

app.delete('/:id', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const { error } = await supabase.from('meetings').delete().eq('id', id).eq('user_id', user.id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

export default app