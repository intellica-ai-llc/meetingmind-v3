MEETINGMIND v4.0 — COMPLETE UPGRADE ARCHITECTURE
From Meeting Assistant to Organisational Intelligence Platform

Version	4.0.0
Date	April 25, 2026
Status	Production Ready (v3.0 Live + v4.0 Design)
Base System	MeetingMind v3.0 As-Built (uploaded)
Concurrent Work	v3.1 E-Commerce (Stripe integration) – being implemented in parallel
Stack	Cloudflare Workers + Supabase + AssemblyAI + Groq + Stripe
1. EXECUTIVE SUMMARY
MeetingMind v3.0 is a production-grade meeting assistant with a strong ingestion pipeline, a 13-field extraction engine, and a solid relational data model. However, it relies entirely on users to trigger its intelligence. The system is correctly built but under-activated.

The v4.0 upgrade transforms MeetingMind from a user-triggered tool into a continuous organisational intelligence platform. It does so by adding three critical layers:

Automated Ingestion – meetings flow into the system without manual effort.

Continuous Intelligence – longitudinal patterns, risks, and threads are computed automatically in the background.

Proactive Surfacing – insights are pushed into the user's primary workflow (dashboard, Slack) rather than waiting to be found.

This upgrade builds directly on the live v3.0 codebase, requires no rewrites, and each phase is tied to monetisation tiers to drive revenue growth.

2. FROM v3.0 AS-BUILT TO v4.0 TARGET: GAP ANALYSIS
Based on the as-built architecture and the Intelligence Amplification Plan, here are the specific gaps we are closing:

Gap	v3.0 Current State	v4.0 Target State	Competitive Impact
Ingestion Triggers	User-triggered only (manual upload/recording)	Universal Ingestion Orchestrator with calendar auto-ingest and webhook support	Matches Gong/Otter auto-join; surpasses with unified pipeline for any source
Intelligence Computation	On-demand only (/api/patterns)	Nightly Background Jobs for pattern aggregation, thread continuity, and risk trends	Creates a proactive moat – no competitor computes cross-meeting risk automatically
Coaching Depth	Single-meeting analysis	Multi-Meeting Coaching Engine that analyses the last 20 meetings	Unique feature; no other tool offers longitudinal behavioural coaching
Dashboard Focus	Task dashboard is primary	Intelligence Dashboard becomes the primary landing page with trends, risk heatmaps, and active threads	Transforms the product from a utility to an executive command centre
Workflow Integration	None	Slack Integration for push summaries and task reminders	Brings intelligence to the user, turning every meeting into a referral opportunity
3. SYSTEM ARCHITECTURE (v4.0 TARGET STATE)
This architecture builds on the v3.0 as-built deployment (Cloudflare Pages + Workers, Supabase) and introduces new services and cron jobs.

text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         MEETINGMIND v4.0 — INTELLIGENCE PLATFORM ARCHITECTURE            │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                         INGESTION LAYER (Automated)                                  │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────────┐ │ │
│  │  │ Manual Upload│ │  Recording   │ │   Calendar   │ │  External Webhooks            │ │ │
│  │  │ (existing)   │ │  (existing)  │ │ (Google API) │ │  (Zoom, Teams, etc.)          │ │ │
│  │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────────┬───────────────────┘ │ │
│  │         └────────────────┴────────┬───────┴────────────────────┘                     │ │
│  │                                   ▼                                                   │ │
│  │                    ┌─────────────────────────────┐                                   │ │
│  │                    │  INGESTION ORCHESTRATOR      │  (NEW)                            │ │
│  │                    │  (Normalizes all sources)    │                                   │ │
│  │                    └─────────────┬───────────────┘                                   │ │
│  └──────────────────────────────────┼───────────────────────────────────────────────────┘ │
│                                     ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                         EXTRACTION PIPELINE (v3.0 - Unchanged)                       │ │
│  │                   AssemblyAI → Groq 13-field → Database Persist                      │ │
│  └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                                     │
│                                     ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                         CONTINUOUS INTELLIGENCE ENGINE (NEW)                         │ │
│  │                                                                                      │ │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐                      │ │
│  │  │ Pattern          │ │ Thread           │ │ Risk             │                      │ │
│  │  │ Aggregation      │ │ Continuity       │ │ Aggregation      │                      │ │
│  │  │ (Nightly Cron)   │ │ (Nightly Cron)   │ │ (Nightly Cron)   │                      │ │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘                      │ │
│  │                                                                                      │ │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────┐│ │
│  │  │                    MULTI-MEETING COACHING ENGINE (UPGRADED)                      ││ │
│  │  │  Aggregates last 20 meetings → Groq → longitudinal coaching insights             ││ │
│  │  └──────────────────────────────────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                                     │
│                                     ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                         SURFACING & INTEGRATION LAYER                                │ │
│  │                                                                                      │ │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐                      │ │
│  │  │ Intelligence     │ │ Slack            │ │ Email            │                      │ │
│  │  │ Dashboard (Web)  │ │ Integration      │ │ Digests          │                      │ │
│  │  │ (Primary UI)     │ │ (Push Summaries) │ │ (Weekly Cron)    │                      │ │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘                      │ │
│  └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                         MONETIZATION LAYER (v3.1 E-Commerce)                         │ │
│  │                                                                                      │ │
│  │  Free: Manual ingestion, basic dashboard                                             │ │
│  │  Pro ($9/mo): Calendar auto-ingest, pattern trends, multi-meeting coach              │ │
│  │  Business ($29/mo): Risk aggregation, Slack integration, team dashboard              │ │
│  └─────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘
4. COMPONENT DESIGN & INTEGRATION POINTS
Every new component is designed to integrate with the existing v3.0 codebase without requiring a rewrite of core logic.

