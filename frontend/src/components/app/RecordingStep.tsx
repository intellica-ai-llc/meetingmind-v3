import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import { usePlan } from '@/contexts/UserPlanProvider'
import { PrepareHeader } from '@/features/console/PrepareHeader'
import { InitiativePickerCard } from '@/features/console/InitiativePickerCard'
import { SpeakerCard } from '@/features/console/SpeakerCard'
import { AgendaBuilder } from '@/features/console/AgendaBuilder'
import { OpenItemsCard } from '@/features/console/OpenItemsCard'

function readPrepareParams(): { title: string; date: string; attendees: string[] } | null {
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('prepare') !== 'true') return null
    return {
      title: params.get('title') || '',
      date: params.get('date') || '',
      attendees: (params.get('attendees') || '').split(',').map(a => a.trim()).filter(Boolean),
    }
  } catch {
    return null
  }
}

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
    selectedInitiativeId,
    setSelectedInitiativeId,
    setMeetingTitle,
    setMeetingDate,
  } = useApp()

  const { plan } = usePlan()
  const [searchParams] = useSearchParams()

  // ── Initial state from URL (first mount) ────────────────
  const initialParams = readPrepareParams()
  const [prepareTitle, setPrepareTitle] = useState<string>(initialParams?.title || '')
  const [prepareDate, setPrepareDate] = useState<string>(initialParams?.date || '')
  const [prepareAttendees, setPrepareAttendees] = useState<string[]>(initialParams?.attendees || [])
  const [showQuickRecord, setShowQuickRecord] = useState(false)
  const cleanedRef = useRef(false)
  const isFree = plan === 'free' || !plan

  // ── Clean URL once AND sync AppContext on first mount ────
  useEffect(() => {
    if (initialParams && !cleanedRef.current) {
      cleanedRef.current = true
      if (initialParams.title) setMeetingTitle(initialParams.title)
      if (initialParams.date) {
        setMeetingDate(new Date(initialParams.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
      }
      window.history.replaceState({}, document.title, '/app')
    }
  }, [initialParams, setMeetingTitle, setMeetingDate])

  // ── Re‑sync when URL changes (same‑component navigation) ─
  useEffect(() => {
    const prepare = searchParams.get('prepare')
    if (prepare === 'true') {
      const title = searchParams.get('title') || ''
      const date = searchParams.get('date') || ''
      const attendees = (searchParams.get('attendees') || '').split(',').map(a => a.trim()).filter(Boolean)

      setPrepareTitle(title)
      setPrepareDate(date)
      setPrepareAttendees(attendees)
      setShowQuickRecord(false)

      if (title) setMeetingTitle(title)
      if (date) {
        setMeetingDate(new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
      }
    }
  }, [searchParams, setMeetingTitle, setMeetingDate])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0')
    const secs = (s % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  // ── QUICK RECORD (minimal launcher) ──────────────────────
  if (showQuickRecord || isRecording || countdown !== null) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowQuickRecord(false)}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '4px 14px',
              color: 'var(--mm-text-secondary)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ← Back to full setup
          </button>
        </div>

        {countdown !== null ? (
          <div>
            <div className="count-num" style={{ fontSize: 80, fontWeight: 900, color: 'var(--mm-cyan)', lineHeight: 1, margin: '0 0 12px', textShadow: '0 0 60px var(--mm-cyan)', fontVariantNumeric: 'tabular-nums' }}>{countdown}</div>
            <p style={{ fontSize: 14, color: 'var(--mm-text-secondary)', margin: 0 }}>Recording starts in a moment — position your device</p>
          </div>
        ) : isRecording ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
              <span className="rec-dot" style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#ff4d4d', boxShadow: '0 0 10px #ff4d4d', animation: 'rec-pulse 1.2s ease-out infinite' }} />
              <span style={{ fontSize: 24, fontWeight: 800, color: '#ff4d4d', fontVariantNumeric: 'tabular-nums' }}>{formatTime(recordingSecs)}</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--mm-text-secondary)', margin: '0 0 24px' }}>Recording… keep the mic in the centre of the table.</p>
            <button onClick={handleStopRecording} style={{ ...glowBtn('#ff4d4d', '#fff', 'lg') }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>⏹</span> STOP RECORDING
            </button>
          </div>
        ) : (
          <div>
            <input
              value={prepareTitle}
              onChange={e => {
                setPrepareTitle(e.target.value)
                setMeetingTitle(e.target.value)
              }}
              placeholder="Meeting title (optional)"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px dashed rgba(255,255,255,0.2)',
                color: 'var(--mm-text-primary)',
                fontSize: 20,
                fontWeight: 700,
                padding: '4px 0',
                textAlign: 'center',
                marginBottom: 24,
                outline: 'none',
              }}
            />

            <div style={{ width: 100, height: 100, margin: '0 auto 20px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.18), rgba(0,212,255,0.03))', border: '2px solid rgba(0,212,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(0,212,255,0.4)' }}>
              <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
                <rect x="13" y="4" width="14" height="22" rx="7" fill="var(--mm-cyan)" opacity="0.9" />
                <path d="M6 20c0 7.732 6.268 14 14 14s14-6.268 14-14" stroke="var(--mm-cyan)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <line x1="20" y1="34" x2="20" y2="39" stroke="var(--mm-cyan)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="14" y1="39" x2="26" y2="39" stroke="var(--mm-cyan)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            <p style={{ fontSize: 15, color: 'var(--mm-text-secondary)', margin: '0 0 24px' }}>Ready to capture your meeting?</p>

            <div style={{ marginBottom: 20 }}>
              <button onClick={handleStartMeeting} style={{ ...glowBtn('var(--mm-cyan)', '#0A0B1A', 'lg'), boxShadow: '0 0 24px rgba(0,212,255,0.5)', width: '100%', maxWidth: 340 }}>
                <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                  <rect x="13" y="4" width="14" height="22" rx="7" fill="#0A0B1A" />
                  <path d="M6 20c0 7.732 6.268 14 14 14s14-6.268 14-14" stroke="#0A0B1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <line x1="20" y1="34" x2="20" y2="39" stroke="#0A0B1A" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                START RECORDING
              </button>
              {isFree && (
                <button onClick={handleDemoMode} style={{ ...glowBtn('var(--mm-purple)', '#fff', 'sm'), marginTop: 8 }}>
                  ⚡ DEMO REPORT
                </button>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(0,212,255,0.12)', paddingTop: 20 }}>
              <div style={{ background: 'rgba(0,212,255,0.04)', border: '2px dashed rgba(0,212,255,0.3)', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8, color: 'var(--mm-cyan)' }}>☁️</div>
                <p style={{ fontSize: 14, color: 'var(--mm-text-primary)', margin: '0 0 4px', fontWeight: 600 }}>Drop your audio file here</p>
                <p style={{ fontSize: 12, color: 'var(--mm-text-secondary)', margin: '0 0 12px' }}>MP3 or M4A · max 25 MB</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <input type="file" accept=".mp3,.m4a" onChange={handleFileChange} style={{ fontSize: 12, color: 'var(--mm-text-secondary)', flex: 1, minWidth: 0 }} />
                  {audioFile && (
                    <button onClick={handleUpload} style={{ ...glowBtn('var(--mm-cyan)', '#0A0B1A', 'sm') }}>
                      Upload & Process
                    </button>
                  )}
                </div>
                {audioFile && !fileError && <p style={{ fontSize: 11, color: '#00e676', margin: '6px 0 0' }}>✓ {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(1)} MB)</p>}
                {fileError && <p style={{ fontSize: 11, color: '#ff4d4d', margin: '6px 0 0' }}>{fileError}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── PREPARE CONSOLE (full setup) ─────────────────────────
  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: 12 }}>
        <button
          onClick={() => setShowQuickRecord(true)}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '4px 14px',
            color: 'var(--mm-text-secondary)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Skip setup → quick record
        </button>
      </div>

      <PrepareHeader title={prepareTitle} date={prepareDate} attendees={prepareAttendees} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <InitiativePickerCard selectedId={selectedInitiativeId} onSelect={setSelectedInitiativeId} />
        <SpeakerCard attendees={prepareAttendees} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <AgendaBuilder />
      </div>

      <div style={{ marginBottom: 24 }}>
        <OpenItemsCard initiativeId={selectedInitiativeId} />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        <button
          onClick={handleStartMeeting}
          style={{ ...glowBtn('var(--mm-cyan)', '#0A0B1A', 'lg'), boxShadow: '0 0 24px rgba(0,212,255,0.5)' }}
        >
          <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
            <rect x="13" y="4" width="14" height="22" rx="7" fill="#0A0B1A" />
            <path d="M6 20c0 7.732 6.268 14 14 14s14-6.268 14-14" stroke="#0A0B1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <line x1="20" y1="34" x2="20" y2="39" stroke="#0A0B1A" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          START RECORDING
        </button>

        <div style={{ background: 'rgba(0,212,255,0.04)', border: '2px dashed rgba(0,212,255,0.3)', borderRadius: 12, padding: '16px', textAlign: 'center', width: '100%', maxWidth: 400 }}>
          <p style={{ fontSize: 13, color: 'var(--mm-text-secondary)', margin: '0 0 8px' }}>Or upload an audio file (MP3, M4A)</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <input type="file" accept=".mp3,.m4a" onChange={handleFileChange} style={{ fontSize: 12, color: 'var(--mm-text-secondary)', flex: 1, minWidth: 0, maxWidth: 300 }} />
            {audioFile && (
              <button onClick={handleUpload} style={glowBtn('var(--mm-cyan)', '#0A0B1A', 'sm')}>
                Upload & Process
              </button>
            )}
          </div>
          {audioFile && !fileError && <p style={{ fontSize: 11, color: '#00e676', margin: '6px 0 0' }}>✓ {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(1)} MB)</p>}
          {fileError && <p style={{ fontSize: 11, color: '#ff4d4d', margin: '6px 0 0' }}>{fileError}</p>}
        </div>
      </div>
    </div>
  )
}