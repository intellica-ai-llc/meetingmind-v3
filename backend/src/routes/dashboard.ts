import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

// ── Existing stats (unchanged) ──────────────────────────
app.get('/stats', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const userId = user.id

  const { count: totalMeetings } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { data: meetings } = await supabase
    .from('meetings')
    .select('effectiveness_score')
    .eq('user_id', userId)
    .not('effectiveness_score', 'is', null)

  const avgScore = meetings?.length
    ? Math.round(meetings.reduce((sum, m) => sum + (m.effectiveness_score || 0), 0) / meetings.length * 10) / 10
    : null

  const { count: openTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'pending')

  const { count: unresolvedThreads } = await supabase
    .from('unresolved_threads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'open')

  return c.json({
    totalMeetings: totalMeetings || 0,
    avgScore,
    openTasks: openTasks || 0,
    unresolvedThreads: unresolvedThreads || 0,
  })
})

// ── KPI + insights (extended) ───────────────────────────
app.get('/kpi', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const userId = user.id

  // Last 5 meetings for sparkline & trends — ordered by meeting_date, not created_at
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .order('meeting_date', { ascending: false })
    .limit(5)

  if (!meetings || meetings.length === 0) {
    return c.json({
      overallScore: null, talkRatio: null, sentiment: null, engagementRate: null,
      avgScore: null, recentScores: [],
      insights: { actionItems: 0, keyTopics: 0, openQuestions: 0, risks: 0 },
    })
  }

  const latest = meetings[0]
  const previous = meetings.length > 1 ? meetings[1] : null

  // Overall Score
  const overallScore = latest.effectiveness_score ?? null
  const scoreTrend = (overallScore !== null && previous?.effectiveness_score != null)
    ? Math.round((overallScore - previous.effectiveness_score) * 10) / 10
    : null

  // Sentiment
  const sentiment = latest.sentiment ?? null
  const sentimentTrend = (sentiment && previous?.sentiment)
    ? (sentiment === previous.sentiment ? '→' : (sentiment === 'Positive' ? '↑' : '↓'))
    : null

  // Engagement (decisions + actions + questions per hour)
  const engagementPoints = (latest.decisions?.length || 0) + (latest.action_items?.length || 0) + (latest.open_questions?.length || 0)
  const duration = latest.duration_minutes || 1
  const engagementRate = Math.round((engagementPoints / duration) * 60 * 10) / 10

  let previousEngagementRate = null
  if (previous) {
    const prevPoints = (previous.decisions?.length || 0) + (previous.action_items?.length || 0) + (previous.open_questions?.length || 0)
    const prevDuration = previous.duration_minutes || 1
    previousEngagementRate = Math.round((prevPoints / prevDuration) * 60 * 10) / 10
  }
  const engagementTrend = (engagementRate !== null && previousEngagementRate !== null)
    ? Math.round((engagementRate - previousEngagementRate) * 10) / 10
    : null

  // Sidebar sparkline data (last 5 scores, oldest first)
  const recentScores = [...meetings].reverse().map(m => m.effectiveness_score).filter(s => s !== null) as number[]

  // Average across all meetings (for sidebar card)
  const { data: allScores } = await supabase
    .from('meetings')
    .select('effectiveness_score')
    .eq('user_id', userId)
    .not('effectiveness_score', 'is', null)

  const avgScore = allScores?.length
    ? Math.round(allScores.reduce((sum, m) => sum + (m.effectiveness_score || 0), 0) / allScores.length * 10) / 10
    : null

  // Key Insights counts from latest meeting
  const insights = {
    actionItems: latest.action_items?.length || 0,
    keyTopics: latest.key_topics?.length || 0,
    openQuestions: latest.open_questions?.length || 0,
    risks: latest.risk_flags?.length || 0,
  }

  return c.json({
    overallScore, scoreTrend,
    talkRatio: null,
    sentiment, sentimentTrend,
    engagementRate, engagementTrend,
    avgScore, recentScores,
    insights,
  })
})

export default app