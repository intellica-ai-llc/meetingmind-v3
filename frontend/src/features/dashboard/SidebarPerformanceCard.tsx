import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { TrendChart } from '@/components/ui/TrendChart'

export function SidebarPerformanceCard() {
  const [avgScore, setAvgScore] = useState<number | null>(null)
  const [sparklineData, setSparklineData] = useState<{ date: string; value: number }[]>([])

  useEffect(() => {
    api.get('/dashboard/kpi').then(res => {
      const { avgScore, recentScores } = res.data
      setAvgScore(avgScore)
      if (recentScores && recentScores.length) {
        setSparklineData(
          recentScores.map((val: number, i: number) => ({
            date: `${i}`,
            value: val,
          }))
        )
      }
    }).catch(() => {})
  }, [])

  const percent = avgScore ? Math.round(avgScore * 10) : 0

  return (
    <div style={{
      margin: '12px 16px',
      padding: 14,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--mm-text-primary)', marginBottom: 4 }}>Keep Improving</div>
      <div style={{ fontSize: 11, color: 'var(--mm-text-muted)', marginBottom: 10 }}>You're on a roll!</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--mm-success)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: 'var(--mm-text-primary)',
          boxShadow: '0 0 8px rgba(52,211,153,0.3)',
          flexShrink: 0,
        }}>
          {percent}%
        </div>
        {sparklineData.length > 1 && (
          <div style={{ flex: 1 }}>
            <TrendChart data={sparklineData} color="var(--mm-success)" height={36} width={80} />
          </div>
        )}
      </div>
    </div>
  )
}