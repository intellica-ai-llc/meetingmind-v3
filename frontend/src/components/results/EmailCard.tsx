import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'

interface EmailCardProps {
  email: string
}

export function EmailCard({ email }: EmailCardProps) {
  const { copyEmail, emailTone, setEmailTone, regenerateEmail, regenLoading } = useApp()
  const [copiedLocal, setCopiedLocal] = useState(false)

  const handleCopy = async () => {
    await copyEmail()
    setCopiedLocal(true)
    setTimeout(() => setCopiedLocal(false), 2000)
  }

  if (!email) return null

  return (
    <div style={{ background: '#080d18', border: '1px solid rgba(124,58,237,0.5)', borderRadius: 10, padding: 20, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Follow-up Email</span>
        <button onClick={handleCopy} style={{ padding: '7px 16px', fontSize: 11, fontWeight: 700, background: copiedLocal ? '#00e676' : '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: `0 0 20px ${copiedLocal ? '#00e676' : '#7c3aed'}55`, transition: 'all 0.2s', letterSpacing: '0.8px' }}>{copiedLocal ? '✓ Copied!' : 'Copy'}</button>
      </div>
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 10, color: '#6b7fa3', margin: '0 0 8px' }}>Regenerate with a different tone:</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[{ value: 'ceo', label: '📊 CEO', desc: 'Bullets, outcomes only' }, { value: 'client', label: '🤝 Client', desc: 'Warm, relationship-first' }, { value: 'team', label: '⚡ Team', desc: 'Casual, action-focused' }].map(tone => (
            <button key={tone.value} title={tone.desc} onClick={() => { setEmailTone(tone.value); regenerateEmail(tone.value) }} disabled={regenLoading} style={{ padding: '7px 16px', fontSize: 11, fontWeight: 700, background: emailTone === tone.value ? '#7c3aed' : '#1e3a5f', color: emailTone === tone.value ? '#fff' : '#6b7fa3', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: `0 0 20px ${emailTone === tone.value ? '#7c3aed' : '#1e3a5f'}55`, transition: 'all 0.2s', letterSpacing: '0.8px', opacity: regenLoading ? 0.6 : 1 }}>{tone.label}</button>
          ))}
          {regenLoading && <span style={{ fontSize: 11, color: '#6b7fa3', alignSelf: 'center' }}>Regenerating...</span>}
        </div>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#e8f0fe', lineHeight: 1.8, fontFamily: 'inherit', margin: 0 }}>{email}</pre>
    </div>
  )
}
