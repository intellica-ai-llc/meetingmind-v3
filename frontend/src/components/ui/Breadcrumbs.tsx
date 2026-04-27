import { useLocation, Link } from 'react-router-dom'

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Intelligence Dashboard',
  meetings: 'Meetings',
  tasks: 'Tasks',
  patterns: 'Patterns',
  coaching: 'Coaching',
  settings: 'Settings',
  initiatives: 'Initiatives',
}

export function Breadcrumbs() {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  // Build breadcrumb items from path
  const breadcrumbs = pathSegments.map((seg, idx) => {
    const path = '/' + pathSegments.slice(0, idx + 1).join('/')
    // Attempt to display human label, fallback to segment itself (capitalized)
    const label = ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)
    return { label, path }
  })

  // Always prepend Dashboard as home
  breadcrumbs.unshift({ label: 'Home', path: '/dashboard' })

  return (
    <div style={{ padding: '8px 24px', background: 'rgba(15,17,48,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--mm-text-secondary)' }}>
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {index > 0 && <span style={{ color: '#4b5a7a' }}>/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span style={{ color: 'var(--mm-text-primary)', fontWeight: 600 }}>{crumb.label}</span>
          ) : (
            <Link to={crumb.path} style={{ color: 'var(--mm-cyan)', textDecoration: 'none', fontWeight: 500 }}>
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  )
}