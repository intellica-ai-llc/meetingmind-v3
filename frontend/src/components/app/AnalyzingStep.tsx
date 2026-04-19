import { useApp } from '@/contexts/AppContext'

export function AnalyzingStep() {
  const { statusMsg } = useApp()
  return (
    <div style={{ padding: '8px 0' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#00d4ff', fontFamily: 'monospace' }}>{'>'} {statusMsg}<span className="blink">_</span></p>
      <p style={{ fontSize: 12, color: '#6b7fa3' }}>Groq Llama 3.3 70B is extracting 13 categories of insight from the transcript...</p>
      <div style={{ marginTop: 16, height: 3, background: '#1e3a5f', borderRadius: 2 }}>
        <div style={{ height: 3, width: '80%', background: 'linear-gradient(90deg, #7c3aed, #00d4ff)', borderRadius: 2, animation: 'pulse-bar 1.5s infinite' }} />
      </div>
    </div>
  )
}
