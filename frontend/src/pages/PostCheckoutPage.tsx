import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'

export function PostCheckoutPage() {
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan') || 'pro'
  const [status, setStatus] = useState<'polling' | 'verifying' | 'success' | 'error'>('polling')
  const navigate = useNavigate()

  useEffect(() => {
    if (status !== 'polling') return

    let attempts = 0
    const maxAttempts = 30   // 60 seconds total

    const checkSubscription = async () => {
      try {
        const res = await api.get('/payments/subscription')
        const sub = res.data.subscription
        if (sub?.status === 'active' && (sub?.tier === 'pro' || sub?.tier === 'business')) {
          setStatus('success')
          setTimeout(() => navigate('/dashboard'), 2000)
          return
        }
      } catch (err: any) {
        // If rate limited, try to verify immediately
        if (err?.response?.status === 429) {
          setStatus('verifying')
          verifyPurchase()
          return
        }
      }

      attempts++
      if (attempts >= maxAttempts) {
        setStatus('verifying')
        verifyPurchase()
      }
    }

    const interval = setInterval(checkSubscription, 2000)
    return () => clearInterval(interval)
  }, [status, navigate])

  const verifyPurchase = async () => {
    try {
      const res = await api.post('/payments/verify-purchase')
      if (res.data.status === 'active') {
        setStatus('success')
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const planLabel = plan === 'business' ? 'Business' : 'Pro'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--mm-gradient-page)' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <Card variant="glass" padding="lg">
          <div style={{ textAlign: 'center' }}>
            {status === 'polling' && (
              <>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                <h2 style={{ color: 'var(--mm-text-primary)', marginBottom: 8 }}>
                  Setting up your {planLabel} account…
                </h2>
                <p style={{ color: 'var(--mm-text-secondary)', fontSize: 14 }}>
                  This usually takes a few seconds.
                </p>
              </>
            )}
            {status === 'verifying' && (
              <>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h2 style={{ color: 'var(--mm-text-primary)', marginBottom: 8 }}>
                  Verifying your purchase…
                </h2>
                <p style={{ color: 'var(--mm-text-secondary)', fontSize: 14 }}>
                  Just a moment.
                </p>
              </>
            )}
            {status === 'success' && (
              <>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <h2 style={{ color: 'var(--mm-text-primary)', marginBottom: 8 }}>
                  You're all set!
                </h2>
                <p style={{ color: 'var(--mm-text-secondary)', fontSize: 14 }}>
                  Redirecting to your dashboard…
                </p>
              </>
            )}
            {status === 'error' && (
              <>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <h2 style={{ color: 'var(--mm-text-primary)', marginBottom: 8 }}>
                  Taking longer than expected
                </h2>
                <p style={{ color: 'var(--mm-text-secondary)', fontSize: 14, marginBottom: 20 }}>
                  Your payment may still be processing.<br />
                  Please check your email for a receipt and refresh this page.
                </p>
                <button
                  onClick={verifyPurchase}
                  style={{
                    background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}