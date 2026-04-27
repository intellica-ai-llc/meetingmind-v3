import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { requirePlan } from '../middleware/entitlement'

const app = new Hono()

app.get('/patterns', requirePlan('pro'), async (c) => {
  const user = c.get('user')
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data } = await supabase
    .from('intelligence_patterns')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return c.json({ patterns: data || null })
})

app.get('/risks', requirePlan('business'), async (c) => {
  const user = c.get('user')
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data } = await supabase
    .from('intelligence_risks')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return c.json({ risks: data || null })
})

// ── Attention Feed (Pro) ───────────────────────────────────
app.get('/feed', requirePlan('pro'), async (c) => {
  const user = c.get('user')
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)

  const alerts: any[] = []

  // 1. Risk flags from recent meetings (last 7 days, limit 5)
  const { data: recentMeetings } = await supabase
    .from('meetings')
    .select('id, title, risk_flags, created_at')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(10)

  if (recentMeetings) {
    recentMeetings.forEach(m => {
      (m.risk_flags || []).forEach((flag: string) => {
        alerts.push({
          type: 'risk',
          title: flag,
          meeting_title: m.title,
          meeting_id: m.id,
          created_at: m.created_at,
        })
      })
    })
  }

  // 2. Stale unresolved threads (open, severity high, older than 7 days)
  const { data: staleThreads } = await supabase
    .from('unresolved_threads')
    .select('id, title, severity, created_at')
    .eq('user_id', user.id)
    .eq('status', 'open')
    .lte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('severity', { ascending: false })
    .limit(5)

  if (staleThreads) {
    staleThreads.forEach(t => {
      alerts.push({
        type: 'thread',
        title: t.title,
        thread_id: t.id,
        severity: t.severity,
        created_at: t.created_at,
      })
    })
  }

  // 3. Overdue tasks (not completed, past due_date)
  const { data: overdueTasks } = await supabase
    .from('tasks')
    .select('id, title, due_date')
    .eq('user_id', user.id)
    .neq('status', 'completed')
    .lte('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })
    .limit(5)

  if (overdueTasks) {
    overdueTasks.forEach(t => {
      alerts.push({
        type: 'task',
        title: t.title,
        task_id: t.id,
        due_date: t.due_date,
      })
    })
  }

  // 4. Initiative health warnings (critical or at_risk)
  const { data: unhealthyInitiatives } = await supabase
    .from('initiatives')
    .select('id, name, health_status')
    .eq('user_id', user.id)
    .in('health_status', ['at_risk', 'critical'])
    .order('updated_at', { ascending: false })
    .limit(5)

  if (unhealthyInitiatives) {
    unhealthyInitiatives.forEach(i => {
      alerts.push({
        type: 'initiative',
        title: i.name,
        initiative_id: i.id,
        health_status: i.health_status,
      })
    })
  }

  // Sort all alerts by recency (use created_at where available, default to now)
  alerts.sort((a, b) => {
    const aDate = a.created_at || a.due_date || new Date().toISOString()
    const bDate = b.created_at || b.due_date || new Date().toISOString()
    return new Date(bDate).getTime() - new Date(aDate).getTime()
  })

  // Limit feed to 20 items
  return c.json({ alerts: alerts.slice(0, 20) })
})

export default app