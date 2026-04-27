import { useState } from 'react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { EditableField } from '@/components/ui/EditableField'

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
  initiative_id?: string
  initiative_name?: string
}

interface TaskCardProps {
  task: Task
  onUpdate: () => void   // callback to refresh parent list
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const [draftStatus, setDraftStatus] = useState(task.status)

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  const handleUpdate = async (field: string, value: any) => {
    try {
      await api.put(`/tasks/${task.id}`, { [field]: value })
      if (field === 'status') setDraftStatus(value)
      onUpdate()
    } catch (e) {
      console.error('Task update failed:', e)
    }
  }

  const handleComplete = async () => {
    try {
      await api.put(`/tasks/${task.id}/complete`)
      onUpdate()
    } catch (e) {
      console.error('Complete task failed:', e)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'rgba(255,255,255,0.08)',
    in_progress: 'rgba(0,212,255,0.12)',
    completed: 'rgba(0,230,118,0.12)',
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 14px',
        background: statusColors[draftStatus] || 'var(--mm-bg-primary)',
        border: `1px solid ${
          draftStatus === 'completed'
            ? 'rgba(0,200,150,0.3)'
            : isOverdue
            ? 'rgba(255,77,106,0.3)'
            : 'rgba(255,255,255,0.05)'
        }`,
        borderRadius: 8,
        opacity: draftStatus === 'completed' ? 0.6 : 1,
        transition: 'opacity 0.3s, border-color 0.2s',
        marginBottom: 4,
        cursor: 'grab',
      }}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={draftStatus === 'completed'}
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
          <EditableField
            value={task.title}
            onSave={(val) => handleUpdate('title', val)}
            className="font-semibold text-sm text-white"
          />
          <PriorityBadge priority={task.priority} />
          {isOverdue && draftStatus !== 'completed' && (
            <span style={{ fontSize: 11, color: 'var(--mm-danger)', fontWeight: 600 }}>Overdue</span>
          )}
        </div>

        <div style={{ fontSize: 12, color: 'var(--mm-text-secondary)', marginBottom: 2 }}>
          <span>Owner: <EditableField value={task.owner_name || '—'} onSave={(val) => handleUpdate('owner_name', val)} placeholder="name" /></span>
          {task.due_date && (
            <span style={{ marginLeft: 12 }}>
              Due: <EditableField value={formatDate(task.due_date)} onSave={(val) => handleUpdate('due_date', val)} placeholder="date" />
            </span>
          )}
          {task.meeting_title && (
            <button
              onClick={() => (window.location.href = `/meetings/${task.meeting_id}`)}
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
          {task.initiative_name && (
            <span style={{
              marginLeft: 12,
              fontSize: 11,
              background: 'rgba(124,58,237,0.2)',
              padding: '2px 8px',
              borderRadius: 10,
              color: '#c4b5fd'
            }}>
              {task.initiative_name}
            </span>
          )}
        </div>

        {task.description && showDetail && (
          <p style={{ fontSize: 12, color: 'var(--mm-text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
            <EditableField value={task.description} onSave={(val) => handleUpdate('description', val)} />
          </p>
        )}

        {/* Status quick change */}
        <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
          <select
            value={draftStatus}
            onChange={(e) => handleUpdate('status', e.target.value)}
            style={{
              background: 'var(--mm-bg-secondary)',
              color: 'var(--mm-text-primary)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 11,
            }}
          >
            <option value="pending">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Done</option>
          </select>
        </div>
      </div>

      {/* Expand detail */}
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