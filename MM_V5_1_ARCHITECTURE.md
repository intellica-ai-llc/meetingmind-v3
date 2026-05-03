MEETINGMIND v5.0 — FINAL DEFINITIVE ARCHITECTURE
The Self‑Improving Organizational Intelligence Platform with Integrated MCP Fabric

Version	5.0.0
Date	May 2, 2026
Status	Production Design — Ready for Implementation
Base System	MeetingMind v4.3 As‑Built
Stack	Cloudflare Workers + Supabase + AssemblyAI + Groq + Stripe + pgvector
MCP Specification	2025‑11‑25 (full compliance)
1. EXECUTIVE SUMMARY
MeetingMind v4.3 established our unassailable lead in cross‑meeting intelligence, initiative health tracking, and multi‑meeting coaching — confirmed by competitive analysis showing no other platform approaches our depth. However, the market has accelerated. Otter.ai launched their Conversational Knowledge Engine on April 28, 2026, validating the category of bidirectional, AI‑accessible organizational memory. Academic research from multiple institutions has proven that closed learning loops, multi‑agent extraction pipelines, and five‑layer memory architectures produce superior results.

MeetingMind v5.0 seizes this moment by uniting three architectural pillars into a single, production‑grade platform:

The MCP Fabric — Every capability exposed through a secure, standards‑compliant Model Context Protocol server, accessible simultaneously via the web app, any AI agent, and real‑time webhooks.

The Self‑Improving Skill System — MeetingType skills that autonomously create, load, and patch themselves based on extraction quality, using the Hermes Agent closed learning loop pattern.

The Five‑Layer Organizational Memory — From short‑term inference through long‑term dialectic modeling, the platform builds a continuously deepening understanding of how each organization makes decisions, communicates, and manages risk.

No competitor — not Otter’s knowledge graph, not Fireflies’ 60+ integrations, not Gong’s revenue intelligence — possesses the autonomous self‑improvement loop or the bidirectional MCP fabric that exposes organizational intelligence to every AI agent on Earth. This is the structural moat.

2. ARCHITECTURAL PRINCIPLES
Every capability accessible through three paths simultaneously: Web App → MCP Server → Webhook/API.

Autonomous self‑improvement: The platform becomes more accurate and personalized with every meeting processed, without human intervention.

Production security from day zero: OWASP MCP Top 10 compliant, OAuth 2.1, Supabase RLS on every query, signed tool manifests, trace‑based audit logging.

Outcome‑oriented tools, not atomic CRUD: MCP tools are “agent stories” — a single tool call solves a complete user problem.

Model‑tiered extraction: Not every task requires a reasoning model; cost‑optimized routing across SIMPLE, MEDIUM, COMPLEX, and REASONING tiers.

Research‑validated patterns: Five‑layer memory, dual‑policy agent routing, dialectic organizational modeling, and token‑efficient skill patching are all backed by published, peer‑reviewed research.

