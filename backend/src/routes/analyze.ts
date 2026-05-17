import { Hono } from 'hono'
import Groq from 'groq-sdk'

const app = new Hono()

// ── Aggressive system prompt – never gives up, extracts fragments ──
const SYSTEM_PROMPT = `You are an expert meeting analyst. You will receive a transcript of a conversation (in English) and must produce a JSON object with the exact keys listed below.

CORE RULES:
1. **Summary length must match transcript volume.**  
   - Very short (a few lines) → 1‑3 sentences.  
   - Short (under 500 words) → 4‑6 sentences.  
   - Medium (500‑1500 words) → 8‑15 sentences.  
   - Long (over 1500 words) → 15‑25 sentences covering all major themes, decisions, context, and nuance.  
   The goal is a complete, self‑contained summary that someone could read instead of the transcript and miss nothing important.

2. **Base everything strictly on the transcript.** Do not invent facts. However, extract **implicit** commitments as well as explicit ones. If a speaker says "I'll do X by Friday", that **is** an action item even if not labelled "action item". Similarly, agreed‑upon directions become decisions. Only leave arrays empty if absolutely nothing of that kind appears.

3. **Always produce a valid JSON object.** Even if the transcript is garbled or extremely short, write the best possible summary and fill other keys with empty arrays or neutral values where truly absent. Never refuse.

4. **If the transcript is mostly unintelligible, write a summary that captures any discernible words or topics.** Do NOT simply state that the transcript is unclear; instead, list any words or fragments you recognised. For example: "Only a few words were intelligible: 'budget', 'deadline', 'Alice'. No full sentences could be understood." Then fill other keys with empty arrays.

5. **Be precise and specific.** Include names, numbers, deadlines, direct quotes, and speaker identifiers when present.

KEYS (with types and examples):
- "summary": string – proportional, see Rule 1.
- "decisions": string[] – e.g. ["Launch on Friday (Alice)", "Switch to PostgreSQL (Bob)"]
- "action_items": { "task": string, "owner": string, "deadline": string, "priority": "High"|"Medium"|"Low" }[]
- "open_questions": string[]
- "parking_lot": string[] – topics deferred for later.
- "key_topics": string[] – main subjects discussed.
- "key_quotes": { "quote": string, "speaker": string }[] – verbatim notable statements.
- "sentiment": "Positive"|"Neutral"|"Mixed"|"Tense"
- "sentiment_reason": string – one sentence explaining the sentiment.
- "effectiveness_score": integer 0‑10 (0 = completely unproductive, 10 = exceptionally productive)
- "effectiveness_reason": string – one sentence justifying the score.
- "next_agenda": string[] – suggested items for the next meeting.
- "risk_flags": string[] – potential blockers, risks, or concerns mentioned.
- "meeting_type": "standup"|"planning"|"review"|"decision"|"brainstorm"|"other"

EXAMPLE OUTPUT (for a short meeting):
{
  "summary": "Alice and Bob discussed the Q3 roadmap. They agreed to push the authentication feature to next sprint. Alice will update the mockups by EOD Friday.",
  "decisions": ["Push authentication to next sprint"],
  "action_items": [
    { "task": "Update mockups", "owner": "Alice", "deadline": "Friday", "priority": "High" }
  ],
  "open_questions": ["Should we use OAuth or SAML?"],
  "parking_lot": ["Office party planning"],
  "key_topics": ["Q3 roadmap", "Authentication module"],
  "key_quotes": [
    { "quote": "We can't delay the mockups any further", "speaker": "Bob" }
  ],
  "sentiment": "Mixed",
  "sentiment_reason": "Progress on roadmap but frustration about auth delays.",
  "effectiveness_score": 7,
  "effectiveness_reason": "Clear decisions and next steps were defined, though some tension.",
  "next_agenda": ["Finalise auth approach", "Review updated mockups"],
  "risk_flags": ["Auth delay could impact Q3 launch"],
  "meeting_type": "planning"
}

Return ONLY the JSON object, no other text.`

const MAX_TRANSCRIPT_LENGTH = 100000

// ── Robust JSON extraction ──────────────────────────────────────────
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

// ── Crippled output detection – now catches lazy/disclaimer summaries ──
function isOutputCrippled(result: Record<string, any>, transcriptLength: number): boolean {
  if (!result || typeof result.summary !== 'string' || result.summary.trim() === '') return true

  const summaryLower = result.summary.toLowerCase()
  const disclaimerPhrases = [
    'incomplete and unclear',
    'too brief or unclear',
    'could not be understood',
    'unintelligible',
    'garbled transcript',
    'cannot analyze',
    'no meaningful',
    'only a few words',
    'unclear transcript',
  ]
  const isDisclaimer = disclaimerPhrases.some(phrase => summaryLower.includes(phrase))

  // If transcript is non‑trivial but the summary is just a disclaimer, it's crippled
  if (transcriptLength > 500 && isDisclaimer) return true

  // Also crippled if too many expected fields are empty
  const criticalEmptyFields = ['decisions', 'action_items', 'key_topics', 'key_quotes']
    .filter(f => !result[f] || (Array.isArray(result[f]) && result[f].length === 0))
  if (transcriptLength > 500 && criticalEmptyFields.length >= 3) return true

  return false
}

// ── Core extraction with retry ──────────────────────────────────────
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
    // Strong nudge: never repeat a disclaimer
    messages.splice(1, 0, {
      role: 'system',
      content: `CRITICAL: Your previous output was a generic disclaimer. You MUST produce a genuine analysis. Even if the transcript is noisy, extract all identifiable words, names, or topics. Do not repeat the disclaimer. Fill all available fields with whatever evidence you find; if none, use empty arrays.`,
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

  return parsed
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

  const transcript = namedLines.join('\n').trim()
  if (!transcript) {
    return c.json({ error: 'Transcript is empty. Cannot analyze.' }, 400)
  }

  console.log('Transcript length:', transcript.length)
  console.log('Transcript preview:', transcript.substring(0, 300))

  if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
    return c.json({ error: 'Transcript too long for a single analysis. Please split into smaller segments.' }, 413)
  }

  try {
    let result = await extractWithRetry(groq, transcript, meeting_context)

    if (isOutputCrippled(result, transcript.length)) {
      console.log('First extraction crippled, retrying with stronger prompt...')
      try {
        result = await extractWithRetry(groq, transcript, meeting_context, 1)
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

// ── Draft email (unchanged) ─────────────────────────────────────────
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

    const emailText = response.choices[0]?.message?.content?.trim()
    if (!emailText) {
      return c.json({ error: 'Email draft was empty.' }, 500)
    }
    return c.json({ email: emailText })
  } catch (error: any) {
    console.error('Draft email error:', error)
    return c.json({ error: 'Email draft failed', message: error?.message || String(error) }, 500)
  }
})

export default app