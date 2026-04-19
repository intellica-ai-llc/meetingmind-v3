#!/bin/bash
set -euo pipefail

# BATCH 3: UI COMPONENTS
# Creates: components/ui/

mkdir -p frontend/src/components/ui

cat > frontend/src/components/ui/SentimentBadge.tsx << 'EOF'
interface SentimentBadgeProps {
  sentiment: string
}

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    Positive: { bg: '#00e67618', color: '#00e676', border: '#00e67640' },
    Neutral:  { bg: '#00d4ff18', color: '#00d4ff', border: '#00d4ff40' },
    Mixed:    { bg: '#f59e0b18', color: '#f59e0b', border: '#f59e0b40' },
    Tense:    { bg: '#ff4d4d18', color: '#ff4d4d', border: '#ff4d4d40' },
  }
  const s = map[sentiment] || map.Neutral
  return (
    <span style={{
      padding: '4px 14px',
      borderRadius: 20,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 12,
      fontWeight: 700,
    }}>
      {sentiment || 'Neutral'}
    </span>
  )
}
EOF

cat > frontend/src/components/ui/ScoreRing.tsx << 'EOF'
interface ScoreRingProps {
  score: number
}

export function ScoreRing({ score }: ScoreRingProps) {
  const color = score >= 7 ? '#00e676' : score >= 4 ? '#f59e0b' : '#ff4d4d'
  const r = 28
  const circ = 2 * Math.PI * r
  
  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1e3a5f" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${(score / 10) * circ} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: '#6b7fa3' }}>/ 10</span>
      </div>
    </div>
  )
}
EOF

cat > frontend/src/components/ui/PriorityBadge.tsx << 'EOF'
interface PriorityBadgeProps {
  priority: string
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    High:   { bg: '#ff4d4d18', color: '#ff4d4d', border: '#ff4d4d40' },
    Medium: { bg: '#f59e0b18', color: '#f59e0b', border: '#f59e0b40' },
    Low:    { bg: '#00e67618', color: '#00e676', border: '#00e67640' },
  }
  const s = map[priority] || map.Low
  return (
    <span style={{
      padding: '2px 9px',
      borderRadius: 10,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 10,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      {priority || 'Low'}
    </span>
  )
}
EOF

cat > frontend/src/components/ui/TalkBar.tsx << 'EOF'
interface TalkBarProps {
  name: string
  data: { minutes: number; percentage: number }
  color: string
}

export function TalkBar({ name, data, color }: TalkBarProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
        <span style={{ color: '#e8f0fe', fontWeight: 600 }}>{name}</span>
        <span style={{ color: '#6b7fa3' }}>{data.minutes} min · {data.percentage}%</span>
      </div>
      <div style={{ height: 5, background: '#1e3a5f', borderRadius: 3 }}>
        <div style={{
          height: 5,
          width: `${data.percentage}%`,
          background: color,
          borderRadius: 3,
          boxShadow: `0 0 8px ${color}66`,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}
EOF

cat > frontend/src/components/ui/Button.tsx << 'EOF'
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
EOF

cat > frontend/src/components/ui/Card.tsx << 'EOF'
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
EOF

cat > frontend/src/components/ui/Modal.tsx << 'EOF'
import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#0d1117', border: '1px solid #1e3a5f', borderRadius: 16, padding: 24, maxWidth: 500, width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e8f0fe', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7fa3', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
EOF

cat > frontend/src/components/ui/Spinner.tsx << 'EOF'
interface SpinnerProps {
  size?: number
  color?: string
}

export function Spinner({ size = 24, color = '#00d4ff' }: SpinnerProps) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `2px solid ${color}33`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}
EOF

echo "✅ Batch 3 complete (8 files: UI components)"