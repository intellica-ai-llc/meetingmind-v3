import { createClient } from '@supabase/supabase-js'
import { sendAlertNotification } from './slack'

export async function runAlertService(env: any) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: prefs } = await supabase
    .from('alert_preferences')
    .select('user_id, risk_escalation_threshold, stale_thread_days, overdue_task_reminders')

  if (!prefs || prefs.length === 0) return

  for (const pref of prefs) {
    const alerts: string[] = []

    // 1. Risk escalation check
    const { data: riskMeetings } = await supabase
      .from('meetings')
      .select('risk_flags')
      .eq('user_id', pref.user_id)
      .order('created_at', { ascending: false })
      .limit(pref.risk_escalation_threshold)

    if (riskMeetings && riskMeetings.length >= pref.risk_escalation_threshold) {
      const allHaveRisks = riskMeetings.every(m => m.risk_flags && m.risk_flags.length > 0)
      if (allHaveRisks) {
        alerts.push(`⚠️ ${pref.risk_escalation_threshold} consecutive meetings had risk flags.`)
      }
    }

    // 2. Stale threads
    const { data: stale } = await supabase
      .from('unresolved_threads')
      .select('title')
      .eq('user_id', pref.user_id)
      .eq('status', 'open')
      .lte('created_at', new Date(Date.now() - pref.stale_thread_days * 24 * 60 * 60 * 1000).toISOString())
      .limit(3)

    if (stale && stale.length > 0) {
      alerts.push(`🔗 ${stale.length} thread(s) unresolved for > ${pref.stale_thread_days} days.`)
    }

    // 3. Overdue tasks
    if (pref.overdue_task_reminders) {
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', pref.user_id)
        .neq('status', 'completed')
        .lte('due_date', new Date().toISOString())
      if (count && count > 0) {
        alerts.push(`📋 ${count} overdue task(s).`)
      }
    }

    if (alerts.length > 0) {
      try {
        await sendAlertNotification(env, pref.user_id, alerts.join('\n'))
      } catch (err) {
        console.error(`Alert notification failed for user ${pref.user_id}:`, err)
      }
    }
  }
}