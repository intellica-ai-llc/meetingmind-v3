interface AttendeeAvatarsProps {
  attendees: string[]
  max?: number
}

const AVATAR_COLORS = [
  '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4',
]

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0]
  const parts = local.split('.').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return local.substring(0, 2).toUpperCase()
}

export function AttendeeAvatars({ attendees, max = 4 }: AttendeeAvatarsProps) {
  const visible = attendees.slice(0, max)
  const overflow = attendees.length - max

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {visible.map((email, i) => (
        <div
          key={email + i}
          title={email}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: AVATAR_COLORS[i % AVATAR_COLORS.length],
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            marginRight: -6,
            border: '2px solid var(--mm-bg-secondary)',
            position: 'relative',
            zIndex: visible.length - i,
          }}
        >
          {initialsFromEmail(email)}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--mm-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            marginRight: -6,
            border: '2px solid var(--mm-bg-secondary)',
            position: 'relative',
            zIndex: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}