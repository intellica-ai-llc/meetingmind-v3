import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { PlanGate } from '@/components/PlanGate'
import { Card } from '@/components/ui/Card'
import { TrendChart } from '@/components/ui/TrendChart'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { PriorityBadge } from '@/components/ui/PriorityBadge'

interface Initiative {
  id: string
  name: string
  description?: string
  health_status: string
  created_at: string
}

interface Meeting {
  id: string
  title: string
  meeting_date: string
  created_at: string
  effectiveness_score: number | null
  risk_flags: string[]
  decisions: string[]
  membership_id?: number
}

interface Task {
  id: string
  title: string
  priority: string
  status: string
  due_date: string
  owner_name: string
  membership_id?: number
}

interface Thread {
  id: string
  title: string
  severity: string
  status: string
  membership_id?: number
}

interface HealthSnapshot {
  snapshot_date: string
  avg_effectiveness: number | null
  open_tasks_count: number
  unresolved_threads_count: number
  risk_frequency: Record<string, number>
}

export function InitiativeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [initiative, setInitiative] = useState<Initiative | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [snapshots, setSnapshots] = useState<HealthSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [availableMeetings, setAvailableMeetings] = useState<any[]>([])

  const fetchData = async () => {
    if (!id) return
    try {
      const [res1, res2] = await Promise.all([
        api.get(`/initiatives/${id}`),
        api.get(`/initiatives/${id}/health`),
      ])
      setInitiative(res1.data.initiative)
      setMeetings(res1.data.linkedMeetings || [])
      setTasks(res1.data.linkedTasks || [])
      setThreads(res1.data.linkedThreads || [])
      setSnapshots(res2.data.snapshots || [])
    } catch (err) {
      console.error('Failed to load initiative:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleLinkMeeting = async (meetingId: string) => {
    try {
      await api.post(`/initiatives/${id}/members`, { meeting_id: meetingId })
      setShowLinkModal(false)
      fetchData()
    } catch (err) {
      console.error('Link meeting failed:', err)
    }
  }

  const handleUnlink = async (membershipId: number) => {
    if (!id) return
    try {
      await api.delete(`/initiatives/${id}/members/${membershipId}`)
      fetchData()
    } catch (err) {
      console.error('Unlink failed:', err)
    }
  }

  const openLinkModal = async () => {
    try {
      const res = await api.get('/meetings')
      const allMeetings = res.data.meetings || []
      const linkedIds = new Set(meetings.map(m => m.id))
      setAvailableMeetings(allMeetings.filter((m: any) => !linkedIds.has(m.id)))
      setShowLinkModal(true)
    } catch (err) {
      console.error('Failed to fetch meetings:', err)
    }
  }

  const getHealthColor = (status: string) => {
    if (status === 'healthy') return '#00e676'
    if (status === 'at_risk') return '#f59e0b'
    return '#ff4d4d'
  }

  if (loading) return <div style={{ color: 'var(--mm-text-secondary)', padding: 40 }}>Loading initiative...</div>
  if (!initiative) return <div style={{ color: 'var(--mm-text-secondary)', padding: 40 }}>Initiative not found.</div>

  const effectivenessData = snapshots.map(s => ({ date: s.snapshot_date, value: s.avg_effectiveness }))

  return (
    <PlanGate feature="initiatives">
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
        {/* Back link */}
        <Link to="/dashboard" style={{ color: 'var(--mm-cyan)', fontSize: 13, textDecoration: 'none' }}>← Back to Dashboard</Link>

        <div style={{ marginTop: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 'var(--mm-fs-title)', fontWeight: 800, color: 'var(--mm-text-primary)', margin: 0 }}>{initiative.name}</h1>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 20,
              background: `${getHealthColor(initiative.health_status)}18`,
              color: getHealthColor(initiative.health_status),
              border: `1px solid ${getHealthColor(initiative.health_status)}40`,
              fontSize: 13, fontWeight: 700
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: getHealthColor(initiative.health_status) }} />
              {initiative.health_status.charAt(0).toUpperCase() + initiative.health_status.slice(1)}
            </span>
          </div>
          {initiative.description && <p style={{ color: 'var(--mm-text-secondary)', marginTop: 8 }}>{initiative.description}</p>}
        </div>

        {/* Trend Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
          <Card variant="glass" padding="md">
            <h4 style={{ fontSize: 13, color: 'var(--mm-text-secondary)', marginBottom: 8 }}>Effectiveness Trend</h4>
            <TrendChart data={effectivenessData} color="#00e676" height={100} width={200} />
          </Card>
          <Card variant="glass" padding="md">
            <h4 style={{ fontSize: 13, color: 'var(--mm-text-secondary)', marginBottom: 8 }}>Open Tasks</h4>
            <TrendChart data={snapshots.map(s => ({ date: s.snapshot_date, value: s.open_tasks_count }))} color="#f59e0b" height={100} width={200} />
          </Card>
          <Card variant="glass" padding="md">
            <h4 style={{ fontSize: 13, color: 'var(--mm-text-secondary)', marginBottom: 8 }}>Unresolved Threads</h4>
            <TrendChart data={snapshots.map(s => ({ date: s.snapshot_date, value: s.unresolved_threads_count }))} color="#7c3aed" height={100} width={200} />
          </Card>
        </div>

        {/* Linked Meetings Timeline */}
        <h3 style={{ color: 'var(--mm-text-primary)', marginBottom: 12 }}>Linked Meetings</h3>
        {meetings.length === 0 ? (
          <Card variant="glass" padding="md"><p style={{ color: 'var(--mm-text-muted)' }}>No meetings linked yet.</p></Card>
        ) : (
          meetings
            .sort((a, b) => new Date(b.meeting_date || b.created_at).getTime() - new Date(a.meeting_date || a.created_at).getTime())
            .map(m => (
              <div key={m.id} style={{ marginBottom: 8 }}>
                <Card variant="glass" padding="sm">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {m.effectiveness_score != null && <ScoreRing score={m.effectiveness_score} />}
                      <div>
                        <Link to={`/meetings/${m.id}`} style={{ color: 'var(--mm-cyan)', fontWeight: 600 }}>
                          {m.title || 'Untitled'}
                        </Link>
                        <div style={{ fontSize: 12, color: 'var(--mm-text-secondary)' }}>
                          {m.meeting_date ? new Date(m.meeting_date).toLocaleDateString() : 'No date'}
                          {m.risk_flags?.length > 0 && (
                            <span style={{ marginLeft: 8, color: 'var(--mm-danger)' }}>
                              ⚠ {m.risk_flags.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => m.membership_id && handleUnlink(m.membership_id)}
                      style={{ background: 'none', border: 'none', color: 'var(--mm-danger)', fontSize: 12, cursor: 'pointer' }}
                    >
                      Unlink
                    </button>
                  </div>
                </Card>
              </div>
            ))
        )}
        <button
          onClick={openLinkModal}
          style={{
            marginTop: 8, background: 'none', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8,
            padding: '8px 16px', color: 'var(--mm-text-secondary)', cursor: 'pointer', width: '100%'
          }}
        >
          + Link a Meeting
        </button>

        {/* Open Tasks */}
        <h3 style={{ color: 'var(--mm-text-primary)', marginTop: 24, marginBottom: 12 }}>Open Tasks</h3>
        {tasks.filter(t => t.status !== 'completed').length === 0 ? (
          <Card variant="glass" padding="md"><p style={{ color: 'var(--mm-text-muted)' }}>No open tasks.</p></Card>
        ) : (
          tasks.filter(t => t.status !== 'completed').map(t => (
            <div key={t.id} style={{ marginBottom: 8 }}>
              <Card variant="glass" padding="sm">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--mm-text-primary)' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--mm-text-secondary)' }}>
                      {t.owner_name} · Due {t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </div>
                  <button
                    onClick={() => t.membership_id && handleUnlink(t.membership_id)}
                    style={{ background: 'none', border: 'none', color: 'var(--mm-danger)', fontSize: 12, cursor: 'pointer' }}
                  >
                    Unlink
                  </button>
                </div>
              </Card>
            </div>
          ))
        )}

        {/* Unresolved Threads */}
        <h3 style={{ color: 'var(--mm-text-primary)', marginTop: 24, marginBottom: 12 }}>Unresolved Threads</h3>
        {threads.filter(t => t.status !== 'resolved').length === 0 ? (
          <Card variant="glass" padding="md"><p style={{ color: 'var(--mm-text-muted)' }}>No unresolved threads.</p></Card>
        ) : (
          threads.filter(t => t.status !== 'resolved').map(t => (
            <div key={t.id} style={{ marginBottom: 8 }}>
              <Card variant="glass" padding="sm">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--mm-text-primary)' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--mm-text-secondary)' }}>Severity: {t.severity}</div>
                  </div>
                  <button
                    onClick={() => t.membership_id && handleUnlink(t.membership_id)}
                    style={{ background: 'none', border: 'none', color: 'var(--mm-danger)', fontSize: 12, cursor: 'pointer' }}
                  >
                    Unlink
                  </button>
                </div>
              </Card>
            </div>
          ))
        )}

        {/* Link Meeting Modal (inline) */}
        {showLinkModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ maxWidth: 400, width: '90%' }}>
              <Card variant="glass" padding="lg">
                <h3 style={{ color: 'var(--mm-text-primary)', marginBottom: 12 }}>Link a Meeting</h3>
                {availableMeetings.length === 0 ? (
                  <p style={{ color: 'var(--mm-text-muted)' }}>All meetings already linked.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, maxHeight: 300, overflowY: 'auto' }}>
                    {availableMeetings.map((m: any) => (
                      <li key={m.id} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <button
                          onClick={() => handleLinkMeeting(m.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--mm-cyan)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                        >
                          {m.title || 'Untitled'} ({m.meeting_date ? new Date(m.meeting_date).toLocaleDateString() : '—'})
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => setShowLinkModal(false)}
                  style={{ marginTop: 12, background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 12px', color: 'var(--mm-text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PlanGate>
  )
}