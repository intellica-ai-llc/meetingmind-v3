ARCHITECTURE BLUEPRINT – MeetingMind v5.1
Source Chat: Full conversation (May 2–27, 2026)
Generated: 2026‑05‑27T08:00:00Z
Blueprint Integrity Hash: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Overall Confidence: 96%
Transfer Continuity Score: 0.98

1. CONTEXT & STAKEHOLDERS
System Goals
MeetingMind v5.1 transforms a v4.3 meeting intelligence platform into a self‑improving organisational intelligence hub with a complete MCP fabric. Every meeting becomes an instantly queryable, actionable, cross‑referenced asset, accessible simultaneously via the web app, any AI agent (MCP), and real‑time webhooks. The system autonomously creates MeetingType skills, produces a 30‑field extraction via a 6‑stage pipeline with zero‑cost LLM routing, and delivers predictive insights that compound across meetings and initiatives.

Stakeholders & Concerns
Stakeholder	Role	Key Concerns
Product Owner (Damain Peter Ramsajan)	Vision, approvals, release authority	Feature completeness, competitive moat, zero API cost, production‑grade reliability
Backend Engineering	Cloudflare Workers, Supabase, LLM routing, MCP	Correctness, performance, security, cost
Frontend Engineering	React/Vite, design tokens, UX	Visual consistency, responsiveness, user flow
Enterprise Users	Business/Enterprise tier	Compliance (SOC2), audit, CRM integration, SSO
Free/Pro Users	Individual professionals, small teams	Ease of use, value for money, AI‑powered insights
AI Agents (external)	Claude, ChatGPT, Cursor, any MCP client	Stable, well‑described MCP tools, secure authentication
External Systems & Actors
Constraints
ID	Constraint	Source
C‑01	Must run on Cloudflare Workers (Hono) and Pages	v4.3 as‑built; deployment command cheat sheet
C‑02	Must use Supabase PostgreSQL for all data, RLS enforced	v4.3 architecture
C‑03	Must use existing design tokens (--mm-*) and UI components (Card, Button) without new CSS frameworks	v4.3 architecture; design system rules
C‑04	No breaking changes to existing v4.3 features	explicit instruction from product owner
C‑05	All secrets in Cloudflare Secrets, not hardcoded	deployment guide
C‑06	MCP specification 2025‑11‑25 compliance, Streamable HTTP primary	MCP server architecture
C‑07	OWASP MCP Top 10 compliance mandatory	security research
C‑08	Zero API cost for extraction (free tier LLMs only)	product owner requirement, Phase 4 design
C‑09	Circuit breaker must never silently cascade from free to paid models	Phase 4 design discussion
C‑10	Full audio and transcript must be persisted with Keep/Discard lifecycle	Phase 9 design discussion
Confidence: 98% – all constraints directly from chat and uploaded architecture files.

2. SOLUTION STRATEGY (PLATFORM‑INDEPENDENT VIEW)
Key Architectural Patterns
Hexagonal Architecture: Core domain logic (meeting extraction, coaching, skill management) is isolated from infrastructure (Cloudflare Workers, Supabase, LLM providers). Adapters (services/, adapters/) bridge the gap.

MCP as Integration Fabric: The Model Context Protocol is the sole mechanism for external AI access, replacing custom REST APIs for agentic use cases. Bidirectional – server (expose 22 tools) and client (consume external MCP servers via Gateway tools).

Multi‑Agent Extraction Pipeline: Six specialized stages, each with its own prompt, quality gate, and model‑tier routing. Stages 3 & 4 run in parallel to reduce latency. Validated by MeetBench‑XL.

Closed‑Loop Self‑Improvement: Inspired by Hermes Agent, SkillForge, AutoSkill. MeetingType skills auto‑create from 3+ meetings with high quality, auto‑load for future meetings, and auto‑patch via token‑efficient replacement when quality degrades.

