import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-meetingmind-bg flex items-center justify-center p-4">
      <div className="bg-meetingmind-card rounded-xl p-8 w-full max-w-md border border-meetingmind-gold/30">
        <div className="text-center mb-8"><h1 className="text-3xl font-bold text-white mb-2">MeetingMind</h1><p className="text-gray-400">Sign in to your account</p></div>
        {error && <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4"><p className="text-red-500 text-sm">{error}</p></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-meetingmind-bg border border-gray-700 rounded-lg text-white focus:outline-none focus:border-meetingmind-gold" required /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-meetingmind-bg border border-gray-700 rounded-lg text-white focus:outline-none focus:border-meetingmind-gold" required /></div>
          <button type="submit" disabled={loading} className="w-full py-2 bg-meetingmind-gold text-black font-semibold rounded-lg hover:bg-yellow-600 transition disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p className="text-center text-gray-400 mt-4">Don't have an account? <Link to="/register" className="text-meetingmind-gold hover:underline">Sign up</Link></p>
      </div>
    </div>
  )
}
