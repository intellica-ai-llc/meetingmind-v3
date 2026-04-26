import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'

export function IntelligencePanel() {
  const [patterns, setPatterns] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/intelligence/patterns')
      .then(r => setPatterns(r.data.patterns))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card variant="glass" padding="md">
        <div style={{ height: 20, width: 120, background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 16 }} />
        <div style={{ height: 60, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }} />
      </Card>
    )
  }

  if (!patterns || !patterns.avg_effectiveness) {
    return (
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--mm-text-primary)', marginBottom: 8 }}>Meeting Patterns</h3>
            <p style={{ fontSize: 14, color: 'var(--mm-text-secondary)' }}>Record 10 meetings to unlock trend analysis.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Effectiveness Trend', 'Decision Velocity', 'Risk Heatmap'].map(label => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8, padding: '12px 16px', textAlign: 'center',
                position: 'relative', filter: 'blur(1px)', opacity: 0.5,
              }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 16 }}>🔒</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--mm-text-muted)', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="glass" padding="md">
      <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--mm-text-primary)', marginBottom: 12 }}>Meeting Patterns</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div style={{ background: 'var(--mm-bg-primary)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--mm-cyan)' }}>{patterns.avg_effectiveness}/10</div>
          <div style={{ fontSize: 12, color: 'var(--mm-text-muted)', marginTop: 4 }}>Avg Effectiveness</div>
        </div>
        <div style={{ background: 'var(--mm-bg-primary)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--mm-purple)' }}>{patterns.decision_velocity}</div>
          <div style={{ fontSize: 12, color: 'var(--mm-text-muted)', marginTop: 4 }}>Meetings/Week</div>
        </div>
        <div style={{ background: 'var(--mm-bg-primary)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--mm-warning)' }}>{patterns.sentiment_trend}</div>
          <div style={{ fontSize: 12, color: 'var(--mm-text-muted)', marginTop: 4 }}>Sentiment Trend</div>
        </div>
      </div>
    </Card>
  )
}