3. SYSTEM ARCHITECTURE
text
┌────────────────────────────────────────────────────────────────────────────┐
│                    MEETINGMIND v5.0 — UNIFIED PLATFORM                      │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        INGESTION LAYER                                 │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ ┌──────────────────┐  │ │
│  │  │ Manual   │ │Recording │ │Calendar (Enhanced)│ │Webhooks (Zoom/   │  │ │
│  │  │Upload    │ │          │ │Poll + Push Notif. │ │Teams/Meet)       │  │ │
│  │  └────┬─────┘ └────┬─────┘ └────────┬─────────┘ └────────┬─────────┘  │ │
│  │       └─────────────┴───────────────┴──────────────────────┘          │ │
│  │                                 ▼                                      │ │
│  │                ┌───────────────────────────┐                          │ │
│  │                │ INGESTION ORCHESTRATOR     │                          │ │
│  │                │ Concurrency, Conflict Det. │                          │ │
│  │                └─────────────┬─────────────┘                          │ │
│  └──────────────────────────────┼────────────────────────────────────────┘ │
│                                 ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │           EXTRACTION ENGINE — 25+ FIELDS, MULTI‑STAGE                  │ │
│  │                                                                        │ │
│  │  Stage 1: Transcript Analysis (SIMPLE model)                          │ │
│  │  Stage 2: Structural Extraction (MEDIUM model)                        │ │
│  │  Stage 3: People & Participation (MEDIUM model)                       │ │
│  │  Stage 4: Decision & Risk Intelligence (COMPLEX model)                │ │
│  │  Stage 5: Strategic & Competitive Awareness (MEDIUM model)            │ │
│  │  Stage 6: Insight Synthesis & Coaching (REASONING model)              │ │
│  │                                                                        │ │
│  │  ┌──────────────────────┐   ┌──────────────────────────────────────┐ │ │
│  │  │ MeetingType Skills   │   │ Prompt Registry (versioned templates) │ │ │
│  │  │ (auto‑created from   │   │ with per‑stage quality gates          │ │ │
│  │  │  ≥3 recurring mtgs)  │   │ and model‑tier routing                │ │ │
│  │  └──────────────────────┘   └──────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                 ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │              CONTINUOUS INTELLIGENCE ENGINE                            │ │
│  │                                                                        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────────┐  │ │
│  │  │autoDream    │ │Semantic     │ │Organizational│ │MeetingType Skill│  │ │
│  │  │Consolidation│ │Search       │ │Modeler      │ │Manager         │  │ │
│  │  │Light/REM/   │ │pgvector+RAG │ │(Honcho‑     │ │Create/Patch    │  │ │
│  │  │Deep cycles  │ │             │ │ dialectic)  │ │                │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────────┐  │ │
│  │  │Predictive   │ │Pattern      │ │Risk         │ │Five‑Layer      │  │ │
│  │  │Alerts       │ │Aggregation  │ │Aggregation  │ │Memory System   │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                 ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    SURFACING & ADDICTION LAYER                         │ │
│  │                                                                        │ │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                │ │
│  │  │Business Pulse │ │Growing Brain  │ │"Aha" Moments  │                │ │
│  │  │(Primary Dash) │ │(Knowledge Gr) │ │(Hero Cards)   │                │ │
│  │  └───────────────┘ └───────────────┘ └───────────────┘                │ │
│  │                                                                        │ │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                │ │
│  │  │Predictive     │ │Coach          │ │Slack v2       │                │ │
│  │  │Alerts         │ │Dashboard v2   │ │(Slash+Inter.) │                │ │
│  │  └───────────────┘ └───────────────┘ └───────────────┘                │ │
│  │                                                                        │ │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                │ │
│  │  │Semantic       │ │Quarterly      │ │Compliance     │                │ │
│  │  │Search UI      │ │Reports        │ │Dashboard      │                │ │
│  │  └───────────────┘ └───────────────┘ └───────────────┘                │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │              UNIFIED MCP FABRIC (ALL CAPABILITIES EXPOSED)             │ │
│  │                                                                        │ │
│  │  ┌─────────────────────┐  ┌─────────────────────┐                      │ │
│  │  │ MCP Server          │  │ MCP Gateway          │                      │ │
│  │  │ (22 domain tools)   │  │ (Bidirectional)      │                      │ │
│  │  │ • Search            │  │ • Connect external   │                      │ │
│  │  │ • Intelligence      │  │ • Enrich briefs      │                      │ │
│  │  │ • Execution         │  │ • Sync context       │                      │ │
│  │  │ • CRM Writeback     │  │ • Native CRM adapters│                      │ │
│  │  │ • Webhook Reg       │  │                       │                      │ │
│  │  └─────────────────────┘  └─────────────────────┘                      │ │
│  │                                                                        │ │
│  │  Auth: OAuth 2.1 + PKCE  |  CABP 6‑stage pipeline  |  SERF errors     │ │
│  │  Transport: Streamable HTTP + SSE legacy bridge                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      MONETIZATION LAYER                                │ │
│  │                                                                        │ │
│  │  Free ($0): Manual upload, 10 meetings/mo, basic dashboard, MCP read   │ │
│  │  Pro ($9/mo): Auto‑ingest, patterns, semantic search, coach,           │ │
│  │               MCP intelligence tools, quarterly reports                │ │
│  │  Business ($29/mo): Risk aggregation, Slack v2, webhooks,              │ │
│  │                     MCP execution tools, compliance dashboard           │ │
│  │  Enterprise ($99/mo): SSO, dedicated support, whitelabel,              │ │
│  │                        MCP gateway + collaboration, audit export       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
4. THE MCP FABRIC — EVERY CAPABILITY, EVERY PATH
The Model Context Protocol (MCP) is not an add‑on — it is the nervous system of MeetingMind v5. Every new capability is exposed simultaneously through three paths:

