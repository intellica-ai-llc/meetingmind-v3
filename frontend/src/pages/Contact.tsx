export function Contact() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-gray-400 mb-10">We're here to help.</p>

        <div className="bg-[#13131f] border border-gray-800 rounded-xl p-8 max-w-md mx-auto mb-8">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-semibold text-white mb-2">Email Us</h2>
          <a href="mailto:intellicaai.ai@gmail.com" className="text-purple-400 hover:underline text-lg">intellicaai.ai@gmail.com</a>
          <p className="text-gray-500 text-sm mt-3">We respond within 24 hours on business days.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          <div className="bg-[#13131f] border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">💬 Support</h3>
            <p className="text-gray-400 text-sm">Account issues, billing questions, or technical help.</p>
          </div>
          <div className="bg-[#13131f] border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">🛡️ Legal</h3>
            <p className="text-gray-400 text-sm">Privacy requests, data deletion, or terms questions.</p>
          </div>
          <div className="bg-[#13131f] border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">🚀 Sales</h3>
            <p className="text-gray-400 text-sm">Business plan inquiries or partnership opportunities.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
