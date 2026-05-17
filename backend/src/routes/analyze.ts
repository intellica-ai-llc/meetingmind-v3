import { Hono } from 'hono'
import Groq from 'groq-sdk'

const app = new Hono()

// Original working prompt – no disclaimer forcing
const SYSTEM_PROMPT = `You are an expert meeting analyst and executive assistant.
Analyse the meeting transcript below and extract comprehensive information.
Return ONLY a valid JSON object with exactly these keys.
Do not add any text before or after the JSON.
Do not invent information not present in the transcript.

{
  "summary": "A thorough, paragraph-length summary covering the meeting purpose, key outcomes, and next steps. Length proportional to transcript.",
  "decisions": ["clearly stated decision one", "clearly stated decision two"],
  "action_items": [
    {
      "task": "specific description of what needs to be done",
      "owner": "name of person responsible (or Unassigned if unclear)",
      "deadline": "deadline mentioned (or No deadline if not mentioned)",
      "priority": "High / Medium / Low based on urgency in conversation"
    }
  ],
  "open_questions": ["question raised but NOT resolved", "another unresolved question"],
  "parking_lot": ["topic explicitly deferred to a future meeting", "another deferred topic"],
  "key_topics": ["topic one", "topic two", "topic three"],
  "key_quotes": [
    { "speaker": "name of speaker", "quote": "notable or important thing they said verbatim or near-verbatim" }
  ],
  "sentiment": "Positive / Neutral / Mixed / Tense",
  "sentiment_reason": "one sentence explaining the sentiment rating",
  "effectiveness_score": 7,
  "effectiveness_reason": "one sentence — what worked well and what could improve",
  "next_agenda": [
    "suggested agenda item 1 based on open questions and parking lot",
    "suggested agenda item 2",
    "suggested agenda item 3"
  ],
  "risk_flags": ["anything that sounds like a blocker, concern, dependency, or unresolved risk"],
  "meeting_type": "one of: Planning / Standup / Retrospective / Decision / Brainstorm / Client / 1-on-1 / All-hands / Other"
}`

// ── Robust JSON parsing (prevents crashes) ──────────────────────────
function parseGroqJSON(raw: string | null): Record<string, any> {
  if (!raw) return {}
  try { return JSON.parse(raw) } catch {}
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    try { return JSON.parse(codeBlockMatch[1]) } catch {}
  }
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]) } catch {}
  }
  return {}
}

// ── Only retry if summary is completely empty ───────────────────────
function isOutputCrippled(result: any): boolean {
  return !result || typeof result.summary !== 'string' || result.summary.trim() === '' || result.summary === 'No summary available.'
}

// ── Core extraction with optional retry ─────────────────────────────
async function extractWithRetry(
  groq: Groq,
  transcript: string,
  meetingContext: any,
  retryCount = 0
): Promise<Record<string, any>> {
  const title = meetingContext?.title || 'Untitled Meeting'
  const date = meetingContext?.date || 'Date not specified'

  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Meeting Title: ${title}\nMeeting Date: ${date}\n\nTRANSCRIPT:\n${transcript}` },
  ]

  if (retryCount > 0) {
    messages.splice(1, 0, {
      role: 'system',
      content: 'Your previous output was incomplete. Please read the transcript again and produce a fully populated JSON object.',
    })
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    response_format: { type: 'json_object' },
    max_tokens: 4000,  // original value
  })

  const raw = response.choices[0].message.content
  console.log(`Groq raw response (attempt ${retryCount + 1}):`, raw?.substring(0, 500))

  const result = parseGroqJSON(raw)

  // Fill missing keys with defaults
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

  return result
}

// ── Route handler ──────────────────────────────────────────────────
app.post('/analyze', async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })

  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { utterances, speaker_map = {}, meeting_context = {} } = body

  if (!utterances || !Array.isArray(utterances) || utterances.length === 0) {
    return c.json({ error: 'Transcript is empty. Cannot analyze.' }, 400)
  }

  const namedLines = utterances.map((utt: any) => {
    const name = speaker_map[utt.speaker] || utt.speaker || 'Unknown'
    return `${name}: ${utt.text}`
  })

  const namedTranscript = namedLines.join('\n').trim()
  if (!namedTranscript) {
    return c.json({ error: 'Transcript is empty. Cannot analyze.' }, 400)
  }

  console.log('Transcript length:', namedTranscript.length)
  console.log('Transcript preview:', namedTranscript.substring(0, 300))

  try {
    let result = await extractWithRetry(groq, namedTranscript, meeting_context)

    if (isOutputCrippled(result)) {
      console.log('First extraction crippled, retrying...')
      try {
        result = await extractWithRetry(groq, namedTranscript, meeting_context, 1)
      } catch (retryErr) {
        console.error('Retry failed:', retryErr)
      }
    }

    return c.json(result)
  } catch (error: any) {
    console.error('Analysis pipeline error:', error)
    return c.json({ error: 'Analysis failed', message: error?.message || String(error) }, 500)
  }
})

// ── Draft email (original logic kept) ───────────────────────────────
app.post('/draft-email', async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })

  let data: any
  try {
    data = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  if (!data.summary || data.summary === 'No summary available.') {
    return c.json({ error: 'No meeting data to draft email from.' }, 400)
  }

  const toneInstructions: Record<string, string> = {
    ceo: 'Write for C-suite: bullet points, outcomes only, under 200 words.',
    client: 'Write for client: warm, relationship-first, commitments not tasks, under 300 words.',
    team: 'Write for team: casual, direct, action-focused, under 250 words.',
  }
  const instructions = toneInstructions[data.tone] || toneInstructions.team
  const prompt = `Write a follow-up email.\nTONE: ${instructions}\nSummary: ${data.summary}\nDecisions: ${data.decisions?.join(', ') || 'None'}\nAction Items: ${JSON.stringify(data.action_items)}\nTopics: ${data.key_topics?.join(', ') || 'None'}\n\nReturn only the email text. Include Subject line.`

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    })

    const emailText = response.choices[0].message.content?.trim()
    if (!emailText) return c.json({ error: 'Email draft was empty.' }, 500)
    return c.json({ email: emailText })
  } catch (error: any) {
    console.error('Draft email error:', error)
    return c.json({ error: 'Email draft failed', message: error?.message || String(error) }, 500)
  }
})

export default app