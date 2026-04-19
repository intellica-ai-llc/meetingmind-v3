import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

app.post('/register', async (c) => {
  const { email, password, name } = await c.req.json()
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
  if (error) return c.json({ error: error.message }, 400)
  return c.json({ user: data.user })
})

app.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return c.json({ error: error.message }, 401)
  return c.json({ token: data.session?.access_token, user: data.user })
})

export default app
