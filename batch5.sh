#!/bin/bash
set -euo pipefail

# BATCH 5: RESULTS COMPONENTS
# Creates: components/results/*.tsx

mkdir -p frontend/src/components/results

cat > frontend/src/components/results/StatsRow.tsx << 'EOF'
import { SentimentBadge } from '@/components/ui/SentimentBadge'
import { ScoreRing } from '@/components/ui/ScoreRing'

interface StatsRowProps {
  results: any
  confidence: number | null
}

export function StatsRow({ results, confidence }: StatsRowProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
      {confidence !== null && (
        <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 10, color: '#6b7fa3', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Confidence</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: confidence >= 80 ? '#00e676' : '#f59e0b' }}>{confidence}%</span>
          <span style={{ fontSize: 10, color: '#6b7fa3' }}>{confidence >= 90 ? 'Excellent audio' : confidence >= 70 ? 'Good quality' : 'Review carefully'}</span>
        </div>
      )}
      <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 10, color: '#6b7fa3', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Sentiment</span>
        <SentimentBadge sentiment={results?.sentiment} />
        {results?.sentiment_reason && <span style={{ fontSize: 10, color: '#6b7fa3' }}>{results.sentiment_reason}</span>}
      </div>
      <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 10, color: '#6b7fa3', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Effectiveness</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ScoreRing score={results?.effectiveness_score || 0} />
          {results?.effectiveness_reason && <span style={{ fontSize: 10, color: '#6b7fa3', flex: 1 }}>{results.effectiveness_reason}</span>}
        </div>
      </div>
    </div>
  )
}
EOF

cat > frontend/src/components/results/ActionItemsTable.tsx << 'EOF'
import { PriorityBadge } from '@/components/ui/PriorityBadge'

interface ActionItem {
  task: string
  owner: string
  deadline: string
  priority: string
}

interface ActionItemsTableProps {
  actionItems: ActionItem[]
}

export function ActionItemsTable({ actionItems }: ActionItemsTableProps) {
  if (!actionItems || actionItems.length === 0) {
    return (
      <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Action Items</span>
        <p style={{ fontSize: 13, color: '#6b7fa3' }}>No action items detected.</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Action Items</span>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
            {['Task', 'Owner', 'Deadline', 'Priority'].map(h => (<th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#00d4ff', fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>))}
          </tr>
        </thead>
        <tbody>
          {actionItems.map((item, i) => (
            <tr key={`${item.task}-${i}`} style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
              <td style={{ padding: '9px 10px', color: '#e8f0fe' }}>{item.task || '—'}</td>
              <td style={{ padding: '9px 10px', color: '#00d4ff' }}>{item.owner || '—'}</td>
              <td style={{ padding: '9px 10px', color: '#6b7fa3' }}>{item.deadline || '—'}</td>
              <td style={{ padding: '9px 10px' }}><PriorityBadge priority={item.priority} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
EOF

cat > frontend/src/components/results/OpenQuestions.tsx << 'EOF'
interface OpenQuestionsProps {
  questions: string[]
}

export function OpenQuestions({ questions }: OpenQuestionsProps) {
  if (!questions || questions.length === 0) return null
  return (
    <div style={{ background: '#080d18', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 10, padding: 16 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Open Questions</span>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#e8f0fe', lineHeight: 1.9 }}>{questions.map((q, i) => (<li key={`oq-${i}`}>{q}</li>))}</ul>
    </div>
  )
}
EOF

cat > frontend/src/components/results/RiskFlags.tsx << 'EOF'
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
EOF

cat > frontend/src/components/results/KeyQuotes.tsx << 'EOF'
interface Quote {
  speaker: string
  quote: string
}

interface KeyQuotesProps {
  quotes: Quote[]
}

export function KeyQuotes({ quotes }: KeyQuotesProps) {
  if (!quotes || quotes.length === 0) return null
  return (
    <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Key Quotes</span>
      {quotes.map((q, i) => (
        <div key={`q-${i}`} style={{ borderLeft: '3px solid #7c3aed', paddingLeft: 14, marginBottom: 12 }}>
          <p style={{ margin: '0 0 3px', fontSize: 13, color: '#e8f0fe', fontStyle: 'italic' }}>"{q.quote}"</p>
          <p style={{ margin: 0, fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>— {q.speaker}</p>
        </div>
      ))}
    </div>
  )
}
EOF

cat > frontend/src/components/results/KeyTopics.tsx << 'EOF'
interface KeyTopicsProps {
  topics: string[]
}

export function KeyTopics({ topics }: KeyTopicsProps) {
  if (!topics || topics.length === 0) return null
  return (
    <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Key Topics</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {topics.map((topic, i) => (<span key={`topic-${i}`} style={{ padding: '3px 12px', borderRadius: 14, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', fontSize: 12, fontWeight: 600 }}>{topic}</span>))}
      </div>
    </div>
  )
}
EOF

cat > frontend/src/components/results/TranscriptViewer.tsx << 'EOF'
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
EOF

cat > frontend/src/components/results/ActionButtons.tsx << 'EOF'
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
EOF

cat > frontend/src/components/results/EmailCard.tsx << 'EOF'
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
EOF

cat > frontend/src/components/results/CoachCard.tsx << 'EOF'
interface CoachCardProps {
  coachData: any | null
}

export function CoachCard({ coachData }: CoachCardProps) {
  if (!coachData) return null
  return (
    <div style={{ background: '#080d18', border: '1px solid rgba(124,58,237,0.5)', borderRadius: 10, padding: 20, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>🏆 Meeting Coach</span>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#e8f0fe', margin: '0 0 16px' }}>{coachData.headline}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: 8, padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#00e676', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 6px' }}>Top Strength</p>
          <p style={{ fontSize: 13, color: '#e8f0fe', margin: 0 }}>{coachData.top_strength}</p>
        </div>
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 6px' }}>Top Improvement</p>
          <p style={{ fontSize: 13, color: '#e8f0fe', margin: 0 }}>{coachData.top_improvement}</p>
        </div>
      </div>
      {coachData.score_to_beat && (
        <div style={{ background: '#060810', border: '1px solid #1e3a5f', borderRadius: 8, padding: 14, marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#00d4ff', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 6px' }}>Score to Beat</p>
          <p style={{ fontSize: 13, color: '#e8f0fe', margin: 0 }}>{coachData.score_to_beat}</p>
        </div>
      )}
      {coachData.facilitation_tips && coachData.facilitation_tips.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7fa3', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 8px' }}>Facilitation Tips</p>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#e8f0fe', lineHeight: 1.9 }}>{coachData.facilitation_tips.map((tip: string, i: number) => (<li key={`tip-${i}`}>{tip}</li>))}</ul>
        </div>
      )}
    </div>
  )
}
EOF

echo "✅ Batch 5 complete (10 files: results components)"