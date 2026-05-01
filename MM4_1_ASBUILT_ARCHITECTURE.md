MEETINGMIND v4.1 – CONSOLIDATED AS‑BUILT ARCHITECTURE
Based exclusively on the three uploaded documents:

MM_V4_1_AB_Architecture.md (class architecture from facts)

MeetingMind_V3_ARCHITECTURE.md (final as‑built v3.0)

MeetingMind v4.0 — COMPLETE UPGRADE ARCHITECTURE.md (design document that, according to user statement, is now built into the live v4.1 app)

Note: The third document is written as a future upgrade plan, but the user has stated that all those features are now part of the live v4.1 app. This consolidation treats the content of that document as implemented, because the user explicitly said “they’re all built into one v4.1 live app”.

1. SYSTEM OVERVIEW
MeetingMind v4.1 is an AI‑powered meeting intelligence platform that:

Transcribes audio (via AssemblyAI) with speaker diarisation.

Extracts 13 structured fields using Groq (Llama 3.3 70B).

Manages action items, unresolved threads, and longitudinal patterns.

Provides a multi‑meeting coach, risk aggregation, and a pattern dashboard.

Supports manual upload, live recording, and automatic Google Calendar ingestion.

Pushes summaries and alerts to Slack (Business tier).

Offers tiered subscriptions (Free, Pro 
9
/
m
o
,
B
u
s
i
n
e
s
s
9/mo,Business29/mo) via Stripe.

Runs entirely on Cloudflare (Pages + Workers) with Supabase (PostgreSQL + Auth).

2. TECHNOLOGY STACK (v3.0 document, confirmed live)
Layer	Technology	Version (as stated)
Frontend	React	18.2.0
Frontend Build	Vite	5.2.0
Frontend Language	TypeScript	5.2.2
Styling	Tailwind CSS	3.4.3
Backend Runtime	Cloudflare Workers	–
Backend Framework	Hono	4.0.0
Database & Auth	Supabase (PostgreSQL)	–
Transcription + Diarisation	AssemblyAI	4.0.0
LLM	Groq (Llama 3.3 70B)	0.5.0
Deployment	Cloudflare Pages + Workers	–
Package Manager	npm	–
3. DIRECTORY STRUCTURE (v3.0 document)
text
meetingmind-v3/
├── .env.example
├── .gitignore
├── README.md
├── frontend/
│   ├── .env.local
│   ├── .nvmrc (Node 20)
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── components/
│       │   ├── ui/          (8 files: Button, Card, Modal, PriorityBadge, ScoreRing, SentimentBadge, Spinner, TalkBar)
│       │   ├── app/         (6 files: AnalyzingStep, AppPanel, NameSpeakersStep, ProcessingStep, RecordingStep, ResultsStep)
│       │   └── results/     (10 files: ActionButtons, ActionItemsTable, CoachCard, EmailCard, KeyQuotes, KeyTopics, OpenQuestions, RiskFlags, StatsRow, TranscriptViewer)
│       ├── contexts/        (2 files: AppContext.tsx, AuthContext.tsx)
│       ├── features/
│       │   ├── auth/        (3 files: Login, ProtectedRoute, Register)
│       │   └── dashboard/   (7 files: Dashboard, MeetingHistory, PatternDashboard, TaskCard, TaskDashboard, UnresolvedThreads, UsageStats)
│       ├── hooks/           (4 files: useAuth, useLocalStorage, useMeetings, useTasks)
│       ├── lib/             (3 files: api.ts, supabase.ts, utils.ts)
│       ├── pages/           (2 files: Landing.tsx, Pricing.tsx)
│       ├── styles/          (5 files: animations.css, globals.css, reduced-motion.css, responsive.css, tokens.css)
│       └── types/           (3 files: api.ts, meeting.ts, task.ts)
├── backend/
│   ├── .dev.vars
│   ├── package.json
│   ├── tsconfig.json
│   ├── wrangler.toml
│   ├── src/
│   │   ├── index.ts (main Hono app)
│   │   ├── routes/      (7 files: analyze.ts, auth.ts, meetings.ts, patterns.ts, tasks.ts, threads.ts, transcribe.ts)
│   │   ├── middleware/  (2 files: auth.ts, rate-limit.ts)
│   │   └── services/    (directory ready)
│   └── cron/
│       └── weekly-digest.ts
└── supabase/
    └── migrations/       (6 migration files: 001_initial.sql … 006_unregistered_owners.sql)