4.1 Ingestion Orchestrator (New)
File: backend/src/services/ingestion-orchestrator.ts

Integrates with: Existing transcribe and analyze logic. Existing meetings, tasks, threads tables.

Function: Acts as the single entry point for all meeting inputs. Normalises audio sources and then calls the existing transcription/extraction pipeline.

Key Implementation Detail: All existing routes (/api/transcribe, /api/record) should be refactored to call ingest(...) to ensure all ingestion follows the same path and triggers the same post-processing (like Slack pushes).

4.2 Calendar Trigger Service (New)
File: backend/src/services/calendar.ts

Integrates with: A new calendar_events table. The Google Calendar API.

Function: Polls user's Google Calendar for recently ended meetings with recordings. On detection, calls ingest({ type: 'calendar_event' }) automatically.

Monetisation Gate: This is the primary value driver for the Pro tier. The service will only be active for users with an active Pro or Business subscription.

4.3 Continuous Intelligence Engine (Modified Cron)
File: backend/cron/intelligence-engine.ts

Integrates with: The existing crons configuration in wrangler.toml. New aggregate tables intelligence_patterns and intelligence_risks.

Function: Contains three nightly jobs that query the existing meetings and unresolved_threads tables, compute aggregates, and store them in new dedicated tables for instant dashboard retrieval.

4.4 Multi-Meeting Coaching (Modified Endpoint)
File: backend/src/routes/analyze.ts (modification to /api/coach)

Integrates with: The existing Groq client.

Function: Modifies the prompt construction to fetch the last 20 meetings for the user and pass aggregated statistics (trends, averages) to the LLM, instead of just a single meeting transcript.

4.5 Intelligence Dashboard (Frontend Modification)
Files: frontend/src/features/dashboard/Dashboard.tsx, frontend/src/features/dashboard/PatternDashboard.tsx

Integrates with: New API endpoints /api/intelligence/patterns and /api/intelligence/risks.

Function: Dashboard.tsx is modified to make the PatternDashboard the primary view. It fetches pre-computed intelligence and displays it as charts (effectiveness trends, risk heatmaps) and proactive alerts.

4.6 Slack Integration (New)
File: backend/src/services/slack.ts

Integrates with: A new slack_configs table. The Stripe subscription system to verify Business plan status.

Function: After a meeting is successfully processed, if the user is on a Business plan, this service constructs a block-kit message and pushes it to a configurable Slack webhook URL.

5. DATABASE SCHEMA ADDITIONS
These tables are added to the existing v3.0 schema to support the new intelligence and integration layers.

sql
-- Weekly intelligence snapshots for fast dashboard retrieval
CREATE TABLE intelligence_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avg_effectiveness REAL,
  decision_velocity REAL,
  sentiment_trend TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated risk frequency over time
CREATE TABLE intelligence_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_frequency JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar event tracking for auto-ingestion
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_google_id TEXT,
  processed BOOLEAN DEFAULT false,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Slack configurations
CREATE TABLE slack_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_webhook_url TEXT,
  notify_on_completion BOOLEAN DEFAULT true
);
6. API ARCHITECTURE (EXPANDED v4.0)
The existing API routes are retained. New routes are added, and one existing route (/api/coach) is upgraded.

