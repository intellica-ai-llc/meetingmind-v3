import { createClient } from '@supabase/supabase-js'
import { pollCalendarEvents } from '../services/calendar'

export default {
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    // ── Calendar auto‑ingestion (every 15 minutes) ──
    await pollCalendarEvents(env)

    // ── Nightly intelligence engine (only once per day) ──
    const today = new Date().toISOString().split('T')[0]
    const lastRunKey = 'last_intelligence_run'
    const lastRun = await env.MEETING_JOBS.get(lastRunKey)

    if (lastRun !== today) {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

      // 1. Get distinct user IDs that have meetings
      const { data: userIds } = await supabase
        .from('meetings')
        .select('user_id')
        .not('user_id', 'is', null)

      if (userIds) {
        const distinctUsers = [...new Set(userIds.map((m: any) => m.user_id))]
        console.log(`Intelligence engine processing ${distinctUsers.length} users`)

        for (const userId of distinctUsers) {
          // 2. Fetch last 20 meetings for this user
          const { data: meetings } = await supabase
            .from('meetings')
            .select('effectiveness_score, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

          if (!meetings || meetings.length < 2) continue

          // 3. Compute aggregate metrics
          const scores = meetings
            .filter((m: any) => m.effectiveness_score != null)
            .map((m: any) => m.effectiveness_score as number)
          const avgEffectiveness = scores.length
            ? Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10
            : null

          // Decision velocity: meetings per week over observed period
          const dates = meetings.map((m: any) => new Date(m.created_at).getTime()).sort()
          const totalDays =
            dates.length > 1
              ? (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)
              : 7
          const meetingsPerWeek =
            Math.round((meetings.length / (totalDays / 7)) * 100) / 100

          // 4. Upsert patterns
          await supabase.from('intelligence_patterns').upsert(
            {
              user_id: userId,
              avg_effectiveness: avgEffectiveness,
              decision_velocity: meetingsPerWeek,
              sentiment_trend: 'neutral',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )

          // 5. Upsert risks placeholder
          await supabase.from('intelligence_risks').upsert(
            {
              user_id: userId,
              risk_frequency: {},
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
        }
      }

      // Mark today as processed
      await env.MEETING_JOBS.put(lastRunKey, today)
      console.log('Intelligence engine run complete.')
    }
  },
}