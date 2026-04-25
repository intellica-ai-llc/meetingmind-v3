import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { requirePlan } from '../middleware/entitlement'

const app = new Hono()

app.get('/patterns', requirePlan('pro'), async (c) => {
  const user = c.get('user')
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data } = await supabase
    .from('intelligence_patterns')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return c.json({ patterns: data || null })
})

app.get('/risks', requirePlan('business'), async (c) => {
  const user = c.get('user')
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data } = await supabase
    .from('intelligence_risks')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return c.json({ risks: data || null })
})

export default app