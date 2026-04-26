import { AssemblyAI } from 'assemblyai'
import { createClient } from '@supabase/supabase-js'
import { releaseJobSlot } from './concurrency'
import { trackUsage } from './usage-tracker'

/**
 * Full ingestion pipeline:
 *  1. Submit audio directly to AssemblyAI (buffer).
 *  2. Poll until completed or error.
 *  3. Return utterances, speakers, talkTime, confidence.
 *  4. Track usage and release the concurrency slot.
 *  5. (future) trigger Slack / pattern updates.
 */
export async function ingest(
  env: any,
  userId: string,
  audioBuffer: Buffer,
  mimeType: string
): Promise<{
  utterances: any[]
  speakers: string[]
  talkTime: Record<string, any>
  confidence: number | null
}> {
  const client = new AssemblyAI({ apiKey: env.ASSEMBLYAI_API_KEY })

  // 1. Submit
  const transcript = await client.transcripts.submit({
    audio: audioBuffer,
    speaker_labels: true,
    speech_model: 'universal',
    punctuate: true,
    format_text: true,
  })

  // 2. Poll
  let result
  while (true) {
    const poll = await client.transcripts.get(transcript.id)
    if (poll.status === 'error') {
      await releaseJobSlot(env)
      throw new Error('AssemblyAI transcription failed: ' + (poll.error || 'unknown error'))
    }
    if (poll.status === 'completed') {
      result = poll
      break
    }
    // Wait 3 seconds before next poll
    await new Promise((r) => setTimeout(r, 3000))
  }

  // 3. Compute utterances / speakers / talkTime / confidence
  const utterances = result.utterances?.map((u) => ({
    speaker: u.speaker,
    text: u.text,
    start_ms: u.start,
    end_ms: u.end,
    duration_ms: u.end - u.start,
  })) || []

  const speakers = [...new Set(utterances.map((u) => u.speaker))]
  const talkTime: Record<string, { ms: number; minutes: number; percentage: number }> = {}
  let totalMs = 0
  for (const u of utterances) {
    talkTime[u.speaker] = talkTime[u.speaker] || { ms: 0, minutes: 0, percentage: 0 }
    talkTime[u.speaker].ms += u.duration_ms
    totalMs += u.duration_ms
  }
  for (const speaker in talkTime) {
    talkTime[speaker].minutes = Math.round((talkTime[speaker].ms / 60000) * 10) / 10
    talkTime[speaker].percentage = Math.round((talkTime[speaker].ms / totalMs) * 1000) / 10
  }

  const confidence = result.confidence ? Math.round(result.confidence * 1000) / 10 : null

  // 4. Track usage
  const durationSeconds = Math.round(totalMs / 1000)
  await trackUsage(env, userId, durationSeconds)

  // 5. Future hooks: pattern refresh, Slack push

  return { utterances, speakers, talkTime, confidence }
}