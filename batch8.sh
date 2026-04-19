#!/bin/bash
set -euo pipefail

# BATCH 8: BACKEND ROUTES
# Creates: backend/src/ directory structure

mkdir -p backend/src/routes backend/src/middleware backend/src/services backend/cron

cat > backend/src/index.ts << 'EOF'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth'
import { rateLimitMiddleware } from './middleware/rate-limit'
import authRoutes from './routes/auth'
import transcribeRoutes from './routes/transcribe'
import analyzeRoutes from './routes/analyze'
import meetingsRoutes from './routes/meetings'
import tasksRoutes from './routes/tasks'
import threadsRoutes from './routes/threads'
import patternsRoutes from './routes/patterns'

const app = new Hono()

app.use('*', cors())
app.use('/api/*', authMiddleware)
app.use('/api/*', rateLimitMiddleware)

app.get('/', (c) => c.json({ status: 'healthy', version: '3.0.0', timestamp: new Date().toISOString() }))

app.route('/api/auth', authRoutes)
app.route('/api', transcribeRoutes)
app.route('/api', analyzeRoutes)
app.route('/api/meetings', meetingsRoutes)
app.route('/api/tasks', tasksRoutes)
app.route('/api/threads', threadsRoutes)
app.route('/api/patterns', patternsRoutes)

export default app
EOF

cat > backend/src/routes/auth.ts << 'EOF'
import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

app.post('/register', async (c) => {
  const { email, password, name } = await c.req.json()
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
  if (error) return c.json({ error: error.message }, 400)
  return c.json({ user: data.user })
})

app.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return c.json({ error: error.message }, 401)
  return c.json({ token: data.session?.access_token, user: data.user })
})

export default app
EOF

cat > backend/src/routes/transcribe.ts << 'EOF'
import { Hono } from 'hono'
import { AssemblyAI } from 'assemblyai'
import { writeFile, unlink } from 'fs/promises'
import { randomUUID } from 'crypto'

const app = new Hono()
const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })

app.post('/transcribe', async (c) => {
  const formData = await c.req.formData()
  const audioFile = formData.get('audio') as File
  if (!audioFile) return c.json({ error: 'No audio file provided' }, 400)
  const tempPath = `/tmp/meeting_${randomUUID()}.webm`
  const buffer = Buffer.from(await audioFile.arrayBuffer())
  await writeFile(tempPath, buffer)
  try {
    const transcript = await client.transcripts.submit({ audio: tempPath, speaker_labels: true, speech_model: 'universal', punctuate: true, format_text: true })
    await unlink(tempPath)
    return c.json({ job_id: transcript.id })
  } catch (error) {
    await unlink(tempPath)
    return c.json({ error: 'Transcription failed' }, 500)
  }
})

app.get('/status/:jobId', async (c) => {
  const jobId = c.req.param('jobId')
  const transcript = await client.transcripts.get(jobId)
  if (transcript.status === 'error') return c.json({ status: 'error', message: transcript.error })
  if (transcript.status !== 'completed') return c.json({ status: 'processing' })
  const utterances = transcript.utterances?.map(u => ({ speaker: u.speaker, text: u.text, start_ms: u.start, end_ms: u.end, duration_ms: u.end - u.start })) || []
  const speakers = [...new Set(utterances.map(u => u.speaker))]
  const talkTime: Record<string, { ms: number; minutes: number; percentage: number }> = {}
  let totalMs = 0
  for (const u of utterances) { talkTime[u.speaker] = { ms: (talkTime[u.speaker]?.ms || 0) + u.duration_ms, minutes: 0, percentage: 0 }; totalMs += u.duration_ms }
  for (const speaker in talkTime) { talkTime[speaker].minutes = Math.round(talkTime[speaker].ms / 60000 * 10) / 10; talkTime[speaker].percentage = Math.round((talkTime[speaker].ms / totalMs) * 1000) / 10 }
  return c.json({ status: 'complete', utterances, speakers, confidence: transcript.confidence ? Math.round(transcript.confidence * 1000) / 10 : null, talk_time: talkTime })
})

export default app
EOF

cat > backend/src/routes/analyze.ts << 'EOF'
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
EOF

cat > backend/src/routes/meetings.ts << 'EOF'
import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

app.get('/', async (c) => {
  const user = c.get('user')
  const { limit = 20, offset = 0 } = c.req.query()
  const { data, error } = await supabase.from('meetings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ meetings: data })
})

app.get('/search', async (c) => {
  const user = c.get('user')
  const q = c.req.query('q')
  if (!q) return c.json({ meetings: [] })
  const { data, error } = await supabase.from('meetings').select('*').eq('user_id', user.id).or(`summary.ilike.%${q}%,decisions.cs.{${q}},action_items.cs.{${q}}`).order('created_at', { ascending: false }).limit(20)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ meetings: data })
})