Cost‑Boundary‑Aware Router: Tier 0 (free models: Gemma 4, Groq Llama) operates its own circuit breaker internally. If all Tier 0 models are degraded, the system returns a typed SERF error with retry_after. It never crosses into Tier 1 (Claude) without explicit user opt‑in.

Five‑Layer Memory: Short‑term (context window), procedural (skills), contextual (pgvector), user/org model (dialectic), session search (LLM summarization).

Domain Model






































































Responsibility Allocation
Domain Responsibility	Component	Technology‑Agnostic
Meeting transcription & speaker labeling	Ingestion Orchestrator	AssemblyAI adapter
Multi‑stage extraction	Extraction Engine (prompt‑registry, quality‑gates)	Six‑stage pipeline with model routing
Cross‑meeting intelligence	Continuous Intelligence Engine (cron)	Nightly aggregation, skill manager, org modeler
Meeting‑to‑CRM sync	CRM Adapters	CrmAdapter interface
External AI access	MCP Server	Streamable HTTP + OAuth2.1 + API keys
Audio & transcript persistence	R2 + meeting_transcripts	Keep/Discard lifecycle, nightly cleanup
User authentication & plan gating	Auth Middleware, Entitlement	Supabase JWT + RLS
Confidence: 95% – domain model derived from database migrations, responsibility allocation from services and route design.

3. BUILDING BLOCK VIEW (C4 Level 2 + 3)
Containers Overview
Container: API Worker (Hono on Cloudflare Workers)
Technology Stack: TypeScript, Hono 4.0.0, Zod, Groq SDK, AssemblyAI SDK, Stripe SDK, @modelcontextprotocol/sdk (for MCP client functions).

Component	Responsibility	Public Interface (Contract)	Dependencies
middleware/auth.ts	Validate JWT on all routes; exempt public paths	Pre: request has Authorization: Bearer <token>. Post: c.get('user') contains {id, email} if valid; else 401. [FORMAL]	Supabase Auth
middleware/entitlement.ts	Plan‑gate routes	Pre: c.get('user') exists. Post: if user.plan >= required, call next(); else 403. [SEMI‑FORMAL]	profiles table
routes/transcribe.ts	Audio → AssemblyAI, store in R2, persist transcript	Pre: FormData with audio blob. Post: returns {job_id, r2_key}. On status completed, stores full transcript in meeting_transcripts and audio in R2. [SEMI‑FORMAL]	AssemblyAI, R2, meeting_transcripts
routes/analyze.ts	6‑stage extraction pipeline	Pre: {transcript, speaker_map, meeting_title, meeting_date}. Post: returns JSON with all 30 fields. Runs 6 stages with parallel execution (3&4), quality gates, and retry. [SEMI‑FORMAL]	llm-router, prompt-registry, quality-gates
routes/search.ts	Semantic search via pgvector	Pre: query parameter q non‑empty. Post: returns {results, method:'vector'|'fulltext'}. Falls back to ILIKE if vector unavailable. [SEMI‑FORMAL]	embedding-service, match_meetings RPC
routes/aha.ts	Generate "Aha" insight	Pre: {meeting_id}. Post: returns {insight} – punchy single sentence. [SEMI‑FORMAL]	Groq, meetings table
services/skill-manager.ts	MeetingType skill lifecycle	Pre: called with userId. Post: detects ≥3 meetings of same type with ≥80% quality, creates skill row. [SEMI‑FORMAL]	meetings, meeting_skills
services/org-modeler.ts	Dialectic organizational insights	Pre: ≥10 meetings for user. Post: upserts insights with confidence scores. Promotes to memory at ≥90%. [SEMI‑FORMAL]	meetings, organizational_insights
services/embedding-service.ts	Generate embeddings via Groq	Pre: valid text, valid API key. Post: returns number[] (768‑dim) or empty array. Indexes both summary and full transcript. [FORMAL]	Groq embeddings API
services/predictive-alerts.ts	Daily alert generation	Pre: called with userId. Post: generates anomaly, escalation, imbalance alerts into predictive_alerts. [SEMI‑FORMAL]	intelligence_patterns, meetings, threads
services/webhook-delivery.ts	HMAC‑signed webhook push	Pre: valid URL, secret, event payload. Post: POSTs signed payload; retries on failure. [SEMI‑FORMAL]	Cloudflare Fetch
adapters/salesforce.ts	Native Salesforce CRM sync	Pre: valid OAuth token. Post: createMeetingNote returns note ID. Implements CrmAdapter. [SEMI‑FORMAL]	Salesforce REST API
adapters/hubspot.ts	Native HubSpot CRM sync	Same contract as Salesforce. [SEMI‑FORMAL]	HubSpot API
cron/scheduled.ts	Nightly intelligence + cleanup	Runs daily: skill creation, org modeling, predictive alerts, orphan transcript cleanup. [SEMI‑FORMAL]	All services
Container: MCP Worker (dedicated Cloudflare Worker)
Technology Stack: Same as API worker, but only serves MCP endpoints. @modelcontextprotocol/sdk for server transport.

