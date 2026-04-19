import { useApp } from '@/contexts/AppContext'

function glowBtn(bg = '#00d4ff', color = '#000', size = 'md') {
  const sizes = { sm: { padding: '7px 16px', fontSize: 11 }, md: { padding: '12px 26px', fontSize: 13 }, lg: { padding: '16px 40px', fontSize: 15 } }
  return { ...sizes[size as keyof typeof sizes], fontWeight: 700, background: bg, color, border: 'none', borderRadius: size === 'lg' ? 12 : 8, cursor: 'pointer', boxShadow: `0 0 20px ${bg}55`, transition: 'all 0.2s', letterSpacing: '0.8px', textTransform: size === 'lg' ? 'uppercase' : 'none' }
}

export function RecordingStep() {
  const { countdown, handleStartMeeting, handleDemoMode, audioFile, handleFileChange, handleUpload, fileError } = useApp()

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 90, height: 90, margin: '0 auto 20px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.15), rgba(0,212,255,0.02))', border: '1.5px solid rgba(0,212,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(0,212,255,0.15)' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="13" y="4" width="14" height="22" rx="7" fill="#00d4ff" opacity="0.9" />
            <path d="M6 20c0 7.732 6.268 14 14 14s14-6.268 14-14" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <line x1="20" y1="34" x2="20" y2="39" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="14" y1="39" x2="26" y2="39" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        {countdown !== null ? (
          <div>
            <div className="count-num" style={{ fontSize: 80, fontWeight: 900, color: '#00d4ff', lineHeight: 1, margin: '0 0 12px', textShadow: '0 0 60px #00d4ff', fontVariantNumeric: 'tabular-nums' }}>{countdown}</div>
            <p style={{ fontSize: 14, color: '#6b7fa3', margin: 0 }}>Recording starts in a moment — position your device</p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e8f0fe', margin: '0 0 8px' }}>Ready to capture your meeting?</h2>
            <p style={{ fontSize: 13, color: '#6b7fa3', margin: '0 0 28px', lineHeight: 1.7, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>Click <strong style={{ color: '#00d4ff' }}>Start Meeting</strong> to record from your browser mic. Place your laptop in the centre of the table.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleStartMeeting} style={{ ...glowBtn('#00d4ff', '#000', 'lg'), display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 40 40" fill="none"><rect x="13" y="4" width="14" height="22" rx="7" fill="#000" /><path d="M6 20c0 7.732 6.268 14 14 14s14-6.268 14-14" stroke="#000" strokeWidth="2.5" strokeLinecap="round" fill="none" /><line x1="20" y1="34" x2="20" y2="39" stroke="#000" strokeWidth="2.5" strokeLinecap="round" /></svg>
                START MEETING
              </button>
              <button onClick={handleDemoMode} style={{ ...glowBtn('#7c3aed', '#fff', 'lg'), display: 'inline-flex', alignItems: 'center', gap: 10 }}>⚡ DEMO REPORT</button>
            </div>
          </div>
        )}
      </div>
      {countdown === null && (
        <div style={{ borderTop: '1px solid rgba(0,212,255,0.12)', paddingTop: 20 }}>
          <div style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ fontSize: 12, color: '#e8f0fe', margin: '0 0 4px', fontWeight: 600 }}>Upload a recorded meeting file</p>
            <p style={{ fontSize: 11, color: '#6b7fa3', margin: '0 0 12px' }}>MP3 or M4A · max 25 MB · recorded on phone or any device</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input type="file" accept=".mp3,.m4a" onChange={handleFileChange} style={{ fontSize: 12, color: '#6b7fa3', flex: 1, minWidth: 0 }} />
              <button onClick={handleUpload} disabled={!audioFile} style={{ ...glowBtn(audioFile ? '#00d4ff' : '#1e3a5f', audioFile ? '#000' : '#6b7fa3', 'sm'), opacity: audioFile ? 1 : 0.5, cursor: audioFile ? 'pointer' : 'not-allowed', flexShrink: 0, whiteSpace: 'nowrap' }}>Upload &amp; Process Meeting File</button>
            </div>
            {audioFile && !fileError && <p style={{ fontSize: 11, color: '#00e676', margin: '6px 0 0' }}>✓ {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(1)} MB)</p>}
            {fileError && <p style={{ fontSize: 11, color: '#ff4d4d', margin: '6px 0 0' }}>{fileError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