Endpoint	Method	Purpose	Plan Gate	Status
Existing v3.0 Routes				
/api/auth/register, /api/auth/login	POST	User authentication	Free	Live
/api/transcribe	POST	Refactored — now calls ingest()	Free	Live
/api/record	POST	Refactored — now calls ingest()	Free	Live
/api/status/:jobId	GET	Poll transcription status	Free	Live
/api/analyze	POST	Refactored — now calls ingest()	Free	Live
/api/meetings	GET, DELETE	List/delete meetings	Free	Live
/api/tasks	GET, POST, PUT	Task management	Free	Live
/api/threads	GET, POST	Unresolved threads	Free	Live
/api/patterns	GET, POST	Legacy — will be replaced by /api/intelligence/patterns	Free	Live
/api/coach	POST	Upgraded to Multi-Meeting Coach	Pro	Live
/api/draft-email	POST	Follow-up email generation	Free	Live
New v3.1 E-Commerce Routes (being implemented in parallel)				
/api/billing/create-checkout-session	POST	Start Stripe subscription	Auth	In Progress
/api/billing/subscription	GET	Get current subscription	Auth	In Progress
/api/billing/create-portal-session	POST	Manage billing via Stripe Portal	Auth	In Progress
/api/stripe/webhook	POST	Handle Stripe events	Public	In Progress
New v4.0 Intelligence Routes				
/api/ingest	POST	Entry point for orchestrated ingestion	Free	To Build
/api/calendar/sync	POST	Trigger calendar auto-ingestion	Pro	To Build
/api/intelligence/patterns	GET	Retrieve pre-computed pattern data	Pro	To Build
/api/intelligence/risks	GET	Retrieve pre-computed risk data	Business	To Build
/api/integrations/slack/config	GET/POST	Manage Slack configuration	Business	To Build
/webhooks/slack	POST	Receive Slack interactions (future)	Business	To Build
7. COMPETITIVE POSITIONING & MOAT
The v4.0 upgrade completes the product's evolution into a defensible intelligence platform.

Feature	Otter.ai	Fireflies.ai	Gong	MeetingMind v4.0
Auto-Ingestion	Zoom only	Zoom/Meet	Zoom/Teams	Universal (Calendar, Webhooks, Upload)
Extraction Depth	Basic summary	Basic + Questions	Deal-focused	13-field extraction
Cross-Meeting Memory	No	No	Limited	Unresolved threads + pattern trends
Multi-Meeting Coach	No	No	No	Yes (last 20 meetings)
Proactive Intelligence	No	Recaps	Deal alerts	Nightly risk aggregation, thread escalation
Workflow Integration	Email	Email	Salesforce	Slack, Email, (Calendar auto-ingest)
The competitive moat is now compound organisational memory. While competitors focus on single-meeting accuracy, MeetingMind v4.0 builds a longitudinal understanding of a team's effectiveness, risk profile, and decision velocity. This data becomes irreplaceable, driving retention and expansion.

8. MONETISATION & PLAN TIERS (FINAL)
The v4.0 features are specifically designed to drive users from Free to Pro, and from Pro to Business.

Plan	Price	Key Features (v4.0 Additions in Bold)
Free	$0	5 meetings/mo, manual upload, basic dashboard
Pro	$9/mo	30 meetings/mo, calendar auto-ingest, pattern trends, multi-meeting coach
Business	$29/mo	50 team meetings/mo, risk aggregation, Slack integration, priority support
9. IMPLEMENTATION ROADMAP (TO v4.0 LAUNCH)
This roadmap integrates the concurrent v3.1 e-commerce work and sequences the v4.0 build to deliver value incrementally.

Phase 1: E-Commerce Foundation (Current - Week 1)
Complete v3.1 Stripe integration, webhooks, and entitlement middleware.

Run 007_subscriptions.sql migration.

Verify: Test payments work, subscriptions update, and plan gates function correctly.

Phase 2: Foundational Intelligence (Week 2-3)
Build the Ingestion Orchestrator (ingestion-orchestrator.ts).

Refactor existing routes (/api/transcribe, /api/record) to use it.

Deploy the nightly pattern aggregation cron job.

Promote the Intelligence Dashboard to the primary landing page.

Monetisation Impact: Immediate increase in product stickiness for all users.

Phase 3: Auto-Ingestion & Coaching (Week 4-5)
Implement the Calendar Trigger Service (Google Calendar API).

Upgrade the /api/coach endpoint to its multi-meeting version.

Monetisation Impact: Drives upgrades to Pro for the "set and forget" meeting analysis.

Phase 4: Workflow Embedding (Week 6-7)
Build the Slack Integration for push summaries.

Implement the automated risk escalation logic in the nightly cron.

Monetisation Impact: Drives upgrades to Business for team-wide workflow dependency.

Phase 5: Launch & Iterate (Week 8)
Full QA and load testing.

Public v4.0 launch with updated marketing and pricing.

Monitor key metrics and begin Phase 6 (Predictive & CRM).

10. SUCCESS METRICS
Metric	Target	Measurement Tool
Activation Rate	>60% of signups use auto-ingestion within 7 days	DB + Frontend analytics
Intelligence Engagement	>40% weekly active users view the Intelligence Dashboard	Frontend analytics
Pro Conversion Rate	>5% free-to-Pro conversion within 30 days	Stripe
Business Adoption	>20% of Business users activate Slack integration	DB
Gross Monthly Churn	<5%	Stripe
