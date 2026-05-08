import { Hono } from 'hono'
import Groq from 'groq-sdk'

const app = new Hono()

// ── System prompt with field definitions & one-shot example ──
const SYSTEM_PROMPT = `You are an expert meeting analyst. Your task is to read the given meeting transcript and produce a JSON object with exactly the following keys. Be thorough, specific, and never omit any key. If there is no data for a key, return an empty array [] or "None" as appropriate.

Key definitions:
- "summary": A concise paragraph (3-5 sentences) capturing the main purpose, outcomes, and tone.
- "decisions": An array of strings, each a clear decision made, with who decided if known.
- "action_items": An array of objects, each with "task", "owner" (name), "deadline" (date or "none"), "priority" (High/Medium/Low). If none, [].
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

// One‑shot example to set tone and completeness
const EXAMPLE_USER = `TRANSCRIPT:
Alice: Let's finalize the launch plan. Target is end of next week.
Bob: Backend is ready. Only blocker is the payment gateway – need one more day to test. Confident by Wednesday.
Carol: Marketing is good. Email drafted, social posts scheduled. Waiting on final feature list from Bob.
Alice: Decision: launch Friday if gateway passes Wednesday. Bob owns that. Carol, send announcement Thursday morning once Bob gives green light.`

const EXAMPLE_ASSISTANT = `{
  "summary": "The team aligned on the product launch schedule, aiming for end of next week. The sole blocker is the payment gateway testing, which Bob expects to complete by Wednesday. A conditional decision was made to launch on Friday if testing succeeds, with clear ownership and communication steps.",
  "decisions": [
    "Launch on Friday if payment gateway testing passes by Wednesday (Alice, Bob)",
    "Carol to send the announcement email Thursday morning after Bob confirms"
  ],
  "action_items": [
    { "task": "Complete payment gateway testing", "owner": "Bob", "deadline": "Wednesday", "priority": "High" },
    { "task": "Send announcement email", "owner": "Carol", "deadline": "Thursday morning", "priority": "High" }
  ],
  "open_questions": [],
  "parking_lot": [],
  "key_topics": ["Launch timeline", "Payment gateway testing", "Marketing readiness"],
  "key_quotes": [
    { "quote": "If the gateway passes Wednesday, we launch Friday.", "speaker": "Alice" }
  ],
  "sentiment": "Positive",
  "sentiment_reason": "The team is confident and proactive, with only one manageable blocker.",
  "effectiveness_score": 9,
  "effectiveness_reason": "Clear decisions, assigned owners, and concrete next steps.",
  "next_agenda": ["Post-launch review", "Rollback plan discussion"],
  "risk_flags": ["Payment gateway testing delay could push launch"],
  "meeting_type": "standup"
}`

// ── Transcript length threshold for two‑pass extraction ──
const LONG_TRANSCRIPT_THRESHOLD = 6000 // characters; ~1000 words / 10 min

// ── Validation rules ──
function isValidExtraction(parsed: any): boolean {
  if (!parsed || typeof parsed.summary !== 'string' || parsed.summary.trim() === '' || parsed.summary === 'No summary available.') return false
  if (typeof parsed.effectiveness_score !== 'number' || parsed.effectiveness_score < 0 || parsed.effectiveness_score > 10) return false
  const allowedSentiments = ['Positive', 'Neutral', 'Mixed', 'Tense']
  if (!allowedSentiments.includes(parsed.sentiment)) return false
  return true
}

// ── Main extraction logic, callable with retry ──
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
    { role: 'user', content: EXAMPLE_USER },
    { role: 'assistant', content: EXAMPLE_ASSISTANT },
    { role: 'user', content: `Meeting Title: ${title}\nMeeting Date: ${date}\n\nTRANSCRIPT:\n${transcript}` },
  ]

  // If retrying, inject a stern reminder
  if (retryCount > 0) {
    messages.splice(3, 0, {
      role: 'system',
      content: 'CRITICAL: Your previous response was incomplete or invalid. Re-read the transcript carefully and produce a fully populated JSON object with every key properly filled. Do NOT leave summary empty or use placeholder text.',
    })
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    response_format: { type: 'json_object' },
    max_tokens: 4000, // enough for full extraction
  })

  const raw = response.choices[0].message.content
  try {
    const parsed = JSON.parse(raw)
    // Fill missing keys with benign defaults
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
      if (!(key in parsed) || parsed[key] === null || parsed[key] === undefined) {
        parsed[key] = defaultVal
      }
    }
    return parsed
  } catch (parseErr) {
    console.error('Failed to parse Groq extraction response:', parseErr, 'Raw:', raw)
    throw new Error('Failed to parse extraction response')
  }
}

// ── Summarisation helper (for long transcripts) ──
async function summarizeTranscript(groq: Groq, transcript: string): Promise<string> {
  const prompt = `Summarize the following meeting transcript into concise, structured bullet points covering all key topics, decisions, action items, risks, and notable quotes. Keep the summary under 500 words.\n\nTRANSCRIPT:\n${transcript}`
  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  })
  return resp.choices[0].message.content?.trim() || transcript // fallback to original
}

// ── Route handler ──────────────────────────────────────────────────
app.post('/analyze', async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })

  const { utterances, speaker_map, meeting_context } = await c.req.json()
  const namedLines = utterances.map((utt: any) =>
    `${speaker_map[utt.speaker] || `Speaker ${utt.speaker}`}: ${utt.text}`
  )
  const namedTranscript = namedLines.join('\n')
  if (!namedTranscript.trim()) return c.json({ error: 'Transcript is empty. Cannot analyze.' })

  try {
    // Two‑pass for long transcripts
    let finalTranscript = namedTranscript
    if (namedTranscript.length > LONG_TRANSCRIPT_THRESHOLD) {
      console.log(`Transcript length ${namedTranscript.length} exceeds threshold; summarizing first.`)
      try {
        finalTranscript = await summarizeTranscript(groq, namedTranscript)
        console.log('Summarisation complete, length:', finalTranscript.length)
      } catch (sumErr) {
        console.error('Summarisation failed, continuing with full transcript:', sumErr)
        // proceed with original transcript
      }
    }

    // First extraction attempt
    let result = await extractWithRetry(groq, finalTranscript, meeting_context)

    // If invalid, retry once
    if (!isValidExtraction(result)) {
      console.log('First extraction invalid, retrying with stricter prompt...')
      result = await extractWithRetry(groq, finalTranscript, meeting_context, 1)
    }

    return c.json(result)
  } catch (error: any) {
    console.error('Analysis pipeline error:', error)
    return c.json({
      error: 'Analysis failed',
      message: error?.message || String(error),
    }, 500)
  }
})

// ── Draft email (unchanged for now) ─────────────────────────────────
app.post('/draft-email', async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })

  const data = await c.req.json()
  if (!data.summary || data.summary === 'No summary available.') {
    return c.json({ error: 'No meeting data to draft email from.' })
  }

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