export function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Refund & Cancellation Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Effective Date: April 23, 2026</p>

        <Section title="1. Overview">
          MeetingMind ("we," "us," or "our") offers a Free tier, a Pro tier ($9/month), and a Business tier ($29/month). This policy explains our refund and cancellation practices.
        </Section>

        <Section title="2. Free Tier">
          The Free tier (10 meetings/month) requires no payment information and no credit card. You may use the Free tier for as long as you like, subject to the usage limits. There are no refunds applicable to the Free tier.
        </Section>

        <Section title="3. Pro and Business Subscriptions">
          Pro and Business subscriptions are billed monthly in advance. There are no contracts and no long-term commitments. You may cancel your subscription at any time.
        </Section>

        <Section title="4. Cancellation">
          You may cancel your subscription at any time by emailing us at <a href="mailto:intellicaai.ai@gmail.com" className="text-purple-400 hover:underline">intellicaai.ai@gmail.com</a>. Upon cancellation, your subscription will remain active until the end of your current billing period. You will not be charged again after cancellation. We do not offer refunds for partial months or unused time in the current billing period.
        </Section>

        <Section title="5. Refunds">
          We do not offer refunds for monthly subscriptions. If you cancel, you retain access for the remainder of the month you've paid for.
        </Section>

        <Section title="6. Promotions and Launch Offers">
          Our 30-day free trial of Pro ("First 500 users get Pro free for 30 days") does not require a credit card and will not auto-convert to a paid plan at the end of the trial period. You will be notified before the trial ends and given the option to subscribe.
        </Section>

        <Section title="7. Chargebacks">
          If you initiate a chargeback through your bank or credit card company, we reserve the right to suspend your account pending resolution. We encourage you to contact us first at <a href="mailto:intellicaai.ai@gmail.com" className="text-purple-400 hover:underline">intellicaai.ai@gmail.com</a> before initiating a chargeback.
        </Section>

        <Section title="8. Contact">
          For any refund or cancellation questions, reach us at: 📧 <a href="mailto:intellicaai.ai@gmail.com" className="text-purple-400 hover:underline">intellicaai.ai@gmail.com</a>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
      <p className="text-gray-300 leading-relaxed">{children}</p>
    </div>
  )
}
