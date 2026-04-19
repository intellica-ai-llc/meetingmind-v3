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
