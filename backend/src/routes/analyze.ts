import { Hono } from 'hono'
import Groq from 'groq-sdk'

const app = new Hono()

// ── System prompt with precise field definitions (no example) ──
const SYSTEM_PROMPT = `You are an expert meeting analyst. Read the transcript and produce a JSON object with exactly these keys. Be thorough, specific, and never omit any key. If there is no data for a key, return an empty array [] or "None" as appropriate.

- "summary": A concise paragraph (3-5 sentences) capturing the main purpose, outcomes, and tone.
- "decisions": An array of strings, each a clear decision made, with who decided if known.
- "action_items": An array of objects, each with "task", "owner", "deadline", "priority" (High/Medium/Low). If none, [].
- "open_questions": Array of strings of unanswered questions.
- "parking_lot": Array of strings of topics deferred for later.
- "key_topics": Array of strings of main subjects discussed.
- "key_quotes": Array of objects with "quote" and "speaker" for notable statements.
- "sentiment": One of "Positive", "Neutral", "Mixed", "Tense".
- "sentiment_reason": A short sentence explaining the sentiment choice.
- "effectiveness_score": Integer 0-10 (0 meaningless, 10 extremely productive).
- "effectiveness_reason": Short justification.
- "next_agenda": Array of strings of suggested agenda items for next meeting.
- "risk_flags": Array of strings describing potential risks or blockers.
- "meeting_type": One of "standup", "planning", "review", "decision", "brainstorm", "other".

Return ONLY the JSON object, no other text.`

app.post('/analyze', async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })

  const { utterances, speaker_map, meeting_context } = await c.req.json()
  const namedLines = utterances.map((utt: any) =>
    `${speaker_map[utt.speaker] || `Speaker ${utt.speaker}`}: ${utt.text}`
  )
  const namedTranscript = namedLines.join('\n')
  if (!namedTranscript.trim()) return c.json({ error: 'Transcript is empty. Cannot analyze.' })

  // Debug logs
  console.log('Transcript length:', namedTranscript.length)
  console.log('Transcript preview:', namedTranscript.substring(0, 300))

  const title = meeting_context?.title || 'Untitled Meeting'
  const date = meeting_context?.date || 'Date not specified'

  const prompt = `Meeting Title: ${title}\nMeeting Date: ${date}\n\nTRANSCRIPT:\n${namedTranscript}`

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
    })

    const raw = response.choices[0].message.content
    console.log('Groq raw response:', raw?.substring(0, 500))

    const result = JSON.parse(raw)

    // Fill missing keys with sane defaults
    const defaults: Record<string, any> = {
      summary: 'No summary available.',
      decisions: [],
      action_items: [],
      open_questions: [],
      parking_lot: [],
      key_topics: [],
      key_quotes: [],
      sentiment: 'Neutral',
      sentiment_reason: '',
      effectiveness_score: 0,
      effectiveness_reason: '',
      next_agenda: [],
      risk_flags: [],
      meeting_type: 'Other',
    }
    for (const [key, defaultVal] of Object.entries(defaults)) {
      if (!(key in result) || result[key] === null || result[key] === undefined) {
        result[key] = defaultVal
      }
    }

    return c.json(result)
  } catch (error: any) {
    console.error('Analysis error:', error)
    return c.json({ error: 'Analysis failed', message: error?.message || String(error) }, 500)
  }
})

// ── Draft email (unchanged) ─────────────────────────────────
app.post('/draft-email', async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })

  const data = await c.req.json()
  if (!data.summary || data.summary === 'No summary available.') return c.json({ error: 'No meeting data to draft email from.' })

  const toneInstructions: Record<string, string> = {
    ceo: 'Write for C-suite: bullet points, outcomes only, under 200 words.',
    client: 'Write for client: warm, relationship-first, commitments not tasks, under 300 words.',
    team: 'Write for team: casual, direct, action-focused, under 250 words.',
  }
  const instructions = toneInstructions[data.tone] || toneInstructions.team
  const prompt = `Write a follow-up email.\nTONE: ${instructions}\nSummary: ${data.summary}\nDecisions: ${data.decisions?.join(', ') || 'None'}\nAction Items: ${JSON.stringify(data.action_items)}\nTopics: ${data.key_topics?.join(', ') || 'None'}\n\nReturn only the email text. Include Subject line.`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  })

  const emailText = response.choices[0].message.content?.trim()
  if (!emailText) return c.json({ error: 'Email draft was empty.' })
  return c.json({ email: emailText })
})

export default app