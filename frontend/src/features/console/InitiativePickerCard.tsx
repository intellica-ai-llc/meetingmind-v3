import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'

interface Initiative {
  id: string
  name: string
  health_status: string
}

interface InitiativePickerCardProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function InitiativePickerCard({ selectedId, onSelect }: InitiativePickerCardProps) {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    api.get('/initiatives')
      .then(res => setInitiatives(res.data.initiatives || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const res = await api.post('/initiatives', { name: newName })
      const created = res.data.initiative
      setInitiatives(prev => [...prev, created])
      onSelect(created.id)
      setNewName('')
      setShowCreate(false)
    } catch (err) {
      console.error('Failed to create initiative:', err)
    }
  }

  const getHealthColor = (status: string) => {
    if (status === 'healthy') return '#00e676'
    if (status === 'at_risk') return '#f59e0b'
    return '#ff4d4d'
  }

  const selectedInitiative = initiatives.find(i => i.id === selectedId)

  return (
    <Card variant="glass" padding="md">
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 12 }}>
        Link to Initiative
      </h3>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--mm-text-muted)' }}>Loading initiatives...</p>
      ) : (
        <>
          <select
            value={selectedId || ''}
            onChange={e => onSelect(e.target.value || null)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--mm-bg-primary)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: 'var(--mm-text-primary)',
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            <option value="">No initiative</option>
            {initiatives.map(init => (
              <option key={init.id} value={init.id}>{init.name}</option>
            ))}
          </select>

          {selectedInitiative && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              fontSize: 13,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: getHealthColor(selectedInitiative.health_status) }} />
              <span style={{ color: 'var(--mm-text-secondary)' }}>Status:</span>
              <span style={{ color: getHealthColor(selectedInitiative.health_status), fontWeight: 600, textTransform: 'capitalize' }}>
                {selectedInitiative.health_status.replace('_', ' ')}
              </span>
            </div>
          )}

          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--mm-cyan)',
                fontSize: 13,
                cursor: 'pointer',
                padding: 0,
                marginTop: 10,
              }}
            >
              + Create New Initiative
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                type="text"
                placeholder="Initiative name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
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
              <button
                onClick={handleCreate}
                style={{
                  background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 14px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  color: 'var(--mm-text-secondary)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  )
}