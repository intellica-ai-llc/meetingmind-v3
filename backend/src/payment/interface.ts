export interface CheckoutOrder {
  userId: string
  email: string
  planType: 'pro' | 'business'
  successUrl: string
  cancelUrl: string
}

export interface CheckoutResult {
  url: string
  providerSessionId?: string
}

export interface WebhookResult {
  userId: string
  planType: string
  status: 'active' | 'canceled' | 'inactive'
  customerId?: string
  subscriptionId?: string
}

export interface PaymentProcessor {
  createCheckoutSession(order: CheckoutOrder): Promise<CheckoutResult>
  handleWebhook(payload: string, signature: string): Promise<WebhookResult | null>
  verifySignature(payload: string, signature: string): boolean
}