import { Hono } from 'hono'
import Groq from 'groq-sdk'

const app = new Hono()

// ── System prompt – multilingual, length‑adaptive, anti‑hallucination ──
const SYSTEM_PROMPT = `You are an expert meeting analyst and translator.
Your task is to read the transcript of a meeting or conversation and produce a JSON object with exactly the following keys.

CORE RULES:
1. **Detect the language** of the transcript. Respond in THAT SAME LANGUAGE for all text fields (summary, decisions, quotes, etc.).
2. **Never invent information.** Every decision, action item, quote, and risk must be traceable to something actually said. If the transcript is garbled, unintelligible, or in a language you cannot understand, set "summary" to "Transcript could not be analyzed" and leave all arrays empty.
3. **Summary length must match the transcript length.** For a short meeting (under 500 words), a 5‑8 sentence summary is enough. For a long meeting (over 1500 words), write a comprehensive summary of 15‑25 sentences covering all major themes, decisions, and context. Use your judgment.
4. **Be precise and detailed.** Include names, specific decisions, numbers, and quotes where possible.

KEY DEFINITIONS:
- "summary": A thorough, proportional summary (see rule 3).
- "decisions": Array of strings, each a clear decision and who made it.
- "action_items": Array of objects with "task", "owner", "deadline" (or "none"), "priority" (High/Medium/Low). If none, [].
- "open_questions": Array of strings.
- "parking_lot": Array of strings (deferred topics).
- "key_topics": Array of strings.
- "key_quotes": Array of objects with "quote" and "speaker".
- "sentiment": "Positive", "Neutral", "Mixed", or "Tense".
- "sentiment_reason": One sentence explaining sentiment.
- "effectiveness_score": Integer 0‑10.
- "effectiveness_reason": One sentence justifying score.
- "next_agenda": Array of strings (suggested next‑meeting topics).
- "risk_flags": Array of strings (potential blockers/risks mentioned).
- "meeting_type": "standup", "planning", "review", "decision", "brainstorm", or "other".

Return ONLY the JSON object, no other text.`

// ── Transcript length threshold for two‑pass extraction ──
const LONG_TRANSCRIPT_THRESHOLD = 6000 // characters (~1500 words)

// ── Summarisation helper (first pass for long transcripts) ──
async function summarizeTranscript(groq: Groq, transcript: string): Promise<string> {
  const prompt = `The following is a long meeting transcript. Create a detailed, structured summary in bullet points that captures all key topics, decisions, action items, risks, and notable quotes. Keep the summary under 1000 words.\n\nTRANSCRIPT:\n${transcript}`
  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
  })
  return resp.choices[0].message.content?.trim() || transcript
}

// ── Validation ──
function isValidExtraction(parsed: any): boolean {
  if (!parsed || typeof parsed.summary !== 'string' || parsed.summary.trim() === '' || parsed.summary === 'Transcript could not be analyzed.') return false
  if (typeof parsed.effectiveness_score !== 'number' || parsed.effectiveness_score < 0 || parsed.effectiveness_score > 10) return false
  const allowedSentiments = ['Positive', 'Neutral', 'Mixed', 'Tense']
  if (!allowedSentiments.includes(parsed.sentiment)) return false
  return true
}

// ── Main extraction (with optional retry) ──
async function extract(
  groq: Groq,
  transcript: string,
  meetingContext: any,
  retry = false
): Promise<Record<string, any>> {
  const title = meetingContext?.title || 'Untitled Meeting'
  const date = meetingContext?.date || 'Date not specified'

  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Meeting Title: ${title}\nMeeting Date: ${date}\n\nTRANSCRIPT:\n${transcript}` },
  ]
  if (retry) {
    messages.splice(1, 0, {
      role: 'system',
      content: 'CRITICAL: Your previous response was incomplete or invalid. Re‑read the transcript and produce a fully populated JSON object with every key properly filled.',
    })
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    response_format: { type: 'json_object' },
    max_tokens: 4000,
  })

  const raw = response.choices[0].message.content
  console.log('Groq raw response:', raw?.substring(0, 500))

  const result = JSON.parse(raw)

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

  const { utterances, speaker_map, meeting_context } = await c.req.json()
  const namedLines = utterances.map((utt: any) =>
    `${speaker_map[utt.speaker] || `Speaker ${utt.speaker}`}: ${utt.text}`
  )
  const namedTranscript = namedLines.join('\n')
  if (!namedTranscript.trim()) return c.json({ error: 'Transcript is empty. Cannot analyze.' })

  console.log('Transcript length:', namedTranscript.length)
  console.log('Transcript preview:', namedTranscript.substring(0, 300))

  try {
    // Two‑pass for very long transcripts
    let finalTranscript = namedTranscript
    if (namedTranscript.length > LONG_TRANSCRIPT_THRESHOLD) {
      console.log('Transcript exceeds threshold; summarizing first.')
      try {
        finalTranscript = await summarizeTranscript(groq, namedTranscript)
        console.log('Summarisation complete, length:', finalTranscript.length)
      } catch (err) {
        console.error('Summarisation failed, using full transcript.', err)
      }
    }

    // First extraction attempt
    let result = await extract(groq, finalTranscript, meeting_context)

    // Retry if invalid
    if (!isValidExtraction(result)) {
      console.log('First extraction invalid, retrying...')
      result = await extract(groq, finalTranscript, meeting_context, true)
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