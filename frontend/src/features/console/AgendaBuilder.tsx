import { useState } from 'react'
import { Card } from '@/components/ui/Card'

export function AgendaBuilder() {
  const [items, setItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState('')

  const handleAdd = () => {
    if (!newItem.trim()) return
    setItems([...items, newItem.trim()])
    setNewItem('')
  }

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <Card variant="glass" padding="md">
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>
        Meeting Agenda
      </h3>
      {items.length === 0 && !newItem && (
        <p style={{ color: 'var(--mm-text-muted)', fontSize: 13, marginBottom: 10 }}>
          Add agenda items to set the focus for this meeting.
        </p>
      )}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ color: 'var(--mm-text-muted)', fontSize: 12 }}>{i + 1}.</span>
            <span style={{ flex: 1, color: 'var(--mm-text-primary)', fontSize: 14 }}>{item}</span>
            <button onClick={() => handleRemove(i)} style={{ background: 'none', border: 'none', color: 'var(--mm-text-muted)', cursor: 'pointer', fontSize: 14 }}>×</button>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          type="text"
          placeholder="Add item..."
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
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