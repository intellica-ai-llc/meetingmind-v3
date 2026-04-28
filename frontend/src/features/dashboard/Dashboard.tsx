import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { HeroMetrics } from './HeroMetrics'
import { CoachPanel } from './CoachPanel'
import { InitiativeGrid } from './InitiativeGrid'
import { AttentionFeed } from './AttentionFeed'
import { api } from '@/lib/api'

export function Dashboard() {
  const { user } = useAuth()
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