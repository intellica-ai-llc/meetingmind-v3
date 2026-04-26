import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { TaskCard } from './TaskCard'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

interface Task {
  id: string
  title: string
  description?: string
  owner_name: string
  due_date: string
  priority: string
  status: string
  meeting_title?: string
  meeting_id?: string
}

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending')

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks')
      setTasks(response.data.tasks)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (taskId: string) => {
    try {
      await api.put(`/tasks/${taskId}/complete`)
      fetchTasks()
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status !== 'completed'
    return task.status === 'completed'
  })

  const overdueTasks = filteredTasks.filter((task) => {
    if (filter === 'completed') return false
    if (!task.due_date) return false
    return new Date(task.due_date) < new Date()
  })

  const dueSoonTasks = filteredTasks.filter((task) => {
    if (filter === 'completed') return false
    if (!task.due_date) return false
    const diffDays = Math.ceil(
      (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    return diffDays >= 0 && diffDays <= 7
  })

  const otherTasks = filteredTasks.filter((task) => {
    if (filter === 'completed') return false
    if (!task.due_date) return true
    const diffDays = Math.ceil(
      (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    return diffDays > 7
  })

  // Loading skeleton
  if (loading) {
    return (
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ height: 20, width: 100, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ height: 28, width: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
            <div style={{ height: 28, width: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--mm-bg-primary)',
              borderRadius: 8,
              padding: 16,
              marginBottom: 8,
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ height: 16, width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 12, width: '40%', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }} />
          </div>
        ))}
      </Card>
    )
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <Card variant="glass" padding="lg">
        <EmptyState
          icon="📋"
          headline="No tasks yet"
          subtext="Tasks from your meetings will appear here. Record your first meeting to generate action items."
          cta={
            <button
              onClick={() => (window.location.href = '/app')}
              style={{
                background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                border: 'none',
                borderRadius: 'var(--mm-radius-button)',
                padding: '10px 20px',
                color: '#0A0B1A',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Start Recording
            </button>
          }
        />
      </Card>
    )
  }

  return (
    <Card variant="glass" padding="md">
      {/* Header + Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 'var(--mm-fs-section)', fontWeight: 700, color: 'var(--mm-text-primary)', margin: 0 }}>
          My Tasks
        </h3>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 2 }}>
          <button
            onClick={() => setFilter('pending')}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'pending' ? 'rgba(0,212,255,0.15)' : 'transparent',
              color: filter === 'pending' ? 'var(--mm-cyan)' : 'var(--mm-text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'completed' ? 'rgba(0,212,255,0.15)' : 'transparent',
              color: filter === 'completed' ? 'var(--mm-cyan)' : 'var(--mm-text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--mm-text-secondary)', padding: '24px 0', fontSize: 14 }}>
          {filter === 'completed' ? 'No completed tasks yet.' : 'All tasks are done! 🎉'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {overdueTasks.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mm-danger)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.06 }}>
                Overdue ({overdueTasks.length})
              </div>
              {overdueTasks.map((task) => (
                <TaskCard key={task.id} task={task} onComplete={handleComplete} />
              ))}
            </div>
          )}

          {dueSoonTasks.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mm-warning)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.06 }}>
                Due This Week ({dueSoonTasks.length})
              </div>
              {dueSoonTasks.map((task) => (
                <TaskCard key={task.id} task={task} onComplete={handleComplete} />
              ))}
            </div>
          )}

          {otherTasks.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mm-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.06 }}>
                Later ({otherTasks.length})
              </div>
              {otherTasks.map((task) => (
                <TaskCard key={task.id} task={task} onComplete={handleComplete} />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}