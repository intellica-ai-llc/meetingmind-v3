#!/bin/bash
set -euo pipefail

# BATCH 7: DASHBOARD FEATURES
# Creates: features/auth/, features/dashboard/

mkdir -p frontend/src/features/auth frontend/src/features/dashboard

cat > frontend/src/features/auth/Login.tsx << 'EOF'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-meetingmind-bg flex items-center justify-center p-4">
      <div className="bg-meetingmind-card rounded-xl p-8 w-full max-w-md border border-meetingmind-gold/30">
        <div className="text-center mb-8"><h1 className="text-3xl font-bold text-white mb-2">MeetingMind</h1><p className="text-gray-400">Sign in to your account</p></div>
        {error && <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4"><p className="text-red-500 text-sm">{error}</p></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-meetingmind-bg border border-gray-700 rounded-lg text-white focus:outline-none focus:border-meetingmind-gold" required /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-meetingmind-bg border border-gray-700 rounded-lg text-white focus:outline-none focus:border-meetingmind-gold" required /></div>
          <button type="submit" disabled={loading} className="w-full py-2 bg-meetingmind-gold text-black font-semibold rounded-lg hover:bg-yellow-600 transition disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p className="text-center text-gray-400 mt-4">Don't have an account? <Link to="/register" className="text-meetingmind-gold hover:underline">Sign up</Link></p>
      </div>
    </div>
  )
}
EOF

cat > frontend/src/features/auth/Register.tsx << 'EOF'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, name)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-meetingmind-bg flex items-center justify-center p-4">
      <div className="bg-meetingmind-card rounded-xl p-8 w-full max-w-md border border-meetingmind-gold/30">
        <div className="text-center mb-8"><h1 className="text-3xl font-bold text-white mb-2">MeetingMind</h1><p className="text-gray-400">Create your free account</p><p className="text-xs text-gray-500 mt-1">No credit card required. Ever.</p></div>
        {error && <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4"><p className="text-red-500 text-sm">{error}</p></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-meetingmind-bg border border-gray-700 rounded-lg text-white focus:outline-none focus:border-meetingmind-gold" required /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-meetingmind-bg border border-gray-700 rounded-lg text-white focus:outline-none focus:border-meetingmind-gold" required /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-meetingmind-bg border border-gray-700 rounded-lg text-white focus:outline-none focus:border-meetingmind-gold" required /></div>
          <button type="submit" disabled={loading} className="w-full py-2 bg-meetingmind-gold text-black font-semibold rounded-lg hover:bg-yellow-600 transition disabled:opacity-50">{loading ? 'Creating account...' : 'Sign Up Free'}</button>
        </form>
        <p className="text-center text-gray-400 mt-4">Already have an account? <Link to="/login" className="text-meetingmind-gold hover:underline">Sign in</Link></p>
      </div>
    </div>
  )
}
EOF

cat > frontend/src/features/auth/ProtectedRoute.tsx << 'EOF'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-meetingmind-bg flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-meetingmind-gold"></div></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
EOF

cat > frontend/src/features/dashboard/Dashboard.tsx << 'EOF'
import { useAuth } from '@/contexts/AuthContext'
import { TaskDashboard } from './TaskDashboard'
import { PatternDashboard } from './PatternDashboard'
import { UnresolvedThreads } from './UnresolvedThreads'
import { MeetingHistory } from './MeetingHistory'
import { UsageStats } from './UsageStats'

export function Dashboard() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-meetingmind-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8"><div><h1 className="text-2xl font-bold text-white">Dashboard</h1><p className="text-gray-400">Welcome back, {user?.email}</p></div><button onClick={() => window.location.href = '/app'} className="px-4 py-2 bg-meetingmind-gold text-black rounded-lg hover:bg-yellow-600 transition">New Meeting</button></div>
        <UsageStats />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6"><TaskDashboard /><MeetingHistory /></div>
          <div className="space-y-6"><PatternDashboard /><UnresolvedThreads /></div>
        </div>
      </div>
    </div>
  )
}
EOF

cat > frontend/src/features/dashboard/TaskDashboard.tsx << 'EOF'
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
EOF

cat > frontend/src/features/dashboard/TaskCard.tsx << 'EOF'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'

