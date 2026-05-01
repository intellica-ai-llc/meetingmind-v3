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

// ── New KPI endpoint (for wireframe panels) ─────────────
app.get('/kpi', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const userId = user.id

  // Fetch last 2 meetings for trend comparison
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(2)

  if (!meetings || meetings.length === 0) {
    return c.json({ overallScore: null, talkRatio: null, sentiment: null, engagement: null })
  }

  const latest = meetings[0]
  const previous = meetings.length > 1 ? meetings[1] : null

  // ── Overall Score ──
  const overallScore = latest.effectiveness_score ?? null
  const scoreTrend = (overallScore !== null && previous?.effectiveness_score != null)
    ? Math.round((overallScore - previous.effectiveness_score) * 10) / 10
    : null

  // ── Talk Ratio ──
  // Compute from stored talk_time if available (front‑end sends it as part of analysis)
  // If not stored, we can estimate from action_items vs total items.
  // For now we look for a dedicated column; if absent we return null.
  const talkRatio = null   // placeholder – we can use a stored value if we decide to store talk_time per meeting

  // ── Sentiment ──
  const sentiment = latest.sentiment ?? null
  const sentimentTrend = (sentiment && previous?.sentiment)
    ? (sentiment === previous.sentiment ? '→' : (sentiment === 'Positive' ? '↑' : '↓'))
    : null

  // ── Engagement ──
  // Compute as (decisions + action_items + open_questions) / duration_minutes, then relative to previous meeting
  const engagementPoints = (latest.decisions?.length || 0) + (latest.action_items?.length || 0) + (latest.open_questions?.length || 0)
  const duration = latest.duration_minutes || 1
  const engagementRate = Math.round((engagementPoints / duration) * 60 * 10) / 10   // per hour

  let previousEngagementRate = null
  if (previous) {
    const prevPoints = (previous.decisions?.length || 0) + (previous.action_items?.length || 0) + (previous.open_questions?.length || 0)
    const prevDuration = previous.duration_minutes || 1
    previousEngagementRate = Math.round((prevPoints / prevDuration) * 60 * 10) / 10
  }

  const engagementTrend = (engagementRate !== null && previousEngagementRate !== null)
    ? Math.round((engagementRate - previousEngagementRate) * 10) / 10
    : null

  return c.json({
    overallScore,
    scoreTrend,
    talkRatio,
    sentiment,
    sentimentTrend,
    engagementRate,
    engagementTrend,
  })
})

export default app