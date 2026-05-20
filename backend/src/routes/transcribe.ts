import { Hono } from 'hono'
import { AssemblyAI } from 'assemblyai'
import { createClient } from '@supabase/supabase-js'
import { acquireJobSlot, releaseJobSlot } from '../services/concurrency'
import { trackUsage } from '../services/usage-tracker'
import { sendSlackSummary } from '../services/slack'

const app = new Hono()

app.post('/transcribe', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  let slotAcquired = false

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

    // 1. Monthly usage limit
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

    // 2. Concurrency slot
    slotAcquired = await acquireJobSlot(c.env)
    if (!slotAcquired) {
      return c.json({
        error: 'All servers are currently busy. Upgrade to Pro for priority processing.',
        code: 'CONCURRENCY_LIMIT',
      }, 429)
    }

    // 3. Parse audio file and optional keyterms
    const formData = await c.req.formData()
    const audioFile = formData.get('audio') as File
    if (!audioFile) {
      await releaseJobSlot(c.env)
      return c.json({ error: 'No audio file provided' }, 400)
    }

    // Fix missing extension
    let filename = audioFile.name || 'recording.webm'
    const contentType = audioFile.type || ''
    if (!filename.includes('.')) {
      if (contentType.includes('webm')) filename = 'recording.webm'
      else if (contentType.includes('mp4') || contentType.includes('m4a')) filename = 'recording.m4a'
      else if (contentType.includes('mp3') || contentType.includes('mpeg')) filename = 'recording.mp3'
      else filename = 'recording.webm'
    }

    const audioBuffer = await audioFile.arrayBuffer()
    const fixedFile = new File([audioBuffer], filename, { type: contentType })

    // Optional keyterms
    const keytermsRaw = formData.get('keyterms')
    let keyterms: string[] | undefined
    if (keytermsRaw && typeof keytermsRaw === 'string') {
      try {
        keyterms = JSON.parse(keytermsRaw)
        if (!Array.isArray(keyterms)) keyterms = [keytermsRaw]
      } catch {
        keyterms = keytermsRaw.split(',').map(k => k.trim()).filter(k => k.length)
      }
    }

    // ===== Phase 9: Store raw audio in R2 =====
    let audioR2Key = ''
    if (c.env.MEETING_AUDIO) {
      const ext = filename.split('.').pop() || 'webm'
      audioR2Key = `audio/${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`
      try {
        await c.env.MEETING_AUDIO.put(audioR2Key, audioBuffer, {
          httpMetadata: { contentType: fixedFile.type },
        })
      } catch (err) {
        console.error('R2 upload failed (non-fatal):', err)
        audioR2Key = ''
      }
    }

    // 4. Submit to AssemblyAI
    const client = new AssemblyAI({ apiKey: c.env.ASSEMBLYAI_API_KEY })
    const transcript = await client.transcripts.submit({
      audio: fixedFile,
      speaker_labels: true,
      speech_models: ['universal'],
      language_code: 'en',
      punctuate: true,
      format_text: true,
      ...(keyterms && keyterms.length ? { keyterms } : {}),
    })

    return c.json({
      job_id: transcript.id,
      audio_r2_key: audioR2Key || null,
    })
  } catch (error: any) {
    if (slotAcquired) await releaseJobSlot(c.env)
    console.error('Transcription submission failed:', error)
    return c.json({ error: 'Transcription failed', message: error?.message || String(error) }, 500)
  }
})

app.get('/status/:jobId', async (c) => {
  try {
    const client = new AssemblyAI({ apiKey: c.env.ASSEMBLYAI_API_KEY })
    const jobId = c.req.param('jobId')
    const transcript = await client.transcripts.get(jobId)

    if (transcript.status === 'error') {
      await releaseJobSlot(c.env)
      return c.json({ status: 'error', message: transcript.error })
    }

    if (transcript.status !== 'completed') return c.json({ status: 'processing' })

    // Build utterances
    const rawUtterances = transcript.utterances || []
    const utterances = rawUtterances
      .filter((u: any) => u.text && u.text.trim().length > 0)
      .map((u: any) => ({
        speaker: u.speaker || 'Unknown',
        text: u.text.trim(),
        start_ms: u.start || 0,
        end_ms: u.end || 0,
        duration_ms: Math.max(0, (u.end || 0) - (u.start || 0)),
      }))

    const speakers = [...new Set(utterances.map((u: any) => u.speaker))]
    const talkTime: Record<string, any> = {}
    let totalMs = 0
    for (const u of utterances) {
      talkTime[u.speaker] = talkTime[u.speaker] || { ms: 0, minutes: 0, percentage: 0 }
      talkTime[u.speaker].ms += u.duration_ms
      totalMs += u.duration_ms
    }
    for (const speaker in talkTime) {
      talkTime[speaker].minutes = Math.round((talkTime[speaker].ms / 60000) * 10) / 10
      talkTime[speaker].percentage = totalMs > 0 ? Math.round((talkTime[speaker].ms / totalMs) * 1000) / 10 : 0
    }

    const confidence = transcript.confidence ? Math.round(transcript.confidence * 1000) / 10 : null

    // ===== Phase 9: Save full transcript to meeting_transcripts =====
    const user = c.get('user')
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
    const audioR2Key = c.req.query('audio_r2_key') || ''
    let transcriptId: string | null = null

    if (user) {
      try {
        const { data: row } = await supabase
          .from('meeting_transcripts')
          .insert({
            meeting_id: null, // linked later when meeting is saved
            full_transcript: transcript.text || '',
            utterances_json: utterances,
            audio_r2_key: audioR2Key,
            audio_duration_seconds: transcript.audio_duration || 0,
            language: transcript.language_code || 'en',
            speaker_count: speakers.length,
            confidence_score: confidence,
            talk_time: talkTime,
            retained: true,
          })
          .select('id')
          .single()
        transcriptId = row?.id || null
      } catch (err) {
        console.error('Failed to save transcript:', err)
      }
    }

    await releaseJobSlot(c.env)

    // Usage tracking + Slack
    if (user) {
      const durationSeconds = Math.round(totalMs / 1000)
      await trackUsage(c.env, user.id, durationSeconds)
      try {
        await sendSlackSummary(c.env, user.id, 'Meeting Processed', 'Your meeting has been processed successfully.', [])
      } catch (err) {
        console.error('Slack notification failed:', err)
      }
    }

    // ===== Phase 9: Signed download URL for audio =====
    let audioDownloadUrl: string | null = null
    if (audioR2Key && c.env.MEETING_AUDIO) {
      try {
        audioDownloadUrl = await c.env.MEETING_AUDIO.createSignedUrl({
          key: audioR2Key,
          method: 'GET',
          expirationTtl: 86400, // 24 hours
        })
      } catch (err) {
        console.error('Failed to create signed URL:', err)
      }
    }

    return c.json({
      status: 'complete',
      utterances,
      speakers,
      confidence,
      talk_time: talkTime,
      full_text: transcript.text || '',
      audio_download_url: audioDownloadUrl,
      transcript_id: transcriptId,
    })
  } catch (error: any) {
    console.error('Status check failed:', error)
    return c.json({ error: 'Status check failed', message: error?.message || String(error) }, 500)
  }
})

export default app