interface Task { id: string; title: string; description?: string; owner_name: string; due_date: string; priority: string; status: string; meeting_title?: string; meeting_id?: string }
interface TaskCardProps { task: Task; onComplete: (taskId: string) => void }

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(task.status === 'completed')
  const [showDetail, setShowDetail] = useState(false)
  const handleComplete = () => { setIsCompleted(true); onComplete(task.id) }
  const priorityColors = { high: 'text-red-500', medium: 'text-yellow-500', low: 'text-green-500' }
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  return (
    <div className={`bg-meetingmind-bg rounded-lg border p-4 transition-all ${isCompleted ? 'border-green-500/30 opacity-60' : isOverdue ? 'border-red-500/30' : 'border-gray-700'}`}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={isCompleted} onChange={handleComplete} className="mt-1 w-4 h-4 rounded border-gray-600 text-meetingmind-gold focus:ring-meetingmind-gold" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap"><h3 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</h3><span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority as keyof typeof priorityColors]} bg-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'green'}-500/10`}>{task.priority.toUpperCase()}</span>{isOverdue && !isCompleted && <span className="text-xs text-red-500">Overdue</span>}</div>
          <div className="text-sm text-gray-400 mt-1"><span>Owner: {task.owner_name}</span>{task.due_date && <span className="ml-3">Due: {formatDate(task.due_date)}</span>}{task.meeting_title && <button onClick={() => window.location.href = `/meeting/${task.meeting_id}`} className="ml-3 text-meetingmind-gold hover:underline">From: {task.meeting_title}</button>}</div>
          {task.description && showDetail && <p className="text-gray-500 text-sm mt-2">{task.description}</p>}
        </div>
        {task.description && <button onClick={() => setShowDetail(!showDetail)} className="text-gray-500 hover:text-gray-300 text-sm">{showDetail ? '▼' : '▶'}</button>}
      </div>
    </div>
  )
}
EOF

cat > frontend/src/features/dashboard/PatternDashboard.tsx << 'EOF'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Pattern { id: string; pattern_type: string; baseline_value: number; current_trend: number; confidence_score: number; sample_size: number }

