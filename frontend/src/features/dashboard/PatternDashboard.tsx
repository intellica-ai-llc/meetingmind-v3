import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Pattern { id: string; pattern_type: string; baseline_value: number; current_trend: number; confidence_score: number; sample_size: number }

export function PatternDashboard() {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { const fetchPatterns = async () => { try { const response = await api.get('/patterns'); setPatterns(response.data.patterns) } catch (error) { console.error('Failed to fetch patterns:', error) } finally { setLoading(false) } }; fetchPatterns() }, [])

  if (loading) return <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6"><div className="animate-pulse space-y-4"><div className="h-6 bg-gray-700 rounded w-1/2"></div><div className="space-y-2"><div className="h-4 bg-gray-700 rounded"></div><div className="h-4 bg-gray-700 rounded w-3/4"></div></div></div></div>

  const effectivenessPattern = patterns.find(p => p.pattern_type === 'effectiveness')
  const completionPattern = patterns.find(p => p.pattern_type === 'completion_rate')

  return (
    <div className="bg-meetingmind-card rounded-xl border border-gray-800 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Your Patterns</h2>
      {effectivenessPattern && effectivenessPattern.sample_size >= 10 ? (
        <div className="space-y-4">
          <div className="bg-meetingmind-bg rounded-lg p-4"><div className="flex justify-between items-center mb-2"><span className="text-gray-400">Effectiveness Trend</span><span className={`text-sm ${effectivenessPattern.current_trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>{effectivenessPattern.current_trend >= 0 ? '↑' : '↓'} {Math.abs(effectivenessPattern.current_trend).toFixed(1)}</span></div><div className="text-2xl font-bold text-white mb-1">{effectivenessPattern.baseline_value.toFixed(1)}/10</div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-meetingmind-gold h-2 rounded-full" style={{ width: `${effectivenessPattern.baseline_value * 10}%` }} /></div><p className="text-gray-500 text-xs mt-2">Based on {effectivenessPattern.sample_size} meetings</p></div>
          {completionPattern && (<div className="bg-meetingmind-bg rounded-lg p-4"><div className="flex justify-between items-center mb-2"><span className="text-gray-400">Task Completion Rate</span><span className={`text-sm ${completionPattern.current_trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>{completionPattern.current_trend >= 0 ? '↑' : '↓'} {Math.abs(completionPattern.current_trend).toFixed(1)}%</span></div><div className="text-2xl font-bold text-white mb-1">{completionPattern.baseline_value.toFixed(0)}%</div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${completionPattern.baseline_value}%` }} /></div></div>)}
        </div>
      ) : (
        <div className="text-center py-8"><p className="text-gray-400 mb-2">Not enough data yet</p><p className="text-sm text-gray-500">Record {10 - (effectivenessPattern?.sample_size || 0)} more meetings to see your patterns</p><div className="w-full bg-gray-700 rounded-full h-2 mt-4"><div className="bg-meetingmind-gold h-2 rounded-full transition-all" style={{ width: `${((effectivenessPattern?.sample_size || 0) / 10) * 100}%` }} /></div></div>
      )}
    </div>
  )
}
