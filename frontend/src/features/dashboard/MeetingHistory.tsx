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