export function PatternDashboard() {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { const fetchPatterns = async () => { try { const response = await api.get('/patterns'); setPatterns(response.data.patterns) } catch (error) { console.error('Failed to fetch patterns:', error) } finally { setLoading(false) } }; fetchPatterns() }, [])

  if (loading) return <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6"><div className="animate-pulse space-y-4"><div className="h-6 bg-gray-700 rounded w-1/2"></div><div className="space-y-2"><div className="h-4 bg-gray-700 rounded"></div><div className="h-4 bg-gray-700 rounded w-3/4"></div></div></div></div>

  const effectivenessPattern = patterns.find(p => p.pattern_type === 'effectiveness')
  const completionPattern = patterns.find(p => p.pattern_type === 'completion_rate')

  return (
    <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Your Patterns</h2>
      {effectivenessPattern && effectivenessPattern.sample_size >= 10 ? (
        <div className="space-y-4">
          <div className="bg-meetingmind-bg rounded-lg p-4"><div className="flex justify-between items-center mb-2"><span className="text-gray-400">Effectiveness Trend</span><span className={`text-sm ${effectivenessPattern.current_trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>{effectivenessPattern.current_trend >= 0 ? '↑' : '↓'} {Math.abs(effectivenessPattern.current_trend).toFixed(1)}</span></div><div className="text-2xl font-bold text-white mb-1">{effectivenessPattern.baseline_value.toFixed(1)}/10</div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-meetingmind-gold h-2 rounded-full" style={{ width: `${effectivenessPattern.baseline_value * 10}%` }} /></div><p className="text-gray-500 text-xs mt-2">Based on {effectivenessPattern.sample_size} meetings</p></div>
          {completionPattern && (<div className="bg-meetingmind-bg rounded-lg p-4"><div className="flex justify-between items-center mb-2"><span className="text-gray-400">Task Completion Rate</span><span className={`text-sm ${completionPattern.current_trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>{completionPattern.current_trend >= 0 ? '↑' : '↓'} {Math.abs(completionPattern.current_trend).toFixed(1)}%</span></div><div className="text-2xl font-bold text-white mb-1">{completionPattern.baseline_value.toFixed(0)}%</div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${completionPattern.baseline_value}%` }} /></div></div>)}
        </div>
      ) : (
        <div className="text-center py-8"><p className="text-gray-400 mb-2">Not enough data yet</p><p className="text-sm text-gray-500">Record {10 - (effectivenessPattern?.sample_size || 0)} more meetings to see your patterns</p><div className="w-full bg-gray-700 rounded-full h-2 mt-4"><div className="bg-meetingmind-gold h-2 rounded-full transition-all" style={{ width: `${((effectivenessPattern?.sample_size || 0) / 10) * 100}%` }} /></div></div>
      )}
    </div>
  )
}
EOF

cat > frontend/src/features/dashboard/UnresolvedThreads.tsx << 'EOF'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Thread { id: string; title: string; mention_count: number; severity: string; assigned_to_user_id?: string; status: string; last_mentioned_meeting_id: string }

export function UnresolvedThreads() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { const fetchThreads = async () => { try { const response = await api.get('/threads'); setThreads(response.data.threads) } catch (error) { console.error('Failed to fetch threads:', error) } finally { setLoading(false) } }; fetchThreads() }, [])

  const handleResolve = async (threadId: string) => { try { await api.post(`/threads/${threadId}/resolve`); setThreads(threads.filter(t => t.id !== threadId)) } catch (error) { console.error('Failed to resolve thread:', error) } }

  if (loading) return <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6"><div className="animate-pulse space-y-4"><div className="h-6 bg-gray-700 rounded w-1/2"></div><div className="h-16 bg-gray-700 rounded"></div></div></div>

  const openThreads = threads.filter(t => t.status === 'open')
  if (openThreads.length === 0) return <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6"><h2 className="text-xl font-semibold text-white mb-4">Unresolved Threads</h2><p className="text-gray-400 text-center py-4">🎉 No unresolved threads! Your team is on top of everything.</p></div>

  const severityColors = { high: 'border-red-500/30 bg-red-500/5', medium: 'border-yellow-500/30 bg-yellow-500/5', low: 'border-green-500/30 bg-green-500/5' }

  return (
    <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Unresolved Threads</h2>
      <div className="space-y-3">{openThreads.map(thread => (<div key={thread.id} className={`rounded-lg border p-4 ${severityColors[thread.severity as keyof typeof severityColors]}`}><div className="flex justify-between items-start mb-2"><h3 className="font-semibold text-white">{thread.title}</h3><span className="text-xs text-gray-500">Mentioned {thread.mention_count} times</span></div><button onClick={() => handleResolve(thread.id)} className="px-3 py-1 text-xs bg-green-600 rounded hover:bg-green-500 transition">Mark Resolved</button></div>))}</div>
    </div>
  )
}
EOF

cat > frontend/src/features/dashboard/MeetingHistory.tsx << 'EOF'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatDate, formatDuration } from '@/lib/utils'

interface Meeting { id: string; title: string; meeting_date: string; duration_minutes: number; effectiveness_score: number; decisions_count?: number; action_items_count?: number; risk_flags_count?: number }

export function MeetingHistory() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { const fetchMeetings = async () => { try { const response = await api.get('/meetings', { params: { limit: 5 } }); setMeetings(response.data.meetings) } catch (error) { console.error('Failed to fetch meetings:', error) } finally { setLoading(false) } }; fetchMeetings() }, [])

  if (loading) return <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6"><div className="animate-pulse space-y-4"><div className="h-6 bg-gray-700 rounded w-1/4"></div><div className="space-y-3"><div className="h-20 bg-gray-700 rounded"></div><div className="h-20 bg-gray-700 rounded"></div></div></div></div>
  if (meetings.length === 0) return <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6"><h2 className="text-xl font-semibold text-white mb-4">Recent Meetings</h2><p className="text-gray-400 text-center py-8">No meetings yet. Record your first meeting to get started.</p></div>

  return (
    <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6">
      <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-white">Recent Meetings</h2><button onClick={() => window.location.href = '/meetings'} className="text-meetingmind-gold text-sm hover:underline">View All →</button></div>
      <div className="space-y-3">{meetings.map(meeting => (<div key={meeting.id} onClick={() => window.location.href = `/meeting/${meeting.id}`} className="bg-meetingmind-bg rounded-lg border border-gray-700 p-4 cursor-pointer hover:border-meetingmind-gold/30 transition"><div className="flex justify-between items-start mb-2"><div><h3 className="font-semibold text-white">{meeting.title || 'Untitled Meeting'}</h3><p className="text-xs text-gray-500">{formatDate(meeting.meeting_date)} · {formatDuration(meeting.duration_minutes)}</p></div><div className="text-right"><span className="text-sm text-meetingmind-gold font-semibold">{meeting.effectiveness_score || 0}/10</span></div></div><div className="flex gap-3 text-xs text-gray-500"><span>📋 {meeting.decisions_count || 0} decisions</span><span>✅ {meeting.action_items_count || 0} actions</span><span>⚠️ {meeting.risk_flags_count || 0} risks</span></div></div>))}</div>
    </div>
  )
}
EOF

cat > frontend/src/features/dashboard/UsageStats.tsx << 'EOF'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface UsageStats { meetings_this_month: number; minutes_this_month: number; completion_rate: number; effectiveness_avg: number }

export function UsageStats() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { const fetchStats = async () => { try { const response = await api.get('/usage'); setStats(response.data) } catch (error) { console.error('Failed to fetch usage stats:', error) } finally { setLoading(false) } }; fetchStats() }, [])

  if (loading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_, i) => (<div key={i} className="bg-meetingmind-card rounded-xl border border-gray-800 p-4"><div className="animate-pulse"><div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div><div className="h-8 bg-gray-700 rounded w-3/4"></div></div></div>))}</div>
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-4"><p className="text-gray-400 text-sm">Meetings This Month</p><p className="text-2xl font-bold text-white">{stats.meetings_this_month}</p></div>
      <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-4"><p className="text-gray-400 text-sm">Minutes Analyzed</p><p className="text-2xl font-bold text-white">{stats.minutes_this_month}</p></div>
      <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-4"><p className="text-gray-400 text-sm">Completion Rate</p><p className="text-2xl font-bold text-green-500">{stats.completion_rate}%</p></div>
      <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-4"><p className="text-gray-400 text-sm">Avg Effectiveness</p><p className="text-2xl font-bold text-meetingmind-gold">{stats.effectiveness_avg}/10</p></div>
    </div>
  )
}
EOF

echo "✅ Batch 7 complete (10 files: auth + dashboard features)"