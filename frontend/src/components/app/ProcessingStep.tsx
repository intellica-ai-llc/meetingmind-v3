import { useApp } from '@/contexts/AppContext'

export function ProcessingStep() {
  const { statusMsg } = useApp()
  return (
    <div style={{ padding: '8px 0' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#00d4ff', fontFamily: 'monospace' }}>{'>'} {statusMsg}<span className="blink">_</span></p>
      <p style={{ fontSize: 12, color: '#6b7fa3' }}>AssemblyAI is transcribing your audio and identifying each speaker. Usually 30–90 seconds.</p>
      <div style={{ marginTop: 16, height: 3, background: '#1e3a5f', borderRadius: 2 }}>
        <div style={{ height: 3, width: '60%', background: 'linear-gradient(90deg, #00d4ff, #7c3aed)', borderRadius: 2, animation: 'pulse-bar 1.5s infinite' }} />
      </div>
    </div>
  )
}
