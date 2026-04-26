import { useNavigate } from 'react-router-dom'
import { useSubscription } from '@/hooks/useSubscription'
import { useApp } from '@/contexts/AppContext'
import { Card } from '@/components/ui/Card'
import { ScoreRing } from '@/components/ui/ScoreRing'

export function CoachPanel() {
  const navigate = useNavigate()
  const { isPaid } = useSubscription()
  const { coachData, results } = useApp()

  const hasData = !!coachData || !!results

  // ── Free tier: teaser ──
  if (!isPaid) {
    return (
      <Card variant="glass" padding="md">
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              filter: hasData ? 'blur(4px)' : 'none',
              opacity: hasData ? 0.4 : 1,
            }}
          >
            <h3
              style={{
                fontSize: 'var(--mm-fs-section)',
                fontWeight: 700,
                color: 'var(--mm-text-primary)',
                marginBottom: 12,
              }}
            >
              Meeting Coach
            </h3>
            {hasData ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <ScoreRing score={results?.effectiveness_score ?? 0} />
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--mm-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 4,
                      }}
                    >
                      Last Meeting Score
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--mm-success)' }}>
                      {coachData?.top_strength ?? '—'}
                    </div>
                  </div>
                </div>
                {coachData?.top_improvement && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--mm-text-muted)', marginBottom: 2 }}>
                      Improvement Area
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--mm-warning)' }}>
                      {coachData.top_improvement}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--mm-text-secondary)', fontSize: 14 }}>
                Record a meeting to get instant coaching feedback.
              </p>
            )}
          </div>

          {hasData && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(15,17,48,0.55)',
                backdropFilter: 'blur(2px)',
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                Unlock full coaching insights
              </span>
              <button
                onClick={() => navigate('/pricing')}
                style={{
                  background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                  border: 'none',
                  borderRadius: 'var(--mm-radius-button)',
                  padding: '8px 20px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Go Pro →
              </button>
            </div>
          )}

          {!hasData && (
            <button
              onClick={() => navigate('/pricing')}
              style={{
                width: '100%',
                marginTop: 16,
                background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                border: 'none',
                borderRadius: 'var(--mm-radius-button)',
                padding: '10px 0',
                color: '#0A0B1A',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Unlock Coach — $9/mo
            </button>
          )}
        </div>
      </Card>
    )
  }

  // ── Pro user: full coaching ──
  return (
    <Card variant="glass" padding="md">
      <h3
        style={{
          fontSize: 'var(--mm-fs-section)',
          fontWeight: 700,
          color: 'var(--mm-text-primary)',
          marginBottom: 12,
        }}
      >
        Meeting Coach
      </h3>
      {hasData ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <ScoreRing score={results?.effectiveness_score ?? 0} />
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--mm-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                }}
              >
                Last Meeting Score
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--mm-success)' }}>
                {coachData?.top_strength ?? '—'}
              </div>
            </div>
          </div>
          {coachData?.top_improvement && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--mm-text-muted)', marginBottom: 2 }}>
                Improvement Area
              </div>
              <div style={{ fontSize: 14, color: 'var(--mm-warning)' }}>{coachData.top_improvement}</div>
            </div>
          )}
          {coachData?.headline && (
            <p style={{ fontSize: 13, color: 'var(--mm-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
              {coachData.headline}
            </p>
          )}
          <div style={{ textAlign: 'right' }}>
            <button
              onClick={() => navigate('/coaching')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--mm-cyan)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              View full analysis →
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ color: 'var(--mm-text-secondary)', fontSize: 14 }}>
            Record a meeting to see your personalized coaching analysis.
          </p>
        </div>
      )}
    </Card>
  )
}