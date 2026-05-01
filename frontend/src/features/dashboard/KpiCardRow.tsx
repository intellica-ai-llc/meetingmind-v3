import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { Card } from '@/components/ui/Card'

interface KpiData {
  overallScore: number | null
  scoreTrend: number | null
  talkRatio: number | null
  sentiment: string | null
  sentimentTrend: string | null
  engagementRate: number | null
  engagementTrend: number | null
}

export function KpiCardRow() {
  const [kpi, setKpi] = useState<KpiData | null>(null)

  useEffect(() => {
    api.get('/dashboard/kpi').then(r => setKpi(r.data)).catch(() => {})
  }, [])

  if (!kpi) return null

  const kpiCards = [
    {
      label: 'Overall Score',
      value: kpi.overallScore,
      sub: kpi.overallScore !== null ? 'Great' : '—',
      trend: kpi.scoreTrend !== null ? `${kpi.scoreTrend > 0 ? '↑' : kpi.scoreTrend < 0 ? '↓' : '→'} ${Math.abs(kpi.scoreTrend)}%` : null,
      render: () => (
        <ScoreRing score={kpi.overallScore ?? 0} />
      ),
    },
    {
      label: 'Talk Ratio',
      value: kpi.talkRatio,
      sub: kpi.talkRatio !== null ? `${kpi.talkRatio}%` : '—',
      trend: null,
      render: () => (
        <div style={{ width: 72, height: 72, borderRadius: '50%', border: '5px solid var(--mm-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--mm-text-primary)' }}>{kpi.talkRatio ?? '—'}</span>
        </div>
      ),
    },
    {
      label: 'Sentiment',
      value: kpi.sentiment ?? '—',
      sub: kpi.sentiment ?? '—',
      trend: kpi.sentimentTrend ? `${kpi.sentimentTrend}` : null,
      render: () => (
        <div style={{ fontSize: 32 }}>{kpi.sentiment === 'Positive' ? '🟢' : kpi.sentiment === 'Negative' ? '🔴' : '⚪'}</div>
      ),
    },
    {
      label: 'Engagement',
      value: kpi.engagementRate,
      sub: kpi.engagementRate !== null ? `${kpi.engagementRate}/hr` : '—',
      trend: kpi.engagementTrend !== null ? `${kpi.engagementTrend > 0 ? '↑' : kpi.engagementTrend < 0 ? '↓' : '→'} ${Math.abs(kpi.engagementTrend)}` : null,
      render: () => (
        <div style={{ fontSize: 32 }}>🎯</div>
      ),
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
      {kpiCards.map(card => (
        <Card key={card.label} variant="glass" padding="md">
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 10 }}>{card.render()}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)' }}>{card.label}</div>
            <div style={{ fontSize: 13, color: 'var(--mm-text-secondary)', marginTop: 4 }}>{card.sub}</div>
            {card.trend && (
              <div style={{ fontSize: 12, color: card.trend.startsWith('↑') ? 'var(--mm-success)' : card.trend.startsWith('↓') ? 'var(--mm-danger)' : 'var(--mm-text-muted)', marginTop: 2 }}>
                {card.trend}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}