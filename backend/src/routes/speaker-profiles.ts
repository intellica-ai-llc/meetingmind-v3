import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { requirePlan } from '../middleware/entitlement'

const app = new Hono()

app.get('/', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')

  const { data, error } = await supabase
    .from('speaker_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ speakers: data })
})

app.post('/', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const body = await c.req.json()

  if (!body.name) return c.json({ error: 'Name is required' }, 400)

  const { data, error } = await supabase
    .from('speaker_profiles')
    .insert({
      user_id: user.id,
      name: body.name,
      email: body.email,
      merged_aliases: body.merged_aliases || [],
    })
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ speaker: data })
})

app.put('/:id', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json()

  const { data: existing } = await supabase
    .from('speaker_profiles')
    .select('id, user_id')
    .eq('id', id)
    .single()
  if (!existing || existing.user_id !== user.id)
    return c.json({ error: 'Speaker not found' }, 404)

  const updates: Record<string, any> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.email !== undefined) updates.email = body.email
  if (body.merged_aliases !== undefined) updates.merged_aliases = body.merged_aliases

  const { error } = await supabase
    .from('speaker_profiles')
    .update(updates)
    .eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

app.delete('/:id', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')

  const { data: existing } = await supabase
    .from('speaker_profiles')
    .select('id, user_id')
    .eq('id', id)
    .single()
  if (!existing || existing.user_id !== user.id)
    return c.json({ error: 'Speaker not found' }, 404)

  const { error } = await supabase.from('speaker_profiles').delete().eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

export default app