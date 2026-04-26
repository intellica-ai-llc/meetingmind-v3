import { useAuth } from '@/contexts/AuthContext'
import { TaskDashboard } from './TaskDashboard'
import { UnresolvedThreads } from './UnresolvedThreads'
import { MeetingHistory } from './MeetingHistory'
import { HeroMetrics } from './HeroMetrics'
import { CoachPanel } from './CoachPanel'
import { IntelligencePanel } from './IntelligencePanel'

export function Dashboard() {
  const { user } = useAuth()

  const firstName = user?.email?.split('@')[0] ?? 'there'
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      {/* PAGE HEADER */}
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
            Here’s everything from your meetings — ready when you are.
          </p>
        </div>
      </div>

      {/* HERO METRICS ROW */}
      <HeroMetrics />

      {/* MAIN GRID: Tasks + Recent Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <TaskDashboard />
        <MeetingHistory />
      </div>

      {/* BOTTOM ROW: Patterns + Threads + Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <IntelligencePanel />
        <UnresolvedThreads />
        <CoachPanel />
      </div>
    </div>
  )
}