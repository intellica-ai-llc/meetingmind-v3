import { useState } from 'react'

interface TranscriptViewerProps {
  transcript: string
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  if (!transcript) return null
  return (
    <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0, width: '100%' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', margin: 0, display: 'block' }}>Full Transcript</span>
        <span style={{ fontSize: 11, color: '#6b7fa3', marginLeft: 'auto' }}>{isOpen ? '▲ Collapse' : '▼ Expand'}</span>
      </button>
      {isOpen && (<pre style={{ marginTop: 14, whiteSpace: 'pre-wrap', fontSize: 12, color: '#6b7fa3', lineHeight: 1.8, fontFamily: 'monospace', maxHeight: 380, overflowY: 'auto' }}>{transcript}</pre>)}
    </div>
  )
}