4. FRONTEND STATE & CONTEXT LAYER (from v4.1 architecture doc)
Three React contexts wrap the app in order:

AuthContext – Supabase session, user, signInWithGoogle, signOut.

AppContext – meeting recording pipeline: step state, audio file, utterances, speakers, results, runAnalysis, handleStartMeeting, handleDemoMode, savedMeetingId, selectedInitiativeId.

UserPlanProvider – fetchPlan() from /api/payments/subscription, returns plan, status, isPaid, refetch.

Step flow types (from v3.0):

typescript
type Step = 'upload' | 'recording' | 'processing' | 'name_speakers' | 'analyzing' | 'results' | 'error'
Auth flow (v4.1 doc):
Google OAuth redirects to https://meetingmind-v3.pages.dev/dashboard. AuthContext listens for onAuthStateChange and sets loading = false only after the first event, preventing an OAuth race condition.

Plan gating (v4.1 doc):
PlanGate.tsx consumes FEATURE_REQUIRED_PLAN from lib/features.ts (a map of feature name → required tier). Pages using it: CoachingPage, AlertSettingsPage, SpeakerProfileManager, InitiativeDetailPage, InitiativesPage.

5. FRONTEND UI COMPONENT HIERARCHY (v4.1 doc)
Shell.tsx – persistent layout with:

Collapsible sidebar (Dashboard, Meetings, Tasks, Initiatives, Coaching, Settings)

User avatar, plan badge, sign‑out button

“Upgrade to Pro” button calling POST /api/payments/create-checkout-session with Stripe price ID

Breadcrumbs

Top header: hamburger, “Intelligence Dashboard” title, plan badge, “+ New Meeting” button

Page components (each wrapped in ProtectedRoute > Shell):

Dashboard.tsx – HeroMetrics, InitiativeGrid, AttentionFeed, CoachPanel, post‑checkout celebration modal (reads ?upgrade=plan&success=true and polls refetch until isPaid changes).

MeetingsPage.tsx – searchable meeting list using /api/meetings.

MeetingDetailPage.tsx – three‑section editable view of all 13 extraction fields, Keep/Discard buttons.

TasksPage.tsx – kanban board (To Do / In Progress / Done) with manual task creation.

InitiativesPage.tsx – list of initiatives with health status badges, create new.

InitiativeDetailPage.tsx – health trend charts, timeline of linked meetings/tasks/threads, link/unlink modal.

CoachingPage.tsx – effectiveness trend chart, score ring, meeting type breakdown table, “Ask the Coach” free‑text input.

AlertSettingsPage.tsx – thresholds for risk escalation, stale threads, overdue tasks, coach digest frequency.

SpeakerProfileManager.tsx – list, create, delete speaker profiles with alias merging.

Settings.tsx – Google Calendar connect, Slack webhook config, navigation cards to Alert Preferences and Speaker Profiles.

Pricing.tsx – three‑tier pricing (Free/Pro/Business) with Stripe checkout buttons.

Landing.tsx – marketing page with “Get Pro” buttons that call POST /api/payments/create-checkout-session.

App Console (AppPanel.tsx):

RecordingStep – countdown, live recording timer, mic icon, demo button (hidden for Pro/Business), initiative picker dropdown.

ProcessingStep, NameSpeakersStep, AnalyzingStep, ResultsStep – pipeline UI.

ResultsStep includes Keep/Discard buttons and “View Saved Meeting” link.

6. BACKEND API LAYER (as‑built from v4.1 doc + v3.0 routes)
All routes are Hono sub‑apps mounted in index.ts. Middleware chain: CORS → authMiddleware (verifies Supabase JWT, sets c.get('user')) → rateLimitMiddleware → (optional) requirePlan('pro'|'business').

