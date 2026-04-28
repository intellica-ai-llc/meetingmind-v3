import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePlan } from '@/contexts/UserPlanProvider'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { api } from '@/lib/api'

const Icon = ({ d, active = false }: { d: string; active?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--mm-cyan)' : 'var(--mm-text-secondary)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7m-9 2v8a2 2 0 002 2h6a2 2 0 002-2v-8M5 10v10a2 2 0 002 2h2' },
  { to: '/meetings', label: 'Meetings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/tasks',    label: 'Tasks',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { to: '/initiatives', label: 'Initiatives', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/coaching',label: 'Coaching',  icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { to: '/settings',label: 'Settings',  icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
]

export function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { isPaid, plan } = usePlan()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Direct Stripe checkout – no intermediate page
  const handleUpgrade = async () => {
    const priceId = import.meta.env.VITE_STRIPE_PRICE_PRO
    try {
      const res = await api.post('/payments/create-checkout-session', {
        priceId,
        planType: 'pro',
        successUrl: window.location.origin + '/dashboard?upgrade=pro&success=true',
        cancelUrl: window.location.origin + '/pricing',
      })
      window.location.href = res.data.url
    } catch (err) {
      console.error('Checkout error:', err)
    }
  }

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const email = user?.email ?? ''
  const displayName = email.split('@')[0]
  const initials = displayName.substring(0, 2).toUpperCase()

  // Plan badge label
  const planLabel = isPaid ? (plan === 'business' ? 'Business' : 'Pro') : 'Free'

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--mm-gradient-page)', fontFamily: 'var(--mm-font-body)', color: 'var(--mm-text-primary)' }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90, display: 'block' }} />
      )}

      <aside style={{
        width: sidebarOpen ? 240 : 64, minWidth: sidebarOpen ? 240 : 64,
        background: 'var(--mm-bg-secondary)', borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'width 0.2s ease', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, overflow: 'hidden',
      }}>
        <div>
          <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>M</div>
            {sidebarOpen && <span style={{ fontFamily: 'var(--mm-font-heading)', fontWeight: 800, fontSize: 16 }}>MeetingMind</span>}
          </div>

          <nav style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(item => {
              const active = location.pathname === item.to
              return (
                <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', textDecoration: 'none',
                  color: active ? 'var(--mm-text-primary)' : 'var(--mm-text-secondary)',
                  background: active ? 'rgba(0,212,255,0.08)' : 'transparent',
                  borderLeft: active ? '3px solid var(--mm-cyan)' : '3px solid transparent',
                  borderRadius: 0, transition: 'all 0.15s ease',
                }}>
                  <Icon d={item.icon} active={active} />
                  {sidebarOpen && <span style={{ fontSize: 'var(--mm-fs-body)', fontWeight: active ? 600 : 400 }}>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--mm-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
            {sidebarOpen && (
              <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
                <div style={{ color: 'var(--mm-text-primary)', lineHeight: 1.2 }}>{displayName}</div>
                <div style={{ fontSize: 11, color: 'var(--mm-text-muted)' }}>{planLabel}</div>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'var(--mm-text-muted)', fontSize: 10, cursor: 'pointer', padding: 0 }}>Sign out</button>
            )}
          </div>

          {/* Upgrade CTA – only visible for free users */}
          {sidebarOpen && !isPaid && (
            <button onClick={handleUpgrade} style={{ marginTop: 12, width: '100%', background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))', border: 'none', borderRadius: 8, padding: '8px 0', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              Upgrade to Pro →
            </button>
          )}
        </div>
      </aside>

      <div style={{ flex: 1, marginLeft: 64, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <header style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,17,48,0.5)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--mm-text-secondary)', fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1 }}>☰</button>
            <span style={{ fontFamily: 'var(--mm-font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--mm-text-primary)' }}>Intelligence Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: 'var(--mm-text-secondary)' }}>{planLabel}</span>
            <button onClick={() => navigate('/app')} style={{ background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ New Meeting</button>
          </div>
        </header>

        <Breadcrumbs />

        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}