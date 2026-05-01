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
    default: {
      background: 'var(--mm-bg-secondary)',
      border: 'var(--mm-border-glass)',
    },
    subtle: {
      background: 'var(--mm-bg-primary)',
      border: 'var(--mm-border-glass)',
    },
    gold: {
      background: 'var(--mm-bg-secondary)',
      border: '1px solid rgba(251, 191, 36, 0.3)',
    },
    glass: {
      background: 'var(--mm-bg-secondary)',
      border: 'var(--mm-border-glass)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    },
  }

  const baseStyle: React.CSSProperties = {
    borderRadius: 'var(--mm-radius-card)',
    marginBottom: 14,
    transition: 'transform var(--mm-duration-fast) var(--mm-ease-out), border-color var(--mm-duration-fast) var(--mm-ease-out), box-shadow var(--mm-duration-fast) var(--mm-ease-out)',
    ...paddingStyles[padding],
    ...variantStyles[variant],
  }

  return (
    <div style={baseStyle} className={`card-hover ${className}`}>
      {variant === 'glass' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '8px',
          right: '8px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
      )}
      {children}
    </div>
  )
}