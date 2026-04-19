import { createMiddleware } from 'hono/factory'

const requestCounts = new Map<string, { count: number; resetAt: number }>()

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const userId = c.get('user')?.id || c.req.header('cf-connecting-ip') || 'anonymous'
  const key = `rate_limit:${userId}`
  const now = Date.now()
  const windowMs = 60 * 1000
  const maxRequests = 30
  const record = requestCounts.get(key)
  if (record && now < record.resetAt) {
    if (record.count >= maxRequests) return c.json({ error: 'Rate limit exceeded. Please try again later.' }, 429)
    record.count++
  } else { requestCounts.set(key, { count: 1, resetAt: now + windowMs }) }
  await next()
})