Web App — the premium UI at https://meetingmind-web.pages.dev

MCP Server — any AI agent (Claude, ChatGPT, Cursor, VS Code) connects to https://meetingmind-mcp.intellicaai-ai.workers.dev/mcp

Webhook/API — real‑time push events to any HTTPS endpoint

4.1 MCP Tools Inventory
Search Family (5 tools)

Tool Name	Description	Plan Gate
search_meetings	Semantic search via pgvector across all meetings, transcripts, decisions, action items, risks	Free
get_meeting_detail	Complete 25‑field extraction + full diarized transcript	Free
get_action_items	Filterable list of open tasks (owner, priority, due date, status)	Free
get_transcript	Raw or utterance‑formatted transcript with speaker labels	Free
search_across_meetings	Cross‑meeting semantic search: “What did we decide about Q3 budget?”	Pro
Intelligence Family (8 tools)

Tool Name	Description	Plan Gate
get_initiative_health	Health status, trends, open tasks, unresolved threads, risk frequency for any initiative	Pro
get_coaching_insights	Longitudinal coaching analysis across 20 meetings	Pro
get_organizational_intelligence	Executive briefing: KPI dashboard, attention feed, upcoming meetings	Pro
get_patterns	Pre‑computed intelligence patterns (effectiveness, decision velocity, sentiment)	Pro
get_risk_aggregation	Aggregated risk frequency and severity over time	Business
synthesize_research	Answer complex business questions with cited sources from meeting data	Business
get_growing_brain	Knowledge graph data — nodes, edges, milestones	Pro
get_skills	List MeetingType skills learned for this organization	Pro
Execution Family (6 tools)

Tool Name	Description	Plan Gate
sync_to_crm	Push meeting summary, actions, decisions to Salesforce, HubSpot, Pipedrive, Zoho	Pro
create_calendar_event	Create a Google Calendar event from meeting context	Pro
create_action	Create a task from meeting context	Free
update_status	Update task status, assignee, or details	Free
notify	Send Slack Block Kit message or email	Business
register_webhook	Register an HTTPS endpoint for real‑time MeetingMind events	Business
Gateway Family (3 tools)

Tool Name	Description	Plan Gate
connect_external	Register an external MCP server (Jira, GitHub, Salesforce, etc.)	Business
enrich_brief	Pull external context into a meeting preparation brief	Business
sync_context	CA‑MCP shared context synchronization	Business
4.2 Authentication & Authorization
Primary: OAuth 2.1 Authorization Code + PKCE (mandatory per MCP 2025‑11‑25 spec)

Token lifetime: 15 minutes (short‑lived, scoped)

Scopes: meetingmind:read, meetingmind:execute, meetingmind:gateway, meetingmind:admin, meetingmind:initiative:<id>

Defense‑in‑depth: Supabase RLS behind every tool call, scoped to auth.uid()

CABP 6‑stage pipeline: Token validation → Scope verification → User resolution → Plan entitlement → Rate limit → Audit log

4.3 Transport
Primary: Streamable HTTP (single POST /api/mcp endpoint, JSON‑RPC 2.0, session management via Mcp-Session-Id header)

Legacy: GET /api/mcp/sse for older client compatibility

Deployment: Separate Cloudflare Worker at meetingmind-mcp.intellicaai-ai.workers.dev, sharing Supabase and KV namespaces with the main API

5. THE SELF‑IMPROVING SKILL SYSTEM
This is the autonomous moat — validated by Hermes Agent (90,300+ GitHub stars), SkillForge (Alibaba Cloud), and AutoSkill (ECNU).

5.1 MeetingType Skill Manager
When 3+ meetings of the same type achieve ≥80% quality scores, the system autonomously creates a MeetingType Skill — an optimized extraction template, coaching focus area, and organizational behavior model specific to that organization’s unique meeting culture.

