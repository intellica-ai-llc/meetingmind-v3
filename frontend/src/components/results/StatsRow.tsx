import { SentimentBadge } from '@/components/ui/SentimentBadge'
import { ScoreRing } from '@/components/ui/ScoreRing'

interface StatsRowProps {
  results: any
  confidence: number | null
}

export function StatsRow({ results, confidence }: StatsRowProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
      {confidence !== null && (
        <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 10, color: '#6b7fa3', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Confidence</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: confidence >= 80 ? '#00e676' : '#f59e0b' }}>{confidence}%</span>
          <span style={{ fontSize: 10, color: '#6b7fa3' }}>{confidence >= 90 ? 'Excellent audio' : confidence >= 70 ? 'Good quality' : 'Review carefully'}</span>
        </div>
      )}
      <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 10, color: '#6b7fa3', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Sentiment</span>
        <SentimentBadge sentiment={results?.sentiment} />
        {results?.sentiment_reason && <span style={{ fontSize: 10, color: '#6b7fa3' }}>{results.sentiment_reason}</span>}
      </div>
      <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 10, color: '#6b7fa3', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Effectiveness</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ScoreRing score={results?.effectiveness_score || 0} />
          {results?.effectiveness_reason && <span style={{ fontSize: 10, color: '#6b7fa3', flex: 1 }}>{results.effectiveness_reason}</span>}
        </div>
      </div>
    </div>
  )
}
