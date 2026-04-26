import { useAuth } from '@/contexts/AuthContext'
import { TaskDashboard } from './TaskDashboard'
import { PatternDashboard } from './PatternDashboard'
import { UnresolvedThreads } from './UnresolvedThreads'
import { MeetingHistory } from './MeetingHistory'
import { UsageStats } from './UsageStats'
import { HeroMetrics } from './HeroMetrics'

export function Dashboard() {
  const { user } = useAuth()

  const firstName = user?.email?.split('@')[0] ?? 'there'
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  const handleUpgrade = () => {
    window.location.href = '/pricing'
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      {/* PAGE HEADER (greeting remains until Phase 3 redesign) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--mm-fs-title)', fontWeight: 800, color: 'var(--mm-text-primary)', margin: 0 }}>
            {getGreeting()}, {displayName}
          </h2>
          <p style={{ fontSize: 'var(--mm-fs-body)', color: 'var(--mm-text-secondary)', margin: '4px 0 0' }}>
            Here’s everything from your meetings — ready when you are.
          </p>
        </div>
        {/* Quick upgrade CTA (subtle, not dominant) */}
        <button
          onClick={handleUpgrade}
          style={{
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--mm-radius-button)',
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--mm-text-secondary)',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Upgrade to Pro
        </button>
      </div>

      {/* USAGE STATS ROW */}
      <HeroMetrics />

      {/* MAIN GRID: Tasks + Recent Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <TaskDashboard />
        <MeetingHistory />
      </div>

      {/* BOTTOM ROW: Patterns + Threads + Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <PatternDashboard />
        <UnresolvedThreads />

        {/* MEETING COACH CARD */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">Meeting coach</span>
            <span className="bg-[#E8A020] text-[#1A0F00] text-[10px] font-bold px-2 py-0.5 rounded">Pro</span>
          </div>

          <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-tertiary)] rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-5 rounded-full bg-[#E8A020] flex items-center justify-center text-[9px] font-bold text-[#1A0F00]">!</div>
              <span className="text-[12px] font-medium text-[var(--color-text-primary)]">Last meeting score</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] font-medium uppercase tracking-[0.4px] text-[var(--color-text-tertiary)] mb-1">TOP STRENGTH</div>
                <div className="text-[11px] font-medium text-[#4ADE80] leading-snug">Clear action item ownership</div>
              </div>
              <div>
                <div className="text-[9px] font-medium uppercase tracking-[0.4px] text-[var(--color-text-tertiary)] mb-1">IMPROVEMENT</div>
                <div className="text-[11px] text-[var(--color-text-secondary)] leading-snug">Address risks before deciding</div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-text-tertiary)] italic leading-relaxed mb-3">
            Unlock prescriptive coaching after every meeting — personalised tips to improve your score.
          </p>

          <button
            onClick={handleUpgrade}
            className="w-full bg-[#E8A020] text-[#1A0F00] text-[12px] font-semibold py-2.5 rounded-lg hover:bg-[#C47E0A] transition"
          >
            Unlock Meeting Coach — $9/mo →
          </button>
        </div>
      </div>
    </div>
  )
}