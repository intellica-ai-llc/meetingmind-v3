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
