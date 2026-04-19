import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

app.post('/register', async (c) => {
  // ✅ Create client INSIDE the handler using c.env
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  
  const { email, password, name } = await c.req.json()
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password, 
    options: { data: { name } } 
  })
  if (error) return c.json({ error: error.message }, 400)
  return c.json({ user: data.user })
})

app.post('/login', async (c) => {
  // ✅ Create client INSIDE the handler using c.env
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  
  const { email, password } = await c.req.json()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return c.json({ error: error.message }, 401)
  return c.json({ token: data.session?.access_token, user: data.user })
})

export default app