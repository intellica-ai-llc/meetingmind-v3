import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseStyles = {
    fontWeight: 700,
    border: 'none',
    borderRadius: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1,
  }

  const variantStyles = {
    primary: { background: '#f59e0b', color: '#0a0e1a' },
    secondary: { background: 'transparent', border: '1px solid #f59e0b', color: '#f59e0b' },
    danger: { background: '#ff4d4d', color: '#fff' },
  }

  const sizeStyles = {
    sm: { padding: '7px 16px', fontSize: 11 },
    md: { padding: '12px 26px', fontSize: 13 },
    lg: { padding: '16px 40px', fontSize: 15 },
  }

  const style = { ...baseStyles, ...variantStyles[variant], ...sizeStyles[size] }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style} className={className}>
      {children}
    </button>
  )
}
