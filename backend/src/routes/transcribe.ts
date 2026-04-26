import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { acquireJobSlot, releaseJobSlot } from '../services/concurrency'
import { ingest } from '../services/ingestion-orchestrator'

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
    const formData = await c.req.formData()
    const audioFile = formData.get('audio') as File
    if (!audioFile) {
      await releaseJobSlot(c.env)
      return c.json({ error: 'No audio file provided' }, 400)
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer())

    // Call the orchestrator — it handles all AssemblyAI work and returns the final payload
    const result = await ingest(c.env, user.id, buffer, audioFile.type)

    // Release the slot only after successful ingestion
    await releaseJobSlot(c.env)

    return c.json({
      status: 'complete',
      utterances: result.utterances,
      speakers: result.speakers,
      talk_time: result.talkTime,
      confidence: result.confidence,
    })
  } catch (err: any) {
    await releaseJobSlot(c.env)
    return c.json({ error: err.message || 'Transcription failed' }, 500)
  }
})

export default app