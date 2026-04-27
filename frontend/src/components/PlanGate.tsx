import { useNavigate } from 'react-router-dom'
import { usePlan } from '@/contexts/UserPlanProvider'
import { FEATURE_REQUIRED_PLAN } from '@/lib/features'
import { Card } from '@/components/ui/Card'

interface PlanGateProps {
  feature: string
  fallbackMessage?: string
  children: React.ReactNode
}

export function PlanGate({ feature, fallbackMessage, children }: PlanGateProps) {
  const { plan, status, loading } = usePlan()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--mm-text-secondary)' }}>
        Checking access...
      </div>
    )
  }

  const requiredPlan = FEATURE_REQUIRED_PLAN[feature]
  const hasAccess =
    status === 'active' &&
    (requiredPlan === 'pro'
      ? plan === 'pro' || plan === 'business'
      : plan === 'business')

  if (hasAccess) return <>{children}</>

  const requiredLabel = requiredPlan
    ? requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)
    : 'Pro'

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <Card variant="glass" padding="lg">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ color: 'var(--mm-text-primary)', marginBottom: 8 }}>
          {fallbackMessage || `This feature requires the ${requiredLabel} plan`}
        </h2>
        <button
          onClick={() => navigate('/pricing')}
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          Upgrade to {requiredLabel} →
        </button>
      </Card>
    </div>
  )
}