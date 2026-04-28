import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { PlanGate } from '@/components/PlanGate'
import { Card } from '@/components/ui/Card'

export function AlertSettingsPage() {
  const [prefs, setPrefs] = useState({
    risk_escalation_threshold: 2,
    stale_thread_days: 10,
    overdue_task_reminders: true,
    coach_digest_frequency: 'weekly',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/alert-preferences')
      .then(res => {
        if (res.data.preferences) {
          setPrefs({
            risk_escalation_threshold: res.data.preferences.risk_escalation_threshold ?? 2,
            stale_thread_days: res.data.preferences.stale_thread_days ?? 10,
            overdue_task_reminders: res.data.preferences.overdue_task_reminders ?? true,
            coach_digest_frequency: res.data.preferences.coach_digest_frequency ?? 'weekly',
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/alert-preferences', prefs)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ color: 'var(--mm-text-secondary)', padding: 40 }}>Loading preferences...</div>

  return (
    <PlanGate feature="alert-preferences">
      <div style={{ maxWidth: 600 }}>
        <h2 style={{ fontSize: 'var(--mm-fs-title)', fontWeight: 800, color: 'var(--mm-text-primary)', marginBottom: 16 }}>
          Alert Preferences
        </h2>
        <Card variant="glass" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Risk escalation threshold */}
            <div>
              <label style={{ color: 'var(--mm-text-primary)', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Risk Escalation Threshold
              </label>
              <p style={{ color: 'var(--mm-text-secondary)', fontSize: 12, marginBottom: 8 }}>
                Alert me if my last N consecutive meetings all contained risk flags.
              </p>
              <input
                type="number"
                min={1}
                max={10}
                value={prefs.risk_escalation_threshold}
                onChange={e => setPrefs({ ...prefs, risk_escalation_threshold: parseInt(e.target.value) || 2 })}
                style={{
                  width: 80,
                  padding: '8px 10px',
                  background: 'var(--mm-bg-primary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: 'var(--mm-text-primary)',
                  fontSize: 14,
                }}
              />
            </div>

            {/* Stale thread days */}
            <div>
              <label style={{ color: 'var(--mm-text-primary)', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Stale Thread Alert
              </label>
              <p style={{ color: 'var(--mm-text-secondary)', fontSize: 12, marginBottom: 8 }}>
                Alert me when a thread remains unresolved for more than N days.
              </p>
              <input
                type="number"
                min={1}
                max={30}
                value={prefs.stale_thread_days}
                onChange={e => setPrefs({ ...prefs, stale_thread_days: parseInt(e.target.value) || 10 })}
                style={{
                  width: 80,
                  padding: '8px 10px',
                  background: 'var(--mm-bg-primary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: 'var(--mm-text-primary)',
                  fontSize: 14,
                }}
              />
            </div>

            {/* Overdue task reminders */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--mm-text-primary)', fontSize: 14, fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={prefs.overdue_task_reminders}
                  onChange={e => setPrefs({ ...prefs, overdue_task_reminders: e.target.checked })}
                  style={{ accentColor: 'var(--mm-cyan)' }}
                />
                Overdue Task Reminders
              </label>
              <p style={{ color: 'var(--mm-text-secondary)', fontSize: 12, margin: '4px 0 0 26px' }}>
                Receive notifications for overdue tasks.
              </p>
            </div>

            {/* Coach digest frequency */}
            <div>
              <label style={{ color: 'var(--mm-text-primary)', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Coach Digest
              </label>
              <p style={{ color: 'var(--mm-text-secondary)', fontSize: 12, marginBottom: 8 }}>
                How often would you like to receive coaching summaries?
              </p>
              <select
                value={prefs.coach_digest_frequency}
                onChange={e => setPrefs({ ...prefs, coach_digest_frequency: e.target.value })}
                style={{
                  padding: '8px 10px',
                  background: 'var(--mm-bg-primary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: 'var(--mm-text-primary)',
                  fontSize: 14,
                }}
              >
                <option value="never">Never</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, var(--mm-cyan), var(--mm-purple))',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save Preferences'}
            </button>
            {saved && <span style={{ color: 'var(--mm-success)', fontSize: 14 }}>✓ Saved</span>}
          </div>
        </Card>
      </div>
    </PlanGate>
  )
}