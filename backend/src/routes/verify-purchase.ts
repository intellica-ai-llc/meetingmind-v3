import { Hono } from 'hono'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

app.post('/verify-purchase', async (c) => {
  const user = c.get('user')
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: '2025-02-24.acacia',
  })

  // Get the user's Stripe customer ID from their profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  if (profile?.stripe_customer_id) {
    // Already have customer ID, try to find completed session
    const sessions = await stripe.checkout.sessions.list({
      customer: profile.stripe_customer_id,
      limit: 5,
    })

    const completedSession = sessions.data.find(
      (s) => s.payment_status === 'paid' && s.mode === 'subscription'
    )

    if (completedSession) {
      const planType = completedSession.metadata?.planType || 'pro'
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          stripe_customer_id: completedSession.customer,
          stripe_subscription_id: completedSession.subscription,
          subscription_tier: planType,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (error) {
        console.error('verify-purchase upsert failed', error)
        return c.json({ error: 'Failed to update subscription. Please try again.' }, 500)
      }
      return c.json({ plan: planType, status: 'active' })
    }
  }

  // Fallback: try to find customer by email
  const customers = await stripe.customers.list({ email: user.email, limit: 1 })
  if (customers.data.length === 0) {
    return c.json({ error: 'No Stripe customer found. Please try again later.' }, 404)
  }

  const customerId = customers.data[0].id

  // Store the customer ID
  await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    limit: 5,
  })

  const completedSession = sessions.data.find(
    (s) => s.payment_status === 'paid' && s.mode === 'subscription'
  )

  if (!completedSession) {
    return c.json({ error: 'No completed purchase found. Please try again or contact support.' }, 404)
  }

  const planType = completedSession.metadata?.planType || 'pro'

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      stripe_customer_id: completedSession.customer,
      stripe_subscription_id: completedSession.subscription,
      subscription_tier: planType,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (error) {
    console.error('verify-purchase upsert failed', error)
    return c.json({ error: 'Failed to update subscription. Please try again.' }, 500)
  }

  return c.json({ plan: planType, status: 'active' })
})

export default app