interface KeyTopicsProps {
  topics: string[]
}

export function KeyTopics({ topics }: KeyTopicsProps) {
  if (!topics || topics.length === 0) return null
  return (
    <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Key Topics</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {topics.map((topic, i) => (<span key={`topic-${i}`} style={{ padding: '3px 12px', borderRadius: 14, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', fontSize: 12, fontWeight: 600 }}>{topic}</span>))}
      </div>
    </div>
  )
}
