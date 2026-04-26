import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatDate, formatDuration } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { SentimentBadge } from '@/components/ui/SentimentBadge'
import { Button } from '@/components/ui/Button'

interface Meeting {
  id: string
  title: string
  meeting_date: string
  duration_minutes: number
  effectiveness_score: number | null
  sentiment?: string
  decisions_count?: number
  action_items_count?: number
  risk_flags_count?: number
}

export function MeetingHistory() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await api.get('/meetings', { params: { limit: 5 } })
        setMeetings(response.data.meetings)
      } catch (error) {
        console.error('Failed to fetch meetings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMeetings()
  }, [])

  // Loading state: skeleton cards
  if (loading) {
    return (
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ height: 20, width: 140, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
          <div style={{ height: 14, width: 60, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ background: 'var(--mm-bg-primary)', borderRadius: 10, padding: 16, marginBottom: 8 }}>
            <div style={{ height: 16, width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 12, width: '40%', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }} />
          </div>
        ))}
      </Card>
    )
  }

  // Empty state: invitation to record
  if (meetings.length === 0) {
    return (
      <Card variant="glass" padding="lg">
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          {/* Mic icon (same style as app console) */}
          <div style={{
            width: 72,
            height: 72,
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.15), rgba(0,212,255,0.02))',
            border: '1.5px solid rgba(0,212,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(0,212,255,0.15)',
          }}>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <rect x="13" y="4" width="14" height="22" rx="7" fill="#00D4FF" opacity="0.9" />
              <path d="M6 20c0 7.732 6.268 14 14 14s14-6.268 14-14" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <line x1="20" y1="34" x2="20" y2="39" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3 style={{ fontSize: 'var(--mm-fs-card-title)', fontWeight: 800, color: 'var(--mm-text-primary)', margin: '0 0 8px' }}>
            Record your first meeting
          </h3>
          <p style={{ fontSize: 'var(--mm-fs-body)', color: 'var(--mm-text-secondary)', margin: '0 auto 24px', maxWidth: 360 }}>
            Capture audio from your browser mic or upload a file to get started.
          </p>
          <Button variant="cyan" size="md" glow onClick={() => navigate('/app')}>
            Start Recording
          </Button>
        </div>
      </Card>
    )
  }

  // Meeting list
  return (
    <Card variant="glass" padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 'var(--mm-fs-section)', fontWeight: 700, color: 'var(--mm-text-primary)', margin: 0 }}>
          Recent Meetings
        </h3>
        <button
          onClick={() => navigate('/meetings')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--mm-cyan)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          View all →
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            onClick={() => navigate(`/meeting/${meeting.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--mm-bg-primary)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--mm-bg-primary)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
            }}
          >
            {/* Left: title, date, stats */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {meeting.title || 'Untitled Meeting'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--mm-text-secondary)', marginBottom: 4 }}>
                {formatDate(meeting.meeting_date)} · {formatDuration(meeting.duration_minutes)}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--mm-text-muted)' }}>
                <span>📋 {meeting.decisions_count ?? 0} decisions</span>
                <span>✅ {meeting.action_items_count ?? 0} actions</span>
                <span>⚠️ {meeting.risk_flags_count ?? 0} risks</span>
              </div>
            </div>

            {/* Right: score ring + sentiment */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16 }}>
              {meeting.effectiveness_score != null ? (
                <ScoreRing score={meeting.effectiveness_score} />
              ) : (
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--mm-text-muted)' }}>—</span>
              )}
              {meeting.sentiment && <SentimentBadge sentiment={meeting.sentiment} />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}