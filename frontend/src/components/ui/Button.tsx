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
    transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary:   { background: '#f59e0b', color: '#0a0e1a' },
    secondary: { background: 'transparent', border: '1px solid #f59e0b', color: '#f59e0b' },
    danger:    { background: '#ff4d4d', color: '#fff' },
    cyan:      { background: 'linear-gradient(135deg, #00D4FF, #7B61FF)', color: '#0A0B1A' },
    purple:    { background: '#7B61FF', color: '#fff' },
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '7px 16px', fontSize: 11 },
    md: { padding: '12px 26px', fontSize: 13 },
    lg: { padding: '16px 40px', fontSize: 15 },
  }

  const glowStyles = glow ? { boxShadow: 'var(--mm-glow-cyan)' } : {}

  const style = { ...baseStyles, ...variantStyles[variant], ...sizeStyles[size], ...glowStyles }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style} className={className}>
      {children}
    </button>
  )
}