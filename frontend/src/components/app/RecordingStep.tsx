import { useApp } from '@/contexts/AppContext'

function glowBtn(bg = '#00d4ff', color = '#000', size = 'md') {
  const sizes = {
    sm: { padding: '7px 16px', fontSize: 11 },
    md: { padding: '12px 26px', fontSize: 13 },
    lg: { padding: '16px 40px', fontSize: 15 },
  }
  return {
    ...sizes[size as keyof typeof sizes],
    fontWeight: 700,
    background: bg,
    color,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: `0 0 20px ${bg}55`,
    transition: 'all 0.2s',
    letterSpacing: '0.8px',
    height: 52,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  }
}

export function RecordingStep() {
  const {
    countdown,
    handleStartMeeting,
    handleDemoMode,
    audioFile,
    handleFileChange,
    handleUpload,
    fileError,
    isRecording,
    recordingSecs,
    handleStopRecording,
  } = useApp()

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0')
    const secs = (s % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <div>
      {/* UPPER HALF: centered content */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
        {/* Waveform SVG decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 600,
            height: 200,
            opacity: 0.12,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 600 100" preserveAspectRatio="none">
            <path
              d="M0 50 Q30 20 60 50 T120 50 T180 50 T240 50 T300 50 T360 50 T420 50 T480 50 T540 50 T600 50"
              fill="none"
              stroke="url(#waveGradient)"
              strokeWidth="3"
            />
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--mm-cyan)" />
                <stop offset="50%" stopColor="var(--mm-purple)" />
                <stop offset="100%" stopColor="var(--mm-cyan)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ---- COUNTDOWN ---- */}
        {countdown !== null ? (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              className="count-num"
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: 'var(--mm-cyan)',
                lineHeight: 1,
                margin: '0 0 12px',
                textShadow: '0 0 60px var(--mm-cyan)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {countdown}
            </div>
            <p style={{ fontSize: 14, color: 'var(--mm-text-secondary)', margin: 0 }}>
              Recording starts in a moment — position your device
            </p>
          </div>
        ) : isRecording ? (
          /* ---- RECORDING IN PROGRESS ---- */
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <span
                className="rec-dot"
                style={{
                  display: 'inline-block',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#ff4d4d',
                  boxShadow: '0 0 10px #ff4d4d',
                  animation: 'rec-pulse 1.2s ease-out infinite',
                }}
              />
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#ff4d4d',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatTime(recordingSecs)}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--mm-text-secondary)', margin: '0 0 24px' }}>
              Recording… keep the mic in the centre of the table.
            </p>
            <button
              onClick={handleStopRecording}
              style={{
                ...glowBtn('#ff4d4d', '#fff', 'lg'),
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>⏹</span> STOP RECORDING
            </button>
          </div>
        ) : (
          /* ---- INITIAL STATE ---- */
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Mic icon — larger, with glow */}
            <div
              style={{
                width: 100,
                height: 100,
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,212,255,0.18), rgba(0,212,255,0.03))',
                border: '2px solid rgba(0,212,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(0,212,255,0.4)',
              }}
            >
              <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
                <rect x="13" y="4" width="14" height="22" rx="7" fill="var(--mm-cyan)" opacity="0.9" />
                <path
                  d="M6 20c0 7.732 6.268 14 14 14s14-6.268 14-14"
                  stroke="var(--mm-cyan)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <line x1="20" y1="34" x2="20" y2="39" stroke="var(--mm-cyan)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="14" y1="39" x2="26" y2="39" stroke="var(--mm-cyan)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--mm-text-primary)',
                margin: '0 0 8px',
              }}
            >
              Ready to capture your meeting?
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--mm-text-secondary)',
                margin: '0 0 28px',
                lineHeight: 1.7,
                maxWidth: 400,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Click <strong style={{ color: 'var(--mm-cyan)' }}>Start Meeting</strong> to record from your
              browser mic. Place your laptop in the centre of the table.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleStartMeeting}
                style={{
                  ...glowBtn('var(--mm-cyan)', '#0A0B1A', 'lg'),
                  boxShadow: '0 0 24px rgba(0,212,255,0.5)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                  <rect x="13" y="4" width="14" height="22" rx="7" fill="#0A0B1A" />
                  <path
                    d="M6 20c0 7.732 6.268 14 14 14s14-6.268 14-14"
                    stroke="#0A0B1A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <line x1="20" y1="34" x2="20" y2="39" stroke="#0A0B1A" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                START MEETING
              </button>
              <button
                onClick={handleDemoMode}
                style={{
                  ...glowBtn('var(--mm-purple)', '#fff', 'lg'),
                  boxShadow: '0 0 24px rgba(123,97,255,0.4)',
                }}
              >
                ⚡ DEMO REPORT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---- UPLOAD ZONE (only when NOT recording) ---- */}
      {!isRecording && countdown === null && (
        <div style={{ borderTop: '1px solid rgba(0,212,255,0.12)', paddingTop: 20 }}>
          <div
            style={{
              background: 'rgba(0,212,255,0.04)',
              border: '2px dashed rgba(0,212,255,0.3)',
              borderRadius: 12,
              padding: '20px',
              textAlign: 'center',
              transition: 'border-color 0.2s',
            }}
          >
            {/* Cloud upload icon */}
            <div style={{ fontSize: 32, marginBottom: 8, color: 'var(--mm-cyan)' }}>☁️</div>
            <p style={{ fontSize: 14, color: 'var(--mm-text-primary)', margin: '0 0 4px', fontWeight: 600 }}>
              Drop your audio file here
            </p>
            <p style={{ fontSize: 12, color: 'var(--mm-text-secondary)', margin: '0 0 12px' }}>
              MP3 or M4A · max 25 MB
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <input
                type="file"
                accept=".mp3,.m4a"
                onChange={handleFileChange}
                style={{ fontSize: 12, color: 'var(--mm-text-secondary)', flex: 1, minWidth: 0, maxWidth: 300 }}
              />
              {audioFile && (
                <button
                  onClick={handleUpload}
                  style={{
                    ...glowBtn('var(--mm-cyan)', '#0A0B1A', 'sm'),
                    width: '100%',
                    maxWidth: 300,
                  }}
                >
                  Upload & Process
                </button>
              )}
            </div>
            {audioFile && !fileError && (
              <p style={{ fontSize: 11, color: '#00e676', margin: '6px 0 0' }}>
                ✓ {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            )}
            {fileError && (
              <p style={{ fontSize: 11, color: '#ff4d4d', margin: '6px 0 0' }}>{fileError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}