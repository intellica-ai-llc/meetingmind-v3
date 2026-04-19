import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

export function Landing() {
  const { user } = useAuth()

  const handlePurchase = () => {
    // Open purchase/checkout flow
    if (!user) {
      // Redirect to signup with return to pricing
      localStorage.setItem('redirectAfterAuth', '/pricing')
      window.location.href = '/register'
    } else {
      // Open upgrade/payment modal or redirect to checkout
      // To be implemented in Phase 2
      console.log('Open purchase flow for user:', user.id)
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
    <div className="min-h-screen bg-meetingmind-bg">
      {/* ============================================================ */}
      {/* ANNOUNCEMENT BAR */}
      {/* ============================================================ */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#1A0F00] py-2 px-5">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="border border-[#E8A020] text-[#E8A020] text-[11px] px-2 py-0.5 rounded">
            Launch week
          </span>
          <span className="text-[#FCD97A] text-xs">
            First 500 users get Pro free for 30 days — no credit card needed
          </span>
          <button
            onClick={handlePurchase}
            className="bg-[#E8A020] text-[#1A0F00] text-xs font-medium px-3 py-0.5 rounded-full hover:opacity-85 transition"
          >
            Claim offer →
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* NAVIGATION */}
      {/* ============================================================ */}
      <nav className="pt-14 pb-3 px-6 border-b border-[var(--mm-border)] bg-[var(--color-background-primary)]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-base font-medium">
            Meeting<span className="text-[#E8A020]">Mind</span>
          </div>

          {/* Nav Links - Center */}
          <div className="hidden md:flex gap-6">
            <a href="#features" className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition">
              Features
            </a>
            <a href="#pricing" className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition">
              Pricing
            </a>
            <a href="#demo" className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition">
              Demo
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSignIn}
              className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
            >
              Sign in
            </button>
            <button
              onClick={handlePurchase}
              className="flex items-center gap-1.5 bg-[#E8A020] text-[#1A0F00] text-[13px] font-medium py-2 px-4 rounded-md hover:bg-[#C47E0A] transition"
            >
              <span>Get Pro</span>
              <span className="bg-black/18 text-[#1A0F00] text-[11px] px-1.5 py-0.5 rounded">
                $9/mo
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="px-6 py-12 md:py-16 bg-[var(--color-background-primary)]">
        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* LEFT COLUMN - Copy & CTAs */}
          <div>
            {/* Social Proof Bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                <div className="w-[22px] h-[22px] rounded-full bg-[#1E3A5F] border-2 border-[var(--color-background-primary)] flex items-center justify-center text-[9px] font-medium text-[#93C5FD] z-0">
                  JK
                </div>
                <div className="w-[22px] h-[22px] rounded-full bg-[#14301A] border-2 border-[var(--color-background-primary)] -ml-1.5 flex items-center justify-center text-[9px] font-medium text-[#4ADE80]">
                  SR
                </div>
                <div className="w-[22px] h-[22px] rounded-full bg-[#3B1A00] border-2 border-[var(--color-background-primary)] -ml-1.5 flex items-center justify-center text-[9px] font-medium text-[#FB923C]">
                  MT
                </div>
                <div className="w-[22px] h-[22px] rounded-full bg-[#2A1040] border-2 border-[var(--color-background-primary)] -ml-1.5 flex items-center justify-center text-[9px] font-medium text-[#C084FC]">
                  PD
                </div>
              </div>
              <span className="text-xs text-[var(--color-text-secondary)]">
                <span className="font-bold text-[var(--color-text-primary)]">240+ teams</span> analyzed their first meeting this week
              </span>
            </div>

            {/* H1 Headline */}
            <h1 className="text-[30px] font-medium leading-tight tracking-[-0.5px] mb-3">
              Stop losing decisions<br />
              and action items<br />
              to <span className="text-[#E8A020]">bad notes.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-[380px] mb-6">
              Upload any recording or go live — MeetingMind extracts decisions, tasks, risks, and coaching in minutes. No bot. No installation. No missed follow-ups.
            </p>

            {/* CTA Block */}
            <div className="flex flex-col gap-2.5">
              {/* Primary Purchase Button */}
              <button
                onClick={handlePurchase}
                className="flex justify-between items-center bg-[#E8A020] rounded-lg px-6 py-3.5 hover:bg-[#C47E0A] transition cursor-pointer w-full max-w-[320px]"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-medium text-[#1A0F00]">Get Pro — instant access</span>
                  <span className="text-[11px] text-[#1A0F00] opacity-70">
                    100 meetings/mo · Coach · Slack · Exports
                  </span>
                </div>
                <div>
                  <span className="text-xl font-medium text-[#1A0F00]">$9</span>
                  <span className="text-[13px] text-[#1A0F00] opacity-70">/mo</span>
                </div>
              </button>

              {/* Escape Hatch */}
              <div className="text-xs text-[var(--color-text-secondary)]">
                or{' '}
                <button onClick={handleStartFree} className="underline hover:text-[var(--color-text-primary)]">
                  start free
                </button>{' '}
                — 10 meetings/month, no credit card
              </div>

              {/* Trust Signals Row */}
              <div className="flex flex-wrap gap-3.5 mt-1">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)]">
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#166534" strokeWidth="1.2">
                      <path d="M1 4L3 6L7 1" stroke="currentColor" strokeLinecap="round" />
                    </svg>
                  </div>
                  Cancel anytime
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)]">
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#166534" strokeWidth="1.2">
                      <path d="M1 4L3 6L7 1" stroke="currentColor" strokeLinecap="round" />
                    </svg>
                  </div>
                  Instant setup
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)]">
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#166534" strokeWidth="1.2">
                      <path d="M1 4L3 6L7 1" stroke="currentColor" strokeLinecap="round" />
                    </svg>
                  </div>
                  No bot required
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Product Preview Card */}
          <div className="bg-[var(--color-background-primary)] border border-[var(--mm-border)] rounded-xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-[var(--color-background-secondary)] px-3.5 py-2.5 border-b border-[var(--mm-border)] flex justify-between items-center">
              <span className="text-xs font-medium">Q3 Product Launch Planning</span>
              <span className="bg-[#14301A] text-[#4ADE80] text-[10px] font-medium px-2 py-0.5 rounded">
                Live analysis
              </span>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 border-b border-[var(--mm-border)]">
              <div className="px-3 py-2.5 text-center border-r border-[var(--mm-border)]">
                <div className="text-[#4ADE80] text-xl font-medium">8.2</div>
                <div className="text-[10px] text-[var(--color-text-tertiary)]">Effectiveness</div>
              </div>
              <div className="px-3 py-2.5 text-center border-r border-[var(--mm-border)]">
                <div className="text-[#E8A020] text-xl font-medium">Positive</div>
                <div className="text-[10px] text-[var(--color-text-tertiary)]">Sentiment</div>
              </div>
              <div className="px-3 py-2.5 text-center">
                <div className="text-[#60A5FA] text-xl font-medium">94%</div>
                <div className="text-[10px] text-[var(--color-text-tertiary)]">Confidence</div>
              </div>
            </div>

            {/* Action Items Section */}
            <div className="px-3.5 py-3">
              <div className="text-[10px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)] mb-1.5">
                Action items
              </div>

              {/* Action Item 1 */}
              <div className="flex items-center gap-2 py-1.5 border-b border-[var(--mm-border)]">
                <div className="w-5 h-5 rounded-full bg-[#1E3A5F] flex items-center justify-center text-[8px] font-medium text-[#93C5FD] flex-shrink-0">
                  BC
                </div>
                <span className="text-xs text-[var(--color-text-secondary)] flex-1">Test Stripe webhooks</span>
                <span className="text-xs text-[var(--color-text-tertiary)]">due Wed</span>
                <span className="bg-[#3B0A0A] text-[#F87171] text-[10px] px-1.5 py-0.5 rounded font-medium">High</span>
              </div>

              {/* Action Item 2 */}
              <div className="flex items-center gap-2 py-1.5 border-b border-[var(--mm-border)]">
                <div className="w-5 h-5 rounded-full bg-[#14301A] flex items-center justify-center text-[8px] font-medium text-[#4ADE80] flex-shrink-0">
                  SR
                </div>
                <span className="text-xs text-[var(--color-text-secondary)] flex-1">Draft launch email</span>
                <span className="text-xs text-[var(--color-text-tertiary)]">due Tue</span>
                <span className="bg-[#3B2500] text-[#FB923C] text-[10px] px-1.5 py-0.5 rounded font-medium">Med</span>
              </div>

              {/* Action Item 3 */}
              <div className="flex items-center gap-2 py-1.5">
                <div className="w-5 h-5 rounded-full bg-[#3B1A00] flex items-center justify-center text-[8px] font-medium text-[#FB923C] flex-shrink-0">
                  TK
                </div>
                <span className="text-xs text-[var(--color-text-secondary)] flex-1">Update pricing page</span>
                <span className="text-xs text-[var(--color-text-tertiary)]">due Thu</span>
                <span className="bg-[#3B2500] text-[#FB923C] text-[10px] px-1.5 py-0.5 rounded font-medium">Med</span>
              </div>
            </div>

            {/* Locked Pro Feature Bar */}
            <div className="bg-[var(--color-background-secondary)] border-t border-[var(--mm-border)] px-3.5 py-2.5 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                {/* Lock Icon */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#E8A020" strokeWidth="1.2">
                  <rect x="3" y="6" width="8" height="7" rx="1" fill="none" />
                  <path d="M5 6V4C5 2.5 5.5 1 7 1C8.5 1 9 2.5 9 4V6" stroke="currentColor" fill="none" />
                </svg>
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  Meeting Coach + Slack sync — <span className="text-[#E8A020]">Pro feature</span>
                </span>
              </div>
              <button
                onClick={handlePurchase}
                className="bg-[#E8A020] text-[#1A0F00] text-[11px] font-medium px-3 py-1 rounded hover:bg-[#C47E0A] transition"
              >
                Unlock →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SOCIAL PROOF STRIP */}
      {/* ============================================================ */}
      <section className="bg-[var(--color-background-secondary)] border-y border-[var(--mm-border)] py-4 px-6">
        <div className="flex flex-wrap items-center justify-center gap-6 max-w-7xl mx-auto">
          {/* Metric 1 */}
          <div className="text-center">
            <div className="text-[#E8A020] text-xl font-medium">13</div>
            <div className="text-[11px] text-[var(--color-text-tertiary)]">AI extractions</div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-[var(--mm-border)] hidden sm:block" />

          {/* Metric 2 */}
          <div className="text-center">
            <div className="text-[#E8A020] text-xl font-medium">0</div>
            <div className="text-[11px] text-[var(--color-text-tertiary)]">bots to install</div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-[var(--mm-border)] hidden sm:block" />

          {/* Metric 3 */}
          <div className="text-center">
            <div className="text-[#E8A020] text-xl font-medium">~4 min</div>
            <div className="text-[11px] text-[var(--color-text-tertiary)]">avg analysis time</div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-[var(--mm-border)] hidden sm:block" />

          {/* Testimonial Quote */}
          <div className="max-w-[280px]">
            <div className="text-xs text-[var(--color-text-secondary)] italic leading-relaxed">
              "We used to spend 20 minutes writing up meeting notes. Now it's done before we close the Zoom window."
            </div>
            <div className="text-[11px] font-medium text-[var(--color-text-primary)] not-italic mt-0.5">
              — Sarah R., Product Manager
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* URGENCY BAR */}
      {/* ============================================================ */}
      <section className="bg-[#1A0F00] py-2.5 px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5 text-[#FCD97A] text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020]" />
            Every meeting without MeetingMind = decisions and tasks lost
          </div>
          <div className="flex items-center gap-1.5 text-[#FCD97A] text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020]" />
            Pro launch offer ends when 500 spots fill
          </div>
          <div className="flex items-center gap-1.5 text-[#FCD97A] text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020]" />
            Setup takes under 60 seconds
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PRICING SECTION */}
      {/* ============================================================ */}
      <section id="pricing" className="py-7 px-6 bg-[var(--color-background-primary)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-[11px] font-medium uppercase tracking-[0.6px] text-[var(--color-text-tertiary)] mb-4">
            Simple pricing — pick your plan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 max-w-3xl mx-auto">
            {/* FREE PLAN CARD */}
            <div className="bg-[var(--color-background-primary)] border border-[var(--mm-border)] rounded-xl p-3.5">
              <div className="text-[13px] font-medium mb-0.5">Free</div>
              <div className="mb-1.5">
                <span className="text-[22px] font-medium">$0</span>
                <span className="text-xs text-[var(--color-text-secondary)]">/mo</span>
              </div>
              <div className="space-y-0.5 mb-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> 10 meetings/month
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> 60 min/meeting
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> 13 extractions
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[var(--color-text-tertiary)]">–</span> Meeting Coach
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[var(--color-text-tertiary)]">–</span> Slack & Calendar
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[var(--color-text-tertiary)]">–</span> Exports
                </div>
              </div>
              <button
                onClick={handleStartFree}
                className="w-full py-2 rounded-md text-xs font-medium border border-[var(--mm-border)] bg-transparent text-[var(--color-text-secondary)] hover:opacity-85 transition"
              >
                Start free
              </button>
            </div>

            {/* PRO PLAN CARD (Featured) */}
            <div className="bg-[var(--color-background-primary)] border-2 border-[#E8A020] rounded-xl p-3.5 relative">
              <div className="mb-1">
                <span className="bg-[#E8A020] text-[#1A0F00] text-[10px] font-medium px-2 py-0.5 rounded inline-block">
                  Most popular
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[13px] font-medium">Pro</span>
                <span className="text-[10px] text-[#4ADE80]">save 2 months free ↑</span>
              </div>
              <div className="mb-1.5">
                <span className="text-[22px] font-medium">$9</span>
                <span className="text-xs text-[var(--color-text-secondary)]">/mo</span>
              </div>
              <div className="space-y-0.5 mb-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> 100 meetings/month
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> 240 min/meeting
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> 13 extractions
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> Meeting Coach
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> Slack & Calendar
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> Exports
                </div>
              </div>
              <button
                onClick={handlePurchase}
                className="w-full py-2 rounded-md text-xs font-medium bg-[#E8A020] text-[#1A0F00] border border-[#E8A020] hover:bg-[#C47E0A] transition"
              >
                Get Pro — $9/mo
              </button>
            </div>

            {/* BUSINESS PLAN CARD */}
            <div className="bg-[var(--color-background-primary)] border border-[var(--mm-border)] rounded-xl p-3.5">
              <div className="text-[13px] font-medium mb-0.5">Business</div>
              <div className="mb-1.5">
                <span className="text-[22px] font-medium">$29</span>
                <span className="text-xs text-[var(--color-text-secondary)]">/mo</span>
              </div>
              <div className="space-y-0.5 mb-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> Unlimited meetings
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> Unlimited minutes
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> Everything in Pro
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> Team members
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> API access
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] py-0.5">
                  <span className="text-[#4ADE80]">✓</span> SOC2 + Priority support
                </div>
              </div>
              <button
                onClick={() => console.log('Contact sales')}
                className="w-full py-2 rounded-md text-xs font-medium border border-[var(--mm-border)] bg-transparent text-[var(--color-text-secondary)] hover:opacity-85 transition"
              >
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}