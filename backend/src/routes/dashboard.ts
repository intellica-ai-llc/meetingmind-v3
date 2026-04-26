import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

app.get('/stats', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const userId = user.id

  // Total meetings
  const { count: totalMeetings } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Average effectiveness score (if any meetings)
  const { data: meetings } = await supabase
    .from('meetings')
    .select('effectiveness_score')
    .eq('user_id', userId)
    .not('effectiveness_score', 'is', null)

  const avgScore = meetings?.length
    ? Math.round(meetings.reduce((sum, m) => sum + (m.effectiveness_score || 0), 0) / meetings.length * 10) / 10
    : null

  // Open tasks
  const { count: openTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'pending')

  // Unresolved threads
  const { count: unresolvedThreads } = await supabase
    .from('unresolved_threads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'open')

  return c.json({
    totalMeetings: totalMeetings || 0,
    avgScore,        // null if no scored meetings
    openTasks: openTasks || 0,
    unresolvedThreads: unresolvedThreads || 0,
  })
})

export default app