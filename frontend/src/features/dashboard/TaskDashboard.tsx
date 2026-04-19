import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { TaskCard } from './TaskCard'

interface Task { id: string; title: string; description?: string; owner_name: string; due_date: string; priority: string; status: string; meeting_title?: string; meeting_id?: string }

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending')

  const fetchTasks = async () => { try { const response = await api.get('/tasks'); setTasks(response.data.tasks) } catch (error) { console.error('Failed to fetch tasks:', error) } finally { setLoading(false) } }
  const handleComplete = async (taskId: string) => { try { await api.put(`/tasks/${taskId}/complete`); fetchTasks() } catch (error) { console.error('Failed to complete task:', error) } }

  useEffect(() => { fetchTasks() }, [])

  const filteredTasks = tasks.filter(task => { if (filter === 'pending') return task.status !== 'completed'; if (filter === 'completed') return task.status === 'completed'; return true })
  const overdueTasks = filteredTasks.filter(task => { if (task.status === 'completed') return false; if (!task.due_date) return false; return new Date(task.due_date) < new Date() })
  const dueSoonTasks = filteredTasks.filter(task => { if (task.status === 'completed') return false; if (!task.due_date) return false; const diffDays = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)); return diffDays >= 0 && diffDays <= 7 })
  const otherTasks = filteredTasks.filter(task => { if (task.status === 'completed') return false; if (!task.due_date) return true; const diffDays = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)); return diffDays > 7 })

  if (loading) return <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6"><div className="animate-pulse space-y-4"><div className="h-6 bg-gray-700 rounded w-1/4"></div><div className="space-y-3"><div className="h-16 bg-gray-700 rounded"></div><div className="h-16 bg-gray-700 rounded"></div></div></div></div>

  return (
    <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6">
      <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-semibold text-white">My Tasks</h2><div className="flex gap-2"><button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded-lg text-sm transition ${filter === 'pending' ? 'bg-meetingmind-gold text-black' : 'bg-gray-800 text-gray-400'}`}>Pending</button><button onClick={() => setFilter('completed')} className={`px-3 py-1 rounded-lg text-sm transition ${filter === 'completed' ? 'bg-meetingmind-gold text-black' : 'bg-gray-800 text-gray-400'}`}>Completed</button></div></div>
      {filteredTasks.length === 0 ? <p className="text-gray-400 text-center py-8">No tasks. Record a meeting to generate action items.</p> : <div className="space-y-4">
        {overdueTasks.length > 0 && <div><h3 className="text-red-500 font-semibold mb-2">🔴 Overdue ({overdueTasks.length})</h3>{overdueTasks.map(task => <TaskCard key={task.id} task={task} onComplete={handleComplete} />)}</div>}
        {dueSoonTasks.length > 0 && <div><h3 className="text-yellow-500 font-semibold mb-2">🟡 Due This Week ({dueSoonTasks.length})</h3>{dueSoonTasks.map(task => <TaskCard key={task.id} task={task} onComplete={handleComplete} />)}</div>}
        {otherTasks.length > 0 && <div><h3 className="text-gray-400 font-semibold mb-2">⚪ Later ({otherTasks.length})</h3>{otherTasks.map(task => <TaskCard key={task.id} task={task} onComplete={handleComplete} />)}</div>}
      </div>}
    </div>
  )
}