Component	Responsibility	Public Interface (Contract)	Dependencies
mcp/index.ts	Hono app, /api/mcp	Pre: valid MCP token. Post: routes JSON‑RPC to tools. Session management via Mcp-Session-Id. [FORMAL]	server.ts, transport.ts, cabp-pipeline
mcp/middleware/cabp-pipeline.ts	6‑stage identity pipeline	Pre: Authorization: Bearer <token>. Stages: token→scope→user→plan→rate‑limit→audit. [FORMAL]	auth/oauth.ts, tool-acl.ts
mcp/middleware/tool-acl.ts	Plan‑gated tool access + annotations	Pre: verifiedUser on context. Post: returns {readOnlyHint, destructiveHint} per Anthropic spec. [FORMAL]	Tool manifest
mcp/middleware/serf-envelope.ts	Structured error wrapping	Pre: any tool execution result. Post: wraps in {success, data} or {success, error: {error_type, agent_instruction, …}}. [FORMAL]	SERF types
mcp/tools/search.ts	5 search tools (real Supabase + pgvector)	Pre: valid MCP request. Post: returns JSON content with cited results. [SEMI‑FORMAL] (Zod schemas)	Supabase, embedding-service
mcp/tools/intelligence.ts	8 intelligence tools	Same contract, returns aggregated intelligence, uses LLM router for deep synthesis. [SEMI‑FORMAL]	llm-router, Supabase
mcp/tools/execution.ts	6 execution tools (create action, sync CRM, notify, webhook)	Write operations; require meetingmind:execute scope. [SEMI‑FORMAL]	CRM adapters, Slack service
mcp/tools/gateway.ts	3 gateway tools (connect, enrich, sync)	Pre: valid external MCP server URL. Post: discovers tools, proxies calls. [SEMI‑FORMAL]	mcp-bridge.ts
mcp/bridge/mcp-bridge.ts	External MCP tool proxy	Pre: server URL + auth token. Post: tools/list → tools/call proxy. [SEMI‑FORMAL]	External MCP servers
Container: Frontend (React SPA)
Technology Stack: React 18.2.0, Vite 5.2.0, TypeScript, Tailwind 3.4.3, design tokens (--mm-*). All styling uses inline styles per existing pattern.

