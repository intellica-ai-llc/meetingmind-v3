import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePlan } from '@/contexts/UserPlanProvider'
import { Button } from '@/components/ui/Button'
import { SidebarPerformanceCard } from '@/features/dashboard/SidebarPerformanceCard'
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

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { isPaid, plan } = usePlan()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleUpgrade = async () => {
    const priceId = import.meta.env.VITE_STRIPE_PRICE_PRO
    try {
      const res = await api.post('/payments/create-checkout-session', {
        priceId,
        planType: 'pro',
        successUrl: window.location.origin + '/post-checkout?plan=pro',
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
  const planLabel = isPaid ? (plan === 'business' ? 'Business' : 'Pro') : 'Free'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--mm-gradient-page)',
      fontFamily: 'var(--mm-font-body)',
      color: 'var(--mm-text-primary)',
      position: 'relative',
    }}>
      {/* Outer glass panel — wireframe spec */}
      <div style={{
        width: '100%',
        maxWidth: 1440,
        height: 'calc(100vh - 48px)',
        display: 'flex',
        borderRadius: 24,
        overflow: 'hidden',
        background: 'rgba(8,14,28,0.88)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 20px 80px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
      }}>
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
        )}

        {/* LEFT SIDEBAR */}
        <aside style={{
          width: 220,
          minWidth: 220,
          background: 'rgba(255,255,255,0.015)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto',   // ← FIXED: sidebar now scrolls when content overflows
        }}>
          <div>
            <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>M</div>
              <span style={{ fontFamily: 'var(--mm-font-heading)', fontWeight: 800, fontSize: 16 }}>MeetingMind</span>
            </div>

            <nav style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {navItems.map(item => {
                const active = location.pathname === item.to
                return (
                  <Link key={item.to} to={item.to} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 18px',
                    margin: '0 8px',
                    textDecoration: 'none',
                    color: active ? '#fff' : 'var(--mm-text-secondary)',
                    background: active ? 'rgba(80,120,255,0.14)' : 'transparent',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    transition: 'all var(--mm-duration-fast) var(--mm-ease-out)',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <Icon d={item.icon} active={active} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Performance Card + User */}
          <div>
            <SidebarPerformanceCard />
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--mm-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
                  <div style={{ color: 'var(--mm-text-primary)', lineHeight: 1.2 }}>{displayName}</div>
                  <div style={{ fontSize: 11, color: 'var(--mm-text-muted)' }}>{planLabel}</div>
                </div>
                <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'var(--mm-text-muted)', fontSize: 10, cursor: 'pointer', padding: 0 }}>Sign out</button>
              </div>
              {!isPaid && (
                <div style={{ marginTop: 12 }}>
                  <Button onClick={handleUpgrade} variant="cyan" glow className="w-full">
                    Upgrade to Pro →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {/* TOP HEADER */}
          <header style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'transparent',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--mm-text-secondary)', fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1 }}>☰</button>
              <span style={{ fontFamily: 'var(--mm-font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--mm-text-primary)' }}>MeetingMind</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* AI Status Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mm-success)', boxShadow: '0 0 6px rgba(52,211,153,0.6)' }} />
                <span style={{ fontSize: 11, color: 'var(--mm-success)', fontWeight: 500 }}>Intelligence Active</span>
              </div>
              {/* Plan Badge */}
              <span style={{
                background: isPaid ? 'rgba(38,182,255,0.12)' : 'rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 12,
                color: isPaid ? 'var(--mm-cyan)' : 'var(--mm-text-secondary)',
              }}>
                {planLabel}
              </span>
              <Button variant="secondary" size="sm">
                Share
              </Button>
              <Button onClick={() => navigate('/app')} variant="cyan" glow size="sm">
                New Meeting
              </Button>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}