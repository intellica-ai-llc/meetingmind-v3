const MAX_CONCURRENT_JOBS = 5
const KV_KEY = 'global:active_jobs'

export async function acquireJobSlot(env: any): Promise<boolean> {
  try {
    if (!env.MEETING_JOBS) return true   // fallback: allow the job if KV is unavailable
    const current = await env.MEETING_JOBS.get(KV_KEY)
    const active = current ? parseInt(current) : 0
    if (active >= MAX_CONCURRENT_JOBS) return false
    await env.MEETING_JOBS.put(KV_KEY, (active + 1).toString())
    return true
  } catch (err) {
    console.error('acquireJobSlot KV error:', err)
    return true   // allow the job rather than block all traffic
  }
}

export async function releaseJobSlot(env: any): Promise<void> {
  try {
    if (!env.MEETING_JOBS) return
    const current = await env.MEETING_JOBS.get(KV_KEY)
    const active = current ? parseInt(current) : 1
    await env.MEETING_JOBS.put(KV_KEY, Math.max(active - 1, 0).toString())
  } catch (err) {
    console.error('releaseJobSlot KV error:', err)
  }
}

export async function getActiveJobs(env: any): Promise<number> {
  try {
    if (!env.MEETING_JOBS) return 0
    const current = await env.MEETING_JOBS.get(KV_KEY)
    return current ? parseInt(current) : 0
  } catch (err) {
    console.error('getActiveJobs KV error:', err)
    return 0
  }
}