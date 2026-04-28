import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

app.post('/access-code', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const { password, plan } = await c.req.json()
  if (!password || !['pro', 'business'].includes(plan)) {
    return c.json({ error: 'Password and a valid plan (pro/business) are required.' }, 400)
  }

  const expectedPassword = c.env.ACCESS_CODE_PASSWORD
  if (!expectedPassword || password !== expectedPassword) {
    return c.json({ error: 'Incorrect password.' }, 403)
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      subscription_tier: plan,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (error) {
    console.error('access-code upsert failed', error)
    return c.json({ error: 'Failed to update subscription.' }, 500)
  }

  return c.json({ success: true, plan })
})

export default app