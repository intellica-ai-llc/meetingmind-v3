import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

app.get('/', async (c) => {
  const user = c.get('user')
  const { data, error } = await supabase.from('unresolved_threads').select('*').eq('user_id', user.id).eq('status', 'open').order('severity', { ascending: false }).order('mention_count', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ threads: data })
})

app.post('/:id/resolve', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const { resolution_notes } = await c.req.json()
  const { data, error } = await supabase.from('unresolved_threads').update({ status: 'resolved', resolved_at: new Date().toISOString(), resolution_notes }).eq('id', id).eq('user_id', user.id).select().single()
  if (error) return c.json({ error: error.message }, 404)
  return c.json({ thread: data })
})

export default app
