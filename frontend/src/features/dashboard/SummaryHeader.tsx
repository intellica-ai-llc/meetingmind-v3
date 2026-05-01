import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export function SummaryHeader() {
  const [latestMeeting, setLatestMeeting] = useState<any>(null)

  useEffect(() => {
    api.get('/meetings?limit=1')
      .then(res => setLatestMeeting(res.data.meetings?.[0] || null))
      .catch(() => {})
  }, [])

  if (!latestMeeting) {
    return (
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--mm-text-primary)', margin: 0 }}>
          Meeting Summary
        </h2>
        <p style={{ fontSize: 13, color: 'var(--mm-text-muted)', margin: '4px 0 0' }}>
          Your latest meeting insights will appear here after your first recording.
        </p>
      </div>
    )
  }

  const dateStr = latestMeeting.meeting_date
    ? new Date(latestMeeting.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date(latestMeeting.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const durationStr = latestMeeting.duration_minutes
    ? `${latestMeeting.duration_minutes}:00`
    : null

  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--mm-text-primary)', margin: 0 }}>
        Meeting Summary
      </h2>
      <p style={{ fontSize: 13, color: 'var(--mm-text-muted)', margin: '4px 0 0' }}>
        {dateStr}{durationStr ? ` • ${durationStr}` : ''}
      </p>
    </div>
  )
}