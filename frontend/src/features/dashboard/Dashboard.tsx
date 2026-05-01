import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { HeroMetrics } from './HeroMetrics'
import { CoachPanel } from './CoachPanel'
import { InitiativeGrid } from './InitiativeGrid'
import { AttentionFeed } from './AttentionFeed'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [greetingHint, setGreetingHint] = useState('')
  const [totalMeetings, setTotalMeetings] = useState<number | null>(null)

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
        setTotalMeetings(totalMeetings)
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

  if (totalMeetings === 0) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--mm-text-primary)', marginBottom: 16 }}>
          Welcome to your Intelligence Dashboard
        </h1>
        <p style={{ fontSize: 16, color: 'var(--mm-text-secondary)', marginBottom: 32, lineHeight: 1.7, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
          Turn any meeting into decisions, tasks, risks, and follow‑through in minutes.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 32 }}>
          <div style={{ width: '100%', maxWidth: 340 }}>
            <Button onClick={() => navigate('/app')} variant="cyan" glow size="lg" className="w-full">
              + Start Live Meeting
            </Button>
          </div>
          <div style={{ width: '100%', maxWidth: 340 }}>
            <Button onClick={() => navigate('/app')} variant="secondary" size="lg" className="w-full">
              Upload Recording
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', fontSize: 13, color: 'var(--mm-text-muted)' }}>
          <span>⚡ Decisions extracted</span>
          <span>⚡ Tasks auto‑created</span>
          <span>⚡ Cross‑meeting memory enabled</span>
        </div>

        <div style={{ marginTop: 40 }}>
          <Card variant="glass" padding="md">
            <p style={{ color: 'var(--mm-text-secondary)', fontSize: 13, textAlign: 'left' }}>
              Your dashboard will populate with meeting scores, open tasks, unresolved threads, and initiative health — automatically, after your first recording.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
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