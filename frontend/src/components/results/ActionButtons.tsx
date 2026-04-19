import { useApp } from '@/contexts/AppContext'

function glowBtn(bg: string, color: string, size: string) {
  const sizes = { sm: { padding: '7px 16px', fontSize: 11 } }
  return { ...sizes[size as keyof typeof sizes], fontWeight: 700, background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: `0 0 20px ${bg}55`, transition: 'all 0.2s', letterSpacing: '0.8px' }
}

export function ActionButtons() {
  const { downloadMinutes, shareViaEmail, reset } = useApp()
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
      <button onClick={downloadMinutes} style={glowBtn('#00d4ff', '#000', 'sm')}>⬇ Download Minutes</button>
      <button onClick={shareViaEmail} style={glowBtn('#7c3aed', '#fff', 'sm')}>✉ Share via Email</button>
      <button onClick={reset} style={glowBtn('#1e3a5f', '#e8f0fe', 'sm')}>↩ New Meeting</button>
    </div>
  )
}
