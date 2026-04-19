interface ScoreRingProps {
  score: number
}

export function ScoreRing({ score }: ScoreRingProps) {
  const color = score >= 7 ? '#00e676' : score >= 4 ? '#f59e0b' : '#ff4d4d'
  const r = 28
  const circ = 2 * Math.PI * r
  
  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1e3a5f" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${(score / 10) * circ} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: '#6b7fa3' }}>/ 10</span>
      </div>
    </div>
  )
}
