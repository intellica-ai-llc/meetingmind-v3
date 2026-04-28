import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePlan } from '@/contexts/UserPlanProvider'
import { HeroMetrics } from './HeroMetrics'
import { CoachPanel } from './CoachPanel'
import { InitiativeGrid } from './InitiativeGrid'
import { AttentionFeed } from './AttentionFeed'
import { api } from '@/lib/api'

export function Dashboard() {
  const { user } = useAuth()
  const { plan, refetch, isPaid } = usePlan()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [polling, setPolling] = useState(false)
  const [greetingHint, setGreetingHint] = useState('')

  const firstName = user?.email?.split('@')[0] ?? 'there'
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => {
        const { totalMeetings, openTasks, avgScore } = res.data
        if (totalMeetings === 0) {
          setGreetingHint('Record your first meeting to unlock insights.')
        } else if (totalMeetings === 1) {
          setGreetingHint(`Your first meeting scored ${avgScore ?? '—'}/10. Here's what to do next.`)
        } else if (openTasks > 0) {
          setGreetingHint(`You have ${openTasks} open task${openTasks > 1 ? 's' : ''}. Stay on top of them.`)
        } else if (avgScore && totalMeetings >= 3) {
          setGreetingHint(`Your average across ${totalMeetings} meetings is ${avgScore}/10. Keep it up.`)
        } else {
          setGreetingHint(`${totalMeetings} meetings recorded. You're building momentum.`)
        }
      })
      .catch(() => {})
  }, [])

  // Handle post‑checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const upgrade = params.get('upgrade')
    const success = params.get('success')
    if (upgrade && success === 'true') {
      // Poll until plan changes or timeout (10 seconds)
      setPolling(true)
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        refetch().then(() => {
          // refetch updates the context, but we need to check if it's now paid
          // We'll use the plan state directly after the next tick
        })
        if (attempts >= 20) { // 10 seconds max
          clearInterval(interval)
          setPolling(false)
          // If still free, show the modal anyway with a "refresh" message
          setShowUpgradeModal(true)
        }
      }, 500)

      // Clean URL immediately
      window.history.replaceState({}, document.title, '/dashboard')

      return () => clearInterval(interval)
    }
  }, [refetch])

  // When plan changes to paid, stop polling and show congrats
  useEffect(() => {
    if (isPaid && polling) {
      setPolling(false)
      setShowUpgradeModal(true)
    }
  }, [isPaid, polling])

  const handleDismiss = () => {
    setShowUpgradeModal(false)
  }

  // Celebration modal
  if (showUpgradeModal) {
    const planLabel = plan === 'business' ? 'Business' : 'Pro'
    const features = [
      'Full Intelligence Dashboard',
      'Calendar auto‑ingest',
      'Multi‑meeting Coach',
      'Coaching trends & analytics',
      'Initiatives & project tracking',
    ]

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}>
        <div style={{
          maxWidth: 520,
          width: '100%',
          background: 'var(--mm-bg-secondary)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: 20,
          padding: 48,
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(0,212,255,0.2)',
        }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🚀</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--mm-text-primary)', margin: '0 0 8px' }}>
            Welcome to MeetingMind {planLabel}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--mm-text-secondary)', marginBottom: 32 }}>
            You've unlocked the full power of organisational intelligence.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 32,
            textAlign: 'left',
          }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--mm-text-primary)' }}>
                <span style={{ color: '#00e676', fontWeight: 700 }}>✓</span> {f}
              </div>
            ))}
          </div>
          {!isPaid ? (
            <div>
              <p style={{ color: 'var(--mm-text-secondary)', marginBottom: 12 }}>Your upgrade is being processed. If you don't see changes soon, refresh.</p>
              <button onClick={() => refetch()} style={{ background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))', border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontWeight: 600, cursor: 'pointer', marginRight: 8 }}>
                Check again
              </button>
              <button onClick={handleDismiss} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '10px 24px', color: 'var(--mm-text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
                Dismiss
              </button>
            </div>
          ) : (
            <button onClick={handleDismiss} style={{ background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))', border: 'none', borderRadius: 8, padding: '12px 32px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
              Get Started
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--mm-fs-title)', fontWeight: 800, color: 'var(--mm-text-primary)', margin: 0 }}>
            {getGreeting()}, {displayName}
          </h2>
          <p style={{ fontSize: 'var(--mm-fs-body)', color: 'var(--mm-text-secondary)', margin: '4px 0 0' }}>
            {greetingHint || `Here's your organisational intelligence at a glance.`}
          </p>
        </div>
      </div>

      <HeroMetrics />
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 'var(--mm-fs-card-title)', color: 'var(--mm-text-primary)', marginBottom: 12 }}>Initiatives</h3>
        <InitiativeGrid />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <AttentionFeed />
        <CoachPanel />
      </div>
    </div>
  )
}