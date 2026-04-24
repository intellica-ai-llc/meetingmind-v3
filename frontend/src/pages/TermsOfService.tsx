export function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Effective Date: April 23, 2026</p>

        <Section title="1. Acceptance of Terms">
          By accessing or using MeetingMind ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
        </Section>

        <Section title="2. Description of Service">
          MeetingMind is an AI-powered meeting analysis tool that transcribes, analyzes, and extracts insights from audio recordings. The Service is provided on an "as is" basis.
        </Section>

        <Section title="3. User Accounts">
          You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information when creating an account. You may not share your account with others.
        </Section>

        <Section title="4. Acceptable Use">
          You agree not to: (a) use the Service for any illegal purpose; (b) upload malicious content; (c) attempt to reverse engineer the Service; (d) exceed rate limits or abuse the platform.
        </Section>

        <Section title="5. Intellectual Property">
          The Service, including its AI models, branding, and underlying code, is owned by MeetingMind. You retain ownership of the audio files and data you upload. We may use anonymized, aggregated data to improve the Service.
        </Section>

        <Section title="6. Payment Terms">
          Paid subscriptions are billed monthly in advance. Prices are subject to change with 30 days notice. Failure to pay may result in account suspension.
        </Section>

        <Section title="7. Limitation of Liability">
          MeetingMind shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid us in the preceding 12 months.
        </Section>

        <Section title="8. Termination">
          We may suspend or terminate your account for violation of these Terms. You may terminate your account at any time by contacting us.
        </Section>

        <Section title="9. Changes to Terms">
          We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.
        </Section>

        <Section title="10. Contact">
          📧 <a href="mailto:intellicaai.ai@gmail.com" className="text-purple-400 hover:underline">intellicaai.ai@gmail.com</a>
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
