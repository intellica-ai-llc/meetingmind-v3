export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('Weekly digest cron job triggered')
    // Implementation: fetch users, generate digest, send emails
  }
}