6.1 Existing v3.0 Routes (still present)
Route	Methods	Purpose	Plan Gate (from v4.1 doc)
/api/auth/*	–	Public auth endpoints	Public
/api/transcribe	POST	Submit audio file to AssemblyAI	Free (refactored to call ingest())
/api/status/:jobId	GET	Poll transcription status	Free
/api/analyze	POST	Send transcript to Groq for 13‑field extraction	Free (refactored to call ingest())
/api/draft-email	POST	Generate follow‑up email	Free
/api/coach	POST	Generate meeting coach advice	Pro (upgraded to multi‑meeting coach)
/api/meetings	GET, DELETE	List/delete meetings	Free
/api/tasks	GET, POST, PUT	Task management	Free
/api/tasks/:id/complete	PUT	Mark task complete	Free
/api/threads	GET, POST	Unresolved threads	Free
/api/threads/:id/resolve	POST	Mark thread resolved	Free
/api/patterns	GET, POST	Legacy pattern endpoint (will be replaced)	Free
/api/patterns/refresh	POST	Recalculate patterns	Free
6.2 v3.1 / v4.0 Routes (added, as per v4.1 doc and upgrade doc)
Route	Methods	Purpose	Plan Gate
/api/ingest	POST	Entry point for orchestrated ingestion	Free
/api/calendar/sync	POST	Trigger calendar auto‑ingestion	Pro
/api/calendar/callback	–	Google OAuth callback	–
/api/calendar/connect	–	Connect Google Calendar	Pro
/api/calendar/status	–	Calendar sync status	Pro
/api/calendar/webhook	–	Google Calendar push webhook	Pro
/api/intelligence/patterns	GET	Retrieve pre‑computed pattern data	Pro
/api/intelligence/risks	GET	Retrieve pre‑computed risk data	Business
/api/intelligence/feed	–	Intelligence feed	Pro / Business
/api/integrations/slack/config	GET/POST	Manage Slack configuration	Business
/api/slack/config	–	Business‑gated Slack webhook config	Business
/api/slack/webhook (or /webhooks/slack)	POST	Receive Slack interactions (future)	Business
/api/alert-preferences	GET/PUT	User alert thresholds	Pro
/api/speaker-profiles	CRUD	Speaker profile management	Pro
/api/initiatives	CRUD	Initiative (project bucket) management	Pro
/api/initiatives/:id/members	–	Link meetings/tasks/threads	Pro
/api/initiatives/:id/health	–	Initiative health snapshot	Pro
/api/initiatives/suggest	–	AI suggestion for initiatives	Pro
/api/dashboard/stats	GET	Dashboard statistics	Free
/api/usage/status	GET	Usage tracking	Free
6.3 Stripe Billing Routes (v3.1 plan, implemented)
Route	Methods	Purpose
/api/payments/create-checkout-session	POST	Create Stripe Checkout session
/api/payments/subscription	GET	Get current subscription (used by UserPlanProvider)
/api/payments/create-portal-session	POST	Create Stripe Customer Portal session
/api/payments/webhook	POST	Stripe webhook (public, signature verified)
Payment flow (as documented):

User clicks “Upgrade to Pro” → POST /api/payments/create-checkout-session { priceId, planType, successUrl, cancelUrl }

Stripe Checkout (test mode) → user pays with test card 4242…

Stripe redirects to successUrl (/dashboard?upgrade=pro&success=true)

Dashboard useEffect reads URL params, calls refetch() repeatedly.

Stripe webhook checkout.session.completed upserts profiles.subscription_tier and subscription_status.

refetch() eventually returns new tier → isPaid true → celebration modal → features unlock.

7. BACKEND SERVICES & CRON (v4.1 doc + v3.0 cron)
7.1 Services (stateless utility functions)
Service	Purpose
concurrency.ts	KV‑based semaphore (max 5 concurrent AssemblyAI jobs)
usage-tracker.ts	Writes monthly_usage table and global KV budget
ingestion-orchestrator.ts	Submits to AssemblyAI, polls until complete, computes utterances/speakers/talkTime, tracks usage, releases slot
calendar.ts	registerWatchChannel (Google Calendar push), pollCalendarEvents (15‑min fallback, refreshes tokens, detects new events)
slack.ts	sendSlackSummary (post‑meeting Block Kit), sendAlertNotification (nightly alert Block Kit); both Business‑gated
alert-service.ts	Nightly checks alert_preferences for each user, compares against meetings/threads/tasks, calls sendAlertNotification
7.2 Cron Jobs
Cron (scheduled.ts)	Schedule	Actions
Main cron	Every 15 minutes	Calls pollCalendarEvents
Nightly intelligence	Once per day (KV flag)	Runs pattern aggregation per user → intelligence_patterns / intelligence_risks, initiative health snapshots, alert service
Legacy v3.0 cron: weekly-digest.ts runs 0 9 * * 1 (Monday 9am) – weekly email digest.

8. EXTERNAL SERVICE INTEGRATIONS
AssemblyAI (v3.0 + v4.1)
POST /api/transcribe submits audio as Blob with speaker_labels: true, speech_models: ['universal'], punctuate: true, optional keyterms.

Returns job_id; frontend polls GET /api/status/:jobId.

Groq (v3.0 + v4.1)
Used in analyze.ts (13‑field extraction), coach.ts (longitudinal coaching + ask), initiatives.ts (suggestion).

Model: llama-3.3-70b-versatile, response_format: json_object.

Stripe (v3.1)
Keys: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_BUSINESS_MONTHLY.

Webhook verifies stripe-signature and handles checkout.session.completed, customer.subscription.updated, customer.subscription.deleted.

Frontend uses VITE_STRIPE_PRICE_PRO and VITE_STRIPE_PRICE_BUSINESS from .env.production.

Google Calendar (v4.0/v4.1)
OAuth2 flow: user clicks Connect → Google consent → callback to /api/calendar/callback → stores refresh token → registers watch channel.

Polling fallback runs every 15 minutes via cron.

Slack (v4.0/v4.1)
Incoming webhook stored in slack_configs table.

Business tier only.

Summary sent after each meeting processing completes; alerts sent nightly.

9. DATABASE SCHEMA (consolidated from v3.0 migrations + v4.0 additions)
All tables are in Supabase PostgreSQL with Row Level Security (RLS) enabled. Explicit policies (SELECT, INSERT, UPDATE, DELETE) are used, not FOR ALL.

9.1 Tables from v3.0 (001–006 migrations)
Table	Purpose	Key columns
profiles	User profile data (extends auth.users)	id, email, display_name, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, google_calendar_refresh_token, google_calendar_sync_enabled, google_calendar_channel_id
meetings	13‑field extraction results	user_id, title, meeting_date, duration_minutes, summary, decisions, action_items, open_questions, parking_lot, key_topics, key_quotes, sentiment, effectiveness_score, risk_flags, meeting_type, discarded, initiative_id
tasks	Action items from meetings	user_id, title, description, owner_name, due_date, priority, status, meeting_id, initiative_id
unresolved_threads	Cross‑meeting issues	user_id, title, description, severity, status, mention_count
user_patterns (or patterns)	Longitudinal AI pattern tracking	–
monthly_usage	Usage analytics	user_id, period_start, meetings_count, minutes_processed
unregistered_owners	Task owners not in system	–
9.2 Tables from v4.0 upgrade (added to v3.0 schema)
Table	Purpose	Key columns
intelligence_patterns	Weekly intelligence snapshots	user_id, avg_effectiveness, decision_velocity, sentiment_trend, updated_at
intelligence_risks	Aggregated risk frequency over time	user_id, risk_frequency (JSONB), updated_at
calendar_events	Calendar event tracking for auto‑ingestion	user_id, event_google_id, processed, recording_url, created_at
slack_configs	Slack integration config	user_id, channel_webhook_url, notify_on_completion
initiatives	User‑defined project buckets	user_id, name, description, health_status
initiative_memberships	Links meetings/tasks/threads to initiatives	initiative_id, meeting_id, task_id, thread_id
initiative_health_snapshots	Daily per‑initiative metrics	initiative_id, avg_effectiveness, open_tasks_count, unresolved_threads_count, risk_frequency
alert_preferences	User notification settings	user_id, risk_escalation_threshold, stale_thread_days, overdue_task_reminders, coach_digest_frequency
speaker_profiles	Cross‑meeting speaker identity	user_id, name, email, merged_aliases
customers (v3.1)	Stripe customer link	id (references auth.users), stripe_customer_id
subscriptions (v3.1)	Subscription state	user_id, stripe_subscription_id, stripe_customer_id, plan_type (pro/business), status, current_period_start, current_period_end, cancel_at_period_end
9.3 RLS Policy Pattern (as built)
sql
CREATE POLICY "Users can view own records" ON table_name
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records" ON table_name
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own records" ON table_name
  FOR DELETE USING (auth.uid() = user_id);
9.4 Auth Trigger (v3.0)
sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
10. THE 13 EXTRACTION FIELDS (v3.0, unchanged)
Field	Type	Description
summary	string	Meeting overview
decisions	string[]	Decisions made
action_items	object[]	Tasks with owner/deadline/priority
open_questions	string[]	Unanswered questions
parking_lot	string[]	Deferred topics
key_topics	string[]	Main discussion themes
key_quotes	object[]	Notable statements with speaker
sentiment	string	Positive/Neutral/Mixed/Tense
sentiment_reason	string	Justification
effectiveness_score	number	0‑10 rating
effectiveness_reason	string	Justification
next_agenda	string[]	Suggested next meeting topics
risk_flags	string[]	Identified risks
meeting_type	string	Classification
11. ANALYSIS PIPELINE (v3.0, still used)
text
Audio file upload
    ↓
AssemblyAI transcription (speaker_labels=true)
    ↓
Speaker detection + talk time calculation
    ↓
User names speakers (UI step)
    ↓
Named transcript → Groq Llama 3.3 70B
    ↓
13-field JSON extraction
    ↓
Results saved + Coach + Email generation
12. SUBAGENT‑DRIVEN DEVELOPMENT (from v4.0 upgrade doc – now built)
The upgrade document describes a subagent‑driven development workflow used internally (not exposed as an API). It includes:

Implementer subagent – writes failing test first, then minimal implementation.

Spec compliance reviewer – checks all requirements from spec.

Code quality reviewer – reviews correctness, style, error handling, testing, security, performance.

Two‑stage review (spec then quality) before commit.

This is an internal development practice, not a user‑facing feature.

13. ENVIRONMENT VARIABLES (as documented)
Frontend (Cloudflare Pages / .env.local)
VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

VITE_API_URL

VITE_STRIPE_PUBLISHABLE_KEY

VITE_STRIPE_PRICE_PRO

VITE_STRIPE_PRICE_BUSINESS

Backend (Cloudflare Worker secrets / .dev.vars)
SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY

ASSEMBLYAI_API_KEY

GROQ_API_KEY_1, _2, _3

STRIPE_SECRET_KEY

STRIPE_WEBHOOK_SECRET

STRIPE_PRICE_PRO_MONTHLY

STRIPE_PRICE_BUSINESS_MONTHLY

Google OAuth credentials (implied but not listed explicitly)

Slack webhook URL (stored in DB, not as env)

14. DEPLOYMENT CONFIGURATION (v3.0 + v4.x)
Cloudflare Worker (wrangler.toml)
Name: meetingmind-api

Main: src/index.ts

Compatibility date: 2024-09-23, flags: ["nodejs_compat"]

Environments: staging, production

Production cron: ["0 9 * * 1"] (weekly digest)

Additional cron (v4.0) runs every 15 minutes and nightly (KV flag) – not shown in v3.0 wrangler but implied by the upgrade.

Cloudflare Pages
Framework preset: React (Vite)

Root directory: frontend

Build command: npm run build

Output directory: dist

Node version: 20 (via .nvmrc)

15. CRITICAL DESIGN DECISIONS (from v3.0 document, still applicable)
No top‑level client instantiation – Supabase, Groq, AssemblyAI clients are instantiated inside request handlers using c.env.

Path alias resolution – Uses vite-tsconfig-paths plugin because Cloudflare Pages does not respect tsconfig.json paths.

RLS policy syntax – Separate explicit policies for SELECT, INSERT, UPDATE, DELETE; never FOR ALL.

File system operations – fs/promises not available in Workers; audio is streamed directly to AssemblyAI.

Environment file strategy – frontend/.env.local (Vite VITE_*), backend/.dev.vars (no prefix).

16. OBSERVABILITY (v3.0)
Worker logs: npx wrangler tail --env production

Dashboard metrics: Cloudflare Dashboard → Workers & Pages → meetingmind-api → Metrics

Build logs: Pages deployment logs

17. PRODUCTION URLS (as built)
Frontend: https://meetingmind-web.pages.dev (also https://meetingmind-v3.pages.dev from v4.1 doc)

Backend: https://meetingmind-api-production.intellicaai-ai.workers.dev

Health check: same URL + /

18. PRICING & PLAN TIERS (as built, from v4.1 doc and v3.1 plan)
Plan	Price	Key Features
Free	$0	10 meetings/mo (from v3.1 plan), manual upload, basic dashboard, 13‑field extraction, tasks, threads, patterns
Pro	$9/mo	Unlimited meetings (or 30 meetings/mo from v4.0 doc), calendar auto‑ingest, pattern trends, multi‑meeting coach, alert preferences, speaker profiles, initiatives
Business	
29
/
m
o
(
o
r
29/mo(or29/mo from v4.0 doc)	Pro features + risk aggregation, Slack integration, team dashboard (implied), priority support
Note: There is a slight variation in meeting limits between documents. The v4.1 doc says “Free 5 meetings/mo” in one section but “Free 10 meetings/mo” in another. The v3.1 plan says 10 meetings/mo. The v4.0 upgrade doc says 30 meetings/mo for Pro. The consolidated as‑built reflects the most specific per‑doc statement, but the actual live limits would need to be verified from code.

19. COMPETITIVE POSITIONING (from v4.0 upgrade doc)
The upgrade document positions MeetingMind v4.0 against Otter, Fireflies, and Gong:

Auto‑ingestion: Universal (Calendar, Webhooks, Upload) – matches Gong, exceeds Otter/Fireflies.

Extraction depth: 13‑field – deeper than basic summary.

Cross‑meeting memory: Yes, via unresolved threads + pattern trends.

Multi‑meeting coach: Yes (unique).

Proactive intelligence: Nightly risk aggregation, thread escalation.

Workflow integration: Slack, Email, Calendar auto‑ingest.

20. SUCCESS METRICS (from v4.0 upgrade doc, target)
Metric	Target
Activation rate	>60% use auto‑ingestion within 7 days
Intelligence engagement	>40% weekly active users view Intelligence Dashboard
Pro conversion rate	>5% free‑to‑Pro within 30 days
Business adoption	>20% of Business users activate Slack integration
Gross monthly churn	<5%
21. MIGRATION FROM v3.0 TO CURRENT STATE (v4.0 upgrade doc steps)
The upgrade document lists a 16‑week roadmap that is now complete (as of v4.1 live). Key steps included:

Add e‑commerce (Stripe, webhooks, entitlements).

Build Ingestion Orchestrator and refactor routes.

Deploy nightly pattern aggregation cron.

Implement Calendar Trigger Service.

Upgrade /api/coach to multi‑meeting version.

Build Slack Integration.

Implement automated risk escalation.

22. KNOWN LIMITATIONS / DESIGN NOTES (from the docs)
OAuth race condition fixed by waiting for first onAuthStateChange event.

Cloudflare Pages alias resolution requires vite-tsconfig-paths.

RLS must use explicit policies.

Stripe webhook uses constructEventAsync with createSubtleCryptoProvider for Cloudflare Workers.

Concurrency limited to 5 simultaneous AssemblyAI jobs via KV semaphore.

Google Calendar has both push (watch channel) and polling fallback every 15 minutes.

Slack integration is Business‑tier only.

Unregistered owners in tasks are supported (table unregistered_owners).

23. FUTURE IMPROVEMENTS IDENTIFIED BUT NOT YET DEPLOYED (from v3.0 document)
These are mentioned in the v3.0 document as not deployed:

Custom SMTP for branded auth emails

Point‑in‑Time Recovery (PITR) for database

Asymmetric JWT signing keys for zero‑downtime rotation

(These are not part of the current as‑built v4.1.)

24. GLOSSARY OF TERMS (from v4.0 upgrade doc)
Term	Definition
Ingestion Orchestrator	Normalises all meeting sources (manual, recording, calendar, webhook) into a single pipeline.
Multi‑meeting coach	Analyses last 20 meetings to provide longitudinal insights.
Intelligence Dashboard	Primary landing page showing pattern trends, risk heatmaps, active threads.
Risk aggregation	Nightly computation of risk frequency over time.
Unresolved threads	Cross‑meeting topic tracking with severity and mention count.