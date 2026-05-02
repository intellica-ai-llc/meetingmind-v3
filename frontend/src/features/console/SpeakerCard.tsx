import { useState } from 'react'
import { Card } from '@/components/ui/Card'

interface SpeakerCardProps {
  attendees: string[]
}

export function SpeakerCard({ attendees }: SpeakerCardProps) {
  const [speakers, setSpeakers] = useState<string[]>(attendees.length > 0 ? attendees : [])
  const [newSpeaker, setNewSpeaker] = useState('')

  const handleAdd = () => {
    if (!newSpeaker.trim()) return
    setSpeakers([...speakers, newSpeaker.trim()])
    setNewSpeaker('')
  }

  const handleRemove = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index))
  }

  const handleEdit = (index: number, value: string) => {
    const updated = [...speakers]
    updated[index] = value
    setSpeakers(updated)
  }

  return (
    <Card variant="glass" padding="md">
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>
        Speakers
      </h3>
      {speakers.length === 0 ? (
        <p style={{ color: 'var(--mm-text-muted)', fontSize: 13, marginBottom: 10 }}>
          No attendees from calendar. Add expected speakers.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {speakers.map((speaker, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 11, color: 'var(--mm-text-muted)' }}>✎</span>
              <input
                value={speaker}
                onChange={e => handleEdit(i, e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px dashed rgba(255,255,255,0.1)',
                  color: 'var(--mm-text-primary)',
                  fontSize: 14,
                  padding: '2px 0',
                  outline: 'none',
                }}
              />
              <button onClick={() => handleRemove(i)} style={{ background: 'none', border: 'none', color: 'var(--mm-text-muted)', cursor: 'pointer', fontSize: 14 }}>×</button>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          type="text"
          placeholder="Add speaker"
          value={newSpeaker}
          onChange={e => setNewSpeaker(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          style={{
            flex: 1,
            padding: '8px 10px',
            background: 'var(--mm-bg-primary)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            color: 'var(--mm-text-primary)',
            fontSize: 13,
          }}
        />
        <button onClick={handleAdd} style={{
          background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
          border: 'none',
          borderRadius: 6,
          padding: '8px 14px',
          color: '#fff',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
        }}>
          Add
        </button>
      </div>
    </Card>
  )
}