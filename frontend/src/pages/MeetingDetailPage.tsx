import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { EditableField } from '@/components/ui/EditableField'
import { Card } from '@/components/ui/Card'
import { api } from '@/lib/api'

export function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [meeting, setMeeting] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/meetings/${id}`)
      .then(res => setMeeting(res.data.meeting))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdate = (field: string, value: any) => {
    if (!meeting) return
    api.put(`/meetings/${meeting.id}`, { [field]: value })
      .then(() => setMeeting({ ...meeting, [field]: value }))
      .catch(console.error)
  }

  const handleDiscard = () => handleUpdate('discarded', true)
  const handleKeep = () => handleUpdate('discarded', false)

  if (loading) return <div className="text-white p-8">Loading meeting...</div>
  if (!meeting) return <div className="text-white p-8">Meeting not found.</div>

  const coreFields = ['title', 'meeting_date', 'duration_minutes', 'meeting_type', 'summary']
  const analysisFields = [
    'effectiveness_score', 'effectiveness_reason',
    'sentiment', 'sentiment_reason',
    'key_topics', 'key_quotes',
    'decisions', 'action_items', 'open_questions',
    'parking_lot', 'risk_flags', 'next_agenda',
  ]

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display text-white">Meeting Detail</h1>
        <div className="flex gap-3">
          {meeting.discarded ? (
            <button
              onClick={handleKeep}
              className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30 transition"
            >
              Keep Meeting
            </button>
          ) : (
            <button
              onClick={handleDiscard}
              className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30 transition"
            >
              Discard Meeting
            </button>
          )}
        </div>
      </div>

      {/* Core Info */}
      <Card variant="glass" padding="lg">
        <h2 className="text-xl font-display text-cyan mb-4">Core Info</h2>
        <div className="grid grid-cols-2 gap-4">
          {coreFields.map(field => (
            <div key={field} className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-slate-400">
                {field.replace(/_/g, ' ')}
              </label>
              <EditableField
                value={meeting[field]?.toString() || ''}
                onSave={(v) => handleUpdate(field, v)}
                placeholder={`Enter ${field.replace(/_/g, ' ')}`}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Analysis */}
      <Card variant="glass" padding="lg">
        <h2 className="text-xl font-display text-cyan mb-4">Analysis</h2>
        <div className="grid grid-cols-2 gap-4">
          {analysisFields.filter(f => meeting[f] !== undefined).map(field => (
            <div key={field} className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-slate-400">
                {field.replace(/_/g, ' ')}
              </label>
              {Array.isArray(meeting[field]) ? (
                <ul className="list-disc list-inside text-white text-sm">
                  {meeting[field].map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <EditableField
                  value={meeting[field]?.toString() || ''}
                  onSave={(v) => handleUpdate(field, v)}
                  placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}