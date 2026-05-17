import { Hono } from 'hono'
import { AssemblyAI } from 'assemblyai'
import { createClient } from '@supabase/supabase-js'
import { acquireJobSlot, releaseJobSlot } from '../services/concurrency'
import { trackUsage } from '../services/usage-tracker'
import { sendSlackSummary } from '../services/slack'

const app = new Hono()

// ---------------------------------------------------------------------------
// POST /transcribe — submit audio file, get job_id
// ---------------------------------------------------------------------------
app.post('/transcribe', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  let slotAcquired = false

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

    // ---------- 1. Monthly usage limit (free tier) ----------
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single()

    const tier = profile?.subscription_tier || 'free'
    const isPaid =
      (tier === 'pro' || tier === 'business') &&
      profile?.subscription_status === 'active'

    if (!isPaid) {
      const { data: usage } = await supabase
        .from('monthly_usage')
        .select('meetings_count')
        .eq('user_id', user.id)
        .eq('period_start', periodStart)
        .maybeSingle()

      if ((usage?.meetings_count || 0) >= 10) {
        return c.json(
          {
            error: 'Free tier limit reached (10 meetings/month)',
            code: 'USAGE_LIMIT',
          },
          402
        )
      }
    }

    // ---------- 2. Concurrency slot ----------
    slotAcquired = await acquireJobSlot(c.env)
    if (!slotAcquired) {
      return c.json(
        {
          error: 'All servers are currently busy. Upgrade to Pro for priority processing.',
          code: 'CONCURRENCY_LIMIT',
        },
        429
      )
    }

    // ---------- 3. Parse request ----------
    const formData = await c.req.formData()
    const audioFile = formData.get('audio') as File
    if (!audioFile) {
      await releaseJobSlot(c.env) // release slot before error
      return c.json({ error: 'No audio file provided' }, 400)
    }

    // Optional keyterms (JSON array or comma-separated)
    const keytermsRaw = formData.get('keyterms')
    let keyterms: string[] | undefined
    if (keytermsRaw && typeof keytermsRaw === 'string') {
      try {
        keyterms = JSON.parse(keytermsRaw)
        if (!Array.isArray(keyterms)) keyterms = [keytermsRaw]
      } catch {
        keyterms = keytermsRaw
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
      }
    }

    // ---------- 4. Submit to AssemblyAI ----------
    const blob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type || 'audio/webm',
    })
    const client = new AssemblyAI({ apiKey: c.env.ASSEMBLYAI_API_KEY })

    const transcript = await client.transcripts.submit({
      audio: blob,
      speaker_labels: true,
      speech_models: ['universal'],
      language_code: 'en',
      punctuate: true,
      format_text: true,
      ...(keyterms && keyterms.length ? { keyterms } : {}),
    })

    return c.json({ job_id: transcript.id })
  } catch (error: any) {
    // Release slot if it was acquired (only on failure before job completes)
    if (slotAcquired) await releaseJobSlot(c.env)

    console.error('Transcription submission failed:', error)
    return c.json(
      {
        error: 'Transcription failed',
        message: error?.message || String(error),
      },
      500
    )
  }
})

// ---------------------------------------------------------------------------
// GET /status/:jobId — poll job status, return full structured result
// ---------------------------------------------------------------------------
app.get('/status/:jobId', async (c) => {
  try {
    const client = new AssemblyAI({ apiKey: c.env.ASSEMBLYAI_API_KEY })
    const jobId = c.req.param('jobId')
    const transcript = await client.transcripts.get(jobId)

    // ---------- Error state ----------
    if (transcript.status === 'error') {
      await releaseJobSlot(c.env)
      return c.json({ status: 'error', message: transcript.error })
    }

    // ---------- Still processing ----------
    if (transcript.status !== 'completed') {
      return c.json({ status: 'processing' })
    }

    // ---------- Build utterances safely ----------
    const rawUtterances = transcript.utterances || []
    const utterances = rawUtterances
      .filter((u: any) => u.text && u.text.trim().length > 0) // remove empty
      .map((u: any) => ({
        speaker: u.speaker || 'Unknown',
        text: u.text.trim(),
        start_ms: u.start || 0,
        end_ms: u.end || 0,
        duration_ms: Math.max(0, (u.end || 0) - (u.start || 0)),
        confidence: typeof u.confidence === 'number' ? Math.round(u.confidence * 100) / 100 : null,
      }))

    // ---------- Talk time per speaker ----------
    const speakers = [...new Set(utterances.map((u) => u.speaker))]
    const talkTime: Record<string, any> = {}
    let totalMs = 0

    for (const u of utterances) {
      talkTime[u.speaker] = talkTime[u.speaker] || { ms: 0, minutes: 0, percentage: 0 }
      talkTime[u.speaker].ms += u.duration_ms
      totalMs += u.duration_ms
    }

    for (const speaker in talkTime) {
      talkTime[speaker].minutes =
        Math.round((talkTime[speaker].ms / 60000) * 10) / 10
      talkTime[speaker].percentage =
        totalMs > 0
          ? Math.round((talkTime[speaker].ms / totalMs) * 1000) / 10
          : 0
    }

    // ---------- Overall confidence ----------
    const confidence = transcript.confidence
      ? Math.round(transcript.confidence * 1000) / 10
      : null

    // ---------- Release slot & usage tracking ----------
    await releaseJobSlot(c.env)

    const user = c.get('user')
    if (user) {
      const durationSeconds = Math.round(totalMs / 1000)
      await trackUsage(c.env, user.id, durationSeconds)

      try {
        await sendSlackSummary(
          c.env,
          user.id,
          'Meeting Processed',
          'Your meeting has been processed successfully.',
          []
        )
      } catch (err) {
        console.error('Slack notification failed:', err)
      }
    }

    // ---------- Return complete result ----------
    return c.json({
      status: 'complete',
      utterances,
      speakers,
      confidence,
      talk_time: talkTime,
      // Additional raw text for fallback / downstream usage
      full_text: transcript.text || '',
      // Metadata
      audio_duration_seconds: transcript.audio_duration || 0,
      language: transcript.language_code || 'en',
    })
  } catch (error: any) {
    console.error('Status check failed:', error)
    return c.json(
      {
        error: 'Status check failed',
        message: error?.message || String(error),
      },
      500
    )
  }
})

export default app