import { Hono } from 'hono'
import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js' // new
import { requirePlan } from '../middleware/entitlement'

const app = new Hono()

app.post('/analyze', async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })
  
  const { utterances, speaker_map, meeting_context } = await c.req.json()
  const namedLines = utterances.map((utt: any) => `${speaker_map[utt.speaker] || `Speaker ${utt.speaker}`}: ${utt.text}`)
  const namedTranscript = namedLines.join('\n')
  if (!namedTranscript.trim()) return c.json({ error: 'Transcript is empty. Cannot analyze.' })
  const title = meeting_context?.title || 'Untitled Meeting'
  const date = meeting_context?.date || 'Date not specified'
  const prompt = `You are an expert meeting analyst. Meeting Title: ${title}\nMeeting Date: ${date}\n\nReturn ONLY a valid JSON object with exactly these keys: summary, decisions, action_items, open_questions, parking_lot, key_topics, key_quotes, sentiment, sentiment_reason, effectiveness_score, effectiveness_reason, next_agenda, risk_flags, meeting_type.\n\nMEETING TRANSCRIPT:\n${namedTranscript}`
  const response = await groq.chat.completions.create({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, max_tokens: 3000 })
  const raw = response.choices[0].message.content
  try {
    const result = JSON.parse(raw)
    const defaults = { summary: 'No summary available.', decisions: [], action_items: [], open_questions: [], parking_lot: [], key_topics: [], key_quotes: [], sentiment: 'Neutral', sentiment_reason: '', effectiveness_score: 0, effectiveness_reason: '', next_agenda: [], risk_flags: [], meeting_type: 'Other' }
    for (const [key, defaultVal] of Object.entries(defaults)) { if (!(key in result)) result[key] = defaultVal }
    return c.json(result)
  } catch { return c.json({ error: 'Failed to parse extraction response' }, 500) }
})

app.post('/draft-email', async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })
  
  const data = await c.req.json()
  if (!data.summary || data.summary === 'No summary available.') return c.json({ error: 'No meeting data to draft email from.' })
  const toneInstructions: Record<string, string> = { ceo: 'Write for C-suite: bullet points, outcomes only, under 200 words.', client: 'Write for client: warm, relationship-first, commitments not tasks, under 300 words.', team: 'Write for team: casual, direct, action-focused, under 250 words.' }
  const instructions = toneInstructions[data.tone] || toneInstructions.team
  const prompt = `Write a follow-up email.\nTONE: ${instructions}\nSummary: ${data.summary}\nDecisions: ${data.decisions?.join(', ') || 'None'}\nAction Items: ${JSON.stringify(data.action_items)}\nTopics: ${data.key_topics?.join(', ') || 'None'}\n\nReturn only the email text. Include Subject line.`
  const response = await groq.chat.completions.create({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: 1000 })
  const emailText = response.choices[0].message.content?.trim()
  if (!emailText) return c.json({ error: 'Email draft was empty.' })
  return c.json({ email: emailText })
})

// UPGRADED: Multi-Meeting Coach
app.post('/coach', requirePlan('pro'), async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')

  const data = await c.req.json()

  // Fetch last 20 meetings for longitudinal context
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

    // Trend: compare last 5 vs previous 5 (if enough meetings)
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

export default app