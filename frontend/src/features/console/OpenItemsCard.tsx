import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PriorityBadge } from '@/components/ui/PriorityBadge'

interface OpenTask {
  id: string
  title: string
  owner_name: string
  due_date: string
  priority: string
  status: string
}

interface UnresolvedThread {
  id: string
  title: string
  severity: string
  mention_count: number
  created_at: string
}

export function OpenItemsCard({ initiativeId }: { initiativeId: string | null }) {
  const [tasks, setTasks] = useState<OpenTask[]>([])
  const [threads, setThreads] = useState<UnresolvedThread[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!initiativeId) {
      setTasks([])
      setThreads([])
      return
    }
    setLoading(true)
    api.get(`/initiatives/${initiativeId}/open-items`)
      .then(res => {
        setTasks(res.data.openTasks || [])
        setThreads(res.data.unresolvedThreads || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [initiativeId])

  const handleLinkTask = async (taskId: string) => {
    try {
      await api.post(`/initiatives/${initiativeId}/members`, { task_id: taskId })
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      console.error('Failed to link task:', err)
    }
  }

  const handleMarkDone = async (taskId: string) => {
    try {
      await api.put(`/tasks/${taskId}/complete`)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      console.error('Failed to complete task:', err)
    }
  }

  if (!initiativeId) return null

  return (
    <Card variant="glass" padding="md">
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>
        Open from Last Time
      </h3>
      {loading ? (
        <p style={{ color: 'var(--mm-text-muted)', fontSize: 13 }}>Loading open items...</p>
      ) : tasks.length === 0 && threads.length === 0 ? (
        <p style={{ color: 'var(--mm-text-muted)', fontSize: 13 }}>Nothing unresolved from this initiative. Great job!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Open Tasks */}
          {tasks.map(task => (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'var(--mm-text-muted)' }}>☐</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--mm-text-primary)' }}>{task.title}</div>
                <div style={{ fontSize: 11, color: 'var(--mm-text-muted)' }}>
                  {task.owner_name} · Due {new Date(task.due_date).toLocaleDateString()}
                </div>
              </div>
              <PriorityBadge priority={task.priority} />
              <Button size="sm" variant="secondary" onClick={() => handleLinkTask(task.id)}>Link</Button>
              <Button size="sm" variant="secondary" onClick={() => handleMarkDone(task.id)}>Done</Button>
            </div>
          ))}

          {/* Unresolved Threads */}
          {threads.map(thread => (
            <div key={thread.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'var(--mm-purple)', fontSize: 14 }}>↺</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--mm-text-primary)' }}>{thread.title}</div>
                <div style={{ fontSize: 11, color: 'var(--mm-text-muted)' }}>
                  {thread.mention_count} · {thread.severity}
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => window.location.href = `/initiatives/${initiativeId}`}>Review</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}