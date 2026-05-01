import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { PriorityBadge } from '@/components/ui/PriorityBadge'

export function TopActionItemsPanel() {
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    api.get('/tasks?status=pending&limit=5')
      .then(res => setTasks(res.data.tasks || []))
      .catch(() => {})
  }, [])

  return (
    <Card variant="glass" padding="md">
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>
        Top Action Items
      </h3>
      {tasks.length === 0 ? (
        <p style={{ color: 'var(--mm-text-muted)' }}>No open tasks.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {tasks.map(task => (
            <li key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'var(--mm-text-muted)' }}>☐</span>
              <span style={{ flex: 1, color: 'var(--mm-text-primary)', fontSize: 14 }}>{task.title}</span>
              <PriorityBadge priority={task.priority} />
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <a href="/tasks" style={{ color: 'var(--mm-cyan)', fontSize: 13 }}>View all tasks →</a>
      </div>
    </Card>
  )
}