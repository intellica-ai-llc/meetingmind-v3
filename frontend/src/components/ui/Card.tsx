import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'subtle' | 'gold'
}

export function Card({ children, className = '', padding = 'md', variant = 'default' }: CardProps) {
  const paddingStyles = {
    none: { padding: 0 },
    sm: { padding: 12 },
    md: { padding: 18 },
    lg: { padding: 24 },
  }

  const variantStyles = {
    default: { background: '#0d1117', border: '1px solid #1e3a5f' },
    subtle: { background: '#080d18', border: '1px solid #1e3a5f' },
    gold: { background: '#0d1117', border: '1px solid rgba(245, 158, 11, 0.3)' },
  }

  return (
    <div style={{ ...paddingStyles[padding], ...variantStyles[variant], borderRadius: 10, marginBottom: 14 }} className={className}>
      {children}
    </div>
  )
}
