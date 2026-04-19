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
