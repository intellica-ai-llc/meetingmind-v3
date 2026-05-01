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
    md:   { padding: 20 },
    lg:   { padding: 28 },
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
      background: 'rgba(12,18,36,0.88)',
      border: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)',
    },
  }

  const baseStyle: React.CSSProperties = {
    borderRadius: 'var(--mm-radius-card)',
    marginBottom: 16,
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