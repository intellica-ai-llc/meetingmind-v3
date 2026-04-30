import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { TaskCard } from '@/features/dashboard/TaskCard'

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

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', owner_name: '', due_date: '', priority: 'Medium' })
  const navigate = useNavigate()

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks')
      setTasks(res.data.tasks || [])
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const handleCreate = async () => {
    if (!newTask.title.trim()) return
    try {
      await api.post('/tasks', newTask)
      setNewTask({ title: '', description: '', owner_name: '', due_date: '', priority: 'Medium' })
      setShowCreate(false)
      fetchTasks()
    } catch (err) {
      console.error('Create task failed:', err)
    }
  }

  const filtered = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))

  const columns = [
    { status: 'pending', label: 'To Do', tasks: filtered.filter(t => t.status === 'pending') },
    { status: 'in_progress', label: 'In Progress', tasks: filtered.filter(t => t.status === 'in_progress') },
    { status: 'completed', label: 'Done', tasks: filtered.filter(t => t.status === 'completed') },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--mm-fs-title)', fontWeight: 800, color: 'var(--mm-text-primary)', margin: 0 }}>Tasks</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          + New Task
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'var(--mm-bg-secondary)',
          color: 'var(--mm-text-primary)',
          fontSize: 14,
          marginBottom: 16,
        }}
      />

      {/* Create form (inline) */}
      {showCreate && (
        <div style={{ marginBottom: 16 }}>
          <Card variant="glass" padding="md">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <input placeholder="Title *" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} style={inputStyle} />
              <input placeholder="Owner" value={newTask.owner_name} onChange={e => setNewTask({ ...newTask, owner_name: e.target.value })} style={inputStyle} />
              <input type="date" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} style={inputStyle} />
              <input placeholder="Description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} style={{ ...inputStyle, gridColumn: 'span 2' }} />
              <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} style={inputStyle}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button onClick={handleCreate} style={primaryBtnStyle}>Create Task</button>
              <button onClick={() => setShowCreate(false)} style={secondaryBtnStyle}>Cancel</button>
            </div>
          </Card>
        </div>
      )}

      {/* Board columns */}
      {loading ? (
        <p style={{ color: 'var(--mm-text-secondary)' }}>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <Card variant="glass" padding="lg">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h2 style={{ color: 'var(--mm-text-primary)', marginBottom: 8 }}>
              No tasks yet — your first meeting can generate tasks automatically
            </h2>
            <p style={{ color: 'var(--mm-text-secondary)', marginBottom: 24 }}>
              MeetingMind extracts owners, deadlines, and action items from conversations.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/app')}
                style={primaryBtnStyle}
              >
                Start Live Meeting
              </button>
              <button
                onClick={() => navigate('/app')}
                style={secondaryBtnStyle}
              >
                Upload Recording
              </button>
              <button
                onClick={() => setShowCreate(true)}
                style={{ ...secondaryBtnStyle, borderColor: 'rgba(255,255,255,0.25)' }}
              >
                Create Manual Task
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 16 }}>
          {columns.map(col => (
            <Card key={col.status} variant="glass" padding="md">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--mm-text-primary)', marginBottom: 12 }}>
                {col.label} ({col.tasks.length})
              </h3>
              {col.tasks.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--mm-text-muted)', textAlign: 'center', padding: '20px 0' }}>No tasks</p>
              ) : (
                col.tasks.map(task => (
                  <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
                ))
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--mm-bg-primary)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6,
  padding: '8px 10px',
  color: 'var(--mm-text-primary)',
  fontSize: 13,
}

const primaryBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
  border: 'none',
  borderRadius: 6,
  padding: '10px 20px',
  color: '#fff',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 6,
  padding: '10px 20px',
  color: 'var(--mm-text-secondary)',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
}