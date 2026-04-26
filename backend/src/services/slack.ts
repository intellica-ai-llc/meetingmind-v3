export async function sendSlackSummary(env: any, userId: string, meetingTitle: string, summary: string, actionItems: any[]) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  // Check subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', userId)
    .single()

  const tier = profile?.subscription_tier || 'free'
  const isActive = profile?.subscription_status === 'active'
  if (tier !== 'business' || !isActive) return // only Business users

  // Get Slack webhook URL
  const { data: slackConfig } = await supabase
    .from('slack_configs')
    .select('channel_webhook_url, notify_on_completion')
    .eq('user_id', userId)
    .maybeSingle()

  if (!slackConfig?.channel_webhook_url || !slackConfig?.notify_on_completion) return

  // Build Block Kit message
  const actionItemsText = actionItems.length
    ? actionItems.map((a: any) => `• ${a.task} (${a.owner})`).join('\n')
    : 'None'

  const blocks = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📋 *MeetingMind: ${meetingTitle || 'Meeting Summary'}*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Summary:*\n${summary.substring(0, 300)}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Action Items:*\n${actionItemsText}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Full Meeting', emoji: true },
            url: 'https://meetingmind-v3.pages.dev/dashboard',
          },
        ],
      },
    ],
  }

  try {
    await fetch(slackConfig.channel_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blocks),
    })
  } catch (err) {
    console.error('Slack send error:', err)
  }
}