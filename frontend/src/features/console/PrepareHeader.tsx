import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'

interface PrepareHeaderProps {
  title: string
  date: string
  attendees: string[]
}

export function PrepareHeader({ title, date, attendees }: PrepareHeaderProps) {
  const [editTitle, setEditTitle] = useState(title)
  const [editDate, setEditDate] = useState(date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const { setMeetingTitle, setMeetingDate } = useApp()

  const handleSaveTitle = () => {
    setMeetingTitle(editTitle)
  }

  const handleSaveDate = (value: string) => {
    setEditDate(value)
    const formatted = new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    setMeetingDate(formatted)
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mm-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        Preparing for
      </div>

      {/* Editable title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={handleSaveTitle}
          placeholder="Meeting title (optional)"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px dashed rgba(255,255,255,0.2)',
            color: 'var(--mm-text-primary)',
            fontSize: 24,
            fontWeight: 700,
            padding: '2px 0',
            width: '100%',
            maxWidth: 500,
            outline: 'none',
          }}
        />
      </div>

      {/* Editable date */}
      <div style={{ marginBottom: 4 }}>
        <input
          type="date"
          value={editDate}
          onChange={e => handleSaveDate(e.target.value)}
          style={{
            background: 'var(--mm-bg-primary)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            padding: '4px 8px',
            color: 'var(--mm-text-secondary)',
            fontSize: 13,
          }}
        />
      </div>

      {/* Attendees display or add */}
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 13, color: 'var(--mm-text-secondary)' }}>
          Attendees: {attendees.length > 0 ? attendees.join(', ') : 'None added yet — add speakers below'}
        </div>
      </div>
    </div>
  )
}