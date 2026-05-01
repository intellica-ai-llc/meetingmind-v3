import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function CoachTipPanel() {
  const [tip, setTip] = useState<string>('')

  useEffect(() => {
    api.get('/meetings?limit=1').then(meetingRes => {
      const meeting = meetingRes.data.meetings?.[0]
      if (!meeting) return
      api.post('/coach', {
        effectiveness_score: meeting.effectiveness_score,
        effectiveness_reason: meeting.effectiveness_reason,
        open_questions: meeting.open_questions,
        risk_flags: meeting.risk_flags,
        sentiment: meeting.sentiment,
        action_items: meeting.action_items,
        meeting_type: meeting.meeting_type,
      }).then(coachRes => {
        setTip(coachRes.data.headline || '')
      }).catch(() => {})
    }).catch(() => {})
  }, [])

  return (
    <Card variant="glass" padding="md">
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>
        Coach Tip
      </h3>
      {tip ? (
        <>
          <p style={{ color: 'var(--mm-text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            {tip}
          </p>
          <div style={{ marginTop: 12 }}>
            <Button variant="purple" size="sm" onClick={() => window.location.href = '/coaching'}>
              View Coaching
            </Button>
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--mm-text-muted)', fontSize: 14 }}>Record a meeting to unlock personalised coaching.</p>
      )}
    </Card>
  )
}