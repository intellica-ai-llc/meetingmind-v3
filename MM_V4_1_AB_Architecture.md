MeetingMind v4.1 — Class Architecture (from facts)
1. Frontend State & Context Layer
Three contexts wrap the app in order:

AuthContext — Supabase session, user, signInWithGoogle, signOut

AppContext — meeting recording pipeline: step state, audio file, utterances, speakers, results, runAnalysis, handleStartMeeting, handleDemoMode, savedMeetingId, selectedInitiativeId

UserPlanProvider — fetchPlan() from /api/payments/subscription, plan, status, isPaid, refetch

Auth flow:
Google OAuth redirects back to https://meetingmind-v3.pages.dev/dashboard. The AuthContext listens for onAuthStateChange and sets loading = false only after the first event, preventing the OAuth race condition.

Plan gating:
PlanGate.tsx consumes FEATURE_REQUIRED_PLAN from lib/features.ts (a map of feature name → required tier) and either renders children or an upgrade prompt. Pages that use it: CoachingPage, AlertSettingsPage, SpeakerProfileManager, InitiativeDetailPage, InitiativesPage.

2. Frontend UI Component Hierarchy
Shell.tsx — persistent layout with:

Collapsible sidebar with navigation items (Dashboard, Meetings, Tasks, Initiatives, Coaching, Settings)

User avatar, plan badge, sign-out button

"Upgrade to Pro" button that calls POST /api/payments/create-checkout-session directly with Stripe price ID from env

Breadcrumbs component

Top header with hamburger, "Intelligence Dashboard" title, plan badge, "+ New Meeting" button

Page components (each wrapped in ProtectedRoute > Shell):

Dashboard.tsx — HeroMetrics, InitiativeGrid, AttentionFeed, CoachPanel, post‑checkout celebration modal (reads ?upgrade=plan&success=true from URL, polls refetch until isPaid changes)

MeetingsPage.tsx — searchable meeting list using /api/meetings

MeetingDetailPage.tsx — three‑section editable view of all 13 extraction fields, Keep/Discard buttons

TasksPage.tsx — kanban board (To Do / In Progress / Done) with manual task creation

InitiativesPage.tsx — list of initiatives with health status badges, create new

InitiativeDetailPage.tsx — health trend charts, timeline of linked meetings/tasks/threads, link/unlink modal

CoachingPage.tsx — effectiveness trend chart, score ring, meeting type breakdown table, "Ask the Coach" free‑text input

AlertSettingsPage.tsx — thresholds for risk escalation, stale threads, overdue tasks, coach digest frequency

SpeakerProfileManager.tsx — list, create, delete speaker profiles with alias merging

Settings.tsx — Google Calendar connect, Slack webhook config, navigation cards to Alert Preferences and Speaker Profiles

Pricing.tsx — three‑tier pricing (Free/Pro/Business) with Stripe checkout buttons

Landing.tsx — marketing page with "Get Pro" buttons that call POST /api/payments/create-checkout-session

App Console (AppPanel.tsx):

RecordingStep — countdown, live recording timer, mic icon, demo button (hidden for Pro/Business), initiative picker dropdown

ProcessingStep, NameSpeakersStep, AnalyzingStep, ResultsStep — pipeline UI

ResultsStep includes Keep/Discard buttons and "View Saved Meeting" link

3. Backend API Layer (Hono on Cloudflare Workers)
All routes are Hono sub‑apps mounted in index.ts:

Route file	Paths	Gating
auth.ts	/api/auth/*	Public
transcribe.ts	/api/transcribe, /api/status/:jobId	Auth required
analyze.ts	/api/analyze, /api/draft-email	Auth required
coach.ts	/api/coach, /api/coach/trends, /api/coach/breakdown, /api/coach/ask	Pro
meetings.ts	/api/meetings (GET/POST), /api/meetings/:id (GET/PUT/DELETE)	Auth required
tasks.ts	/api/tasks (GET/POST), /api/tasks/:id (PUT/DELETE), /api/tasks/:id/complete	Auth required
threads.ts	/api/threads, /api/threads/:id (PUT/DELETE), /api/threads/:id/resolve	Auth required
initiatives.ts	/api/initiatives, /api/initiatives/:id, /api/initiatives/:id/members, /api/initiatives/:id/health, /api/initiatives/suggest	Pro
intelligence.ts	/api/intelligence/patterns, /api/intelligence/risks, /api/intelligence/feed	Pro / Business
dashboard.ts	/api/dashboard/stats	Auth required
calendar.ts	/api/calendar/callback, /api/calendar/connect, /api/calendar/status, /api/calendar/webhook	Pro
slack.ts	/api/slack/config	Business
alert-preferences.ts	/api/alert-preferences (GET/PUT)	Pro
speaker-profiles.ts	/api/speaker-profiles (CRUD)	Pro
payments.ts	/api/payments/create-checkout-session, /api/payments/subscription, /api/payments/create-portal-session	Auth required
webhooks.ts	/api/payments/webhook (Stripe)	Public (signature verified)
usage.ts	/api/usage/status	Auth required
patterns.ts	/api/patterns	Auth required
Middleware chain:

cors() on all routes

authMiddleware on /api/* — verifies Supabase JWT, sets c.get('user')

rateLimitMiddleware on /api/*

requirePlan('pro'|'business') on gated endpoints — checks profiles.subscription_tier and subscription_status

4. Backend Services & Cron
Services (stateless utility functions called by routes):

concurrency.ts — KV‑based semaphore (max 5 concurrent AssemblyAI jobs)

usage-tracker.ts — writes monthly_usage table and global KV budget

ingestion-orchestrator.ts — submits to AssemblyAI, polls until complete, computes utterances/speakers/talkTime, tracks usage, releases slot

calendar.ts — registerWatchChannel (Google Calendar push), pollCalendarEvents (15‑min fallback, refreshes tokens, detects new events)

slack.ts — sendSlackSummary (post‑meeting Block Kit), sendAlertNotification (nightly alert Block Kit), both Business‑gated

alert-service.ts — nightly checks alert_preferences for each user, compares against meetings/threads/tasks, calls sendAlertNotification

Cron (scheduled.ts):

Runs every 15 minutes

Always calls pollCalendarEvents

Once per day (KV flag): runs pattern aggregation per user → intelligence_patterns / intelligence_risks, initiative health snapshots, alert service

5. External Service Integrations
AssemblyAI:

POST /api/transcribe submits audio as Blob with speaker_labels, speech_models: ['universal'], punctuate: true, optional keyterms

Returns job_id; frontend polls GET /api/status/:jobId

Groq:

Used in analyze.ts (13‑field extraction), coach.ts (longitudinal coaching + ask), initiatives.ts (suggestion)

Model: llama-3.3-70b-versatile, response_format: json_object

Stripe:

POST /api/payments/create-checkout-session — creates Stripe Checkout Session in test mode, returns URL

POST /api/payments/webhook — verifies stripe-signature, handles checkout.session.completed (upserts profiles with tier/status), customer.subscription.updated, customer.subscription.deleted

Frontend uses VITE_STRIPE_PRICE_PRO and VITE_STRIPE_PRICE_BUSINESS from .env.production

Google Calendar:

OAuth2 flow: user clicks Connect → Google consent screen → callback to /api/calendar/callback → stores refresh token → registers watch channel

Polling fallback runs every 15 minutes via cron

Slack:

Incoming webhook stored in slack_configs table

Business tier only

Summary sent after each meeting processing completes; alerts sent nightly

6. Database Tables (from migration files)
Table	Purpose	Key columns
meetings	13‑field extraction results	user_id, title, meeting_date, duration_minutes, summary, decisions, action_items, open_questions, parking_lot, key_topics, key_quotes, sentiment, effectiveness_score, risk_flags, meeting_type, discarded, initiative_id
tasks	Action items from meetings	user_id, title, description, owner_name, due_date, priority, status, meeting_id, initiative_id
unresolved_threads	Cross‑meeting issues	user_id, title, description, severity, status, mention_count
initiatives	User‑defined project buckets	user_id, name, description, health_status
initiative_memberships	Links meetings/tasks/threads to initiatives	initiative_id, meeting_id, task_id, thread_id
initiative_health_snapshots	Daily per‑initiative metrics	initiative_id, avg_effectiveness, open_tasks_count, unresolved_threads_count, risk_frequency
intelligence_patterns	Per‑user aggregate trends	user_id, avg_effectiveness, decision_velocity, sentiment_trend
intelligence_risks	Risk frequency over time	user_id, risk_frequency
alert_preferences	User notification settings	user_id, risk_escalation_threshold, stale_thread_days, overdue_task_reminders, coach_digest_frequency
speaker_profiles	Cross‑meeting speaker identity	user_id, name, email, merged_aliases
slack_configs	Slack webhook URLs	user_id, channel_webhook_url, notify_on_completion
calendar_events	Processed calendar events	user_id, event_google_id, processed
monthly_usage	Per‑user usage tracking	user_id, period_start, meetings_count, minutes_processed
profiles	Extended user metadata	id, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, google_calendar_refresh_token, google_calendar_sync_enabled, google_calendar_channel_id
7. Current Payment Flow (as built)
text
User clicks "Upgrade to Pro" (Shell, Pricing, Landing)
  → POST /api/payments/create-checkout-session { priceId, planType, successUrl, cancelUrl }
  → Stripe Checkout (test mode)
  → User pays with test card 4242...
  → Stripe redirects to successUrl (/dashboard?upgrade=pro&success=true)
  → Dashboard useEffect reads URL params, calls refetch() repeatedly
  → Meanwhile, Stripe sends webhook to /api/payments/webhook
  → Webhook handler upserts profiles: subscription_tier = planType, subscription_status = 'active'
  → refetch() eventually returns the new tier
  → isPaid becomes true
  → Celebration modal appears
  → Features unlock (PlanGate + usePlan)