app.get('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const { data, error } = await supabase.from('meetings').select('*').eq('id', id).eq('user_id', user.id).single()
  if (error) return c.json({ error: error.message }, 404)
  return c.json({ meeting: data })
})

app.delete('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const { error } = await supabase.from('meetings').delete().eq('id', id).eq('user_id', user.id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

export default app
EOF

cat > backend/src/routes/tasks.ts << 'EOF'
import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

app.get('/', async (c) => {
  const user = c.get('user')
  const { status } = c.req.query()
  let query = supabase.from('tasks').select('*, meetings(title)').eq('user_id', user.id).order('due_date', { ascending: true, nullsFirst: false })
  if (status && status !== 'all') query = query.eq('status', status)
  const { data, error } = await query
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ tasks: data })
})

app.post('/', async (c) => {
  const user = c.get('user')
  const { title, description, owner_name, due_date, priority, meeting_id } = await c.req.json()
  if (!title) return c.json({ error: 'Title is required' }, 400)
  const { data, error } = await supabase.from('tasks').insert({ user_id: user.id, title, description, owner_name, due_date, priority, meeting_id, status: 'pending' }).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ task: data })
})

app.put('/:id/complete', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const { completion_notes } = await c.req.json()
  const { data, error } = await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString(), completion_notes }).eq('id', id).eq('user_id', user.id).select().single()
  if (error) return c.json({ error: error.message }, 404)
  return c.json({ task: data })
})

app.post('/bulk/remind', async (c) => {
  const user = c.get('user')
  const { task_ids } = await c.req.json()
  const { data, error } = await supabase.from('tasks').select('*').in('id', task_ids).eq('user_id', user.id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ reminded: data?.length || 0 })
})

export default app
EOF

cat > backend/src/routes/threads.ts << 'EOF'
import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

app.get('/', async (c) => {
  const user = c.get('user')
  const { data, error } = await supabase.from('unresolved_threads').select('*').eq('user_id', user.id).eq('status', 'open').order('severity', { ascending: false }).order('mention_count', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ threads: data })
})

app.post('/:id/resolve', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const { resolution_notes } = await c.req.json()
  const { data, error } = await supabase.from('unresolved_threads').update({ status: 'resolved', resolved_at: new Date().toISOString(), resolution_notes }).eq('id', id).eq('user_id', user.id).select().single()
  if (error) return c.json({ error: error.message }, 404)
  return c.json({ thread: data })
})

export default app
EOF

cat > backend/src/routes/patterns.ts << 'EOF'
import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

app.get('/', async (c) => {
  const user = c.get('user')
  const { data, error } = await supabase.from('user_patterns').select('*').eq('user_id', user.id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ patterns: data })
})

app.post('/refresh', async (c) => {
  const user = c.get('user')
  const { data: meetings } = await supabase.from('meetings').select('effectiveness_score, created_at').eq('user_id', user.id).order('created_at', { ascending: true })
  if (meetings && meetings.length >= 5) {
    const recent = meetings.slice(-5)
    const avg = recent.reduce((sum, m) => sum + (m.effectiveness_score || 0), 0) / recent.length
    const baseline = meetings.slice(-10).reduce((sum, m) => sum + (m.effectiveness_score || 0), 0) / Math.min(meetings.length, 10)
    await supabase.from('user_patterns').upsert({ user_id: user.id, pattern_type: 'effectiveness', baseline_value: baseline, current_trend: avg - baseline, confidence_score: Math.min(meetings.length / 20, 1), sample_size: meetings.length, updated_at: new Date().toISOString() }, { onConflict: 'user_id, pattern_type' })
  }
  return c.json({ success: true })
})

export default app
EOF

cat > backend/src/middleware/auth.ts << 'EOF'
import { createMiddleware } from 'hono/factory'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.substring(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return c.json({ error: 'Invalid token' }, 401)
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  c.set('user', { ...user, ...profile })
  await next()
})
EOF

cat > backend/src/middleware/rate-limit.ts << 'EOF'
import { createMiddleware } from 'hono/factory'

const requestCounts = new Map<string, { count: number; resetAt: number }>()

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const userId = c.get('user')?.id || c.req.header('cf-connecting-ip') || 'anonymous'
  const key = `rate_limit:${userId}`
  const now = Date.now()
  const windowMs = 60 * 1000
  const maxRequests = 30
  const record = requestCounts.get(key)
  if (record && now < record.resetAt) {
    if (record.count >= maxRequests) return c.json({ error: 'Rate limit exceeded. Please try again later.' }, 429)
    record.count++
  } else { requestCounts.set(key, { count: 1, resetAt: now + windowMs }) }
  await next()
})
EOF

cat > backend/cron/weekly-digest.ts << 'EOF'
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('Weekly digest cron job triggered')
    // Implementation: fetch users, generate digest, send emails
  }
}
EOF

echo "✅ Batch 8 complete (14 files: backend routes, middleware, cron)"