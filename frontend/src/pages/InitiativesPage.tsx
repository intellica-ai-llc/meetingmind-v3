import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { PlanGate } from '@/components/PlanGate'
import { EmptyState } from '@/components/ui/EmptyState'

interface Initiative {
  id: string
  name: string
  description?: string
  health_status: string
}

export function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInitiatives = async () => {
    try {
      const res = await api.get('/initiatives')
      setInitiatives(res.data.initiatives || [])
    } catch (err) {
      console.error('Failed to load initiatives:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInitiatives() }, [])

  const handleCreate = async () => {
    const name = prompt('Initiative name:')
    if (!name) return
    try {
      await api.post('/initiatives', { name })
      fetchInitiatives()
    } catch (err) {
      console.error('Create initiative failed:', err)
    }
  }

  const getHealthColor = (status: string) => {
    if (status === 'healthy') return '#00e676'
    if (status === 'at_risk') return '#f59e0b'
    return '#ff4d4d'
  }

  return (
    <PlanGate feature="initiatives">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 'var(--mm-fs-title)', fontWeight: 800, color: 'var(--mm-text-primary)', margin: 0 }}>Initiatives</h1>
          <button
            onClick={handleCreate}
            style={{
              background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            + New Initiative
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--mm-text-secondary)' }}>Loading initiatives...</p>
        ) : initiatives.length === 0 ? (
          <Card variant="glass" padding="lg">
            <EmptyState
              icon="📊"
              headline="No initiatives yet"
              subtext="Group your meetings into strategic initiatives to track progress and risks over time."
              cta={
                <button
                  onClick={handleCreate}
                  style={{
                    background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                    border: 'none',
                    borderRadius: 'var(--mm-radius-button)',
                    padding: '10px 20px',
                    color: '#0A0B1A',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Create Your First Initiative
                </button>
              }
            />
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {initiatives.map(initiative => (
              <Link key={initiative.id} to={`/initiatives/${initiative.id}`} style={{ textDecoration: 'none' }}>
                <Card variant="glass" padding="md" className="hover:shadow-glow-cyan transition cursor-pointer">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, color: 'var(--mm-text-primary)', fontSize: 16 }}>{initiative.name}</h3>
                      {initiative.description && (
                        <p style={{ fontSize: 13, color: 'var(--mm-text-secondary)', margin: '4px 0 0' }}>{initiative.description}</p>
                      )}
                    </div>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 12px', borderRadius: 20,
                      background: `${getHealthColor(initiative.health_status)}18`,
                      color: getHealthColor(initiative.health_status),
                      border: `1px solid ${getHealthColor(initiative.health_status)}40`,
                      fontSize: 12, fontWeight: 600
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getHealthColor(initiative.health_status) }} />
                      {initiative.health_status.charAt(0).toUpperCase() + initiative.health_status.slice(1)}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PlanGate>
  )
}