import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'

export function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/meetings?limit=100')
      .then(res => setMeetings(res.data.meetings || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = meetings.filter(m =>
    (m.title || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-display text-white">Meetings</h1>
      <input
        type="text"
        placeholder="Search meetings..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md glass bg-white/5 p-3 rounded-xl text-white placeholder-white/40 border border-white/10 focus:border-cyan/40 outline-none"
      />
      {loading ? (
        <p className="text-white/60">Loading meetings...</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/40">No meetings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(meeting => (
            <Link key={meeting.id} to={`/meetings/${meeting.id}`}>
              <Card variant="glass" className="p-4 hover:shadow-glow-cyan transition cursor-pointer">
                <h2 className="font-semibold text-lg text-white truncate">
                  {meeting.title || 'Untitled'}
                </h2>
                <p className="text-sm text-slate-400">
                  {meeting.meeting_date
                    ? new Date(meeting.meeting_date).toLocaleDateString()
                    : 'No date'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {meeting.effectiveness_score != null && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan/20 text-cyan">
                      {meeting.effectiveness_score}% eff.
                    </span>
                  )}
                  {meeting.discarded && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                      Discarded
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}