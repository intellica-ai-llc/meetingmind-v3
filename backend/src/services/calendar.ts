import { createClient } from '@supabase/supabase-js'
import { ingest } from './ingestion-orchestrator'
import { acquireJobSlot, releaseJobSlot } from './concurrency'

/**
 * Register a Google Calendar push notification channel.
 * Stores channel ID and expiration in the user's profile.
 */
export async function registerWatchChannel(env: any, userId: string, accessToken: string) {
  const channelId = crypto.randomUUID?.() || `channel-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const webhookUrl = 'https://api.meeting-mind.com/api/calendar/webhook'
  const expiration = new Date()
  expiration.setDate(expiration.getDate() + 7)  // Channel expires after 7 days (renewal needed)

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/watch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
      token: userId,  // we use userId as the channel token for simplicity
      expiration: expiration.getTime().toString(),
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to register watch channel: ${res.status} ${text}`)
  }

  const data = await res.json()
  const actualExpiration = data.expiration ? new Date(parseInt(data.expiration)).toISOString() : expiration.toISOString()

  // Store channel ID and expiration in profiles
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  await supabase
    .from('profiles')
    .update({
      google_calendar_channel_id: channelId,
      google_calendar_channel_expiration: actualExpiration,
    })
    .eq('id', userId)

  console.log(`Watch channel registered for user ${userId}, expires ${actualExpiration}`)
}

/**
 * Poll calendar events for all users with sync enabled.
 * Now used as a fallback in case the push channel misses notifications or expires.
 */
export async function pollCalendarEvents(env: any) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  // Fetch all users who have enabled calendar sync
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, google_calendar_refresh_token, subscription_tier, subscription_status, google_calendar_channel_expiration')
    .eq('google_calendar_sync_enabled', true)
    .not('google_calendar_refresh_token', 'is', null)

  if (!profiles || profiles.length === 0) return

  const now = new Date()

  for (const profile of profiles) {
    // Only poll for Pro/Business users with active subscription
    const tier = profile.subscription_tier || 'free'
    const isPaid = (tier === 'pro' || tier === 'business') && profile.subscription_status === 'active'
    if (!isPaid) continue
    if (!profile.google_calendar_refresh_token) continue

    // Skip if push channel is still valid (use polling as fallback)
    if (profile.google_calendar_channel_expiration) {
      const expirationDate = new Date(profile.google_calendar_channel_expiration)
      if (expirationDate > now) {
        // Channel still active; we can skip polling to rely on push
        continue
      }
    }

    try {
      // Refresh access token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          refresh_token: profile.google_calendar_refresh_token,
          grant_type: 'refresh_token',
        }),
      })
      if (!tokenRes.ok) continue
      const { access_token } = await tokenRes.json()

      // Get recently ended events (last 30 minutes)
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60000)
      const timeMin = thirtyMinAgo.toISOString()
      const timeMax = now.toISOString()

      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '5',
        }),
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      if (!calRes.ok) continue
      const { items } = await calRes.json()
      if (!items || items.length === 0) continue

      for (const event of items) {
        // Check if event already processed
        const { data: existing } = await supabase
          .from('calendar_events')
          .select('id')
          .eq('event_google_id', event.id)
          .eq('user_id', profile.id)
          .maybeSingle()
        if (existing) continue

        // Mark as processed to avoid duplicates
        await supabase.from('calendar_events').insert({
          user_id: profile.id,
          event_google_id: event.id,
          processed: false,
          created_at: new Date().toISOString(),
        })

        // If the event has a Google Meet recording link, we'll process it later.
        // For MVP, we just create a meeting record with the event title as placeholder.
        // Real audio ingestion from calendar recordings requires further integration.
        console.log(`Calendar event detected for user ${profile.id}: ${event.summary}`)
      }

      // Renew watch channel if it has expired or will expire soon
      if (access_token && (!profile.google_calendar_channel_expiration || new Date(profile.google_calendar_channel_expiration) <= now)) {
        try {
          await registerWatchChannel(env, profile.id, access_token)
        } catch (err) {
          console.error(`Failed to renew watch channel for user ${profile.id}:`, err)
        }
      }
    } catch (err) {
      console.error(`Calendar poll error for user ${profile.id}:`, err)
    }
  }
}