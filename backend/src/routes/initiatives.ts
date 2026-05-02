import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'
import { requirePlan } from '../middleware/entitlement'

const app = new Hono()

// ── List all initiatives for user ──────────────────────────
app.get('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const { data, error } = await supabase
    .from('initiatives')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ initiatives: data })
})

// ── Create initiative (Pro) ────────────────────────────────
app.post('/', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const body = await c.req.json()
  if (!body.name) return c.json({ error: 'Name is required' }, 400)

  const { data, error } = await supabase
    .from('initiatives')
    .insert({ user_id: user.id, name: body.name, description: body.description })
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ initiative: data })
})

// ── Get single initiative with linked items (UPDATED – includes membership IDs) ──
app.get('/:id', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')

  const { data: initiative, error } = await supabase
    .from('initiatives')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (error) return c.json({ error: 'Initiative not found' }, 404)

  // Fetch memberships
  const { data: members } = await supabase
    .from('initiative_memberships')
    .select('id, meeting_id, task_id, thread_id')
    .eq('initiative_id', id)

  const meetingIds = members?.filter(m => m.meeting_id).map(m => m.meeting_id) || []
  const taskIds = members?.filter(m => m.task_id).map(m => m.task_id) || []
  const threadIds = members?.filter(m => m.thread_id).map(m => m.thread_id) || []

  let linkedMeetings: any[] = []
  let linkedTasks: any[] = []
  let linkedThreads: any[] = []

  if (meetingIds.length) {
    const { data: meetings } = await supabase.from('meetings').select('*').in('id', meetingIds)
    linkedMeetings = (meetings || []).map(m => {
      const memb = members?.find(mb => mb.meeting_id === m.id)
      return { ...m, membership_id: memb?.id }
    })
  }
  if (taskIds.length) {
    const { data: tasks } = await supabase.from('tasks').select('*').in('id', taskIds)
    linkedTasks = (tasks || []).map(t => {
      const memb = members?.find(mb => mb.task_id === t.id)
      return { ...t, membership_id: memb?.id }
    })
  }
  if (threadIds.length) {
    const { data: threads } = await supabase.from('unresolved_threads').select('*').in('id', threadIds)
    linkedThreads = (threads || []).map(th => {
      const memb = members?.find(mb => mb.thread_id === th.id)
      return { ...th, membership_id: memb?.id }
    })
  }

  return c.json({ initiative, linkedMeetings, linkedTasks, linkedThreads })
})

// ── Update initiative (Pro) ────────────────────────────────
app.put('/:id', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json()

  const { data: existing, error: fetchErr } = await supabase
    .from('initiatives')
    .select('id, user_id')
    .eq('id', id)
    .single()
  if (fetchErr || existing.user_id !== user.id) {
    return c.json({ error: 'Initiative not found' }, 404)
  }

  const updates: Record<string, any> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.description !== undefined) updates.description = body.description
  if (body.health_status !== undefined) updates.health_status = body.health_status

  const { error } = await supabase
    .from('initiatives')
    .update(updates)
    .eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

// ── Delete initiative (Pro) ────────────────────────────────
app.delete('/:id', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const id = c.req.param('id')

  const { data: existing, error: fetchErr } = await supabase
    .from('initiatives')
    .select('id, user_id')
    .eq('id', id)
    .single()
  if (fetchErr || existing.user_id !== user.id) {
    return c.json({ error: 'Initiative not found' }, 404)
  }

  const { error } = await supabase.from('initiatives').delete().eq('id', id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

// ── Link a meeting/task/thread to an initiative (Pro) ──────
app.post('/:id/members', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const initiativeId = c.req.param('id')
  const { meeting_id, task_id, thread_id } = await c.req.json()

  const { data: initiative } = await supabase
    .from('initiatives')
    .select('id, user_id')
    .eq('id', initiativeId)
    .eq('user_id', user.id)
    .single()
  if (!initiative) return c.json({ error: 'Initiative not found' }, 404)

  if (meeting_id) {
    const { data: meet } = await supabase.from('meetings').select('id').eq('id', meeting_id).eq('user_id', user.id).single()
    if (!meet) return c.json({ error: 'Meeting not found or not yours' }, 404)
  }
  if (task_id) {
    const { data: tsk } = await supabase.from('tasks').select('id').eq('id', task_id).eq('user_id', user.id).single()
    if (!tsk) return c.json({ error: 'Task not found or not yours' }, 404)
  }
  if (thread_id) {
    const { data: thr } = await supabase.from('unresolved_threads').select('id').eq('id', thread_id).eq('user_id', user.id).single()
    if (!thr) return c.json({ error: 'Thread not found or not yours' }, 404)
  }

  const { data, error } = await supabase
    .from('initiative_memberships')
    .insert({ initiative_id: initiativeId, meeting_id, task_id, thread_id })
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ membership: data })
})

