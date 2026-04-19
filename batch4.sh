#!/bin/bash
set -euo pipefail

# BATCH 4: APP PANEL COMPONENTS
# Creates: components/app/ and components/results/

mkdir -p frontend/src/components/app frontend/src/components/results

cat > frontend/src/components/app/AppPanel.tsx << 'EOF'
import { useApp } from '@/contexts/AppContext'
import { RecordingStep } from './RecordingStep'
import { ProcessingStep } from './ProcessingStep'
import { NameSpeakersStep } from './NameSpeakersStep'
import { AnalyzingStep } from './AnalyzingStep'
import { ResultsStep } from './ResultsStep'

export function AppPanel() {
  const { step, error, reset } = useApp()

  if (step === 'error') {
    return (
      <div style={{ background: '#120609', border: '1px solid rgba(255,77,77,0.4)', borderRadius: 12, padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#ff4d4d' }}>❌ Something went wrong</p>
        <p style={{ fontSize: 13, color: '#6b7fa3', fontFamily: 'monospace' }}>{error}</p>
        <button onClick={reset} style={{ background: '#ff4d4d', color: '#fff', fontWeight: 700, padding: '10px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 12 }}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="app-panel" style={{ position: 'relative', background: '#020408', border: '1.5px solid #00d4ff', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.012) 2px, rgba(0,212,255,0.012) 4px)' }} />
      {[{ top: 0, left: 0, borderTop: '2px solid #00d4ff', borderLeft: '2px solid #00d4ff' }, { top: 0, right: 0, borderTop: '2px solid #00d4ff', borderRight: '2px solid #00d4ff' }, { bottom: 0, left: 0, borderBottom: '2px solid #00d4ff', borderLeft: '2px solid #00d4ff' }, { bottom: 0, right: 0, borderBottom: '2px solid #00d4ff', borderRight: '2px solid #00d4ff' }].map((cs, i) => (<div key={i} style={{ position: 'absolute', width: 18, height: 18, zIndex: 2, ...cs }} />))}
      <div style={{ position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(0,212,255,0.15)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(0,212,255,0.07), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>{['#ff5f56', '#ffbd2e', '#27c93f'].map(c => (<div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />))}</div>
          <span style={{ fontSize: 11, color: '#6b7fa3', letterSpacing: '2px', fontFamily: 'monospace' }}>MEETINGMIND v3.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', boxShadow: '0 0 6px #00e676' }} />
          <span style={{ fontSize: 10, color: '#00e676', letterSpacing: '1px', fontFamily: 'monospace' }}>ONLINE</span>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, padding: '28px 28px 32px' }}>
        {step === 'upload' && <RecordingStep />}
        {step === 'recording' && <RecordingStep />}
        {step === 'processing' && <ProcessingStep />}
        {step === 'name_speakers' && <NameSpeakersStep />}
        {step === 'analyzing' && <AnalyzingStep />}
        {step === 'results' && <ResultsStep />}
      </div>
    </div>
  )
}
EOF

cat > frontend/src/components/app/RecordingStep.tsx << 'EOF'
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
EOF

cat > frontend/src/components/app/ProcessingStep.tsx << 'EOF'
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
EOF

cat > frontend/src/components/app/NameSpeakersStep.tsx << 'EOF'
import { useApp } from '@/contexts/AppContext'

export function NameSpeakersStep() {
  const { speakers, speakerMap, setSpeakerMap, utterances, error, meetingTitle, setMeetingTitle, meetingDate, setMeetingDate, handleNameConfirm } = useApp()

  return (
    <div>
      <h3 style={{ fontSize: 16, color: '#e8f0fe', margin: '0 0 6px', fontWeight: 800 }}>👥 Who was in this meeting?</h3>
      <p style={{ fontSize: 13, color: '#6b7fa3', margin: '0 0 20px' }}>We detected <strong style={{ color: '#00d4ff' }}>{speakers.length}</strong> speaker{speakers.length !== 1 ? 's' : ''}. Name each one so action items are correctly assigned.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', marginBottom: 6, display: 'block' }}>Meeting Title (optional)</label>
          <input type="text" placeholder="e.g. Q3 Planning Session" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} style={{ width: '100%', padding: '9px 14px', fontSize: 13, borderRadius: 8, border: '1px solid #1e3a5f', background: '#060810', color: '#e8f0fe', boxSizing: 'border-box' }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', marginBottom: 6, display: 'block' }}>Meeting Date</label>
          <input type="text" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} style={{ width: '100%', padding: '9px 14px', fontSize: 13, borderRadius: 8, border: '1px solid #1e3a5f', background: '#060810', color: '#e8f0fe', boxSizing: 'border-box' }} />
        </div>
      </div>
      {speakers.map(spkr => (
        <div key={spkr} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(0,212,255,0.12)', color: '#00d4ff', padding: '5px 12px', borderRadius: 14, border: '1px solid rgba(0,212,255,0.3)', minWidth: 85, textAlign: 'center' }}>Speaker {spkr}</span>
          <span style={{ fontSize: 12, color: '#6b7fa3', fontStyle: 'italic', flex: 1, minWidth: 100 }}>"{utterances.find(u => u.speaker === spkr)?.text?.slice(0, 55)}..."</span>
          <input type="text" placeholder="Enter name" value={speakerMap[spkr] || ''} onChange={e => setSpeakerMap({ ...speakerMap, [spkr]: e.target.value })} style={{ padding: '9px 14px', fontSize: 13, borderRadius: 8, border: '1px solid #1e3a5f', background: '#060810', color: '#e8f0fe', width: 180 }} />
        </div>
      ))}
      {error && <p style={{ fontSize: 13, color: '#ff4d4d', marginBottom: 12 }}>{error}</p>}
      <button onClick={handleNameConfirm} style={{ padding: '12px 26px', fontSize: 13, fontWeight: 700, background: '#00d4ff', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 0 20px #00d4ff55', transition: 'all 0.2s', letterSpacing: '0.8px' }}>✓ Confirm Names and Analyse</button>
    </div>
  )
}
EOF

cat > frontend/src/components/app/AnalyzingStep.tsx << 'EOF'
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
EOF

cat > frontend/src/components/app/ResultsStep.tsx << 'EOF'
import { useApp } from '@/contexts/AppContext'
import { StatsRow } from '@/components/results/StatsRow'
import { TalkBar } from '@/components/ui/TalkBar'
import { ActionItemsTable } from '@/components/results/ActionItemsTable'
import { OpenQuestions } from '@/components/results/OpenQuestions'
import { RiskFlags } from '@/components/results/RiskFlags'
import { KeyQuotes } from '@/components/results/KeyQuotes'
import { KeyTopics } from '@/components/results/KeyTopics'
import { CoachCard } from '@/components/results/CoachCard'
import { EmailCard } from '@/components/results/EmailCard'
import { TranscriptViewer } from '@/components/results/TranscriptViewer'
import { ActionButtons } from '@/components/results/ActionButtons'

const TALK_COLORS = ['#00d4ff', '#7c3aed', '#00e676', '#f59e0b']

export function ResultsStep() {
  const { meetingTitle, meetingDate, demoMode, results, talkTime, speakerMap, coachData, email, namedTranscript } = useApp()

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        {meetingTitle && <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8f0fe', margin: '0 0 4px' }}>{meetingTitle}</h3>}
        <p style={{ fontSize: 12, color: '#6b7fa3', margin: 0 }}>{meetingDate}</p>
        {demoMode && <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 10, background: 'rgba(124,58,237,0.15)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.35)', fontSize: 10, fontWeight: 700 }}>DEMO MODE</span>}
      </div>
      <StatsRow results={results} confidence={null} />
      {Object.keys(talkTime).length > 0 && (
        <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Talk Time</span>
          {Object.entries(talkTime).map(([lbl, data], i) => (<TalkBar key={lbl} name={speakerMap[lbl] || `Speaker ${lbl}`} data={data as { minutes: number; percentage: number }} color={TALK_COLORS[i % TALK_COLORS.length]} />))}
        </div>
      )}
      <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Meeting Summary</span>
        <p style={{ fontSize: 11, color: '#6b7fa3', margin: '0 0 8px' }}>Type: <strong style={{ color: '#00d4ff' }}>{results?.meeting_type || 'Other'}</strong></p>
        <p style={{ color: '#e8f0fe', lineHeight: 1.8, fontSize: 14, margin: 0 }}>{results?.summary || 'No summary available.'}</p>
      </div>
      <ActionItemsTable actionItems={results?.action_items || []} />
      {results?.decisions && results.decisions.length > 0 && (
        <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Decisions Made</span>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#e8f0fe', lineHeight: 1.9 }}>{results.decisions.map((d: string, i: number) => (<li key={`d-${i}`}>{d}</li>))}</ul>
        </div>
      )}
      <KeyQuotes quotes={results?.key_quotes || []} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <OpenQuestions questions={results?.open_questions || []} />
        {results?.parking_lot && results.parking_lot.length > 0 && (
          <div style={{ background: '#080d18', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 10, padding: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Parking Lot</span>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#e8f0fe', lineHeight: 1.9 }}>{results.parking_lot.map((p: string, i: number) => (<li key={`pl-${i}`}>{p}</li>))}</ul>
          </div>
        )}
      </div>
      <RiskFlags flags={results?.risk_flags || []} />
      {results?.next_agenda && results.next_agenda.length > 0 && (
        <div style={{ background: '#080d18', border: '1px solid rgba(0,230,118,0.4)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#00e676', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Next Meeting Agenda</span>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#e8f0fe', lineHeight: 1.9 }}>{results.next_agenda.map((a: string, i: number) => (<li key={`na-${i}`}>{a}</li>))}</ol>
        </div>
      )}
      <KeyTopics topics={results?.key_topics || []} />
      <CoachCard coachData={coachData} />
      <EmailCard email={email} />
      <TranscriptViewer transcript={namedTranscript} />
      <ActionButtons />
    </div>
  )
}
EOF

echo "✅ Batch 4 complete (7 files: app panel components)"