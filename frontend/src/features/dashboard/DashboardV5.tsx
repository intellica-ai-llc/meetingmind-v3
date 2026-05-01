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
      {/* Hero Strip — premium greeting */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: 'var(--mm-text-primary)', margin: 0, lineHeight: 1.1 }}>
          {getGreeting()}, {displayName}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--mm-text-secondary)', margin: '8px 0 0', maxWidth: 600 }}>
          {greetingHint || `Track decisions, action items, blockers, and momentum across every meeting.`}
        </p>
      </div>

      <div style={{ marginBottom: 28 }}>
        <SummaryHeader />
      </div>

      <KpiCardRow />

      {/* Three-panel row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
        <KeyInsightsPanel />
        <TopActionItemsPanel />
        <CoachTipPanel />
      </div>

      {/* Initiatives Grid */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>Initiatives</h3>
        <InitiativeGrid />
      </div>

      {/* Attention Feed */}
      <div style={{ marginBottom: 28 }}>
        <AttentionFeed />
      </div>

      {/* Upcoming Meetings */}
      <div>
        <UpcomingMeetingsPanel />
      </div>
    </div>
  )
}