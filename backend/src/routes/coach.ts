import { Hono } from 'hono'
import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'
import { requirePlan } from '../middleware/entitlement'

const app = new Hono()

// ── Multi‑Meeting Coach (moved from analyze) ────────────────
app.post('/coach', requirePlan('pro'), async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')

  const data = await c.req.json()

  const { data: meetings } = await supabase
    .from('meetings')
    .select('effectiveness_score, effectiveness_reason, sentiment, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  let historicalContext = ''
  if (meetings && meetings.length >= 2) {
    const scores = meetings
      .filter(m => m.effectiveness_score != null)
      .map(m => m.effectiveness_score as number)
    const avgHistorical = scores.length
      ? Math.round((scores.reduce((a,b) => a+b,0) / scores.length) * 10) / 10
      : null

    const last5 = meetings.slice(0,5).filter(m => m.effectiveness_score != null).map(m => m.effectiveness_score as number)
    const prev5 = meetings.slice(5,10).filter(m => m.effectiveness_score != null).map(m => m.effectiveness_score as number)
    const avgLast5 = last5.length ? last5.reduce((a,b)=>a+b,0)/last5.length : null
    const avgPrev5 = prev5.length ? prev5.reduce((a,b)=>a+b,0)/prev5.length : null
    const trend = (avgLast5 !== null && avgPrev5 !== null) ? (avgLast5 - avgPrev5) : null

    historicalContext = `Historical data (last ${meetings.length} meetings):
- Average effectiveness: ${avgHistorical !== null ? avgHistorical+'/10' : 'N/A'}
- Recent trend (last 5 vs previous 5): ${trend !== null ? (trend >= 0 ? '+' : '') + trend.toFixed(1) + ' points' : 'insufficient data'}
- Number of meetings analyzed: ${meetings.length}`
  }

  const prompt = `You are a meeting coach. Provide actionable advice.

${historicalContext}

Current meeting details:
- Type: ${data.meeting_type || 'Other'}
- Score: ${data.effectiveness_score}/10
- Reason: ${data.effectiveness_reason || 'Not provided'}
- Sentiment: ${data.sentiment || 'Neutral'}
- Action Items: ${data.action_items?.length || 0}
- Open Questions: ${data.open_questions?.length || 0}
- Risks: ${data.risk_flags?.length || 0}

Return ONLY a valid JSON object with these keys:
"headline" (string, a concise one-line summary of the coaching insight),
"top_strength" (string),
"top_improvement" (string),
"agenda_suggestion" (array of strings, suggestions for next meeting's agenda),
"facilitation_tips" (array of strings, 2-3 tips for the facilitator),
"score_to_beat" (string, e.g., "7.5/10 — your average last month was 6.8").`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 800,
  })

  const raw = response.choices[0].message.content
  try {
    return c.json(JSON.parse(raw))
  } catch {
    return c.json({ error: 'Failed to parse coach response.' })
  }
})

// ── Get trend data for coaching charts ─────────────────────
app.get('/coach/trends', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')

  const { data: meetings } = await supabase
    .from('meetings')
    .select('effectiveness_score, decision_velocity, sentiment, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(20)

  const trends = (meetings || []).map(m => ({
    date: m.created_at,
    effectiveness: m.effectiveness_score ?? null,
    decision_velocity: m.decision_velocity ?? null,
    sentiment: m.sentiment ?? 'Neutral',
  }))

  return c.json({ trends })
})

// ── Ask the Coach (free‑form, with longitudinal context) ────
app.post('/coach/ask', requirePlan('pro'), async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')

  const { question } = await c.req.json()
  if (!question) return c.json({ error: 'Question is required' }, 400)

  // Get last 20 meetings for context
  const { data: meetings } = await supabase
    .from('meetings')
    .select('title, summary, effectiveness_score, decisions, action_items, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const context = meetings?.length
    ? meetings.map(m => `Meeting: ${m.title}\nScore: ${m.effectiveness_score}/10\nSummary: ${m.summary}`).join('\n---\n')
    : 'No meeting history yet.'

  const prompt = `You are an executive meeting coach. Use the following historical meeting data to answer the user's question. Provide concise, actionable advice.

Meeting History:
${context}

User Question: ${question}

Answer in a clear, direct paragraph. Return ONLY the answer text, no JSON.`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
  })

  const answer = response.choices[0].message.content?.trim() || 'No answer generated.'
  return c.json({ answer })
})

// ── Meeting Type Breakdown ────────────────────────────────
app.get('/coach/breakdown', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')

  // Fetch last 30 meetings (enough to group by type)
  const { data: meetings } = await supabase
    .from('meetings')
    .select('meeting_type, effectiveness_score, duration_minutes, decisions, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  if (!meetings || meetings.length === 0) return c.json({ breakdown: [] })

  // Group by meeting_type
  const groups: Record<string, any[]> = {}
  for (const m of meetings) {
    const type = m.meeting_type || 'Other'
    if (!groups[type]) groups[type] = []
    groups[type].push(m)
  }

  const breakdown = Object.entries(groups).map(([type, items]) => {
    const scores = items.filter(m => m.effectiveness_score != null).map(m => m.effectiveness_score)
    const avgScore = scores.length
      ? Math.round((scores.reduce((a,b) => a+b, 0) / scores.length) * 10) / 10
      : null

    const durations = items.filter(m => m.duration_minutes != null).map(m => m.duration_minutes)
    const avgDuration = durations.length
      ? Math.round(durations.reduce((a,b) => a+b, 0) / durations.length)
      : null

    const totalDecisions = items.reduce((sum, m) => sum + (m.decisions?.length || 0), 0)
    const avgDecisions = items.length ? Math.round((totalDecisions / items.length) * 10) / 10 : null

    // Trend: compare last 3 vs previous 3 (if enough meetings of this type)
    const sorted = [...items].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const last3 = sorted.slice(0,3).filter(m => m.effectiveness_score != null).map(m => m.effectiveness_score)
    const prev3 = sorted.slice(3,6).filter(m => m.effectiveness_score != null).map(m => m.effectiveness_score)
    const avgLast3 = last3.length ? last3.reduce((a,b) => a+b, 0) / last3.length : null
    const avgPrev3 = prev3.length ? prev3.reduce((a,b) => a+b, 0) / prev3.length : null
    let trend: string = '→'
    if (avgLast3 !== null && avgPrev3 !== null) {
      if (avgLast3 > avgPrev3) trend = '↑'
      else if (avgLast3 < avgPrev3) trend = '↓'
    }

    return {
      meeting_type: type,
      meetings_count: items.length,
      avg_score: avgScore,
      avg_duration: avgDuration,
      avg_decisions: avgDecisions,
      trend,
    }
  })

  // Sort by count desc
  breakdown.sort((a,b) => b.meetings_count - a.meetings_count)

  return c.json({ breakdown })
})

export default app