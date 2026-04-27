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

      // 1. Per‑user pattern aggregation (existing logic)
      const { data: userIds } = await supabase
        .from('meetings')
        .select('user_id')
        .not('user_id', 'is', null)

      if (userIds) {
        const distinctUsers = [...new Set(userIds.map((m: any) => m.user_id))]
        console.log(`Intelligence engine processing ${distinctUsers.length} users`)

        for (const userId of distinctUsers) {
          const { data: meetings } = await supabase
            .from('meetings')
            .select('effectiveness_score, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

          if (!meetings || meetings.length < 2) continue

          const scores = meetings
            .filter((m: any) => m.effectiveness_score != null)
            .map((m: any) => m.effectiveness_score as number)
          const avgEffectiveness = scores.length
            ? Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10
            : null

          const dates = meetings.map((m: any) => new Date(m.created_at).getTime()).sort()
          const totalDays = dates.length > 1
            ? (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)
            : 7
          const meetingsPerWeek = Math.round((meetings.length / (totalDays / 7)) * 100) / 100

          await supabase.from('intelligence_patterns').upsert(
            { user_id: userId, avg_effectiveness: avgEffectiveness, decision_velocity: meetingsPerWeek, sentiment_trend: 'neutral', updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )

          await supabase.from('intelligence_risks').upsert(
            { user_id: userId, risk_frequency: {}, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
        }
      }

      // 2. Initiative health snapshots (NEW)
      const { data: allInitiatives } = await supabase
        .from('initiatives')
        .select('id, user_id')

      if (allInitiatives && allInitiatives.length) {
        for (const initiative of allInitiatives) {
          // Fetch memberships for this initiative
          const { data: members } = await supabase
            .from('initiative_memberships')
            .select('meeting_id, task_id, thread_id')
            .eq('initiative_id', initiative.id)

          const meetingIds = members?.filter(m => m.meeting_id).map(m => m.meeting_id) || []
          const taskIds = members?.filter(m => m.task_id).map(m => m.task_id) || []
          const threadIds = members?.filter(m => m.thread_id).map(m => m.thread_id) || []

          let avgEffectiveness = null
          let openTasks = 0
          let unresolvedThreads = 0
          let riskFreq: Record<string, number> = {}

          if (meetingIds.length) {
            const { data: meetings } = await supabase
              .from('meetings')
              .select('effectiveness_score, risk_flags')
              .in('id', meetingIds)
              .eq('user_id', initiative.user_id)

            if (meetings) {
              const scores = meetings.filter(m => m.effectiveness_score != null).map(m => m.effectiveness_score)
              avgEffectiveness = scores.length
                ? Math.round((scores.reduce((a,b) => a+b, 0) / scores.length) * 10) / 10
                : null

              meetings.forEach(m => {
                (m.risk_flags || []).forEach((r: string) => {
                  riskFreq[r] = (riskFreq[r] || 0) + 1
                })
              })
            }
          }

          if (taskIds.length) {
            const { count } = await supabase
              .from('tasks')
              .select('*', { count: 'exact', head: true })
              .in('id', taskIds)
              .neq('status', 'completed')
            openTasks = count || 0
          }

          if (threadIds.length) {
            const { count } = await supabase
              .from('unresolved_threads')
              .select('*', { count: 'exact', head: true })
              .in('id', threadIds)
              .eq('status', 'open')
            unresolvedThreads = count || 0
          }

          // Determine health status
          let healthStatus = 'healthy'
          if (unresolvedThreads >= 5 || Object.keys(riskFreq).length >= 3) healthStatus = 'at_risk'
          if (unresolvedThreads >= 10 || Object.values(riskFreq).some(v => v >= 5)) healthStatus = 'critical'

          // Upsert health snapshot
          await supabase.from('initiative_health_snapshots').upsert({
            initiative_id: initiative.id,
            avg_effectiveness: avgEffectiveness,
            open_tasks_count: openTasks,
            unresolved_threads_count: unresolvedThreads,
            risk_frequency: riskFreq,
            snapshot_date: today,
          }, { onConflict: 'initiative_id, snapshot_date' })

          // Update the initiative's health_status
          await supabase.from('initiatives').update({ health_status: healthStatus }).eq('id', initiative.id)
        }
      }

      // Mark as processed
      await env.MEETING_JOBS.put(lastRunKey, today)
      console.log('Intelligence engine run complete (patterns + initiative health).')
    }
  },
}