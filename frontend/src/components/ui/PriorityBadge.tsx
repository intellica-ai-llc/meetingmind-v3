interface PriorityBadgeProps {
  priority: string
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    High:   { bg: '#ff4d4d18', color: '#ff4d4d', border: '#ff4d4d40' },
    Medium: { bg: '#f59e0b18', color: '#f59e0b', border: '#f59e0b40' },
    Low:    { bg: '#00e67618', color: '#00e676', border: '#00e67640' },
  }
  const s = map[priority] || map.Low
  return (
    <span style={{
      padding: '2px 9px',
      borderRadius: 10,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 10,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      {priority || 'Low'}
    </span>
  )
}
