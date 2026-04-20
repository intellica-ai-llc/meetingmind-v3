import { useAuth } from '@/contexts/AuthContext'
import { TaskDashboard } from './TaskDashboard'
import { PatternDashboard } from './PatternDashboard'
import { UnresolvedThreads } from './UnresolvedThreads'
import { MeetingHistory } from './MeetingHistory'
import { UsageStats } from './UsageStats'

export function Dashboard() {
  const { user } = useAuth()

  const firstName = user?.email?.split('@')[0] ?? 'there'
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  const handleUpgrade = () => {
    window.location.href = '/pricing'
  }

  const handleNewMeeting = () => {
    window.location.href = '/app'
  }

  const handleUploadRecording = () => {
    window.location.href = '/upload'
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#1A0F00] px-6 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
          <span className="text-[#FCD97A] text-[11px]">
            Free plan — 0 of 10 meetings used this month
          </span>
        </div>
        <button
          onClick={handleUpgrade}
          className="text-[#FCD97A] text-[11px] hover:opacity-80 transition"
        >
          Upgrade to Pro for unlimited Coach access →
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* PAGE HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)] tracking-[-0.3px]">
              {getGreeting()}, {displayName}
            </h1>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
              Here's everything from your meetings — ready when you are.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleUploadRecording}
              className="border border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] text-[13px] px-4 py-2 rounded-md hover:opacity-80 transition"
            >
              Upload recording
            </button>
            <button
              onClick={handleNewMeeting}
              className="bg-[#E8A020] text-[#1A0F00] text-[13px] font-medium px-4 py-2 rounded-md hover:bg-[#C47E0A] transition"
            >
              + New meeting
            </button>
          </div>
        </div>

        {/* USAGE STATS ROW */}
        <UsageStats />

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

          {/* MY TASKS */}
          <TaskDashboard />

          {/* RECENT MEETINGS */}
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

            {/* Last meeting score card */}
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
    </div>
  )
}