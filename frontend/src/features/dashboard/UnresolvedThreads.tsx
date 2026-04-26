import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'

interface Thread {
  id: string
  title: string
  mention_count: number
  severity: string
  status: string
  last_mentioned_meeting_id: string
}

export function UnresolvedThreads() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await api.get('/threads')
        setThreads(response.data.threads)
      } catch (error) {
        console.error('Failed to fetch threads:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchThreads()
  }, [])

  const handleResolve = async (threadId: string) => {
    try {
      await api.post(`/threads/${threadId}/resolve`)
      setThreads(threads.filter((t) => t.id !== threadId))
    } catch (error) {
      console.error('Failed to resolve thread:', error)
    }
  }

  const openThreads = threads.filter((t) => t.status === 'open')
  const count = openThreads.length

  // Loading skeleton
  if (loading) {
    return (
      <Card variant="glass" padding="md">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div style={{ height: 20, width: 140, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
          <div style={{ height: 20, width: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
        </div>
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--mm-bg-primary)',
              borderRadius: 8,
              padding: 14,
              marginBottom: 6,
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ height: 14, width: '70%', background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 10, width: '40%', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }} />
          </div>
        ))}
      </Card>
    )
  }

  // Empty state (keep the 🎉, style it properly)
  if (count === 0) {
    return (
      <Card variant="glass" padding="md">
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <h3
            style={{
              fontSize: 'var(--mm-fs-card-title)',
              fontWeight: 800,
              color: 'var(--mm-text-primary)',
              margin: '0 0 6px',
            }}
          >
            No unresolved threads!
          </h3>
          <p style={{ fontSize: 13, color: 'var(--mm-text-secondary)', margin: 0 }}>
            Your team is on top of everything.
          </p>
        </div>
      </Card>
    )
  }

  // Active threads
  const severityColors: Record<string, { border: string; bg: string }> = {
    high: { border: 'rgba(255,77,106,0.35)', bg: 'rgba(255,77,106,0.06)' },
    medium: { border: 'rgba(255,181,71,0.35)', bg: 'rgba(255,181,71,0.06)' },
    low: { border: 'rgba(0,200,150,0.35)', bg: 'rgba(0,200,150,0.06)' },
  }

  return (
    <Card variant="glass" padding="md">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            fontSize: 'var(--mm-fs-section)',
            fontWeight: 700,
            color: 'var(--mm-text-primary)',
            margin: 0,
          }}
        >
          Unresolved Threads
        </h3>
        <span
          style={{
            background: 'rgba(255,181,71,0.15)',
            color: 'var(--mm-warning)',
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {openThreads.map((thread) => {
          const colors = severityColors[thread.severity] || severityColors.low
          return (
            <div
              key={thread.id}
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--mm-text-primary)',
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {thread.title}
                </h4>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--mm-text-muted)',
                    marginLeft: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Mentioned {thread.mention_count}×
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleResolve(thread.id)}
                  style={{
                    background: 'rgba(0,200,150,0.12)',
                    border: '1px solid rgba(0,200,150,0.25)',
                    borderRadius: 6,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--mm-success)',
                    cursor: 'pointer',
                  }}
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}