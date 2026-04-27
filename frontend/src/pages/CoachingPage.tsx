import { useState, useEffect } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { TrendChart } from '@/components/ui/TrendChart'
import { ScoreRing } from '@/components/ui/ScoreRing'

export function CoachingPage() {
  const { isPaid } = useSubscription()
  const [trends, setTrends] = useState<any[]>([])
  const [patterns, setPatterns] = useState<any>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPaid) {
      setLoading(false)
      return
    }
    Promise.all([
      api.get('/coach/trends').catch(() => ({ data: { trends: [] } })),
      api.get('/intelligence/patterns').catch(() => ({ data: { patterns: null } }))
    ]).then(([trendsRes, patternsRes]) => {
      setTrends(trendsRes.data.trends || [])
      setPatterns(patternsRes.data.patterns || null)
    }).finally(() => setLoading(false))
  }, [isPaid])

  const handleAsk = async () => {
    if (!question.trim()) return
    setAsking(true)
    try {
      const res = await api.post('/coach/ask', { question })
      setAnswer(res.data.answer)
      setQuestion('')
    } catch (e) {
      console.error('Ask coach failed:', e)
    } finally {
      setAsking(false)
    }
  }

  if (!isPaid) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <Card variant="glass" padding="lg">
            <h2 style={{ color: 'var(--mm-text-primary)', marginBottom: 12 }}>Get Your Personal Meeting Coach</h2>
            <p style={{ color: 'var(--mm-text-secondary)', marginBottom: 20 }}>
              Upgrade to Pro to unlock trends, longitudinal insights, and ask‑the‑coach.
            </p>
            <button onClick={() => window.location.href = '/pricing'} style={{
              background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
              border: 'none', borderRadius: 8, padding: '12px 24px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer'
            }}>Go Pro — $9/mo</button>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) return <div style={{ color: 'var(--mm-text-secondary)', padding: 40 }}>Loading coaching data...</div>

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontSize: 'var(--mm-fs-title)', fontWeight: 800, color: 'var(--mm-text-primary)', marginBottom: 24 }}>
        Meeting Coach
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <Card variant="glass" padding="md">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--mm-text-primary)', marginBottom: 12 }}>
            Effectiveness Trend
          </h3>
          <TrendChart
            data={trends.map(t => ({ date: t.date, value: t.effectiveness }))}
            color="#00e676"
            height={120}
            width={300}
          />
        </Card>
        <Card variant="glass" padding="md">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--mm-text-primary)', marginBottom: 12 }}>
            Score Summary
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ScoreRing score={patterns?.avg_effectiveness ?? 0} />
            <div>
              <div style={{ color: 'var(--mm-text-secondary)', fontSize: 14 }}>Decision Velocity</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--mm-cyan)' }}>
                {patterns?.decision_velocity ?? '—'} <span style={{ fontSize: 12, fontWeight: 400 }}>meetings/week</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Card variant="glass" padding="lg">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--mm-text-primary)', marginBottom: 12 }}>
            Ask the Coach
          </h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="e.g. How can I improve idea generation in my meetings?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              style={{
                flex: 1, background: 'var(--mm-bg-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                padding: '10px 14px', color: 'var(--mm-text-primary)', fontSize: 14
              }}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
            />
            <button
              onClick={handleAsk}
              disabled={asking}
              style={{
                background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                border: 'none', borderRadius: 8, padding: '10px 18px', color: '#fff', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {asking ? '...' : 'Ask'}
            </button>
          </div>
          {answer && (
            <p style={{ color: 'var(--mm-text-primary)', marginTop: 16, lineHeight: 1.7, fontSize: 14 }}>
              {answer}
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}