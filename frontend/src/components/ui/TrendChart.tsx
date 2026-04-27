interface DataPoint {
  date: string
  value: number | null
}

interface TrendChartProps {
  data: DataPoint[]
  color?: string
  height?: number
  width?: number
}

export function TrendChart({ data, color = '#00d4ff', height = 100, width = 200 }: TrendChartProps) {
  const valid = data.filter(p => p.value !== null) as { date: string; value: number }[]
  if (valid.length < 2) return <div style={{ color: 'var(--mm-text-muted)', fontSize: 12 }}>Not enough data to chart.</div>

  const maxVal = Math.max(...valid.map(p => p.value), 1)
  const points = valid.map(p => ({
    x: ((new Date(p.date).getTime() - new Date(valid[0].date).getTime()) / (24 * 3600 * 1000)) * (width / Math.max(valid.length - 1, 1)),
    y: height - (p.value / maxVal) * height,
    date: new Date(p.date).toLocaleDateString(),
    value: p.value,
  }))

  const pathD = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {points.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r={2} fill={color} />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--mm-text-muted)' }}>
        <span>{valid[0].date ? new Date(valid[0].date).toLocaleDateString() : ''}</span>
        <span>{valid[valid.length-1].date ? new Date(valid[valid.length-1].date).toLocaleDateString() : ''}</span>
      </div>
    </div>
  )
}