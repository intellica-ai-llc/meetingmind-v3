import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SummaryHeader } from './SummaryHeader'
import { KpiCardRow } from './KpiCardRow'
import { KeyInsightsPanel } from './KeyInsightsPanel'
import { TopActionItemsPanel } from './TopActionItemsPanel'
import { CoachTipPanel } from './CoachTipPanel'
import { UpcomingMeetingsPanel } from './UpcomingMeetingsPanel'
import { InitiativeGrid } from './InitiativeGrid'
import { AttentionFeed } from './AttentionFeed'
import { api } from '@/lib/api'

export function DashboardV5() {
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
      {/* Greeting block — matches old dashboard intelligence */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mm-text-primary)', margin: 0 }}>
          {getGreeting()}, {displayName}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--mm-text-secondary)', margin: '4px 0 0' }}>
          {greetingHint || `Here's your organisational intelligence at a glance.`}
        </p>
      </div>

      <SummaryHeader />
      <KpiCardRow />

      {/* Three-panel row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <KeyInsightsPanel />
        <TopActionItemsPanel />
        <CoachTipPanel />
      </div>

      {/* Initiatives Grid — moved below Key Insights */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>Initiatives</h3>
        <InitiativeGrid />
      </div>

      {/* Attention Feed — never empty, critical for intelligence loop */}
      <div style={{ marginBottom: 24 }}>
        <AttentionFeed />
      </div>

      {/* Upcoming Meetings */}
      <div>
        <UpcomingMeetingsPanel />
      </div>
    </div>
  )
}