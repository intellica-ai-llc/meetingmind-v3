import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'

interface Initiative {
  id: string
  name: string
  health_status: string
  open_tasks?: number
  unresolved_threads?: number
}

export function InitiativeGrid() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/initiatives')
      .then(res => setInitiatives(res.data.initiatives || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getHealthColor = (status: string) => {
    if (status === 'healthy') return '#00e676'
    if (status === 'at_risk') return '#f59e0b'
    return '#ff4d4d'
  }

  if (loading) return <div style={{ color: '#6b7fa3' }}>Loading initiatives…</div>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12, marginBottom: 16 }}>
      {initiatives.length === 0 && (
        <div className="col-span-full">
          <Card variant="glass" padding="sm">
            <p style={{ color: '#6b7fa3', textAlign: 'center' }}>
              No initiatives yet. Start one from a meeting analysis.
            </p>
          </Card>
        </div>
      )}
      {initiatives.map(initiative => (
        <Link key={initiative.id} to={`/initiatives/${initiative.id}`} style={{ textDecoration: 'none' }}>
          <Card variant="glass" padding="sm" className="hover:shadow-glow-cyan transition cursor-pointer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h4 style={{ fontWeight: 700, color: 'var(--mm-text-primary)', fontSize: 14 }}>{initiative.name}</h4>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: getHealthColor(initiative.health_status),
                boxShadow: `0 0 6px ${getHealthColor(initiative.health_status)}`,
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#6b7fa3' }}>
              {initiative.open_tasks ?? 0} open tasks · {initiative.unresolved_threads ?? 0} threads
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}