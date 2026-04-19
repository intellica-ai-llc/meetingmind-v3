import { Hono } from 'hono'
import { AssemblyAI } from 'assemblyai'
import { writeFile, unlink } from 'fs/promises'
import { randomUUID } from 'crypto'

const app = new Hono()

app.post('/transcribe', async (c) => {
  const client = new AssemblyAI({ apiKey: c.env.ASSEMBLYAI_API_KEY })
  
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
  const client = new AssemblyAI({ apiKey: c.env.ASSEMBLYAI_API_KEY })
  
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