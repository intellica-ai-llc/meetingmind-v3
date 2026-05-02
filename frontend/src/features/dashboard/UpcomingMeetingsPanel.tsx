import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AttendeeAvatars } from '@/components/ui/AttendeeAvatars'

// ── Types ──────────────────────────────────────────────────
interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  attendees: string[]
  creator: string | null
  description: string | null
  location: string | null
  hangoutLink: string | null
  conferenceData: any
}

// ── Helpers ────────────────────────────────────────────────

/** Basic calendar noise filter – removes birthdays, holidays, etc. */
function isNoisyEvent(event: CalendarEvent): boolean {
  const title = (event.title || '').toLowerCase()
  const patterns = [
    'birthday', 'anniversary', 'holiday', 'out of office',
    'ooo', 'vacation', 'sick', 'pto', 'lunch', 'dinner',
  ]
  // Zero attendees and no description → likely a placeholder
  if (patterns.some(p => title.includes(p))) return true
  if (!event.attendees.length && !event.description && title.includes('birthday')) return true
  return false
}

/** Minutes until the meeting starts */
function minutesUntil(event: CalendarEvent): number {
  return (new Date(event.start).getTime() - Date.now()) / 60000
}

function formatTimeRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  return `${s.toLocaleTimeString([], opts)} – ${e.toLocaleTimeString([], opts)}`
}

// ── Main Panel ─────────────────────────────────────────────

