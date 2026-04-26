import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { getActiveJobs } from '../services/concurrency'

const app = new Hono()

app.get('/status', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single()

  const tier = profile?.subscription_tier || 'free'
  const isPaid = (tier === 'pro' || tier === 'business') && profile?.subscription_status === 'active'

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const { data: usage } = await supabase
    .from('monthly_usage')
    .select('meetings_count')
    .eq('user_id', user.id)
    .eq('period_start', periodStart)
    .maybeSingle()

  const meetingsThisMonth = usage?.meetings_count || 0
  const limit = isPaid ? 999 : 10
  const remaining = Math.max(limit - meetingsThisMonth, 0)

  const activeJobs = await getActiveJobs(c.env)
  const concurrencyAvailable = activeJobs < 5

  let message: string | undefined
  if (remaining === 0) {
    message = 'Monthly limit reached. Upgrade to Pro for unlimited meetings.'
  } else if (remaining === 1) {
    message = 'One free meeting remaining this month.'
  }

  return c.json({
    tier,
    isPaid,
    meetingsThisMonth,
    limit,
    remaining,
    concurrencyAvailable,
    globalActiveJobs: activeJobs,
    message,
  })
})

export default app