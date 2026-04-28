import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

interface DashboardStats {
  totalMeetings: number
  avgScore: number | null
  openTasks: number
  unresolvedThreads: number
}

export function HeroMetrics() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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
            border: '1px solid rgba(255,255,255,0.08)',
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
      value: stats.totalMeetings,
      format: (v: number) => v.toString(),
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
      value: stats.openTasks,
      format: (v: number) => v.toString(),
      icon: '✅',
      onClick: () => navigate('/tasks'),
    },
    {
      label: 'Unresolved Threads',
      value: stats.unresolvedThreads,
      format: (v: number) => v.toString(),
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
          style={{
            background: 'var(--mm-bg-secondary)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--mm-radius-card)',
            padding: 20,
            cursor: card.onClick ? 'pointer' : 'default',
            transition: 'border 0.2s, transform 0.2s',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            if (card.onClick) e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'
          }}
          onMouseLeave={(e) => {
            if (card.onClick) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--mm-text-primary)', lineHeight: 1, marginBottom: 4 }}>
            {card.value !== null ? card.format(card.value) : '—'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--mm-text-secondary)', fontWeight: 500 }}>
            {card.label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--mm-text-muted)', marginTop: 4 }}>
            {subtext(card.label)}
          </div>
        </div>
      ))}
    </div>
  )
}