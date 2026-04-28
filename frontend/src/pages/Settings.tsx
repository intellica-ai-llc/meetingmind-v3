import { useEffect, useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { api } from '@/lib/api'

export function Settings() {
  const { subscription, loading: subLoading } = useSubscription()
  const tier = subscription?.tier || 'free'

  const [calendarEnabled, setCalendarEnabled] = useState(false)

  const [slackWebhook, setSlackWebhook] = useState('')
  const [slackNotify, setSlackNotify] = useState(true)
  const [slackSaving, setSlackSaving] = useState(false)

  const isPro = tier === 'pro' || tier === 'business'
  const isBusiness = tier === 'business'

  useEffect(() => {
    if (isPro) {
      api.get('/calendar/status')
        .then(r => setCalendarEnabled(r.data.enabled))
        .catch(() => {})
    }
    if (isBusiness) {
      api.get('/slack/config')
        .then(r => {
          setSlackWebhook(r.data.webhookUrl || '')
          setSlackNotify(r.data.notifyEnabled ?? true)
        })
        .catch(() => {})
    }
  }, [isPro, isBusiness])

  const handleConnectCalendar = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
    if (!clientId) {
      alert('Google Client ID not configured.')
      return
    }
    const redirectUri = 'https://meetingmind-api-production.intellicaai-ai.workers.dev/api/calendar/callback'
    const scope = 'https://www.googleapis.com/auth/calendar.events.readonly'
    const state = ''
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent` +
      `&state=${encodeURIComponent(state)}`
    window.location.href = url
  }

  const handleSaveSlack = async () => {
    setSlackSaving(true)
    try {
      await api.post('/slack/config', {
        webhookUrl: slackWebhook,
        notifyEnabled: slackNotify,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSlackSaving(false)
    }
  }

  if (subLoading) {
    return (
      <div style={{ maxWidth: 600 }}>
        <h2 style={{ fontSize: 'var(--mm-fs-title)', fontWeight: 800, color: 'var(--mm-text-primary)', marginBottom: 24 }}>Settings</h2>
        <div style={{ height: 60, background: 'rgba(255,255,255,0.04)', borderRadius: 12, marginBottom: 12 }} />
        <div style={{ height: 60, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: 'var(--mm-fs-title)', fontWeight: 800, color: 'var(--mm-text-primary)', marginBottom: 24 }}>
        Settings
      </h2>

      {/* ── Calendar Section ── */}
      <div style={{
        background: 'var(--mm-bg-secondary)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--mm-text-primary)', margin: 0 }}>Google Calendar</h3>
            <p style={{ fontSize: 13, color: 'var(--mm-text-secondary)', margin: '4px 0 0' }}>
              Auto‑import meetings from your calendar.
            </p>
          </div>
          {isPro ? (
            calendarEnabled ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--mm-success)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mm-success)' }} /> Connected
              </span>
            ) : (
              <button
                onClick={handleConnectCalendar}
                style={{
                  background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Connect
              </button>
            )
          ) : (
            <span style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              color: 'var(--mm-text-muted)',
            }}>
              Pro feature
            </span>
          )}
        </div>
      </div>

      {/* ── Slack Section ── */}
      <div style={{
        background: 'var(--mm-bg-secondary)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
      }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--mm-text-primary)', margin: 0 }}>Slack Notifications</h3>
          <p style={{ fontSize: 13, color: 'var(--mm-text-secondary)', margin: '4px 0 0' }}>
            Receive a summary after every meeting is processed.
          </p>
        </div>
        {isBusiness ? (
          <>
            <input
              type="text"
              placeholder="https://hooks.slack.com/services/..."
              value={slackWebhook}
              onChange={e => setSlackWebhook(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--mm-bg-primary)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: 'var(--mm-text-primary)',
                fontSize: 14,
                marginBottom: 12,
              }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--mm-text-secondary)', marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={slackNotify}
                onChange={e => setSlackNotify(e.target.checked)}
                style={{ accentColor: 'var(--mm-cyan)' }}
              />
              Send notifications after each meeting
            </label>
            <button
              onClick={handleSaveSlack}
              disabled={slackSaving}
              style={{
                background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {slackSaving ? 'Saving…' : 'Save'}
            </button>
          </>
        ) : (
          <span style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            color: 'var(--mm-text-muted)',
          }}>
            Business feature
          </span>
        )}
      </div>

      {/* ── Alert Preferences Link ── */}
      <div style={{
        background: 'var(--mm-bg-secondary)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--mm-text-primary)', margin: 0 }}>Alert Preferences</h3>
          <p style={{ fontSize: 13, color: 'var(--mm-text-secondary)', margin: '4px 0 0' }}>
            Configure when and how you get notified about risks, stale threads, and overdue tasks.
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/settings/alerts'}
          style={{
            background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Configure
        </button>
      </div>

      {/* ── Speaker Profiles Link ── */}
      <div style={{
        background: 'var(--mm-bg-secondary)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--mm-text-primary)', margin: 0 }}>Speaker Profiles</h3>
          <p style={{ fontSize: 13, color: 'var(--mm-text-secondary)', margin: '4px 0 0' }}>
            Manage speaker identities and merge aliases across meetings for more accurate coaching.
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/settings/speakers'}
          style={{
            background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Manage
        </button>
      </div>
    </div>
  )
}