text
Trigger: 3+ meetings of type "standup" with ≥80% quality
→ Auto‑create "standup-extraction" skill
→ Optimized prompt focuses on blocker detection, progress updates
→ Coaching prioritizes decision velocity for standups
→ Skill loaded automatically for all future standups
→ If skill degrades (success rate <70%), auto‑patch via Hermes token‑efficient update
5.2 Eleven Skill Categories
Category	Trigger	Example Output
MeetingType Extraction	3+ meetings of same type	Optimized extraction template for board meetings
Coaching Skills	Same advice given 3+ times	“Decision‑clarity‑coaching” with 82% success rate
Facilitation Skills	Pattern correlates with high effectiveness	“Round‑robin format improves participation by 20%”
Action Item Intelligence	Learned completion/failure patterns	“Tasks assigned on Fridays to Bob miss deadlines”
Risk Mitigation Skills	Captured resolution patterns	“Budget‑overrun → contingency review” playbook
Communication Skills	Learned org‑specific jargon and signals	47 internal terms mapped; “We’re going with…” = committed
Team Health Monitoring	Degradation detection	Psychological safety drop → alert
Integration Action Skills	Repeated manual workflows	Auto‑push action items to Linear
Summarization Style Skills	Stakeholder preferences	CEO: 3‑bullet executive summary; PM: full context
Meeting Preparation Skills	Historical patterns for meeting type	“Review Q3 budget tracker — discussed in 3 of 5 last standups”
Cross‑Project Intelligence	Patterns across multiple teams	“Decision velocity down 15% org‑wide this quarter”
5.3 Skill Lifecycle
text
Creation → Active Use → Patch (if degrades) → Success Tracking
    ↓                                              ↓
  (3+ meetings, ≥80% quality)           (flag if success_rate <70%)
                                                  ↓
                                            Deprecation (if <50%)
                                                  ↓
                                            Promotion to global template (if >90%, optional opt‑in)
6. THE 25+ FIELD EXTRACTION ENGINE — MULTI‑STAGE
The monolithic Groq call is replaced with a six‑stage specialized pipeline, validated by MeetBench‑XL’s dual‑policy agent architecture.

6.1 Complete Field Inventory
Base Layer (14 fields — preserved from v4.3)

summary, 2. decisions, 3. action_items, 4. open_questions, 5. parking_lot, 6. key_topics, 7. key_quotes, 8. sentiment, 9. sentiment_reason, 10. effectiveness_score, 11. effectiveness_reason, 12. next_agenda, 13. risk_flags, 14. meeting_type

People & Participation (6 new fields)
15. dominance_imbalance_score, 16. silence_analysis, 17. influence_map, 18. per_speaker_sentiment, 29. psychological_safety_score, 30. false_consensus_flag

Decision & Action Intelligence (4 new fields)
19. decision_clarity_score, 20. action_smart_scores, 21. bottleneck_detection, 22. thread_recurrence_flags

Resource & Time Intelligence (3 new fields)
23. estimated_meeting_cost, 24. agenda_adherence_score, 25. time_pareto_breakdown

Strategic & Contextual Awareness (3 new fields)
26. competitor_mentions, 27. strategic_pillar_alignment, 28. resource_requests

Total: 30 fields (14 base + 16 new)

6.2 Multi‑Stage Pipeline
Stage	Purpose	Model Tier	Quality Gate
1. Transcript Analysis	Speaker validation, talk‑time, meeting type, language	SIMPLE	All speakers identified
2. Structural Extraction	Summary, decisions, actions, topics, quotes, cost	MEDIUM	Actions have owners
3. People & Participation	Dominance, silence, sentiment, influence, psych safety	MEDIUM	Scores have transcript evidence
4. Decision & Risk Intelligence	Decision clarity, SMART scores, bottlenecks, threads	COMPLEX	Cross‑references past meetings
5. Strategic Awareness	Competitors, strategic alignment, resource requests	MEDIUM	Explicit mentions flagged
6. Insight Synthesis	“Aha” insight, coaching brief, trend alerts, positive reinforcement	REASONING	Insight is specific, surprising, data‑backed
Each stage has its own versioned prompt template in the Prompt Registry, optimized by any applicable MeetingType Skill.