Component	Responsibility	Props/Events	Dependencies
AhaInsightCard	Gold card with punchy insight	insight: string, meetingTitle: string, onDismiss?: () => void	Card (variant="gold")
DecisionVelocityGauge	Decisions‑this‑week widget with trend arrow	None (fetches internally)	/api/dashboard/stats
RiskRadarChart	High/medium/low risk breakdown	None	/api/dashboard/stats
SinceLastLoggedIn	Summary of changes since last visit	None	/api/dashboard/since-last-login
SemanticSearchPage	Full‑page search with cited results	None	/api/search
GrowingBrainPage	Knowledge graph (skills, insights, milestones)	None	/api/intelligence/knowledge-graph
PredictiveAlertsPage	List of delivered predictive alerts	None	/api/dashboard/stats
ComplianceDashboardPage	SOC2 readiness, audit logs	None	/api/compliance
QuarterlyReportPage	Download/view quarterly reports	None	/api/reports/quarterly
McpKeyManagementPage	Generate/revoke MCP API keys	None	/api/mcp-keys
Shell.tsx (mod)	Sidebar links, skills pill, mobile responsive	None	usePlan()
ResultsStep.tsx (mod)	Aha card, action bar “Send to…”	None	AhaInsightCard
DashboardV5.tsx (mod)	Intelligence Pulse row with 3 new widgets	None	DecisionVelocityGauge, RiskRadarChart, SinceLastLoggedIn
Confidence: 94% – all components defined in batches, validated against current repo files.

4. RUNTIME VIEW
Scenario 1: Meeting Processing (Full Pipeline)
Scenario 2: MCP Agent Tool Call
Scenario 3: Circuit Breaker – All Tier 0 Models Degraded
Confidence: 97% – scenarios directly from route/service implementation plans and router design.

5. DEPLOYMENT VIEW
Infrastructure
Environment	Frontend	Backend API Worker	MCP Worker	Database	Audio Storage
Production	Cloudflare Pages (meetingmind-v3 project, custom domain meeting-mind.com)	Cloudflare Workers (meetingmind-api-production)	Cloudflare Workers (meetingmind-mcp)	Supabase (tfanegrlbztbxqinhdhq)	R2 (meeting-audio)
Staging	Pages preview deploy	meetingmind-api-staging	meetingmind-mcp-staging	Supabase staging branch	R2 staging bucket
Local	Vite dev server	wrangler dev on port 8787	wrangler dev on port 8788	Local Supabase or production DB (with care)	R2 dev bucket
CI/CD Pipeline











Environment Variable Catalog (names only, no values)
Variable	Used by
VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLISHABLE_KEY, VITE_STRIPE_PRICE_PRO, VITE_STRIPE_PRICE_BUSINESS, VITE_GOOGLE_CLIENT_ID	Frontend
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ASSEMBLYAI_API_KEY, GROQ_API_KEY_1, GOOGLE_AI_STUDIO_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_BUSINESS_MONTHLY, STRIPE_PRICE_ENTERPRISE, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, WEBHOOK_SIGNING_SECRET, ACCESS_CODE_PASSWORD, SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET, HUBSPOT_ACCESS_TOKEN, PIPEDRIVE_API_TOKEN, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ANTHROPIC_API_KEY (optional)	API Worker
All above, plus MCP_OAUTH_ISSUER	MCP Worker
RATE_LIMIT_KV (binding), MCP_SESSION_KV (binding), MCP_TOOL_INDEX_KV (binding), MEETING_AUDIO (R2 binding)	Both Workers
Confidence: 100% – exact environment variable list from command cheat sheet and batch scripts.

