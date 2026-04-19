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
