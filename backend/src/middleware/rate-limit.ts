import { createMiddleware } from 'hono/factory'

const requestCounts = new Map<string, { count: number; resetAt: number }>()

// Paths that must never be rate‑limited (post‑checkout polling, subscription checks, cached calendar)
const skipPaths = [
  '/api/payments/subscription',
  '/api/payments/verify-purchase',
  '/api/calendar/upcoming',
]

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const userId = c.get('user')?.id || c.req.header('cf-connecting-ip') || 'anonymous'
  const key = `rate_limit:${userId}`

  // Allow unlimited requests to the paths that the post‑checkout page depends on
  if (skipPaths.includes(new URL(c.req.url).pathname)) {
    return await next()
  }

  const now = Date.now()
  const windowMs = 30 * 1000        // 30 seconds (burst‑friendly)
  const maxRequests = 60            // 60 requests per window (was 30)
  const record = requestCounts.get(key)

  if (record && now < record.resetAt) {
    if (record.count >= maxRequests) {
      return c.json({ error: 'Rate limit exceeded. Please try again later.' }, 429)
    }
    record.count++
  } else {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs })
  }

  await next()
})