6.3 Model Tier Routing
Tier	Examples	Used For	Cost Profile
SIMPLE	Gemini Flash	Transcript analysis, meeting type	Lowest
MEDIUM	DeepSeek, Grok	Structural extraction, people analytics	Low
COMPLEX	Claude Sonnet	Decision intelligence, risk analysis	Medium
REASONING	Claude Opus	Insight synthesis, coaching	Highest
The LLM cost router selects the cheapest capable model for each stage, validated by MeetBench‑XL’s finding that dual‑policy routing achieves superior quality‑latency tradeoffs.

7. SEMANTIC SEARCH — pgvector
Closes the #1 competitive gap with Circleback and Otter.

7.1 Architecture
Embedding generation: Groq embedding endpoint, triggered on meeting creation via Supabase Edge Function

Storage: meeting_embeddings table with vector(1536) column

Search: match_meetings RPC function using cosine similarity (<=>)

Fallback: PostgreSQL ilike full‑text search when vector results are insufficient

Result format: Cited — includes meeting title, date, speaker attribution, snippet, similarity score

7.2 API
text
GET /api/search?q=What did we decide about Q3 budget?&limit=10&type=all
POST /api/mcp → search_meetings { query: "Q3 budget decision" }
The MCP tool exposes the same semantic search to external AI agents, with the same cited‑source quality.

8. THE “AHA” INSIGHT ENGINE — DAY‑1 VALUE
8.1 The Insight Ladder
Stage	Meetings Processed	What MeetingMind Knows
Day 1, Meeting 1	1	Universal patterns + immediate anomalies in the transcript
Day 3, Meeting 3	3‑5	Meeting cadence, initial patterns forming
Day 7, Meeting 8	8‑10	Recurring topics, individual speaking patterns
Day 14, Meeting 15	15‑20	Decision velocity, risk recurrence, team dynamics
Day 30, Meeting 30	30+	Deep organizational behavior model, predictive alerts
Day 90, Meeting 90	90+	System knows you better than you know yourself
8.2 “Aha” Insight Examples
“You spent 80% of meeting time on status updates, but only 20% on decisions. Top‑performing teams reverse that ratio.”

“Alex spoke for 45 minutes. Jamie spoke for 2. This is the 4th meeting with this pattern.”

“The phrase ‘let’s circle back’ was used 7 times. That’s a sign of deferred decisions.”

8.3 Quality Gate
Every insight must pass the “Would I pay for this?” test:

Is it specific to THIS meeting, not generic advice?

Is it surprising? Would the user have caught this themselves?

Is it actionable? Can they do something about it tomorrow?

Is it evidence‑backed? Can you point to the exact data?

9. THE FIVE‑LAYER MEMORY ARCHITECTURE
Validated by EvoMem (dual‑evolving memory mechanisms) and AMA (80% token reduction via multi‑agent memory coordination).

Layer	Name	MeetingMind Implementation	Research Basis
1	Short‑term Inference	Current meeting transcript + extraction (context window)	Context window management
2	Procedural Skills	MeetingType Skills (auto‑created, auto‑loaded, auto‑patched)	Hermes Agent, SkillForge, AutoSkill
3	Contextual Persistence	pgvector semantic search across all meetings	MeetBench‑XL cross‑meeting aggregation
4	User/Org Modeling	Organizational behavior modeler (Honcho‑inspired dialectic)	Honcho 12‑layer dialectic
5	Session Search	Cross‑meeting search with LLM summarization	FTS5 + LLM (Hermes pattern)
9.1 Organizational Behavior Modeler (Layer 4)
Uses dialectic reasoning to test hypotheses against meeting data:

“Does this team make faster decisions in morning meetings?”

“Is risk tolerance higher in Q4 than Q1?”

“Is psychological safety correlated with decision velocity?”

Insights with confidence ≥70% are stored in organizational_insights. At ≥90% confidence, they are promoted to permanent memory and the coach cites them with authority: “Based on your team’s decision velocity pattern — an insight I’m 92% confident in across 45 meetings — I recommend scheduling critical decisions before 11 AM.”

