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
    return c.json({ error: 'Invalid signature' }, 400)
  }
  
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.client_reference_id
      const customerId = session.customer
      const subscriptionId = session.subscription
      const planType = session.metadata?.planType || 'pro'
      
      await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_tier: planType,
          subscription_status: 'active'
        })
        .eq('id', userId)
      
      break
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const customerId = subscription.customer
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
      
      if (profile) {
        const tier = subscription.status === 'active' 
          ? (profile.subscription_tier || 'pro') 
          : 'free'
        await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            subscription_tier: tier
          })
          .eq('id', profile.id)
      }
      
      break
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_tier: 'free'
          })
          .eq('id', profile.id)
      }
      
      break
    }
  }
  
  return c.json({ received: true })
})

export default app