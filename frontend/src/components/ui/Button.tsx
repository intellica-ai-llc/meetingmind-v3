import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'cyan' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  glow?: boolean
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  glow = false,
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    fontWeight: 700,
    border: 'none',
    borderRadius: 'var(--mm-radius-button)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all var(--mm-duration-fast) var(--mm-ease-out)`,
    opacity: disabled ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
      color: '#fff',
    },
    secondary: {
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.15)',
      color: 'var(--mm-text-secondary)',
    },
    danger: {
      background: 'var(--mm-danger)',
      color: '#fff',
    },
    cyan: {
      background: 'var(--mm-cyan)',
      color: '#070B17',
    },
    purple: {
      background: 'var(--mm-purple)',
      color: '#fff',
    },
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '7px 16px', fontSize: 12, height: 36 },
    md: { padding: '12px 26px', fontSize: 14, height: 48 },
    lg: { padding: '16px 40px', fontSize: 16, height: 56 },
  }

  const glowStyles: React.CSSProperties = glow
    ? { boxShadow: 'var(--mm-glow-cyan)' }
    : {}

  const style = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...glowStyles,
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`btn-hover ${className}`}
    >
      {children}
    </button>
  )
}