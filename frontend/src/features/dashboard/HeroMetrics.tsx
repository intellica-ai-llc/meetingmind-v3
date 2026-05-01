import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

interface DashboardStats {
  totalMeetings: number
  avgScore: number | null
  openTasks: number
  unresolvedThreads: number
}

function useCountUp(target: number | null, duration: number = 600) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === null || target === 0) {
      setValue(0)
      return
    }
    let start = 0
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return value
}

export function HeroMetrics() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const totalMeetings = useCountUp(stats?.totalMeetings ?? null)
  const openTasks = useCountUp(stats?.openTasks ?? null)
  const unresolvedThreads = useCountUp(stats?.unresolvedThreads ?? null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats')
        setStats(res.data)
      } catch (err) {
        console.error('Failed to load dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: 'var(--mm-bg-secondary)',
            border: 'var(--mm-border-glass)',
            borderRadius: 'var(--mm-radius-card)',
            padding: 20, height: 100,
          }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', height: 16, width: '60%', borderRadius: 6, marginBottom: 12 }} />
            <div style={{ background: 'rgba(255,255,255,0.04)', height: 32, width: '40%', borderRadius: 6 }} />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const subtext = (label: string) => {
    if (label === 'Average Score') {
      return stats.totalMeetings < 3 ? '— · not enough data' : 'trending —'
    }
    if (label === 'Open Tasks') {
      return stats.openTasks > 0 ? `${stats.openTasks} open · view all →` : 'all clear'
    }
    if (label === 'Unresolved Threads') {
      return stats.unresolvedThreads > 0 ? `${stats.unresolvedThreads} active · view all →` : 'all clear'
    }
    return `${stats.totalMeetings} recorded · view all →`
  }

  const cards = [
    {
      label: 'Total Meetings',
      value: totalMeetings,
      icon: '📅',
      onClick: () => navigate('/meetings'),
    },
    {
      label: 'Average Score',
      value: stats.avgScore,
      format: (v: number | null) => v !== null ? `${v}/10` : '—',
      icon: '📊',
      onClick: stats.totalMeetings >= 3 ? () => navigate('/coaching') : undefined,
    },
    {
      label: 'Open Tasks',
      value: openTasks,
      icon: '✅',
      onClick: () => navigate('/tasks'),
    },
    {
      label: 'Unresolved Threads',
      value: unresolvedThreads,
      icon: '🔗',
      onClick: () => navigate('/initiatives'),
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
      {cards.map((card) => (
        <div
          key={card.label}
          onClick={card.onClick}
          className="card-hover"
          style={{
            background: 'var(--mm-bg-secondary)',
            border: 'var(--mm-border-glass)',
            borderRadius: 'var(--mm-radius-card)',
            padding: 20,
            cursor: card.onClick ? 'pointer' : 'default',
            transition: 'border var(--mm-duration-fast) var(--mm-ease-out), transform var(--mm-duration-fast) var(--mm-ease-out)',
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--mm-text-primary)', lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
            {card.format ? card.format(card.value) : card.value}
          </div>
          <div style={{ fontSize: 14, color: 'var(--mm-text-secondary)', fontWeight: 500 }}>
            {card.label}
          </div>
          <div style={{ fontSize: 12, color: 'var(--mm-text-muted)', marginTop: 4 }}>
            {subtext(card.label)}
          </div>
        </div>
      ))}
    </div>
  )
}