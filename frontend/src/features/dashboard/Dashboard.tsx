import { useAuth } from '@/contexts/AuthContext'
import { HeroMetrics } from './HeroMetrics'
import { CoachPanel } from './CoachPanel'
import { InitiativeGrid } from './InitiativeGrid'
import { AttentionFeed } from './AttentionFeed'

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--mm-fs-title)', fontWeight: 800, color: 'var(--mm-text-primary)', margin: 0 }}>
            {getGreeting()}, {displayName}
          </h2>
          <p style={{ fontSize: 'var(--mm-fs-body)', color: 'var(--mm-text-secondary)', margin: '4px 0 0' }}>
            Here’s your organisational intelligence at a glance.
          </p>
        </div>
      </div>

      {/* QUICK STATS */}
      <HeroMetrics />

      {/* INITIATIVES GRID */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 'var(--mm-fs-card-title)', color: 'var(--mm-text-primary)', marginBottom: 12 }}>Initiatives</h3>
        <InitiativeGrid />
      </div>

      {/* MAIN GRID: Attention Feed + Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <AttentionFeed />
        <CoachPanel />
      </div>
    </div>
  )
}