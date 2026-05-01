import { createMiddleware } from 'hono/factory'
import { createClient } from '@supabase/supabase-js'

// Paths that must be accessible without a JWT
const PUBLIC_PATHS = [
  '/api/calendar/callback',
  '/api/calendar/webhook',
  '/api/payments/webhook',
]

export const authMiddleware = createMiddleware(async (c, next) => {
  // Allow public enpoints through without authentication
  const url = new URL(c.req.url)
  if (PUBLIC_PATHS.some(path => url.pathname === path)) {
    return await next()
  }

  const supabaseUrl = c.env.SUPABASE_URL
  const supabaseKey = c.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = createClient(supabaseUrl, supabaseKey)

  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      error: 'Unauthorized - no token',
    }, 401)
  }

  const token = authHeader.substring(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return c.json({
      error: 'Invalid token',
      supabase_error: error?.message || 'No user returned',
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