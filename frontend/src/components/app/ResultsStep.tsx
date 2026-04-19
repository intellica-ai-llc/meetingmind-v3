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
