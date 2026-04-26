import { createClient } from '@supabase/supabase-js'

export async function trackUsage(env: any, userId: string, durationSeconds: number) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('monthly_usage')
    .select('meetings_count, minutes_processed')
    .eq('user_id', userId)
    .eq('period_start', periodStart)
    .maybeSingle()

  const newMeetings = (existing?.meetings_count || 0) + 1
  const newMinutes = (existing?.minutes_processed || 0) + Math.round(durationSeconds / 60)

  await supabase
    .from('monthly_usage')
    .upsert({
      user_id: userId,
      period_start: periodStart,
      period_end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
      meetings_count: newMeetings,
      minutes_processed: newMinutes,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, period_start' })

  // Also update global budget in KV (for emergency monitoring, not user-facing)
  const globalKey = 'global:usage:hours'
  const currentHoursStr = await env.MEETING_JOBS.get(globalKey) || '0'
  const newHours = parseFloat(currentHoursStr) + durationSeconds / 3600
  await env.MEETING_JOBS.put(globalKey, newHours.toString())
}