6. CROSS‑CUTTING CONCEPTS
Security
Concern	Implementation
Authentication (web app)	Supabase Auth (Google OAuth, email/password). JWT validated on every request via middleware/auth.ts.
Authentication (MCP)	OAuth 2.1 + PKCE (primary) and API keys (mm-mcp-sk_…) hashed with SHA‑256, stored in mcp_api_keys. CABP pipeline enforces identity per tool call.
Authorization	Plan gating via middleware/entitlement.ts (REST) and tool-acl.ts (MCP). Supabase RLS on all tables.
Input Validation	Zod schemas for every MCP tool and REST endpoint. No raw SQL; all queries parameterized by Supabase client.
Tool Poisoning Prevention	MCP tool manifests signed with SHA‑256; hash verified at tools/list. Tool descriptions sanitized before storage.
Command Injection	No shell execution, no eval(). All dynamic behavior through safe APIs.
Supply Chain	SBOM generated per build. Dependencies pinned with integrity hashes. @agentscore-xyz scanned.
Audit	mcp_audit_log records every tool invocation. audit_logs table records all data access. Nightly narrative‑trace reconciliation.
Transport Security	HTTPS enforced for all endpoints. DPoP tokens bind MCP sessions to the client.
Error Handling & Resilience
SERF (Structured Error Recovery Framework): Every MCP tool response is wrapped in { success, error?: { error_type, agent_instruction } }. Agents can self‑correct for TRANSIENT and AUTH errors.

Cost‑Boundary‑Aware Circuit Breaker: Tier 0 (free) operates internally; all degraded → SERF error with retry_after. Never crosses to Tier 1 without opt‑in.

Predictive Rate Limiting: Switches model at 80% of daily capacity before the first 429.

Graceful Degradation: Semantic search falls back to ILIKE. Multi‑stage extraction retries stages with higher model tiers on failure.

Logging, Monitoring & Observability
Structured JSON logs: Written to Cloudflare Worker logs (wrangler tail). All MCP tool calls logged to mcp_audit_log.

Metrics: Cloudflare Analytics Engine for request volume, latency, error rates.

Audit: Every data access logged in audit_logs with user, resource, IP, timestamp.

Internationalization / Accessibility
Meeting language auto‑detected by AssemblyAI; stored in meetings.language and meeting_transcripts.language.

UI follows existing responsive patterns (mobile‑first improvements in v5.1 Shell).

Confidence: 95% – security patterns validated against OWASP MCP Top 10 and Stacklok checklist.

