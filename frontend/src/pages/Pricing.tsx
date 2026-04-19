export function Pricing() {
  return (
    <div className="min-h-screen bg-meetingmind-bg flex items-center justify-center p-4">
      <div className="bg-meetingmind-card rounded-xl p-8 w-full max-w-4xl border border-meetingmind-gold/30">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Simple, Transparent Pricing</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-meetingmind-bg rounded-lg p-6 text-center border border-gray-700"><h2 className="text-xl font-bold text-white mb-2">Free</h2><p className="text-3xl font-bold text-meetingmind-gold mb-4">$0</p><ul className="text-gray-400 text-sm space-y-2 mb-6"><li>✓ 10 meetings/month</li><li>✓ 60 min per meeting</li><li>✓ 30-day history</li><li>✓ Basic AI analysis</li></ul><button className="w-full py-2 bg-gray-700 text-white rounded-lg cursor-default">Current Plan</button></div>
          <div className="bg-meetingmind-bg rounded-lg p-6 text-center border-2 border-meetingmind-gold relative"><div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-meetingmind-gold text-black text-xs font-bold px-3 py-1 rounded-full">Most Popular</div><h2 className="text-xl font-bold text-white mb-2">Pro</h2><p className="text-3xl font-bold text-meetingmind-gold mb-4">$9<span className="text-sm text-gray-400">/month</span></p><ul className="text-gray-400 text-sm space-y-2 mb-6"><li>✓ 100 meetings/month</li><li>✓ 240 min per meeting</li><li>✓ 1-year history</li><li>✓ Meeting Coach</li><li>✓ Slack + Calendar</li><li>✓ Export to Notion/Asana</li></ul><button className="w-full py-2 bg-meetingmind-gold text-black font-semibold rounded-lg hover:bg-yellow-600 transition">Upgrade to Pro</button></div>
          <div className="bg-meetingmind-bg rounded-lg p-6 text-center border border-gray-700"><h2 className="text-xl font-bold text-white mb-2">Business</h2><p className="text-3xl font-bold text-meetingmind-gold mb-4">$29<span className="text-sm text-gray-400">/month</span></p><ul className="text-gray-400 text-sm space-y-2 mb-6"><li>✓ Unlimited meetings</li><li>✓ Unlimited history</li><li>✓ Team members</li><li>✓ Priority support</li><li>✓ API access</li><li>✓ SOC2 compliance</li></ul><button className="w-full py-2 bg-meetingmind-gold text-black font-semibold rounded-lg hover:bg-yellow-600 transition">Upgrade to Business</button></div>
        </div>
      </div>
    </div>
  )
}
