const MAX_CONCURRENT_JOBS = 5
const KV_KEY = 'global:active_jobs'

export async function acquireJobSlot(env: any): Promise<boolean> {
  const current = await env.MEETING_JOBS.get(KV_KEY)
  const active = current ? parseInt(current) : 0
  if (active >= MAX_CONCURRENT_JOBS) return false
  await env.MEETING_JOBS.put(KV_KEY, (active + 1).toString())
  return true
}

export async function releaseJobSlot(env: any): Promise<void> {
  const current = await env.MEETING_JOBS.get(KV_KEY)
  const active = current ? parseInt(current) : 1
  await env.MEETING_JOBS.put(KV_KEY, Math.max(active - 1, 0).toString())
}

export async function getActiveJobs(env: any): Promise<number> {
  const current = await env.MEETING_JOBS.get(KV_KEY)
  return current ? parseInt(current) : 0
}