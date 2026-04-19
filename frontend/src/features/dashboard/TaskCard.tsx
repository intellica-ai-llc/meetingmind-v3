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
