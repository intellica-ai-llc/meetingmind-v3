import { createMiddleware } from 'hono/factory'
import { createClient } from '@supabase/supabase-js'

export const requirePlan = (requiredPlan: 'pro' | 'business') => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user')
    if (!user) return c.json({ error: 'Unauthorized' }, 401)

    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single()

    const planRank: Record<string, number> = { free: 0, pro: 1, business: 2 }
    const userRank = planRank[profile?.subscription_tier || 'free']
    const requiredRank = planRank[requiredPlan]

    if (userRank < requiredRank || profile?.subscription_status !== 'active') {
      return c.json(
        { error: 'Upgrade required', required: requiredPlan },
        402
      )
    }

    await next()
  })
}