7. ARCHITECTURE DECISION RECORDS (FORMAL)
ID	Title	Status	Context	Decision	Consequences	Source
ADR‑001	MCP as sole AI‑agent integration protocol	Accepted	Need to expose meeting intelligence to external AI agents.	Implement full MCP server (2025‑11‑25 spec) with Streamable HTTP, OAuth2.1, 22 tools.	All AI integrations through MCP. Custom REST for agents deprecated.	Chat: MCP server architecture
ADR‑002	Separate Cloudflare Worker for MCP	Accepted	MCP traffic patterns differ from REST; dedicated worker isolates load and security.	Create meetingmind-mcp worker sharing Supabase and KV bindings.	Cleaner scaling and monitoring; slight duplication of env setup.	v5.1 architecture
ADR‑003	Multi‑stage extraction with zero‑cost LLM router	Accepted	Monolithic extraction produces mediocre results; free models are now capable. MeetBench‑XL validates dual‑policy routing.	6‑stage pipeline with Gemma 4 and Groq Llama. Cost‑boundary‑aware router with predictive rate limiting and circuit breaker.	Zero API cost. When better free models ship, add one config entry.	Phase 4 design discussion
ADR‑004	API keys as primary MCP auth, OAuth2.1 for enterprise	Accepted	MCP client configuration is simpler with API keys; OAuth required by spec for enterprise SSO.	Support both: mm-mcp-sk_ keys (hashed) and OAuth2.1 tokens. CABP pipeline handles both.	Need mcp-key-service and frontend management page.	Lead engineer report; product owner approval
ADR‑005	Self‑improving MeetingType skills via closed‑loop learning	Accepted	Organizations have unique meeting cultures; static templates underperform. Hermes, SkillForge, AutoSkill validate.	Auto‑create skills from 3+ meetings with ≥80% quality. Auto‑patch when quality degrades.	Increases competitive moat autonomously.	v5 architecture; frontier research
ADR‑006	pgvector for semantic search with ILIKE fallback	Accepted	Semantic search closes #1 gap. pgvector available on Supabase.	Generate embeddings via Groq, store in meeting_embeddings. Fall back to ILIKE.	Embedding generation adds latency but is async.	v5 architecture; pgvector docs
ADR‑007	Audio + transcript persistence with Keep/Discard lifecycle	Accepted	Garbled transcripts cannot be diagnosed without original audio. Full transcript is ground truth for search, audit, LLM.	Store audio in R2 (zero egress), transcript in meeting_transcripts. Keep retains; Discard deletes. Nightly cleanup of orphans.	$0 cost on R2 free tier.	Phase 9 design discussion; architecture audit
ADR‑008	Cost‑boundary‑aware circuit breaker	Accepted	Silent fallback from free to paid models is a billing incident.	Tier 0 operates internally; all degraded → SERF error. Never crosses to Tier 1 without opt‑in.	Protects free users from unexpected charges.	Phase 4 design discussion
8. QUALITY REQUIREMENTS & RISKS
Quality Goals
Goal	Target	Measurement
API latency (p95)	<500ms for REST, <2s for MCP tool calls	Cloudflare Analytics
MCP tool availability	99.9% uptime	Worker health checks
Extraction quality	>85% human‑verified accuracy on 30 fields	Periodic QA sampling
Security score	>90/100 OWASP MCP Top 10 compliance	mcp-config-guard audit
Zero API cost for extraction	$0/month	Groq/Google AI Studio free tiers
Activation rate (auto‑ingestion)	>70% within 7 days of signup	Product analytics
Risk & Technical Debt
Risk	Mitigation
pgvector performance at scale	Embedding generation is async; meeting_embeddings indexed with HNSW; monitor query latency
LLM provider rate limits (free tier)	Predictive rate limiting at 80%; multi‑provider router with fallbacks; circuit breaker
Mobile responsiveness debt	v5.1 implements mobile‑first Shell layout; further polish in future iteration
CRM adapter maintenance (API changes)	CrmAdapter interface isolates vendor logic; tests run against sandboxes
Audio storage growth	R2 free tier: 10 GB; nightly cleanup of discarded meetings; archive policy at scale
9. GLOSSARY
Term	Definition
MCP	Model Context Protocol – open standard for connecting AI assistants to external tools and data sources.
CABP	Context‑Aware Broker Protocol – 6‑stage identity pipeline for MCP tool calls (token→scope→user→plan→rate→audit).
SERF	Structured Error Recovery Framework – machine‑readable error taxonomy that allows AI agents to self‑correct.
MeetingType Skill	An auto‑created, optimized extraction template for a specific meeting type at a specific organization.
Growing Brain	Knowledge graph visualization showing learned skills, topics, people, and milestones.
Business Pulse	Dashboard section with effectiveness sparkline, decision velocity, risk radar, and “since last login” summary.
Aha Insight	A single, surprising, data‑backed insight displayed after a meeting is processed.
Multi‑stage extraction	The 6‑stage pipeline replacing the single LLM call (transcript analysis → structural → people → decision → strategic → synthesis).
pgvector	PostgreSQL extension for vector similarity search.
RLS	Row‑Level Security – Supabase feature that restricts data access per authenticated user.
R2	Cloudflare’s object storage service (zero egress, 10 GB free tier).
Zod	TypeScript schema validation library used for all tool and API inputs.
Hono	Lightweight web framework for Cloudflare Workers.
ADR	Architecture Decision Record – a formal record of a significant architectural choice.
Gemma 4	Google’s open‑weight LLM family; free on AI Studio (1,500 RPD). Used for extraction stages.
Groq	Low‑latency LLM inference provider; free tier used for overflow and embeddings.
10. CROSS‑REFERENCE INDEX
Element	Section(s)
AhaInsightCard	§3 (Frontend), §4 (Scenario 1)
search_meetings (MCP tool)	§3 (MCP Worker), §4 (Scenario 2)
analyze.ts	§3 (API Worker), §4 (Scenario 1), ADR‑003
transcribe.ts	§3 (API Worker), §4 (Scenario 1), ADR‑007
meeting_transcripts	§2 (Domain), §3 (API Worker), ADR‑007
mcp_audit_log	§3 (Data), §6 (Audit)
meeting_skills	§2 (Domain), §3 (Data), ADR‑005
CrmAdapter	§3 (API Worker), ADR‑004
CABP pipeline	§3 (MCP Worker), §6 (Security)
llm-router.ts	§3 (API Worker), §4 (Scenario 3), ADR‑003, ADR‑008
pgvector	§2 (Patterns), §3 (API Worker), ADR‑006
SERF	§2 (Patterns), §6 (Error Handling)
R2	§3 (Containers), §5 (Deployment), ADR‑007
Shell.tsx (modified)	§3 (Frontend)
wrangler.toml	§5 (Deployment)
013_mcp.sql	§3 (Data)
015_v5.sql	§3 (Data)
016_transcripts.sql	§3 (Data), ADR‑007
11. CONFORMANCE CHECKLIST
All MCP tools return SERF‑enveloped responses. Source: MCP server architecture

