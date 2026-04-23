import { Hono } from 'hono'
import Stripe from 'stripe'

const app = new Hono()

app.post('/create-checkout-session', async (c) => {
  const user = c.get('user')
  
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: '2025-02-24.acacia',
  })
  
  const { priceId, successUrl, cancelUrl } = await c.req.json()
  
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId: user.id }
  })
  
  return c.json({ url: session.url })
})

export default app