10. PREDICTIVE ALERTS & QUARTERLY REPORTS
10.1 Alert Types
Alert Type	Trigger	Example
Effectiveness Anomaly	Score drops >2 points below 30‑day average	“Your last meeting (4.2) was significantly below your average (7.1)”
Thread Escalation	Thread open >21 days, blocking ≥3 action items	“Budget Approval thread is 21 days old, blocking 3 tasks”
Workload Imbalance	One person has >5 overdue tasks, others have 0	“Bob has 5 overdue tasks. Alice has 0.”
Positive Reinforcement	Team hits top 10% benchmark	“Your decision velocity is in the top 10% this week!”
Delivery via email, Slack, and webhook — user‑configurable in Alert Settings.

10.2 Quarterly Reports
Auto‑generated PDF/email summarizing:

Effectiveness trend (quarterly sparkline)

Decision velocity comparison (this quarter vs. last)

Top risks and their resolution status

Coaching themes and skill improvements

Team health metrics (psychological safety, participation balance)

Generated by a monthly cron job, stored in quarterly_reports, surfaced in Business Pulse and via MCP.

11. SLACK v2 — INTERACTIVE INTEGRATION
11.1 Slash Commands
Command	Function
/meetingmind-summary	Latest meeting summary as Block Kit card
/meetingmind-tasks	Personal action items with “Mark Complete” buttons
/meetingmind-search <query>	Semantic search across meetings
/meetingmind-coach	Latest coaching insight with trend visualization
11.2 Interactive Messages
After each meeting (Business tier), a Block Kit message includes:

View Full Report button → links to meeting detail page

Mark Task Done buttons on individual action items

Assign to @user dropdown for task delegation

All actions update the database in real‑time via the Slack interactions webhook.

12. ENTERPRISE COMPLIANCE DASHBOARD
12.1 Features
Section	Content	Update Frequency
Data Residency	Cloud region display	Static (config‑driven)
Retention Policies	“Recordings deleted after X days”	Real‑time
Audit Logs	Who accessed which meeting, when, from which IP	Real‑time
SOC2 Readiness	Checklist with completion dates	Quarterly
Export	CSV download of audit logs for SIEM	On‑demand
12.2 Audit Logging
Every data access — via web app, MCP tool, or webhook — is recorded in audit_logs with user ID, action, resource type, resource ID, IP address, and timestamp. Nightly reconciliation compares MCP agent narratives against trace evidence (addressing the 63.2% divergence problem documented in research).

13. DATABASE SCHEMA — COMPLETE v5.0 ADDITIONS
All tables are in Supabase PostgreSQL with Row Level Security enabled. The following are added to the existing v4.3 schema.

sql
-- Semantic search
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE meeting_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  embedding vector(1536),
  content_type TEXT CHECK (content_type IN ('transcript','summary','decisions','action_items')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Self-improving skills
CREATE TABLE meeting_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'meeting-type',
  version TEXT NOT NULL DEFAULT '1.0.0',
  meeting_type TEXT NOT NULL,
  optimized_prompt TEXT,
  extraction_fields TEXT[],
  coaching_focus TEXT[],
  trigger_patterns TEXT[],
  organization_specific BOOLEAN DEFAULT true,
  success_rate REAL,
  times_used INTEGER DEFAULT 0,
  created_from UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE skill_patches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES meeting_skills(id) ON DELETE CASCADE,
  old_string TEXT NOT NULL,
  new_string TEXT NOT NULL,
  match_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizational intelligence
CREATE TABLE organizational_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT CHECK (insight_type IN ('decision_pattern','communication_style','risk_tolerance','team_dynamic')),
  insight TEXT NOT NULL,
  confidence REAL DEFAULT 0.0,
  derived_from UUID[],
  promoted_to_memory BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_validated TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced intelligence aggregates
CREATE TABLE intelligence_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avg_effectiveness REAL,
  decision_velocity REAL,
  sentiment_trend TEXT,
  psychological_safety_avg REAL,
  dominant_topic TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE intelligence_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_frequency JSONB,
  risk_trend JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictive alerts
CREATE TABLE predictive_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('effectiveness_anomaly','thread_escalation','workload_imbalance','positive_reinforcement')),
  alert_data JSONB,
  delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quarterly reports
