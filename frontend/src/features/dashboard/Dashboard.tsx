import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePlan } from '@/contexts/UserPlanProvider'
import { HeroMetrics } from './HeroMetrics'
import { CoachPanel } from './CoachPanel'
import { InitiativeGrid } from './InitiativeGrid'
import { AttentionFeed } from './AttentionFeed'
import { Card } from '@/components/ui/Card'

export function Dashboard() {
  const { user } = useAuth()
  const { refetch } = usePlan()                 // only what we use
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [newPlan, setNewPlan] = useState('')

  const firstName = user?.email?.split('@')[0] ?? 'there'
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Check for post‑checkout success param (e.g. ?upgrade=pro&success=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const upgrade = params.get('upgrade')
    const success = params.get('success')
    if (upgrade && success === 'true') {
      refetch().then(() => {
        setNewPlan(upgrade)
        setShowUpgradeModal(true)
        window.history.replaceState({}, document.title, '/dashboard')
      })
    }
  }, [refetch])

  // Upgrade celebration modal
  if (showUpgradeModal) {
    const planLabel = newPlan === 'business' ? 'Business' : 'Pro'
    const features =
      newPlan === 'business'
        ? ['Risk aggregation', 'Slack integration', 'Team dashboard']
        : [
            'Intelligence dashboard',
            'Calendar auto‑ingest',
            'Multi‑meeting coach',
            'Coaching trends',
            'Initiatives',
          ]

    return (
      <div
        style={{
          padding: 24,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <div style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
          <Card variant="glass" padding="lg">
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ color: 'var(--mm-text-primary)', marginBottom: 8 }}>
              Welcome to {planLabel}!
            </h2>
            <p style={{ color: 'var(--mm-text-secondary)', marginBottom: 20 }}>
              You now have access to:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--mm-text-primary)' }}>
              {features.map((f) => (
                <li key={f} style={{ padding: '6px 0', fontSize: 16 }}>
                  ✓ {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                setShowUpgradeModal(false)
                window.location.href = '/dashboard'
              }}
              style={{
                marginTop: 24,
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
              Get Started
            </button>
          </Card>
        </div>
      </div>
    )
  }

  // Normal dashboard view
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 'var(--mm-fs-title)',
              fontWeight: 800,
              color: 'var(--mm-text-primary)',
              margin: 0,
            }}
          >
            {getGreeting()}, {displayName}
          </h2>
          <p
            style={{
              fontSize: 'var(--mm-fs-body)',
              color: 'var(--mm-text-secondary)',
              margin: '4px 0 0',
            }}
          >
            Here’s your organisational intelligence at a glance.
          </p>
        </div>
      </div>

      <HeroMetrics />
      <div style={{ marginTop: 20 }}>
        <h3
          style={{
            fontSize: 'var(--mm-fs-card-title)',
            color: 'var(--mm-text-primary)',
            marginBottom: 12,
          }}
        >
          Initiatives
        </h3>
        <InitiativeGrid />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <AttentionFeed />
        <CoachPanel />
      </div>
    </div>
  )
}