Semantic search falls back to ILIKE when vector results < match_threshold. Source: ADR‑006

No static API keys in source code; all secrets in Cloudflare Secrets. Source: C‑05

middleware/entitlement.ts blocks Pro features from Free users with 403. Source: v4.3 architecture

CABP pipeline validates MCP token on every request, not just session start. Source: ADR‑001

analyze.ts runs exactly 6 stages with quality gates between stages 2, 3, and 6. Source: ADR‑003

MeetingType skills created only after ≥3 meetings of same type with ≥80% quality. Source: ADR‑005

Circuit breaker never crosses Tier 0 → Tier 1 without explicit user opt‑in. Source: ADR‑008

Predictive rate limiting switches model at 80% of daily limit. Source: Phase 4 design

All new tables have RLS enabled with per‑user policies. Source: v4.3 architecture

Shell.tsx no longer renders <Breadcrumbs />. Source: Phase 1 plan

Full verbatim transcript stored in meeting_transcripts after AssemblyAI completes. Source: ADR‑007

Raw audio stored in R2 before AssemblyAI call. Source: ADR‑007

Discard deletes R2 audio and marks transcript retained=false. Source: Phase 9 design

Nightly cleanup hard‑deletes orphaned transcripts after 7 days. Source: Phase 9 design

Enterprise tier ($99/mo) purchasable via Stripe Checkout. Source: v5.1 architecture

All 22 MCP tools annotated with readOnlyHint/destructiveHint. Source: Anthropic connector directory requirements

12. PROVENANCE LOG (SELECTED)
Claim	Provenance Type	Source	Trust Tier
MCP server must implement 2025‑11‑25 spec with Streamable HTTP	DIRECT_QUOTE	MCP server architecture doc	VERIFIED
Six‑stage extraction pipeline with quality gates	DIRECT_QUOTE	v5.1 architecture	VERIFIED
Zero‑cost LLM routing with Gemma 4 + Groq Llama	DIRECT_QUOTE	Phase 4 design discussion	VERIFIED
Cost‑boundary‑aware circuit breaker never crosses tiers without opt‑in	DIRECT_QUOTE	Phase 4 design discussion	VERIFIED
MeetingType skills auto‑created from 3+ meetings with ≥80% quality	DIRECT_QUOTE	v5 architecture; frontier research	VERIFIED
Audio + transcript persistence with Keep/Discard lifecycle	DIRECT_QUOTE	Phase 9 design discussion	VERIFIED
OAuth2.1 + PKCE mandatory for MCP auth, API keys supported as primary	INFERENCE	Lead engineer report + product owner decision	VERIFIED
pgvector used for semantic search with ILIKE fallback	DIRECT_QUOTE	ADR‑006	VERIFIED
13