CREATE TABLE quarterly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance audit
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting streaks
CREATE TABLE meeting_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  week_start DATE NOT NULL,
  meetings_analyzed INTEGER DEFAULT 0,
  UNIQUE(user_id, week_start)
);

-- Calendar push notifications
CREATE TABLE calendar_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  resource_id TEXT,
  expiration TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additional meeting fields (from expanded extraction)
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS dominance_imbalance_score REAL;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS silence_analysis JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS per_speaker_sentiment JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS influence_map JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS decision_clarity_score REAL;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS action_smart_scores JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS bottleneck_detection JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS thread_recurrence_flags JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS estimated_meeting_cost REAL;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS agenda_adherence_score REAL;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS time_pareto_breakdown JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS competitor_mentions TEXT[];
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS strategic_pillar_alignment JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS resource_requests JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS psychological_safety_score REAL;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS false_consensus_flag BOOLEAN;

-- RLS on all new tables
ALTER TABLE meeting_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_patches ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizational_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_channels ENABLE ROW LEVEL SECURITY;

-- Standard RLS policies
CREATE POLICY "Users can view own records" ON meeting_embeddings FOR SELECT USING (auth.uid() = (SELECT user_id FROM meetings WHERE id = meeting_id));
-- (Additional policies follow the existing pattern: each table scoped to auth.uid())
14. API ROUTES — COMPLETE v5.0
All routes mounted in backend/src/index.ts on the existing Cloudflare Worker.

