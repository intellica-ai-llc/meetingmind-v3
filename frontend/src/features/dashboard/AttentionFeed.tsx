import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { SentimentBadge } from '@/components/ui/SentimentBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'

interface Alert {
  type: 'risk' | 'thread' | 'task' | 'initiative'
  title: string
  meeting_title?: string
  meeting_id?: string
  thread_id?: string
  task_id?: string
  initiative_id?: string
  severity?: string
  health_status?: string
  due_date?: string
  created_at?: string
}

export function AttentionFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/intelligence/feed')
      .then(res => setAlerts(res.data.alerts || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getAlertIcon = (type: string) => {
    const icons: Record<string, string> = {
      risk: '⚠',
      thread: '🔗',
      task: '📋',
      initiative: '📊',
    }
    return icons[type] || '•'
  }

  const getAlertStyle = (alert: Alert): React.CSSProperties => {
    if (alert.type === 'risk') return { borderLeft: '3px solid #ff4d4d' }
    if (alert.type === 'initiative' && alert.health_status === 'critical') return { borderLeft: '3px solid #ff4d4d' }
    if (alert.health_status === 'at_risk') return { borderLeft: '3px solid #f59e0b' }
    if (alert.type === 'thread') return { borderLeft: '3px solid #7c3aed' }
    return { borderLeft: '3px solid #00d4ff' }
  }

  if (loading) return <Card variant="glass" padding="md"><p style={{ color: '#6b7fa3' }}>Loading feed…</p></Card>
  if (alerts.length === 0) return <Card variant="glass" padding="md"><p style={{ color: '#6b7fa3' }}>No alerts right now. Great job!</p></Card>

  return (
    <Card variant="glass" padding="md" className="mb-4">
      <h3 style={{ fontSize: 'var(--mm-fs-card-title)', color: 'var(--mm-text-primary)', marginBottom: 12 }}>Attention Feed</h3>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {alerts.slice(0, 8).map((alert, i) => (
          <li key={i} style={{ padding: '8px 12px', marginBottom: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 8, ...getAlertStyle(alert) }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{getAlertIcon(alert.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--mm-text-primary)', fontSize: 13 }}>{alert.title}</div>
                {alert.meeting_title && <div style={{ fontSize: 11, color: '#6b7fa3' }}>Meeting: {alert.meeting_title}</div>}
                {alert.type === 'task' && <div style={{ fontSize: 11, color: '#6b7fa3' }}>Due: {new Date(alert.due_date!).toLocaleDateString()}</div>}
                {alert.type === 'thread' && <PriorityBadge priority={alert.severity === 'high' ? 'High' : 'Medium'} />}
                {alert.health_status && <SentimentBadge sentiment={alert.health_status === 'critical' ? 'Tense' : 'Mixed'} />}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}