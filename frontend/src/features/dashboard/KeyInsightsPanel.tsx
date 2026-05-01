import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'

export function KeyInsightsPanel() {
  const [insights, setInsights] = useState<{ actionItems: number; keyTopics: number; openQuestions: number; risks: number } | null>(null)

  useEffect(() => {
    api.get('/dashboard/kpi')
      .then(r => setInsights(r.data.insights))
      .catch(() => {})
  }, [])

  return (
    <Card variant="glass" padding="md">
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>
        Key Insights
      </h3>
      {insights ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mm-text-secondary)' }}>Action Items</span>
              <span style={{ fontWeight: 600, color: 'var(--mm-text-primary)' }}>{insights.actionItems}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mm-text-secondary)' }}>Key Topics</span>
              <span style={{ fontWeight: 600, color: 'var(--mm-text-primary)' }}>{insights.keyTopics}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mm-text-secondary)' }}>Open Questions</span>
              <span style={{ fontWeight: 600, color: 'var(--mm-text-primary)' }}>{insights.openQuestions}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mm-text-secondary)' }}>Risks &amp; Concerns</span>
              <span style={{ fontWeight: 600, color: 'var(--mm-text-primary)' }}>{insights.risks}</span>
            </div>
          </div>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <a href="/meetings" style={{ color: 'var(--mm-cyan)', fontSize: 13 }}>View all insights →</a>
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--mm-text-muted)' }}>No meeting data yet.</p>
      )}
    </Card>
  )
}