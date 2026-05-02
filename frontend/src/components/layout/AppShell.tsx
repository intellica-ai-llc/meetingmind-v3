import { useApp } from '@/contexts/AppContext'
import { useNavigate } from 'react-router-dom'
import { RecordingStep } from '@/components/app/RecordingStep'
import { ProcessingStep } from '@/components/app/ProcessingStep'
import { NameSpeakersStep } from '@/components/app/NameSpeakersStep'
import { AnalyzingStep } from '@/components/app/AnalyzingStep'
import { ResultsStep } from '@/components/app/ResultsStep'
import { Button } from '@/components/ui/Button'

export function AppShell() {
  const { step, error, reset } = useApp()
  const navigate = useNavigate()

  if (step === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--mm-gradient-page)',
      }}>
        <div style={{
          maxWidth: 500,
          width: '100%',
          background: 'rgba(8,14,28,0.88)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 24,
          padding: 32,
          textAlign: 'center',
          boxShadow: '0 20px 80px rgba(0,0,0,0.45)',
        }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--mm-danger)', marginBottom: 8 }}>❌ Something went wrong</p>
          <p style={{ fontSize: 13, color: 'var(--mm-text-muted)', fontFamily: 'var(--mm-font-mono)', marginBottom: 16 }}>{error}</p>
          <Button onClick={reset} variant="danger">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--mm-gradient-page)',
      fontFamily: 'var(--mm-font-body)',
      color: 'var(--mm-text-primary)',
      position: 'relative',
    }}>
      {/* Outer glass panel — matches DashboardShell */}
      <div style={{
        width: '100%',
        maxWidth: 960,
        height: 'calc(100vh - 48px)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 24,
        overflow: 'hidden',
        background: 'rgba(8,14,28,0.88)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 20px 80px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
      }}>
        {/* TOP HEADER */}
        <header style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'transparent',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>M</div>
            <span style={{ fontFamily: 'var(--mm-font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--mm-text-primary)' }}>MeetingMind</span>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="secondary" size="sm">
            ← Dashboard
          </Button>
        </header>

        {/* CONTENT */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {step === 'upload' && <RecordingStep />}
          {step === 'recording' && <RecordingStep />}
          {step === 'processing' && <ProcessingStep />}
          {step === 'name_speakers' && <NameSpeakersStep />}
          {step === 'analyzing' && <AnalyzingStep />}
          {step === 'results' && <ResultsStep />}
        </main>
      </div>
    </div>
  )
}