import { Hono } from 'hono'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

app.post('/create-checkout-session', async (c) => {
  const user = c.get('user')

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: '2025-02-24.acacia',
  })

  const { priceId, successUrl, cancelUrl, planType } = await c.req.json()

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user.id,
      planType: planType || 'pro',
    },
  })

  return c.json({ url: session.url })
})

app.get('/subscription', async (c) => {
  const user = c.get('user')
  if (!user?.id) return c.json({ error: 'Not authenticated' }, 401)

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return c.json({ subscription: { tier: 'free', status: 'inactive' } })
  }

  return c.json({
    subscription: {
      tier: profile.subscription_tier || 'free',
      status: profile.subscription_status || 'inactive',
      stripe_customer_id: profile.stripe_customer_id,
    },
  })
})

app.post('/create-portal-session', async (c) => {
  const user = c.get('user')
  const { returnUrl } = await c.req.json()

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: '2025-02-24.acacia',
  })

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return c.json({ error: 'No Stripe customer found' }, 404)
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: returnUrl || 'https://meetingmind-v3.pages.dev/dashboard',
  })

  return c.json({ url: session.url })
})

export default app