import Hero from '@/components/Hero'
import SampleReportPreview from '@/components/SampleReportPreview'
import WorkshopCards from '@/components/WorkshopCards'

export function Landing() {
  return (
    <div className="min-h-screen bg-meetingmind-bg">
      <Hero />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">AI Agents MeetingMind Bootcamp</h2>
          <p className="text-gray-400">Build a three-agent AI that turns meetings into intelligence</p>
        </div>
        <SampleReportPreview />
        <WorkshopCards />
        <div className="text-center py-12">
          <a href="/app" className="inline-block px-8 py-3 bg-meetingmind-gold text-black font-semibold rounded-lg hover:bg-yellow-600 transition">Try MeetingMind →</a>
        </div>
      </div>
    </div>
  )
}
