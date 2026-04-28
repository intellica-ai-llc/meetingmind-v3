import Stripe from 'stripe'
import type { PaymentProcessor, CheckoutOrder, CheckoutResult, WebhookResult } from './interface'

export class StripeAdapter implements PaymentProcessor {
  private stripe: Stripe

  constructor(private env: Record<string, any>) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2025-02-24.acacia',
    })
  }

  async createCheckoutSession(order: CheckoutOrder): Promise<CheckoutResult> {
    // Price IDs are stored as Cloudflare Worker secrets, not on the frontend
    const priceId =
      order.planType === 'business'
        ? this.env.STRIPE_PRICE_BUSINESS
        : this.env.STRIPE_PRICE_PRO

    const session = await this.stripe.checkout.sessions.create({
      customer_email: order.email,
      client_reference_id: order.userId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: order.successUrl,
      cancel_url: order.cancelUrl,
      metadata: {
        userId: order.userId,
        planType: order.planType,
      },
    })

    return {
      url: session.url!,
      providerSessionId: session.id,
    }
  }

  async verifySignature(payload: string, signature: string): Promise<boolean> {
    try {
      await this.stripe.webhooks.constructEventAsync(
        payload,
        signature,
        this.env.STRIPE_WEBHOOK_SECRET
      )
      return true
    } catch {
      return false
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<WebhookResult | null> {
    let event: Stripe.Event
    try {
      event = await this.stripe.webhooks.constructEventAsync(
        payload,
        signature,
        this.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Stripe webhook signature verification failed', err)
      return null
    }

    console.log('StripeAdapter: received event', { type: event.type })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        return {
          userId: session.client_reference_id || '',
          planType: (session.metadata?.planType as string) || 'pro',
          status: 'active',
          customerId: session.customer as string,
          subscriptionId: session.subscription as string,
        }
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        return {
          userId: '',
          planType: (subscription.metadata?.planType as string) || 'pro',
          status: subscription.status === 'active' ? 'active' : 'inactive',
          customerId: subscription.customer as string,
          subscriptionId: subscription.id,
        }
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        return {
          userId: '',
          planType: 'pro',
          status: 'canceled',
          customerId: subscription.customer as string,
          subscriptionId: subscription.id,
        }
      }
      default:
        return null
    }
  }
}