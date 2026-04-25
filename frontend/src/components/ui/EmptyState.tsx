import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode       // e.g. an <svg> or an emoji string
  headline: string
  subtext: string
  cta?: ReactNode       // optional button
}

export function EmptyState({ icon, headline, subtext, cta }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16, color: 'var(--mm-cyan)' }}>{icon}</div>
      <h3 style={{ fontSize: 'var(--mm-fs-card-title)', fontWeight: 800, color: 'var(--mm-text-primary)', margin: '0 0 8px' }}>
        {headline}
      </h3>
      <p style={{ fontSize: 'var(--mm-fs-body)', color: 'var(--mm-text-secondary)', margin: '0 0 24px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        {subtext}
      </p>
      {cta && <div>{cta}</div>}
    </div>
  )
}