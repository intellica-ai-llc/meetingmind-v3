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
