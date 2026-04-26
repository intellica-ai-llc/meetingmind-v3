import { createClient } from '@supabase/supabase-js'

export default {
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

    // Step 1: get every distinct user_id that has at least one meeting
    const { data: userIds } = await supabase
      .from('meetings')
      .select('user_id', { count: 'exact', head: false })
      .not('user_id', 'is', null)

    if (!userIds || userIds.length === 0) {
      console.log('No meetings in the database yet.')
      return
    }

    const distinctUsers = [...new Set(userIds.map((m) => m.user_id))]
    console.log(`Intelligence engine processing ${distinctUsers.length} users`)

    for (const userId of distinctUsers) {
      // Step 2: fetch the 20 most recent meetings for this user
      const { data: meetings } = await supabase
        .from('meetings')
        .select('id, effectiveness_score, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!meetings || meetings.length < 2) continue // need at least 2 meetings for any trend

      // Step 3: compute aggregate metrics
      const scores = meetings
        .filter((m) => m.effectiveness_score != null)
        .map((m) => m.effectiveness_score as number)
      const avgEffectiveness =
        scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
          : null

      // Decision velocity: meetings per week over the observed period
      const dates = meetings.map((m) => new Date(m.created_at).getTime()).sort()
      const totalDays = dates.length > 1
        ? (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)
        : 7
      const meetingsPerWeek = Math.round((meetings.length / (totalDays / 7)) * 100) / 100

      // Sentiment trend placeholder — we'll enrich this when sentiment data is stored in meetings
      const sentimentTrend = 'neutral'

      // Step 4: upsert intelligence_patterns
      await supabase.from('intelligence_patterns').upsert(
        {
          user_id: userId,
          avg_effectiveness: avgEffectiveness,
          decision_velocity: meetingsPerWeek,
          sentiment_trend: sentimentTrend,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

      // Step 5: create/update intelligence_risks placeholder
      await supabase.from('intelligence_risks').upsert(
        {
          user_id: userId,
          risk_frequency: {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    }

    console.log('Intelligence engine run complete.')
  },
}