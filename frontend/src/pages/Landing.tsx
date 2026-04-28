import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function Landing() {
  const { user } = useAuth()

  const handlePurchase = async (priceId: string, planType: string) => {
    if (!user) {
      localStorage.setItem('redirectAfterAuth', '/pricing')
      window.location.href = '/register'
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('https://meetingmind-api-production.intellicaai-ai.workers.dev/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          priceId,
          planType,
          successUrl: window.location.origin + '/dashboard?upgrade=' + planType + '&success=true',
          cancelUrl: window.location.origin + '/pricing'
        })
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }

  const handleStartFree = () => {
    if (!user) {
      window.location.href = '/register'
    } else {
      window.location.href = '/dashboard'
    }
  }

  const handleSignIn = () => {
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', color: '#f0f0f5', fontFamily: 'inherit' }}>

      {/* ── LAUNCH BANNER ── */}
      <div style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #4f46e5 100%)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>
          Launch week
        </span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>
          First 500 users get Pro free for 30 days — <strong>347 spots remaining</strong>
        </span>
        <button
          onClick={() => handlePurchase('price_1TP7vNA67WFEmKggjsbh4UAQ', 'pro')}
          style={{ background: '#fff', color: '#4f46e5', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' }}
        >
          Claim your free month →
        </button>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>Offer ends May 4</span>
      </div>

      {/* ── NAVIGATION ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,15,0.97)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
          Meeting<span style={{ color: '#a78bfa' }}>Mind</span>
        </div>
        <div className="hidden md:flex" style={{ gap: '28px' }}>
          <a href="#features" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Features</a>
          <a href="#pricing"  style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Pricing</a>
          <a href="#demo"     style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Demo</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSignIn}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '8px 18px', fontSize: '14px', cursor: 'pointer' }}
          >
            Sign in
          </button>
          <button
            onClick={() => handlePurchase('price_1TP7vNA67WFEmKggjsbh4UAQ', 'pro')}
            style={{ background: '#7c3aed', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 18px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            Get Pro — $9/mo
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', padding: '72px 40px 64px', maxWidth: '1200px', margin: '0 auto', alignItems: 'center' }}>

        {/* LEFT */}
        <div>
          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ display: 'flex' }}>
              {[
                { initials: 'JK', bg: '#1e1b4b', color: '#a5b4fc' },
                { initials: 'SR', bg: '#065f46', color: '#6ee7b7' },
                { initials: 'MT', bg: '#7c2d12', color: '#fca5a5' },
                { initials: 'PD', bg: '#1e3a5f', color: '#93c5fd' },
              ].map((av, i) => (
                <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #0a0a0f', background: av.bg, color: av.color, fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '-8px', position: 'relative', zIndex: 4 - i }}>
                  {av.initials}
                </div>
              ))}
            </div>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginLeft: '14px' }}>
              <strong style={{ color: 'rgba(255,255,255,0.9)' }}>240+ teams</strong> analyzed their first meeting this week
            </span>
            <span style={{ color: '#f59e0b', fontSize: '12px', letterSpacing: '2px' }}>★★★★★</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: '44px', fontWeight: 700, lineHeight: 1.15, color: '#fff', marginBottom: '16px' }}>
            Your meetings decide<br />
            your business.<br />
            <span style={{ color: '#a78bfa' }}>Stop letting the follow-up</span><br />
            <span style={{ color: '#34d399' }}>fail them.</span>
          </h1>

          <p style={{ fontSize: '17px', lineHeight: 1.65, color: 'rgba(255,255,255,0.5)', marginBottom: '32px', maxWidth: '480px' }}>
            MeetingMind turns any recording into action items, decisions, risks, and a ready-to-send follow-up email — in under 2 minutes. No bot joins your call. No setup required.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handlePurchase('price_1TP7vNA67WFEmKggjsbh4UAQ', 'pro')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#7c3aed', border: 'none', color: '#fff', borderRadius: '12px', padding: '16px 24px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', width: '100%', maxWidth: '380px' }}
            >
              <span>Start Pro free for 30 days</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', padding: '3px 10px', fontSize: '14px', fontWeight: 500 }}>$9/mo after</span>
            </button>

            <button
              onClick={handleStartFree}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '14px 24px', fontSize: '15px', cursor: 'pointer', width: '100%', maxWidth: '380px' }}
            >
              <span style={{ background: '#065f46', color: '#34d399', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>FREE</span>
              <span>Try free — 10 meetings/month, no card needed</span>
            </button>
          </div>

          {/* Trust signals */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
            {['Cancel anytime', 'Instant setup', 'No bot required'].map((label) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                <div style={{ width: '14px', height: '14px', background: '#065f46', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3.5 6L6.5 1.5" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Product card */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '-20px', background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '24px' }} />
          <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>

            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#0d0d1a' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Q3 Product Launch Planning</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', background: '#34d399', borderRadius: '50%', animation: 'mm-pulse 2s infinite' }} />
                Live analysis
              </span>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              {[
                { val: '8.2',      lbl: 'Effectiveness', color: '#a78bfa' },
                { val: 'Positive', lbl: 'Sentiment',     color: '#f59e0b' },
                { val: '94%',      lbl: 'Confidence',    color: '#34d399' },
              ].map((stat, i) => (
                <div key={i} style={{ padding: '16px 12px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>{stat.val}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{stat.lbl}</div>
                </div>
              ))}
            </div>

            {/* Action items */}
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '10px 20px 6px' }}>
              Action items
            </div>
            {[
              { initials: 'BC', bg: '#1e1b4b', color: '#a5b4fc', task: 'Test Stripe webhooks',  due: 'due Wed', badge: 'High', badgeBg: 'rgba(239,68,68,0.18)',    badgeColor: '#f87171' },
              { initials: 'SR', bg: '#065f46', color: '#6ee7b7', task: 'Draft launch email',    due: 'due Tue', badge: 'Med',  badgeBg: 'rgba(245,158,11,0.18)',  badgeColor: '#fbbf24' },
              { initials: 'TK', bg: '#1e3a5f', color: '#93c5fd', task: 'Update pricing page',   due: 'due Thu', badge: 'Med',  badgeBg: 'rgba(245,158,11,0.18)',  badgeColor: '#fbbf24' },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: item.bg, color: item.color, fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.initials}
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', flex: 1 }}>{item.task}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginRight: '4px' }}>{item.due}</span>
                <span style={{ background: item.badgeBg, color: item.badgeColor, borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>{item.badge}</span>
              </div>
            ))}

            {/* Key quote */}
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '10px 20px 6px' }}>
              Key quote
            </div>
            <div style={{ margin: '0 20px 12px', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderLeft: '3px solid #a78bfa', borderRadius: '0 8px 8px 0' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
                "If the webhook passes Wednesday, we launch Friday. No more deliberating."
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', marginBottom: 0 }}>— Bob Chen</p>
            </div>

            {/* Pro unlock bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(124,58,237,0.1)', borderTop: '1px solid rgba(124,58,237,0.2)', padding: '12px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#a78bfa" strokeWidth="1.2">
                  <rect x="3" y="6" width="8" height="7" rx="1" fill="none" />
                  <path d="M5 6V4C5 2.5 5.5 1 7 1C8.5 1 9 2.5 9 4V6" fill="none" />
                </svg>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  Meeting Coach + Slack sync — <span style={{ color: '#a78bfa', fontWeight: 600 }}>Pro feature</span>
                </span>
              </div>
              <button
                onClick={() => handlePurchase('price_1TP7vNA67WFEmKggjsbh4UAQ', 'pro')}
                style={{ background: '#7c3aed', border: 'none', color: '#fff', borderRadius: '8px', padding: '7px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Unlock →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGO BAR ── */}
      <div style={{ padding: '24px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.22)', marginRight: '8px' }}>Teams from</span>
          {['Notion', 'Stripe', 'Vercel', 'Linear', 'HubSpot', 'Figma', 'Intercom'].map((name) => (
            <span key={name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '7px 16px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.32)' }}>
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '28px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { val: '13',   lbl: 'AI extractions per meeting' },
            { val: '~2min', lbl: 'average analysis time' },
            { val: '0',    lbl: 'bots to install' },
            { val: '240+', lbl: 'teams onboarded this week' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#a78bfa' }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '72px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>What it does</div>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>From recording to action in 2 minutes</h2>
        <p style={{ textAlign: 'center', fontSize: '16px', color: 'rgba(255,255,255,0.4)', marginBottom: '52px' }}>Upload any audio or record live — MeetingMind handles the rest.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: '🎙', iconBg: 'rgba(124,58,237,0.15)', name: 'Transcription + speaker ID',    desc: 'Upload MP3, WAV, or any recording. Each speaker is identified and labeled automatically.' },
            { icon: '✅', iconBg: 'rgba(16,185,129,0.1)',  name: '13-field AI extraction',         desc: 'Decisions, action items, risks, open questions, key quotes — extracted and structured every time.' },
            { icon: '✉️', iconBg: 'rgba(245,158,11,0.1)',  name: 'Follow-up email, written',       desc: 'A complete meeting summary email is drafted and ready to send before you close your laptop.' },
            { icon: '📊', iconBg: 'rgba(59,130,246,0.1)',  name: 'Meeting score + coaching',       desc: 'Get an effectiveness score and specific coaching on how to run a better next meeting.' },
            { icon: '🚩', iconBg: 'rgba(239,68,68,0.1)',   name: 'Risk flags + open threads',      desc: 'Unresolved decisions and risk signals surface automatically — nothing falls through the cracks.' },
            { icon: '📁', iconBg: 'rgba(124,58,237,0.1)',  name: 'Full meeting history',           desc: 'Every meeting is saved. Search, revisit, and track tasks across your entire meeting history.' },
          ].map((feat) => (
            <div key={feat.name} style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px 20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: feat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', fontSize: '18px' }}>
                {feat.icon}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>{feat.name}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>{feat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '56px 40px', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>What teams are saying</div>
          <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '40px' }}>Real results from real teams</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { quote: 'We used to spend 20 minutes writing notes after every standup. MeetingMind does it in 90 seconds and catches things we missed.', name: 'Alex Wu',   role: 'Head of Product, Forma',     initials: 'AW', bg: '#1e1b4b', color: '#a5b4fc' },
              { quote: 'The action item extraction is scarily accurate. It even picked up a decision made off-hand at the end of the call.',             name: 'Sara C.',  role: 'Engineering Lead, Shipyard', initials: 'SC', bg: '#065f46', color: '#6ee7b7' },
              { quote: 'I was skeptical. Then I ran my first client call through it and sent the follow-up email 4 minutes after hanging up.',           name: 'Marcus T.', role: 'Founder, Clearline',         initials: 'MT', bg: '#7c2d12', color: '#fca5a5' },
            ].map((t) => (
              <div key={t.name} style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px 20px' }}>
                <div style={{ color: '#f59e0b', fontSize: '13px', marginBottom: '12px', letterSpacing: '2px' }}>★★★★★</div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.65, marginBottom: '16px' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: t.bg, color: t.color, fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── URGENCY BAR ── */}
      <div style={{ background: 'rgba(124,58,237,0.12)', borderTop: '1px solid rgba(124,58,237,0.2)', borderBottom: '1px solid rgba(124,58,237,0.2)', padding: '14px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
          {[
            'Every meeting without MeetingMind = decisions lost',
            'Pro launch offer ends when 500 spots fill',
            'Setup takes under 60 seconds',
          ].map((msg) => (
            <div key={msg} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', flexShrink: 0 }} />
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '72px 40px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Simple pricing</div>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>Start free. Upgrade when you're ready.</h2>
        <p style={{ textAlign: 'center', fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginBottom: '48px' }}>No contracts. No credit card for the free tier. Cancel anytime.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>

          {/* FREE */}
          <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px 24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Free</div>
            <div style={{ fontSize: '38px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>$0 <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>/mo</span></div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: '8px 0 20px' }}>10 meetings/month, no card needed.</div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {['10 meetings per month', '60 min recording limit', '13-field AI extraction', 'Action items + decisions', 'Follow-up email draft'].map((f) => (
                <li key={f} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#34d399', fontSize: '14px' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={handleStartFree} style={{ width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)', borderRadius: '10px', padding: '12px', fontSize: '14px', cursor: 'pointer' }}>
              Start free →
            </button>
          </div>

          {/* PRO */}
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1a1035 100%)', border: '1px solid rgba(124,58,237,0.45)', borderRadius: '16px', padding: '28px 24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#7c3aed', color: '#fff', borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: 700 }}>Most popular</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(165,180,252,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Pro</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2px' }}>
              <span style={{ fontSize: '38px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>$9</span>
              <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>/mo</span>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, marginLeft: '6px' }}>save 2 months free ↑</span>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '8px 0 20px' }}>Unlimited meetings + team features.</div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {['100 meetings/month', '240 min/meeting', '13-field AI extraction', 'Meeting Coach access', 'Slack & Calendar sync', 'Exports + task dashboard', 'Pattern analytics'].map((f) => (
                <li key={f} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#34d399', fontSize: '14px' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => handlePurchase('price_1TP7vNA67WFEmKggjsbh4UAQ', 'pro')} style={{ width: '100%', background: '#7c3aed', border: 'none', color: '#fff', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Get Pro — $9/mo →
            </button>
          </div>

          {/* BUSINESS */}
          <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px 24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Business</div>
            <div style={{ fontSize: '38px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>$29 <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>/mo</span></div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: '8px 0 20px' }}>Everything in Pro, built for teams.</div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {['Unlimited meetings', 'Unlimited minutes', 'Everything in Pro', 'Team members + shared history', 'API access', 'SOC2 + Priority support'].map((f) => (
                <li key={f} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#34d399', fontSize: '14px' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => handlePurchase('price_1TP86WA67WFEmKgggQizCLK6', 'business')} style={{ width: '100%', background: '#7c3aed', border: 'none', color: '#fff', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Get Business — $29/mo →
            </button>
          </div>

        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ textAlign: 'center', padding: '80px 40px', background: 'linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.07) 100%)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '14px', lineHeight: 1.2 }}>
          Your next meeting is in your calendar.<br />
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>Will you remember what was decided?</span>
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
          Join 240+ teams who stopped losing decisions to bad notes.
        </p>
        <button
          onClick={handleStartFree}
          style={{ background: '#7c3aed', border: 'none', color: '#fff', borderRadius: '12px', padding: '16px 44px', fontSize: '17px', fontWeight: 700, cursor: 'pointer', display: 'inline-block' }}
        >
          Start free — no credit card needed
        </button>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)', marginTop: '14px' }}>
          Or upgrade to Pro today for $9/mo · Cancel anytime
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '40px', marginTop: '60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            © 2026 MeetingMind. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <a href="/refund-policy" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Refund Policy</a>
            <a href="/terms" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/privacy" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/contact" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>

      {/* ── PULSE ANIMATION ── */}
      <style>{`
        @keyframes mm-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>

    </div>
  )
}