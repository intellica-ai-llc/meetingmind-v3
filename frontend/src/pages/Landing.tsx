// import Hero from '@/components/Hero'
// import SampleReportPreview from '@/components/SampleReportPreview'
// import WorkshopCards from '@/components/WorkshopCards'

export function Landing() {
  return (
    <div className="min-h-screen bg-meetingmind-bg">
      {/* Hero section placeholder - will be implemented */}
      <div className="bg-meetingmind-card p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">MeetingMind v3.0</h1>
        <p className="text-gray-400">AI-powered meeting analysis</p>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">AI Agents MeetingMind Bootcamp</h2>
          <p className="text-gray-400">Build a three-agent AI that turns meetings into intelligence</p>
        </div>
        
        {/* Sample report preview placeholder */}
        <div className="bg-meetingmind-card rounded-xl p-6 mb-8 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-2">Sample Report</h3>
          <p className="text-gray-400">Meeting analysis preview will appear here</p>
        </div>
        
        {/* Workshop cards placeholder */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-meetingmind-card rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Agent 1: Transcription</h3>
            <p className="text-gray-400">AssemblyAI powered transcription</p>
          </div>
          <div className="bg-meetingmind-card rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Agent 2: Analysis</h3>
            <p className="text-gray-400">Groq Llama 3.3 70B extraction</p>
          </div>
          <div className="bg-meetingmind-card rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Agent 3: Coaching</h3>
            <p className="text-gray-400">AI meeting coach advice</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <a href="/app" className="inline-block px-8 py-3 bg-meetingmind-gold text-black font-semibold rounded-lg hover:bg-yellow-600 transition">Try MeetingMind →</a>
        </div>
      </div>
    </div>
  )
}