export function UpcomingMeetingsPanel() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [connected, setConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/calendar/upcoming')
      setEvents(res.data.events || [])
      setConnected(res.data.connected ?? null)
    } catch (err) {
      console.error('UpcomingMeetingsPanel fetch error:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // ── Remove noise before grouping ─────────────────────────
  const cleanEvents = events.filter(e => !isNoisyEvent(e))

  // ── Group into time buckets ──────────────────────────────
  const now = new Date()
  const today: CalendarEvent[] = []
  const tomorrow: CalendarEvent[] = []
  const thisWeek: CalendarEvent[] = []
  const later: CalendarEvent[] = []

  cleanEvents.forEach(e => {
    const date = new Date(e.start)
    const diffDays = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays < 0) return
    if (date.toDateString() === now.toDateString()) today.push(e)
    else if (diffDays < 1 && date.getDate() === now.getDate() + 1) tomorrow.push(e)
    else if (diffDays < 7) thisWeek.push(e)
    else later.push(e)
  })

  // ── Happening Soon extraction ────────────────────────────
  const happeningSoon: CalendarEvent[] = []
  const todayFiltered = today.filter(e => {
    const mins = minutesUntil(e)
    if (mins >= -30 && mins <= 120) {
      happeningSoon.push(e)
      return false   // remove from normal list
    }
    return true
  })

  const groups = { today: todayFiltered, tomorrow, thisWeek, later }
  const hasEvents = cleanEvents.length > 0

  // Weekly count for the header
  const weeklyCount = today.length + tomorrow.length + thisWeek.length

  const handlePrepare = (event: CalendarEvent) => {
    const params = new URLSearchParams({
      prepare: 'true',
      title: event.title,
      date: new Date(event.start).toISOString(),
      attendees: event.attendees.join(','),
    })
    navigate(`/app?${params.toString()}`)
  }

  // ── States ───────────────────────────────────────────────
  if (loading) {
    return (
      <Card variant="glass" padding="md">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>Upcoming</h3>
        <p style={{ color: 'var(--mm-text-muted)', fontSize: 14 }}>Loading upcoming events…</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card variant="glass" padding="md">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>Upcoming</h3>
        <p style={{ color: 'var(--mm-text-secondary)', fontSize: 14, marginBottom: 12 }}>
          Couldn't load upcoming meetings.
        </p>
        <Button onClick={fetchEvents} variant="secondary" size="sm">
          Retry
        </Button>
      </Card>
    )
  }

  if (connected === false) {
    return (
      <Card variant="glass" padding="md">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>Upcoming</h3>
        <p style={{ color: 'var(--mm-text-secondary)', fontSize: 14, marginBottom: 12 }}>
          Connect your Google Calendar to see upcoming meetings.
        </p>
        <Button onClick={() => navigate('/settings')} variant="secondary" size="sm">
          Connect Calendar
        </Button>
      </Card>
    )
  }

  if (!hasEvents && connected !== null) {
    return (
      <Card variant="glass" padding="md">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>Upcoming</h3>
        <p style={{ color: 'var(--mm-text-muted)', fontSize: 14 }}>No upcoming events.</p>
      </Card>
    )
  }

  // ── Urgency colour map ──────────────────────────────────
  const urgencyColor = (group: string, mins: number) => {
    if (group === 'today' && mins <= 120 && mins >= -30) return 'var(--mm-cyan)'
    if (group === 'today') return 'var(--mm-cyan)'
    if (group === 'tomorrow') return 'var(--mm-warning)'
    return 'var(--mm-text-muted)'
  }

  const buttonLabel = (group: string) => group === 'later' ? 'Preview →' : 'Prepare →'

  // ── Render ──────────────────────────────────────────────
  return (
    <Card variant="glass" padding="md">
      {/* Enhanced header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', margin: 0 }}>
          Upcoming · {weeklyCount} meeting{weeklyCount !== 1 ? 's' : ''} this week
        </h3>
        <Button size="sm" variant="secondary" onClick={() => navigate('/app')}>
          + New Meeting
        </Button>
      </div>

      {/* Happening Soon banner */}
      {happeningSoon.map(event => {
        const mins = Math.max(0, Math.floor(minutesUntil(event)))
        return (
          <div
            key={event.id}
            style={{
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 0 20px rgba(6,182,212,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <span
                className="ai-pulse"
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mm-cyan)', flexShrink: 0 }}
              />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mm-cyan)' }}>
                Starting in {mins} min
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginLeft: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {event.title}
              </span>
            </div>
            <Button size="sm" variant="cyan" glow onClick={() => handlePrepare(event)}>
              Prepare → Briefing
            </Button>
          </div>
        )
      })}

      {/* Meeting list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto' }}>
        {(['today', 'tomorrow', 'thisWeek', 'later'] as const).map(group => {
          const items = groups[group]
          if (items.length === 0) return null
          const label = { today: 'Today', tomorrow: 'Tomorrow', thisWeek: 'This Week', later: 'Later' }[group]
          return (
            <div key={group}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                {label}
              </div>
              {items.map(event => {
                const mins = minutesUntil(event)
                const edgeColor = urgencyColor(group, mins)
                return (
                  <div
                    key={event.id}
                    className="card-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 12,
                      marginBottom: 8,
                      overflow: 'hidden',
                      transition: 'all var(--mm-duration-fast) var(--mm-ease-out)',
                      opacity: group === 'later' ? 0.7 : 1,
                    }}
                  >
                    {/* Left urgency bar */}
                    <div
                      style={{
                        width: 3,
                        background: edgeColor,
                        borderRadius: '0 2px 2px 0',
                        flexShrink: 0,
                      }}
                    />

                    {/* Main content */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        gap: 16,
                      }}
                    >
                      {/* LEFT — title + organizer */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, color: 'var(--mm-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {event.title === '(No title)' ? (
                            <span style={{ fontStyle: 'italic', color: 'var(--mm-text-muted)' }}>Untitled meeting</span>
                          ) : (
                            event.title
                          )}
                        </div>
                        {event.creator && (
                          <div style={{ fontSize: 12, color: 'var(--mm-text-muted)', marginTop: 2 }}>
                            {event.creator}
                          </div>
                        )}
                      </div>

                      {/* CENTRE — date & time */}
                      <div style={{ textAlign: 'center', flexShrink: 0, width: 140 }}>
                        <div style={{ fontSize: 13, color: 'var(--mm-text-secondary)', fontWeight: 500 }}>
                          {new Date(event.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--mm-text-muted)', marginTop: 2 }}>
                          {formatTimeRange(event.start, event.end)}
                        </div>
                        {event.attendees.length > 0 && (
                          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'center' }}>
                            <AttendeeAvatars attendees={event.attendees} max={3} />
                          </div>
                        )}
                      </div>

                      {/* RIGHT — Prepare button */}
                      <div style={{ flexShrink: 0, width: 120, textAlign: 'right' }}>
                        <Button size="sm" variant={group === 'today' ? 'cyan' : 'secondary'} glow={group === 'today'} onClick={() => handlePrepare(event)}>
                          {buttonLabel(group)}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Later this month divider */}
      {later.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              padding: '12px 0',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--mm-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Later this month
          </div>
        </div>
      )}
    </Card>
  )
}