import type { PaymentProcessor } from './interface'

export function getPaymentProcessor(env: Record<string, any>): PaymentProcessor {
  const provider = env.ACTIVE_PAYMENT_PROVIDER || 'stripe'

  switch (provider) {
    case 'gumroad': {
      const { GumroadAdapter } = require('./gumroad-adapter')
      return new GumroadAdapter(env)
    }
    case 'stripe':
    default: {
      const { StripeAdapter } = require('./stripe-adapter')
      return new StripeAdapter(env)
    }
  }
}