// ── Unlink a membership (Pro) ──────────────────────────────
app.delete('/:id/members/:memberId', requirePlan('pro'), async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const initiativeId = c.req.param('id')
  const memberId = c.req.param('memberId')

  const { data: membership } = await supabase
    .from('initiative_memberships')
    .select('id, initiative_id')
    .eq('id', memberId)
    .eq('initiative_id', initiativeId)
    .single()
  if (!membership) return c.json({ error: 'Membership not found' }, 404)

  const { data: initiative } = await supabase
    .from('initiatives')
    .select('id, user_id')
    .eq('id', initiativeId)
    .eq('user_id', user.id)
    .single()
  if (!initiative) return c.json({ error: 'Initiative not found or not yours' }, 404)

  const { error } = await supabase
    .from('initiative_memberships')
    .delete()
    .eq('id', memberId)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

// ── Initiative Health ──────────────────────────────────────
app.get('/:id/health', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const initiativeId = c.req.param('id')

  const { data: initiative } = await supabase
    .from('initiatives')
    .select('id, user_id')
    .eq('id', initiativeId)
    .eq('user_id', user.id)
    .single()
  if (!initiative) return c.json({ error: 'Initiative not found' }, 404)

  const { data: snapshots } = await supabase
    .from('initiative_health_snapshots')
    .select('*')
    .eq('initiative_id', initiativeId)
    .order('snapshot_date', { ascending: false })
    .limit(30)

  return c.json({ snapshots: snapshots || [] })
})

// ── Get open items for a specific initiative (NEW) ─────────
app.get('/:id/open-items', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const initiativeId = c.req.param('id')

  // Verify ownership
  const { data: initiative } = await supabase
    .from('initiatives')
    .select('id, user_id')
    .eq('id', initiativeId)
    .eq('user_id', user.id)
    .single()
  if (!initiative) return c.json({ error: 'Initiative not found' }, 404)

  // Get membership IDs for this initiative
  const { data: members } = await supabase
    .from('initiative_memberships')
    .select('meeting_id, task_id, thread_id')
    .eq('initiative_id', initiativeId)

  const meetingIds = members?.filter(m => m.meeting_id).map(m => m.meeting_id) || []
  const taskIds = members?.filter(m => m.task_id).map(m => m.task_id) || []
  const threadIds = members?.filter(m => m.thread_id).map(m => m.thread_id) || []

  // Open tasks (not completed)
  let openTasks: any[] = []
  if (taskIds.length) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .in('id', taskIds)
      .neq('status', 'completed')
      .order('due_date', { ascending: true })
    openTasks = tasks || []
  }

  // Unresolved threads
  let unresolvedThreads: any[] = []
  if (threadIds.length) {
    const { data: threads } = await supabase
      .from('unresolved_threads')
      .select('*')
      .in('id', threadIds)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
    unresolvedThreads = threads || []
  }

  // Recent decisions from linked meetings
  let recentDecisions: string[] = []
  if (meetingIds.length) {
    const { data: meetings } = await supabase
      .from('meetings')
      .select('decisions')
      .in('id', meetingIds)
      .order('created_at', { ascending: false })
      .limit(3)
    if (meetings) {
      meetings.forEach(m => {
        if (m.decisions?.length) {
          recentDecisions = [...recentDecisions, ...m.decisions]
        }
      })
      recentDecisions = recentDecisions.slice(0, 5)
    }
  }

  // Last meeting summary for context
  let lastMeetingSummary: string | null = null
  if (meetingIds.length) {
    const { data: lastMeeting } = await supabase
      .from('meetings')
      .select('summary')
      .in('id', meetingIds)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    lastMeetingSummary = lastMeeting?.summary || null
  }

  return c.json({
    openTasks,
    unresolvedThreads,
    recentDecisions,
    lastMeetingSummary,
  })
})

// ── Suggest initiatives from a meeting (Pro) ───────────────
app.post('/suggest', requirePlan('pro'), async (c) => {
  const groq = new Groq({ apiKey: c.env.GROQ_API_KEY_1 })
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const user = c.get('user')
  const { meeting_id } = await c.req.json()

  const { data: meeting } = await supabase
    .from('meetings')
    .select('summary, key_topics, decisions, title')
    .eq('id', meeting_id)
    .eq('user_id', user.id)
    .single()
  if (!meeting) return c.json({ error: 'Meeting not found' }, 404)

  const prompt = `You are a strategic project manager. Given the following meeting data, suggest 3 strategic initiatives that could stem from this meeting. Return ONLY a valid JSON object with a key "initiatives" containing an array of 3 objects, each with "name" and "reason" (one sentence why).

Meeting Title: ${meeting.title || 'Untitled'}
Summary: ${meeting.summary || ''}
Topics: ${(meeting.key_topics || []).join(', ')}
Decisions: ${(meeting.decisions || []).join(', ')}`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 500,
  })

  try {
    const parsed = JSON.parse(response.choices[0].message.content)
    return c.json(parsed)
  } catch {
    return c.json({ error: 'Failed to parse suggestions' }, 500)
  }
})

export default app