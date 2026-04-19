interface TalkBarProps {
  name: string
  data: { minutes: number; percentage: number }
  color: string
}

export function TalkBar({ name, data, color }: TalkBarProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
        <span style={{ color: '#e8f0fe', fontWeight: 600 }}>{name}</span>
        <span style={{ color: '#6b7fa3' }}>{data.minutes} min · {data.percentage}%</span>
      </div>
      <div style={{ height: 5, background: '#1e3a5f', borderRadius: 3 }}>
        <div style={{
          height: 5,
          width: `${data.percentage}%`,
          background: color,
          borderRadius: 3,
          boxShadow: `0 0 8px ${color}66`,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}
