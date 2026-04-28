import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { PlanGate } from '@/components/PlanGate'
import { Card } from '@/components/ui/Card'

interface SpeakerProfile {
  id: string
  name: string
  email?: string
  merged_aliases?: string[]
}

export function SpeakerProfileManager() {
  const [speakers, setSpeakers] = useState<SpeakerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newAliases, setNewAliases] = useState('')

  const fetchSpeakers = () => {
    api.get('/speaker-profiles')
      .then(res => setSpeakers(res.data.speakers || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSpeakers() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await api.post('/speaker-profiles', {
        name: newName,
        email: newEmail || undefined,
        merged_aliases: newAliases ? newAliases.split(',').map(s => s.trim()) : [],
      })
      setNewName('')
      setNewEmail('')
      setNewAliases('')
      fetchSpeakers()
    } catch (err) {
      console.error('Create speaker failed:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this speaker profile?')) return
    try {
      await api.delete(`/speaker-profiles/${id}`)
      fetchSpeakers()
    } catch (err) {
      console.error('Delete speaker failed:', err)
    }
  }

  if (loading) return <div style={{ color: 'var(--mm-text-secondary)', padding: 40 }}>Loading speaker profiles...</div>

  return (
    <PlanGate feature="speaker-profiles">
      <div style={{ maxWidth: 700 }}>
        <h2 style={{ fontSize: 'var(--mm-fs-title)', fontWeight: 800, color: 'var(--mm-text-primary)', marginBottom: 16 }}>
          Speaker Profiles
        </h2>
        <p style={{ color: 'var(--mm-text-secondary)', fontSize: 14, marginBottom: 20 }}>
          Manage speaker identities across your meetings. Merging aliases helps the coach provide accurate cross‑meeting insights.
        </p>

        {/* Creation form */}
        <div style={{ marginBottom: 16 }}>
          <Card variant="glass" padding="md">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                placeholder="Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Email (optional)"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Aliases (comma separated)"
                value={newAliases}
                onChange={e => setNewAliases(e.target.value)}
                style={{ ...inputStyle, gridColumn: 'span 2' }}
              />
            </div>
            <button
              onClick={handleCreate}
              style={{
                marginTop: 10,
                background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Add Speaker
            </button>
          </Card>
        </div>

        {/* Speaker list */}
        {speakers.length === 0 ? (
          <Card variant="glass" padding="md">
            <p style={{ color: 'var(--mm-text-muted)', textAlign: 'center' }}>No speaker profiles yet.</p>
          </Card>
        ) : (
          speakers.map(sp => (
            <div key={sp.id} style={{ marginBottom: 8 }}>
              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--mm-text-primary)' }}>{sp.name}</div>
                    {sp.email && <div style={{ fontSize: 13, color: 'var(--mm-text-secondary)' }}>{sp.email}</div>}
                    {sp.merged_aliases && sp.merged_aliases.length > 0 && (
                      <div style={{ fontSize: 12, color: 'var(--mm-text-muted)', marginTop: 4 }}>
                        Aliases: {sp.merged_aliases.join(', ')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(sp.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--mm-danger)',
                      fontSize: 12,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </PlanGate>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--mm-bg-primary)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6,
  padding: '8px 10px',
  color: 'var(--mm-text-primary)',
  fontSize: 14,
}