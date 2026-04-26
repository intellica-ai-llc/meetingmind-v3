import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'

export function PatternPlaceholder() {
  const [totalMeetings, setTotalMeetings] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then((res) => setTotalMeetings(res.data.totalMeetings ?? 0))
      .catch(() => setTotalMeetings(0))
      .finally(() => setLoading(false))
  }, [])

  const progress = Math.min(totalMeetings, 10)

  const lockedTiles = [
    { label: 'Effectiveness Trend', icon: '📈' },
    { label: 'Decision Velocity', icon: '⚡' },
    { label: 'Risk Heatmap', icon: '🔥' },
  ]

  if (loading) {
    return (
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 18, width: 120, background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 12 }} />
            <div style={{ height: 12, width: '80%', background: 'rgba(255,255,255,0.04)', borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 8, height: 60 }} />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="glass" padding="md">
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {/* LEFT SIDE: Title + Progress */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(123,97,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              🧠
            </div>
            <h3
              style={{
                fontSize: 'var(--mm-fs-section)',
                fontWeight: 700,
                color: 'var(--mm-text-primary)',
                margin: 0,
              }}
            >
              Meeting Patterns
            </h3>
          </div>

          <p style={{ fontSize: 14, color: 'var(--mm-text-secondary)', margin: '0 0 12px' }}>
            {progress} of 10 meetings recorded
          </p>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: 6,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(progress / 10) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--mm-purple), var(--mm-cyan))',
                borderRadius: 3,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>

        {/* RIGHT SIDE: Locked Preview Tiles */}
        <div style={{ flex: 1, display: 'flex', gap: 8, minWidth: 280 }}>
          {lockedTiles.map((tile) => (
            <div
              key={tile.label}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                filter: progress >= 10 ? 'none' : 'blur(1px)',
                opacity: progress >= 10 ? 1 : 0.5,
              }}
            >
              {progress < 10 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15,17,48,0.5)',
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>🔒</span>
                </div>
              )}
              <span style={{ fontSize: 20, marginBottom: 4 }}>{tile.icon}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--mm-text-muted)',
                  textAlign: 'center',
                }}
              >
                {tile.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {progress < 10 && (
        <p
          style={{
            fontSize: 12,
            color: 'var(--mm-text-muted)',
            margin: '12px 0 0',
            textAlign: 'center',
          }}
        >
          Unlocks after 10 meetings
        </p>
      )}
    </Card>
  )
}