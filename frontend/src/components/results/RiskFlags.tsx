interface RiskFlagsProps {
  flags: string[]
}

export function RiskFlags({ flags }: RiskFlagsProps) {
  if (!flags || flags.length === 0) return null
  return (
    <div style={{ background: '#120609', border: '1px solid rgba(255,77,77,0.4)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#ff4d4d', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>⚠ Risk Flags</span>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#e8f0fe', lineHeight: 1.9 }}>{flags.map((r, i) => (<li key={`rf-${i}`}>{r}</li>))}</ul>
    </div>
  )
}
