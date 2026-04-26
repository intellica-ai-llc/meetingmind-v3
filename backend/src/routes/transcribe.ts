import { Hono } from 'hono'
import { AssemblyAI } from 'assemblyai'
import { createClient } from '@supabase/supabase-js'
import { acquireJobSlot, releaseJobSlot } from '../services/concurrency'
import { trackUsage } from '../services/usage-tracker'

const app = new Hono()

app.post('/transcribe', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  // 1. Check user's monthly limit
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single()

  const tier = profile?.subscription_tier || 'free'
  const isPaid = (tier === 'pro' || tier === 'business') && profile?.subscription_status === 'active'

  if (!isPaid) {
    const { data: usage } = await supabase
      .from('monthly_usage')
      .select('meetings_count')
      .eq('user_id', user.id)
      .eq('period_start', periodStart)
      .maybeSingle()

    if ((usage?.meetings_count || 0) >= 10) {
      return c.json({
        error: 'Free tier limit reached (10 meetings/month)',
        code: 'USAGE_LIMIT',
      }, 402)
    }
  }

  // 2. Concurrency check
  const slotAcquired = await acquireJobSlot(c.env)
  if (!slotAcquired) {
    return c.json({
      error: 'All servers are currently busy. Upgrade to Pro for priority processing.',
      code: 'CONCURRENCY_LIMIT',
    }, 429)
  }

  try {
    const client = new AssemblyAI({ apiKey: c.env.ASSEMBLYAI_API_KEY })
    const formData = await c.req.formData()
    const audioFile = formData.get('audio') as File
    if (!audioFile) {
      await releaseJobSlot(c.env)
      return c.json({ error: 'No audio file provided' }, 400)
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const transcript = await client.transcripts.submit({
      audio: buffer,
      speaker_labels: true,
      speech_model: 'universal',
      punctuate: true,
      format_text: true,
    })

    return c.json({ job_id: transcript.id })
  } catch (error) {
    await releaseJobSlot(c.env)
    return c.json({ error: 'Transcription failed' }, 500)
  }
})

app.get('/status/:jobId', async (c) => {
  const client = new AssemblyAI({ apiKey: c.env.ASSEMBLYAI_API_KEY })
  const jobId = c.req.param('jobId')
  const transcript = await client.transcripts.get(jobId)

  if (transcript.status === 'error') {
    await releaseJobSlot(c.env)
    return c.json({ status: 'error', message: transcript.error })
  }

  if (transcript.status !== 'completed') return c.json({ status: 'processing' })

  const utterances = transcript.utterances?.map(u => ({
    speaker: u.speaker,
    text: u.text,
    start_ms: u.start,
    end_ms: u.end,
    duration_ms: u.end - u.start,
  })) || []

  const speakers = [...new Set(utterances.map(u => u.speaker))]
  const talkTime: Record<string, any> = {}
  let totalMs = 0
  for (const u of utterances) {
    talkTime[u.speaker] = { ms: (talkTime[u.speaker]?.ms || 0) + u.duration_ms, minutes: 0, percentage: 0 }
    totalMs += u.duration_ms
  }
  for (const speaker in talkTime) {
    talkTime[speaker].minutes = Math.round(talkTime[speaker].ms / 60000 * 10) / 10
    talkTime[speaker].percentage = Math.round((talkTime[speaker].ms / totalMs) * 1000) / 10
  }

  // Release concurrency slot and track usage
  await releaseJobSlot(c.env)

  const user = c.get('user')
  if (user) {
    const durationSeconds = Math.round(totalMs / 1000)
    await trackUsage(c.env, user.id, durationSeconds)
  }

  return c.json({
    status: 'complete',
    utterances,
    speakers,
    confidence: transcript.confidence ? Math.round(transcript.confidence * 1000) / 10 : null,
    talk_time: talkTime,
  })
})

export default app