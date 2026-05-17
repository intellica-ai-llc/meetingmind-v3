import { Hono } from 'hono'
import Groq from 'groq-sdk'

const app = new Hono()

// ── Optimized system prompt – proportional, always‑on, no refusal ──
const SYSTEM_PROMPT = `You are an expert meeting analyst. You will receive a transcript of a conversation (in English) and must produce a JSON object with the exact keys listed below.

CORE RULES:
1. **Write a summary whose length is proportional to the transcript.**  
   - Very short (a few lines) → 1‑3 sentence summary.  
   - Short (under 500 words) → 4‑6 sentence summary.  
   - Medium (500‑1500 words) → 8‑15 sentence summary.  
   - Long (over 1500 words) → 15‑25 sentence summary covering all major themes, decisions, and context.  
   Let the transcript length guide you.

2. **Base everything strictly on the transcript.** Do not invent decisions, action items, quotes, or any data. If a field has no supporting content, return an empty array [] or appropriate empty value.

3. **Always produce a valid JSON output.** Even if the transcript is minimal, garbled, or contains only a few words, write the best possible summary with what you can understand. If you truly cannot extract any meaning, set "summary" to "The transcript was too brief or unclear to analyze." but still fill the other keys with empty arrays/neutral values.

4. **Be precise and specific.** Include names, numbers, deadlines, and direct quotes whenever they appear in the transcript.

KEYS (with types and examples):
- "summary": string (proportional, see Rule 1)
- "decisions": string[] – e.g. ["Launch on Friday (Alice)"]
- "action_items": { "task": string, "owner": string, "deadline": string, "priority": "High"|"Medium"|"Low" }[] – tasks assigned during the meeting
- "open_questions": string[] – unanswered questions
- "parking_lot": string[] – topics deferred for later
- "key_topics": string[] – main subjects discussed
- "key_quotes": { "quote": string, "speaker": string }[] – notable statements
- "sentiment": "Positive"|"Neutral"|"Mixed"|"Tense"
- "sentiment_reason": string – one sentence explaining sentiment
- "effectiveness_score": integer 0‑10 – 0 = unproductive, 10 = extremely productive
- "effectiveness_reason": string – one sentence justifying score
- "next_agenda": string[] – suggested items for next meeting
- "risk_flags": string[] – potential blockers or risks mentioned
- "meeting_type": "standup"|"planning"|"review"|"decision"|"brainstorm"|"other"

Return ONLY the JSON object, no other text.`

// ── Transcript length threshold for two‑pass extraction (optimization, not a gate) ──
const LONG_TRANSCRIPT_THRESHOLD = 6000 // characters (~1500 words)

// ── Summarisation helper for long transcripts ──
async function summarizeTranscript(groq: Groq, transcript: string): Promise<string> {
  const prompt = `The following is a long meeting transcript. Create a detailed, structured summary in bullet points that captures all key topics, decisions, action items, risks, and notable quotes. Keep the summary under 1000 words.\n\nTRANSCRIPT:\n${transcript}`
  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
  })
  return resp.choices[0].message.content?.trim() || transcript
}

// ── Light validation – only retry if the output is clearly broken (missing summary) ──
function isOutputCrippled(result: any): boolean {
  // If summary is empty or the default placeholder, consider it crippled
  return !result || typeof result.summary !== 'string' || result.summary.trim() === '' || result.summary === 'No summary available.'
}

// ── Core extraction (with optional retry for crippled output) ──
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

  // On retry, inject a stronger reminder
  if (retryCount > 0) {
    messages.splice(1, 0, {
      role: 'system',
      content: 'CRITICAL: Your previous output was incomplete. Please re‑read the transcript carefully and produce a fully populated JSON object. Ensure the summary is a meaningful paragraph, not a placeholder.',
    })
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    response_format: { type: 'json_object' },
    max_tokens: 4000,
  })

  const raw = response.choices[0].message.content
  console.log(`Groq raw response (attempt ${retryCount + 1}):`, raw?.substring(0, 500))

  const result = JSON.parse(raw)

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

  const { utterances, speaker_map, meeting_context } = await c.req.json()
  const namedLines = utterances.map((utt: any) =>
    `${speaker_map[utt.speaker] || `Speaker ${utt.speaker}`}: ${utt.text}`
  )
  const namedTranscript = namedLines.join('\n')
  if (!namedTranscript.trim()) return c.json({ error: 'Transcript is empty. Cannot analyze.' })

  // Debug logs (harmless)
  console.log('Transcript length:', namedTranscript.length)
  console.log('Transcript preview:', namedTranscript.substring(0, 300))

  try {
    // Optional two‑pass for very long transcripts (improves extraction quality)
    let finalTranscript = namedTranscript
    if (namedTranscript.length > LONG_TRANSCRIPT_THRESHOLD) {
      console.log('Transcript exceeds threshold; summarizing first.')
      try {
        finalTranscript = await summarizeTranscript(groq, namedTranscript)
        console.log('Summarisation complete, length:', finalTranscript.length)
      } catch (err) {
        console.error('Summarisation failed, using full transcript.', err)
        finalTranscript = namedTranscript   // fallback to original
      }
    }

    // First extraction attempt
    let result = await extractWithRetry(groq, finalTranscript, meeting_context)

    // If the output is crippled (e.g., summary still placeholder), retry once
    if (isOutputCrippled(result)) {
      console.log('First extraction crippled, retrying...')
      try {
        result = await extractWithRetry(groq, finalTranscript, meeting_context, 1)
      } catch (retryErr) {
        console.error('Retry failed:', retryErr)
        // keep the crippled result rather than throwing
      }
    }

    return c.json(result)
  } catch (error: any) {
    console.error('Analysis pipeline error:', error)
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