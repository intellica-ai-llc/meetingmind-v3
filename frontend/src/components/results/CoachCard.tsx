interface CoachCardProps {
  coachData: any | null
}

export function CoachCard({ coachData }: CoachCardProps) {
  if (!coachData) return null
  return (
    <div style={{ background: '#080d18', border: '1px solid rgba(124,58,237,0.5)', borderRadius: 10, padding: 20, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>🏆 Meeting Coach</span>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#e8f0fe', margin: '0 0 16px' }}>{coachData.headline}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: 8, padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#00e676', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 6px' }}>Top Strength</p>
          <p style={{ fontSize: 13, color: '#e8f0fe', margin: 0 }}>{coachData.top_strength}</p>
        </div>
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 6px' }}>Top Improvement</p>
          <p style={{ fontSize: 13, color: '#e8f0fe', margin: 0 }}>{coachData.top_improvement}</p>
        </div>
      </div>
      {coachData.score_to_beat && (
        <div style={{ background: '#060810', border: '1px solid #1e3a5f', borderRadius: 8, padding: 14, marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#00d4ff', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 6px' }}>Score to Beat</p>
          <p style={{ fontSize: 13, color: '#e8f0fe', margin: 0 }}>{coachData.score_to_beat}</p>
        </div>
      )}
      {coachData.facilitation_tips && coachData.facilitation_tips.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7fa3', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 8px' }}>Facilitation Tips</p>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#e8f0fe', lineHeight: 1.9 }}>{coachData.facilitation_tips.map((tip: string, i: number) => (<li key={`tip-${i}`}>{tip}</li>))}</ul>
        </div>
      )}
    </div>
  )
}
