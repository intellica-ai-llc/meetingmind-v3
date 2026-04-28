import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth'
import { rateLimitMiddleware } from './middleware/rate-limit'
import authRoutes from './routes/auth'
import transcribeRoutes from './routes/transcribe'
import analyzeRoutes from './routes/analyze'
import meetingsRoutes from './routes/meetings'
import tasksRoutes from './routes/tasks'
import threadsRoutes from './routes/threads'
import patternsRoutes from './routes/patterns'
import paymentsRoutes from './routes/payments'
import webhookRoutes from './routes/webhooks'
import intelligenceRoutes from './routes/intelligence'
import usageRoutes from './routes/usage'  // ← NEW
import dashboardRoutes from './routes/dashboard'
import calendarRoutes from './routes/calendar'
import slackRoutes from './routes/slack'
import initiativesRoutes from './routes/initiatives'
import coachRoutes from './routes/coach'
import alertPreferencesRoutes from './routes/alert-preferences'
import speakerProfilesRoutes from './routes/speaker-profiles'

const app = new Hono()

app.use('*', cors())
app.use('/api/*', authMiddleware)
app.use('/api/*', rateLimitMiddleware)

app.get('/', (c) => c.json({ status: 'healthy', version: '3.0.0', timestamp: new Date().toISOString() }))

app.route('/api/auth', authRoutes)
app.route('/api', transcribeRoutes)
app.route('/api', analyzeRoutes)
app.route('/api/meetings', meetingsRoutes)
app.route('/api/tasks', tasksRoutes)
app.route('/api/threads', threadsRoutes)
app.route('/api/patterns', patternsRoutes)
app.route('/api/payments', paymentsRoutes)
app.route('/api/payments', webhookRoutes)
app.route('/api/intelligence', intelligenceRoutes)
app.route('/api/usage', usageRoutes)  // ← NEW
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/calendar', calendarRoutes)
app.route('/api/slack', slackRoutes)
app.route('/api/alert-preferences', alertPreferencesRoutes)
app.route('/api/speaker-profiles', speakerProfilesRoutes)
app.route('/api/initiatives', initiativesRoutes)
app.route('/api', coachRoutes)

export default app