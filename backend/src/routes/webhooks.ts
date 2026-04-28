import { Hono } from 'hono'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

app.post('/webhook', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: '2025-02-24.acacia',
  })

  const signature = c.req.header('stripe-signature')
  const body = await c.req.text()
  let event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      c.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed', err)
    return c.json({ error: 'Invalid signature' }, 400)
  }

  console.log('Stripe webhook received', { type: event.type })

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.client_reference_id
        const customerId = session.customer
        const subscriptionId = session.subscription
        const planType = session.metadata?.planType || 'pro'

        // Retrieve the user's email from auth
        let email = session.customer_email || null
        if (userId && !email) {
          try {
            const { data: authUser } = await supabase.auth.admin.getUserById(userId)
            email = authUser?.user?.email || null
          } catch (e) {
            console.error('Failed to fetch user email for webhook', e)
          }
        }

        console.log('Processing checkout.session.completed', { userId, planType, email })

        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email,                                    // ← required NOT NULL column
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_tier: planType,
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' })

        if (error) throw error
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, subscription_tier, email')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          const tier = subscription.status === 'active' 
            ? (profile.subscription_tier || 'pro') 
            : 'free'

          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: profile.id,
              email: profile.email,                 // already present
              subscription_status: subscription.status,
              subscription_tier: tier,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })

          if (error) throw error
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: profile.id,
              email: profile.email,                 // already present
              subscription_status: 'canceled',
              subscription_tier: 'free',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })

          if (error) throw error
        }
        break
      }
    }

    return c.json({ received: true })
  } catch (err: any) {
    console.error('Webhook processing failed', err.message || err)
    return c.json({ error: 'Internal server error' }, 500)   // Stripe will retry
  }
})

export default app