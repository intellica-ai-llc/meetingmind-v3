interface SentimentBadgeProps {
  sentiment: string
}

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    Positive: { bg: '#00e67618', color: '#00e676', border: '#00e67640' },
    Neutral:  { bg: '#00d4ff18', color: '#00d4ff', border: '#00d4ff40' },
    Mixed:    { bg: '#f59e0b18', color: '#f59e0b', border: '#f59e0b40' },
    Tense:    { bg: '#ff4d4d18', color: '#ff4d4d', border: '#ff4d4d40' },
  }
  const s = map[sentiment] || map.Neutral
  return (
    <span style={{
      padding: '4px 14px',
      borderRadius: 20,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 12,
      fontWeight: 700,
    }}>
      {sentiment || 'Neutral'}
    </span>
  )
}
