import { Hono } from 'hono'
import Groq from 'groq-sdk'

const app = new Hono()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_1! })

app.post('/analyze', async (c) => {
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

app.post('/coach', async (c) => {
  const data = await c.req.json()
  const prompt = `You are a meeting coach. Provide actionable advice.\nMeeting type: ${data.meeting_type}\nScore: ${data.effectiveness_score}/10\nReason: ${data.effectiveness_reason}\nSentiment: ${data.sentiment}\nAction items: ${data.action_items?.length || 0}\nOpen questions: ${data.open_questions?.length || 0}\nRisks: ${data.risk_flags?.length || 0}\n\nReturn ONLY JSON: {"headline": "...", "top_strength": "...", "top_improvement": "...", "agenda_suggestion": [...], "facilitation_tips": [...], "score_to_beat": "..."}`
  const response = await groq.chat.completions.create({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, max_tokens: 800 })
  const raw = response.choices[0].message.content
  try { return c.json(JSON.parse(raw)) } catch { return c.json({ error: 'Failed to parse coach response.' }) }
})

export default app
