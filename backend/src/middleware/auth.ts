import { createMiddleware } from 'hono/factory'
import { createClient } from '@supabase/supabase-js'

export const authMiddleware = createMiddleware(async (c, next) => {
  const supabaseUrl = c.env.SUPABASE_URL
  const supabaseKey = c.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = createClient(supabaseUrl, supabaseKey)

  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      error: 'Unauthorized - no token',
      debug_url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING',
      debug_key: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'MISSING'
    }, 401)
  }

  const token = authHeader.substring(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return c.json({
      error: 'Invalid token',
      debug_url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING',
      debug_key: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'MISSING',
      supabase_error: error?.message || 'No user returned'
    }, 401)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  c.set('user', { ...user, ...profile })
  await next()
})
