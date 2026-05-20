// backend/src/routes/meetings.ts
import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

// ── Create a meeting (after recording) ──────────────────────────────
app.post('/', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
    const body = await c.req.json().catch(() => ({}))
    const { title, meeting_context, assemblyai_job_id } = body

    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        title: title || meeting_context?.title || null,
        assemblyai_job_id: assemblyai_job_id || null,
      })
      .select('*')
      .single()

    if (error || !meeting) {
      console.error('Meeting insert failed:', error)
      return c.json({ error: 'Failed to create meeting' }, 500)
    }

    // ── Phase 9: link transcript to this meeting ──────────────────
    const transcriptId = c.req.header('X-Transcript-Id')
    if (transcriptId) {
      await supabase
        .from('meeting_transcripts')
        .update({ meeting_id: meeting.id })
        .eq('id', transcriptId)
        .eq('meeting_id', null) // only link if not already linked
    }

    return c.json({ meeting }, 201)
  } catch (error: any) {
    console.error('Meeting POST error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ── List meetings for the user ───────────────────────────────────────
app.get('/', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 50)
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('meetings')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return c.json({ meetings: data, page, limit, total: count })
  } catch (error: any) {
    console.error('Meeting list error:', error)
    return c.json({ error: 'Failed to fetch meetings' }, 500)
  }
})

// ── Get a single meeting (with transcript if available) ────────────
app.get('/:id', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
    const id = c.req.param('id')

    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !meeting) {
      return c.json({ error: 'Meeting not found' }, 404)
    }

    // Optionally fetch linked transcript
    const { data: transcript } = await supabase
      .from('meeting_transcripts')
      .select('full_transcript, utterances_json, audio_r2_key, confidence_score')
      .eq('meeting_id', id)
      .eq('retained', true)
      .maybeSingle()

    return c.json({ meeting, transcript: transcript || null })
  } catch (error: any) {
    console.error('Meeting get error:', error)
    return c.json({ error: 'Failed to fetch meeting' }, 500)
  }
})

// ── Update a meeting (including discard / analysis save) ────────────
app.put('/:id', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
    const id = c.req.param('id')
    const body = await c.req.json().catch(() => ({}))
    if (!body || Object.keys(body).length === 0) {
      return c.json({ error: 'No update fields provided' }, 400)
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return c.json({ error: 'Meeting not found' }, 404)
    }

    // ── Phase 9: If discarding, clean up R2 audio & mark transcript ─
    if (body.discarded === true && c.env.MEETING_AUDIO) {
      const { data: transcript } = await supabase
        .from('meeting_transcripts')
        .select('id, audio_r2_key')
        .eq('meeting_id', id)
        .maybeSingle()

      if (transcript?.audio_r2_key) {
        try {
          await c.env.MEETING_AUDIO.delete(transcript.audio_r2_key)
        } catch (err) {
          console.error('R2 audio delete failed:', err)
        }
      }
      if (transcript?.id) {
        await supabase
          .from('meeting_transcripts')
          .update({ retained: false })
          .eq('id', transcript.id)
      }
    }

    // Apply update (only allowed fields)
    const allowedFields = ['title', 'summary', 'decisions', 'action_items', 'open_questions',
      'parking_lot', 'key_topics', 'key_quotes', 'sentiment', 'sentiment_reason',
      'effectiveness_score', 'effectiveness_reason', 'next_agenda', 'risk_flags',
      'meeting_type', 'discarded', 'coach_notes']
    const updateData: Record<string, any> = {}
    for (const key of allowedFields) {
      if (key in body) updateData[key] = body[key]
    }

    const { data: updated, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error || !updated) {
      console.error('Meeting update failed:', error)
      return c.json({ error: 'Failed to update meeting' }, 500)
    }

    return c.json({ meeting: updated })
  } catch (error: any) {
    console.error('Meeting PUT error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ── Delete a meeting (hard delete with cleanup) ─────────────────────
app.delete('/:id', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
    const id = c.req.param('id')

    // Verify ownership
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !meeting) {
      return c.json({ error: 'Meeting not found' }, 404)
    }

    // ── Phase 9: Clean up R2 audio and transcript before delete ──
    if (c.env.MEETING_AUDIO) {
      const { data: transcript } = await supabase
        .from('meeting_transcripts')
        .select('audio_r2_key')
        .eq('meeting_id', id)
        .maybeSingle()

      if (transcript?.audio_r2_key) {
        try {
          await c.env.MEETING_AUDIO.delete(transcript.audio_r2_key)
        } catch (err) {
          console.error('R2 audio delete failed:', err)
        }
      }
    }

    // Delete transcript rows (cascade would also work, but explicit is safe)
    await supabase.from('meeting_transcripts').delete().eq('meeting_id', id)

    // Delete the meeting itself
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Meeting delete failed:', error)
      return c.json({ error: 'Failed to delete meeting' }, 500)
    }

    return c.json({ success: true })
  } catch (error: any) {
    console.error('Meeting DELETE error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app