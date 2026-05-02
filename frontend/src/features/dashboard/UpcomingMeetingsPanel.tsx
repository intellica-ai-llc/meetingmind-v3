import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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

export function UpcomingMeetingsPanel() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [connected, setConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const navigate = useNavigate()

  const fetchEvents = async () => {
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
      setRetrying(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleRetry = () => {
    setRetrying(true)
    fetchEvents()
  }

  if (loading || retrying) {
    return (
      <Card variant="glass" padding="md">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>Upcoming</h3>
        <p style={{ color: 'var(--mm-text-muted)', fontSize: 14 }}>
          {retrying ? 'Retrying…' : 'Loading upcoming events…'}
        </p>
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
        <Button onClick={handleRetry} variant="secondary" size="sm">
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

  const now = new Date()
  const today: CalendarEvent[] = []
  const tomorrow: CalendarEvent[] = []
  const thisWeek: CalendarEvent[] = []
  const later: CalendarEvent[] = []

  events.forEach(e => {
    const date = new Date(e.start)
    const diffDays = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays < 0) return
    if (date.toDateString() === now.toDateString()) today.push(e)
    else if (diffDays < 1 && date.getDate() === now.getDate() + 1) tomorrow.push(e)
    else if (diffDays < 7) thisWeek.push(e)
    else later.push(e)
  })

  const groups = { today, tomorrow, thisWeek, later }
  const hasEvents = events.length > 0

  const handlePrepare = (event: CalendarEvent) => {
    const params = new URLSearchParams({
      prepare: 'true',
      title: event.title,
      date: new Date(event.start).toISOString(),
      attendees: event.attendees.join(','),
    })
    navigate(`/app?${params.toString()}`)
  }

  return (
    <Card variant="glass" padding="md">
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>Upcoming</h3>
      {!hasEvents && connected !== null ? (
        <p style={{ color: 'var(--mm-text-muted)', fontSize: 14 }}>No upcoming events.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
          {(['today', 'tomorrow', 'thisWeek', 'later'] as const).map(group => {
            const items = groups[group]
            if (items.length === 0) return null
            const label = { today: 'Today', tomorrow: 'Tomorrow', thisWeek: 'This Week', later: 'Later' }[group]
            return (
              <div key={group}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  {label}
                </div>
                {items.map(event => (
                  <div key={event.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <div style={{ fontSize: 14, color: 'var(--mm-text-primary)' }}>{event.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--mm-text-muted)' }}>
                        {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => handlePrepare(event)}>
                      Prepare
                    </Button>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}