import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/PriorityBadge'

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

interface TaskCardProps {
  task: Task
  onComplete: (taskId: string) => void
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(task.status === 'completed')
  const [showDetail, setShowDetail] = useState(false)

  const handleComplete = () => {
    setIsCompleted(true)
    onComplete(task.id)
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 14px',
        background: 'var(--mm-bg-primary)',
        border: `1px solid ${
          isCompleted
            ? 'rgba(0,200,150,0.3)'
            : isOverdue
            ? 'rgba(255,77,106,0.3)'
            : 'rgba(255,255,255,0.05)'
        }`,
        borderRadius: 8,
        opacity: isCompleted ? 0.6 : 1,
        transition: 'opacity 0.3s, border-color 0.2s',
        marginBottom: 4,
      }}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleComplete}
        style={{
          width: 18,
          height: 18,
          accentColor: 'var(--mm-cyan)',
          cursor: 'pointer',
          marginTop: 2,
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <h4
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isCompleted ? 'var(--mm-text-muted)' : 'var(--mm-text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              margin: 0,
            }}
          >
            {task.title}
          </h4>
          <PriorityBadge priority={task.priority} />
          {isOverdue && !isCompleted && (
            <span style={{ fontSize: 11, color: 'var(--mm-danger)', fontWeight: 600 }}>Overdue</span>
          )}
        </div>

        <div style={{ fontSize: 12, color: 'var(--mm-text-secondary)', marginBottom: 2 }}>
          <span>Owner: {task.owner_name || '—'}</span>
          {task.due_date && <span style={{ marginLeft: 12 }}>Due: {formatDate(task.due_date)}</span>}
          {task.meeting_title && (
            <button
              onClick={() => (window.location.href = `/meeting/${task.meeting_id}`)}
              style={{
                marginLeft: 12,
                background: 'none',
                border: 'none',
                color: 'var(--mm-cyan)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              From: {task.meeting_title}
            </button>
          )}
        </div>

        {task.description && showDetail && (
          <p style={{ fontSize: 12, color: 'var(--mm-text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
            {task.description}
          </p>
        )}
      </div>

      {/* Expand/collapse detail */}
      {task.description && (
        <button
          onClick={() => setShowDetail(!showDetail)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--mm-text-muted)',
            fontSize: 14,
            cursor: 'pointer',
            padding: 0,
            marginTop: 2,
          }}
        >
          {showDetail ? '▼' : '▶'}
        </button>
      )}
    </div>
  )
}