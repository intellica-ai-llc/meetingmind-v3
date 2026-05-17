import { Hono } from 'hono'
import Groq from 'groq-sdk'

const app = new Hono()

const SYSTEM_PROMPT = `You are an expert meeting analyst and executive assistant.
Analyse the meeting transcript below and extract comprehensive information.
Return ONLY a valid JSON object with exactly these keys.
Do not add any text before or after the JSON.
Do not invent information not present in the transcript.

{
  "summary": "A thorough, paragraph-length summary covering the meeting purpose, key outcomes, and next steps. Length should be proportional to the transcript.",
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

const MAX_TRANSCRIPT_LENGTH = 100000

function parseGroqJSON(raw: string | null): Record<string, any> {
  if (!raw) return {}
  try { return JSON.parse(raw) } catch {}
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) { try { return JSON.parse(codeBlockMatch[1]) } catch {} }
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (jsonMatch) { try { return JSON.parse(jsonMatch[0]) } catch {} }
  return {}
}

function isOutputCrippled(result: Record<string, any>, transcriptLength: number): boolean {
  if (!result || typeof result.summary !== 'string' || result.summary.trim() === '') return true
  // If the transcript is substantial but the summary is still the placeholder, retry
  if (transcriptLength > 500 && result.summary === 'No summary available.') return true
  return false
}

async function extractWithRetry(
  groq: Groq,
  transcript: string,
  meetingContext: any,
  retryCount = 0
): Promise<{ result: Record<string, any>; retries: number }> {
  const title = meetingContext?.title || 'Untitled Meeting'
  const date = meetingContext?.date || 'Date not specified'

  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Meeting Title: ${title}\nMeeting Date: ${date}\n\nTRANSCRIPT:\n${transcript}` },
  ]

  if (retryCount > 0) {
    messages.splice(1, 0, {
      role: 'system',
      content: 'CRITICAL: Your previous output was incomplete. Please read the transcript again and produce a fully populated JSON. Do not return a generic placeholder summary.',
    })
  }

  const estimatedTokens = Math.min(8000, Math.max(2000, Math.ceil(transcript.length / 2)))
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    response_format: { type: 'json_object' },
    max_tokens: estimatedTokens,
  })

  const raw = response.choices[0]?.message?.content || ''
  console.log(`Groq raw response (attempt ${retryCount + 1}):`, raw?.substring(0, 500))

  const parsed = parseGroqJSON(raw)

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
    effectiveness_score: null,
    effectiveness_reason: '',
    next_agenda: [],
    risk_flags: [],
    meeting_type: null,
  }

  for (const [key, defaultVal] of Object.entries(defaults)) {
    if (!(key in parsed) || parsed[key] === null || parsed[key] === undefined) {
      parsed[key] = defaultVal
    }
  }

  if (parsed.effectiveness_score !== null && typeof parsed.effectiveness_score !== 'number') {
    parsed.effectiveness_score = null
  }

  return { result: parsed, retries: retryCount }
}

app.post('/analyze', async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })

  let body: any
  try { body = await c.req.json() } catch { return c.json({ error: 'Invalid JSON body' }, 400) }

  const { utterances, speaker_map = {}, meeting_context = {} } = body
  if (!utterances || !Array.isArray(utterances) || utterances.length === 0) {
    return c.json({ error: 'Transcript is empty. Cannot analyze.' }, 400)
  }

  const namedLines = utterances.map((utt: any) => {
    const name = speaker_map[utt.speaker] || utt.speaker || 'Unknown'
    return `${name}: ${utt.text}`
  })

  const transcript = namedLines.join('\n').trim()
  if (!transcript) return c.json({ error: 'Transcript is empty. Cannot analyze.' }, 400)

  console.log('Transcript length:', transcript.length)
  console.log('Transcript preview:', transcript.substring(0, 300))

  if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
    return c.json({ error: 'Transcript too long for a single analysis.' }, 413)
  }

  try {
    let { result, retries } = await extractWithRetry(groq, transcript, meeting_context)

    if (isOutputCrippled(result, transcript.length)) {
      console.log('First extraction crippled, retrying...')
      const retry = await extractWithRetry(groq, transcript, meeting_context, 1)
      result = retry.result
      retries = retry.retries
    }

    return c.json({ ...result, analysis_meta: { retries_attempted: retries } })
  } catch (error: any) {
    console.error('Analysis pipeline error:', error)
    return c.json({ error: 'Analysis failed', message: error?.message || String(error) }, 500)
  }
})

app.post('/draft-email', async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })

  let data: any
  try { data = await c.req.json() } catch { return c.json({ error: 'Invalid JSON body' }, 400) }

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

    const emailText = response.choices[0]?.message?.content?.trim()
    if (!emailText) return c.json({ error: 'Email draft was empty.' }, 500)
    return c.json({ email: emailText })
  } catch (error: any) {
    console.error('Draft email error:', error)
    return c.json({ error: 'Email draft failed', message: error?.message || String(error) }, 500)
  }
})

export default app