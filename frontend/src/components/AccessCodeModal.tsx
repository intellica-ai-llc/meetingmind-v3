import { useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { usePlan } from '@/contexts/UserPlanProvider'

interface AccessCodeModalProps {
  onClose: () => void
}

export function AccessCodeModal({ onClose }: AccessCodeModalProps) {
  const [password, setPassword] = useState('')
  const [plan, setPlan] = useState<'pro' | 'business'>('pro')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { refetch } = usePlan()

  const handleSubmit = async () => {
    if (!password.trim()) return
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/access-code', { password, plan })
      if (res.data.success) {
        setSuccess(true)
        await refetch()
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1500)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{ maxWidth: 400, width: '90%' }} onClick={e => e.stopPropagation()}>
        <Card variant="glass" padding="lg">
          <div style={{ textAlign: 'center' }}>
            {success ? (
              <div style={{ padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <p style={{ color: 'var(--mm-success)', fontWeight: 600 }}>Access granted! Refreshing…</p>
              </div>
            ) : (
              <>
                <h3 style={{ color: 'var(--mm-text-primary)', marginTop: 0, marginBottom: 16 }}>
                  Enter Access Code
                </h3>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'var(--mm-bg-primary)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    color: 'var(--mm-text-primary)',
                    fontSize: 15,
                    marginBottom: 12,
                  }}
                />
                <select
                  value={plan}
                  onChange={e => setPlan(e.target.value as 'pro' | 'business')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--mm-bg-primary)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    color: 'var(--mm-text-primary)',
                    fontSize: 14,
                    marginBottom: 16,
                  }}
                >
                  <option value="pro">Pro</option>
                  <option value="business">Business</option>
                </select>
                {error && (
                  <p style={{ color: 'var(--mm-danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 0',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: loading ? 'default' : 'pointer',
                  }}
                >
                  {loading ? 'Verifying…' : 'Continue'}
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}