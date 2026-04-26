import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface Subscription {
  tier: string
  status: string
  stripe_customer_id?: string
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/payments/subscription')
      .then((res) => setSubscription(res.data.subscription))
      .catch(() => setSubscription({ tier: 'free', status: 'inactive' }))
      .finally(() => setLoading(false))
  }, [])

  const isPaid =
    subscription?.status === 'active' &&
    (subscription?.tier === 'pro' || subscription?.tier === 'business')

  return { subscription, loading, isPaid }
}