Endpoint	Method	Purpose	Plan Gate
Existing v4.3 Routes (retained)			
/api/auth/*	POST/GET	Authentication	Public
/api/transcribe	POST	Audio → AssemblyAI	Free
/api/status/:jobId	GET	Poll transcription	Free
/api/analyze	POST	25‑field extraction (multi‑stage)	Free
/api/coach	POST	Multi‑meeting coaching	Pro
/api/meetings	CRUD	Meeting management	Free
/api/tasks	CRUD	Task management	Free
/api/threads	CRUD	Unresolved threads	Free
/api/initiatives	CRUD	Initiative management	Pro
/api/dashboard/*	GET	Dashboard data	Free
/api/calendar/*	GET/POST	Calendar integration	Pro
/api/payments/*	POST/GET	Stripe billing	Auth
/api/slack/config	GET/POST	Slack config	Business
New v5.0 Routes			
/api/search	GET	Semantic cross‑meeting search	Pro
/api/aha	POST	Generate “Aha” insight	Free
/api/intelligence/pulse	GET	Business Pulse dashboard data	Free
/api/intelligence/knowledge‑graph	GET	Growing Brain data	Pro
/api/intelligence/insights	GET	Organizational behavior insights	Pro
/api/skills	GET/POST	Skill management	Pro
/api/skills/:id/patch	POST	Token‑efficient skill patching	Pro
/api/reports/quarterly	GET	Latest quarterly report	Pro
/api/compliance	GET	Compliance dashboard	Business
/api/admin/audit‑logs	GET	Audit log export	Business
/api/slack/commands	POST	Slack slash command handler	Business
/api/slack/interactions	POST	Slack interactive message handler	Business
/api/integrations/crm/sync	POST	CRM sync trigger	Pro
/api/webhooks/register	POST	Register webhook endpoint	Business
MCP Server			
/api/mcp	POST	Streamable HTTP (JSON‑RPC)	MCP token
/api/mcp/sse	GET	Legacy SSE bridge	MCP token
15. IMPLEMENTATION ROADMAP
Phase 1: Critical Gap Closure (Weeks 1‑3)
Semantic search (pgvector + /api/search + MCP tool)

“Aha” insight engine (/api/aha + hero card UI)

Business Pulse dashboard (effectiveness sparkline, decision velocity, risk radar)

Slack v2 (slash commands + interactive messages)

MCP server core tools (search, intelligence, execution)

Phase 2: Intelligence & Self‑Improvement (Weeks 4‑6)
25‑field extraction engine (stages 2‑5)

Multi‑stage pipeline with model‑tier routing

MeetingType Skill Manager (create, load, patch)

autoDream REM Sleep consolidation cycle

Organizational behavior modeler

Predictive alerts system

Phase 3: Workflow & Enterprise (Weeks 7‑8)
Growing Brain visualization (knowledge graph UI)

Quarterly report generation cron

Enterprise tier ($99/mo) with Stripe integration

Compliance dashboard

Audit logging middleware + CSV export

Multilingual transcription support

Calendar push notification enhancements

Phase 4: Advanced MCP & Launch (Week 9)
MCP Gateway tools (external server bridge)

ClawLink cross‑owner collaboration (encrypted agent relay)

Full CI security pipeline (mcp‑check, mcp‑tef, mcpwn, mcp‑config‑guard)

Production deployment

Documentation, MCP server listing, marketing

16. COMPETITIVE POSITION — FINAL MOAT
Capability	Otter (Apr 2026)	Fireflies	Gong	Fathom	MeetingMind v5
Cross‑meeting semantic search	✅	✅	❌	❌	✅ pgvector + MCP
Bidirectional MCP	✅	❌	❌	❌	✅ Server + Client + Gateway
Self‑improving skills	❌	❌	❌	❌	✅ MeetingType Skills
25+ field extraction	❌	❌	❌	❌	✅ Multi‑stage pipeline
Organizational behavior model	❌	❌	❌	❌	✅ Honcho‑inspired dialectic
Five‑layer memory	❌	❌	❌	❌	✅ Research‑validated
“Aha” Day‑1 insights	❌	❌	❌	❌	✅ Universal + specific
Growing Brain visualization	❌	❌	❌	❌	✅ Knowledge graph lock‑in
Native CRM adapters (4)	❌ (2 via MCP)	Via Zapier	✅ Salesforce deep	Basic	✅ 4 native + MCP Gateway
Predictive alerts	❌	❌	❌	❌	✅ 4 alert types
Webhook push	✅	❌	✅	❌	✅ HMAC‑signed
Enterprise compliance	❌	❌	❌	❌	✅ SOC2 + audit logs
OWASP MCP Top 10 compliant	❌	❌	❌	❌	✅ Full compliance
PRODUCTION SECURITY SCORE	Unknown	Unknown	Unknown	Unknown	>90/100
17. ENVIRONMENT VARIABLES — COMPLETE
Variable	Purpose	Location
SUPABASE_URL	Database connection	Cloudflare Secret
SUPABASE_SERVICE_ROLE_KEY	Database admin access	Cloudflare Secret
ASSEMBLYAI_API_KEY	Transcription	Cloudflare Secret
GROQ_API_KEY_1, _2, _3	AI extraction, coaching, embeddings	Cloudflare Secret
STRIPE_SECRET_KEY	Payment processing	Cloudflare Secret
STRIPE_WEBHOOK_SECRET	Webhook verification	Cloudflare Secret
SALESFORCE_CLIENT_ID	CRM adapter	Cloudflare Secret
SALESFORCE_CLIENT_SECRET	CRM adapter	Cloudflare Secret
HUBSPOT_ACCESS_TOKEN	CRM adapter	Cloudflare Secret
PIPEDRIVE_API_TOKEN	CRM adapter	Cloudflare Secret
ZOHO_CLIENT_ID	CRM adapter	Cloudflare Secret
ZOHO_CLIENT_SECRET	CRM adapter	Cloudflare Secret
WEBHOOK_SIGNING_SECRET	Webhook HMAC	Cloudflare Secret
MCP_OAUTH_ISSUER	MCP auth server	Worker env
MCP_SESSION_KV	KV binding	wrangler.toml
MCP_TOOL_INDEX_KV	KV binding	wrangler.toml
18. SUCCESS METRICS
Metric	v4 Target	v5 Target
Activation rate (auto‑ingestion within 7 days)	>60%	>70%
Weekly active users	N/A	>50% of MAU
Meetings per user per week	N/A	>3
Semantic search adoption	N/A	>30% of Pro users
Skill creation rate	N/A	>1 per user per month
Pro conversion rate	>5%	>7%
Business adoption	>20%	>25%
Gross monthly churn	<5%	<3%
MCP tool calls per week	N/A	>1,000 within 30 days
Security audit score	N/A	>90/100
