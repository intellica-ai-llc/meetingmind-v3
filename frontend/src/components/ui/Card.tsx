import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'subtle' | 'gold' | 'glass'
}

export function Card({ children, className = '', padding = 'md', variant = 'default' }: CardProps) {
  const paddingStyles: Record<string, React.CSSProperties> = {
    none: { padding: 0 },
    sm:   { padding: 12 },
    md:   { padding: 18 },
    lg:   { padding: 24 },
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    default: { background: '#0d1117', border: '1px solid #1e3a5f' },
    subtle:  { background: '#080d18', border: '1px solid #1e3a5f' },
    gold:    { background: '#0d1117', border: '1px solid rgba(245,158,11,0.3)' },
    glass:   {
      background: '#0F1130',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(10px)',
      borderRadius: 'var(--mm-radius-card)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
  }

  return (
    <div style={{ ...paddingStyles[padding], ...variantStyles[variant], borderRadius: 10, marginBottom: 14 }} className={className}>
      {children}
    </div>
  )
}