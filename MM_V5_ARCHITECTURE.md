MEETINGMIND v5.0 — COMPLETE UPGRADE ARCHITECTURE
The Self-Improving Organizational Intelligence Platform

Version	5.0.0
Date	April 26, 2026
Status	Production Design (v4.0 98% deployed)
Base System	MeetingMind v4.0 As-Built
Stack	Cloudflare Workers + Supabase + AssemblyAI + Groq + Stripe
PART 1: EXECUTIVE SUMMARY
MeetingMind v4.0 established our unassailable lead in cross-meeting intelligence, 25-field extraction, and automated intelligence aggregation—confirmed by the competitive analysis showing no other platform comes close. But v4 is still a platform that we improve. v5 transforms MeetingMind into a platform that improves itself.

The core innovation is the integration of Hermes Agent's closed learning loop directly into the MeetingMind architecture. After processing 3+ meetings of the same type with high quality scores, the system autonomously creates MeetingType Skills—optimized extraction templates, coaching focus areas, and organizational behavior models specific to that organization's unique meeting culture. A "standup" in one company looks very different from a "standup" in another. The skill system adapts to each.

This self-improving capability, combined with the expanded 25+ field extraction engine, the addiction layer that makes the AI's growing knowledge visible, and the five-layer memory architecture inspired by Hermes, creates a competitive moat that widens autonomously with every meeting processed.

PART 2: FROM v4 TO v5 — COMPLETE GAP CLOSURE
2.1 The Seven Gaps Being Closed
Gap	v4 State	v5 Target	Hermes Pattern Applied
Static Extraction	13 fields, manually designed	25+ fields, self-improving MeetingType Skills	skill_manage + SKILLS_GUIDANCE
No Organizational Memory	Cross-meeting search basic	Five-layer memory with autoDream consolidation	Five-layer memory architecture
Semantic Search Missing	Basic keyword search	Vector search with cited sources via pgvector	Contextual persistence (Layer 3)
Coach is Single-Meeting	Last 20 meetings aggregated	Organizational behavior model + dialectic reasoning	Honcho-inspired user modeling
No Self-Improvement	We improve the product	Platform creates MeetingType skills autonomously	Closed learning loop
Limited Workflow Integration	Basic Slack push	Slack v2 with slash commands, interactive messages	Gateway platform pattern
No Enterprise Compliance	Basic RLS security	SOC2 readiness dashboard, audit logs	Security defense-in-depth
2.2 Competitive Position After v5
The external competitive analysis confirmed that our lead in cross-meeting intelligence is already unassailable—no competitor has anything close to our nightly intelligence aggregation, risk tracking, or multi-meeting coaching. v5 widens that lead further by adding semantic search (closing the #1 gap with Circleback), Slack v2, and the enterprise compliance dashboard. The self-improving skill system makes the gap structural—competitors cannot catch up without rebuilding their entire memory architecture.

PART 3: SYSTEM ARCHITECTURE (v5.0 TARGET STATE)
text
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                         MEETINGMIND v5.0 — SELF-IMPROVING INTELLIGENCE PLATFORM               │
│                                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                         INGESTION LAYER (Enhanced with Webhooks)                          │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ ┌────────────────────────────┐│ │
│  │  │ Manual Upload│ │  Recording   │ │ Calendar (Enhanced)  │ │ Webhooks (Zoom/Teams/Meet) ││ │
│  │  │ (existing)   │ │  (existing)  │ │ Poll + Push Notif.   │ │ (New)                       ││ │
│  │  └──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘ └──────────┬─────────────────┘│ │
│  │         └────────────────┴──────────┬─────────┴────────────────────────┘                  │ │
│  │                                     ▼                                                       │ │
│  │                    ┌─────────────────────────────┐                                        │ │
│  │                    │  INGESTION ORCHESTRATOR      │  (v4 - Enhanced)                       │ │
│  │                    │  Retry Queue, Conflict Det.  │                                        │ │
│  │                    └─────────────┬───────────────┘                                        │ │
│  └──────────────────────────────────┼────────────────────────────────────────────────────────┘ │
│                                     ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │    EXTRACTION ENGINE (25+ Fields, Progressive Disclosure, MeetingType Skills)              │ │
│  │                                                                                           │ │
│  │  ┌──────────────────────┐ ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │  MeetingType Skills  │ │  Subagent-Based Complex Analysis                          │   │ │
│  │  │  (Auto-created from  │ │  (Decision Agent | People Agent | Strategy Agent)         │   │ │
│  │  │   >=3 recurring mtgs)│ │  Each with fresh context, two-stage review                │   │ │
│  │  └──────────────────────┘ └──────────────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                                            │
│                                     ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │    CONTINUOUS INTELLIGENCE ENGINE (Enhanced with Hermes Patterns)                          │ │
│  │                                                                                           │ │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────────┐                     │ │
│  │  │ Dual-Stream    │ │ autoDream      │ │ Organizational Modeler     │                     │ │
│  │  │ Write          │ │ Consolidation  │ │ (Honcho-inspired dialectic)│                     │ │
│  │  │ Fast: immediate │ │ Light/REM/Deep │ │                            │                     │ │
│  │  │ Slow: nightly   │ │ Sleep cycles   │ │ "Team decides faster AM"   │                     │ │
│  │  └────────────────┘ └────────────────┘ └────────────────────────────┘                     │ │
│  │                                                                                           │ │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────────┐                     │ │
│  │  │ MeetingType    │ │ Five-Layer     │ │ Context-Fenced Memory      │                     │ │
│  │  │ Skill Manager  │ │ Memory System  │ │ <organizational-memory>    │                     │ │
│  │  │ Create/Patch   │ │ (Hermes arch)  │ │ tags for safety            │                     │ │
│  │  └────────────────┘ └────────────────┘ └────────────────────────────┘                     │ │
│  │                                                                                           │ │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────────┐                     │ │
│  │  │ Semantic Search│ │ Pattern        │ │ Risk Aggregation           │                     │ │
│  │  │ pgvector + RAG │ │ Aggregation    │ │ (Nightly Cron)             │                     │ │
│  │  │ (NEW)          │ │ (Nightly Cron) │ │                            │                     │ │
│  │  └────────────────┘ └────────────────┘ └────────────────────────────┘                     │ │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                                            │
│                                     ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │    SURFACING & ADDICTION LAYER                                                             │ │
│  │                                                                                           │ │
│  │  ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐               │ │
│  │  │ Business Pulse       │ │ Growing Brain        │ │ Aha Moments          │               │ │
│  │  │ (Primary Dashboard)  │ │ (Knowledge Graph Viz)│ │ (Hero Insight Cards)  │               │ │
│  │  └──────────────────────┘ └──────────────────────┘ └──────────────────────┘               │ │
│  │                                                                                           │ │
│  │  ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐               │ │
│  │  │ Predictive Alerts    │ │ Coach Dashboard v2   │ │ Slack v2 (Slash Cmds) │               │ │
│  │  │ (Push/Email/Slack)   │ │ (Trends + Benchmarks)│ │ (Interactive Messages) │               │ │
│  │  └──────────────────────┘ └──────────────────────┘ └──────────────────────┘               │ │
│  │                                                                                           │ │
│  │  ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐               │ │
│  │  │ Semantic Search UI   │ │ Quarterly Reports    │ │ Compliance Dashboard  │               │ │
│  │  │ (Pro+)               │ │ (Auto PDF/Email)     │ │ (Enterprise)          │               │ │
│  │  └──────────────────────┘ └──────────────────────┘ └──────────────────────┘               │ │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │    MONETIZATION LAYER (v5.0 Expanded)                                                      │ │
│  │                                                                                           │ │
│  │  Free: Manual, basic dash, basic search, 5 meetings/mo                                    │ │
│  │  Pro ($9/mo): Auto-ingest, patterns, semantic search, coach, quarterly reports            │ │
│  │  Business ($29/mo): Risk aggregation, Slack v2, ticket escalation, compliance dashboard    │ │
│  │  Enterprise ($99/mo): Whitelabel, on-prem, dedicated support, SSO                         │ │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
PART 4: THE SELF-IMPROVING SKILL SYSTEM (CORE INNOVATION)
This is the most significant architectural addition to v5—inspired directly by Hermes Agent's closed learning loop.

4.1 MeetingType Skill Manager
typescript
// backend/src/services/skill-manager.ts

interface MeetingTypeSkill {
  name: string                    // "standup-extraction-v2"
  category: string                // "meeting-type"
  description: string             // "Optimized extraction for daily standups at Acme Corp"
  version: string                 // "2.0.1"
  meeting_type: string            // "standup"
  optimized_prompt: string        // Custom Groq prompt evolved from experience
  extraction_fields: string[]     // Which 25+ fields are most relevant for this type
  coaching_focus: string[]        // What the coach should prioritize
  trigger_patterns: string[]      // Keywords/phrases that identify this meeting type
  organization_specific: boolean  // true = learned from this org's meetings
  success_rate: number            // 0.0-1.0 based on user feedback and quality scores
  times_used: number
  created_from: string[]          // Meeting IDs that contributed to this skill
  patch_history: PatchRecord[]    // Hermes-style patch history
}

class MeetingTypeSkillManager {
  /**
   * Triggered after 3+ meetings of the same type with >=80% quality scores.
   * Creates a specialized extraction skill using the Hermes skill_manage pattern.
   */
  async createSkillFromMeetings(meetings: Meeting[]): Promise<MeetingTypeSkill> {
    const meetingType = this.detectDominantType(meetings)
    
    // Use Groq to analyze what made these extractions successful
    const analysis = await this.analyzeExtractionPatterns(meetings)
    
    const skill: MeetingTypeSkill = {
      name: `${meetingType}-extraction`,
      category: 'meeting-type',
      description: `Optimized extraction for ${meetingType} meetings`,
      version: '1.0.0',
      meeting_type: meetingType,
      optimized_prompt: analysis.recommended_prompt,
      extraction_fields: analysis.most_relevant_fields,
      coaching_focus: analysis.coaching_priorities,
      trigger_patterns: analysis.identifying_patterns,
      organization_specific: true,
      success_rate: this.calculateAverageQuality(meetings),
      times_used: 0,
      created_from: meetings.map(m => m.id),
      patch_history: []
    }
    
    // Atomic write with quarantine (Hermes security pattern)
    await this.atomicWriteSkill(skill)
    
    // Security scan
    await this.securityScan(skill)
    
    await this.skillRegistry.register(skill)
    
    return skill
  }
  
  /**
   * Token-efficient targeted update (Hermes patch pattern).
   * Uses fuzzy matching to find old_string and replace it.
   */
  async patchSkill(
    skillName: string, 
    oldString: string, 
    newString: string
  ): Promise<void> {
    const skill = await this.skillRegistry.get(skillName)
    
    // Try exact match first, then fuzzy (whitespace-tolerant)
    const { newContent, matchCount, error } = this.fuzzyFindAndReplace(
      skill.optimized_prompt, oldString, newString
    )
    
    if (error) {
      throw new Error(`Patch failed: ${error}`)
    }
    
    // Atomic write with quarantine
    await this.atomicWriteSkill({ ...skill, optimized_prompt: newContent })
    
    // Update patch history
    skill.patch_history.push({
      timestamp: new Date(),
      old_string: oldString,
      new_string: newString,
      match_count: matchCount
    })
    
    // Increment patch version
    skill.version = this.incrementVersion(skill.version, 'patch')
    await this.skillRegistry.update(skill)
  }
}
4.2 SKILLS_GUIDANCE for MeetingMind
text
After processing 3+ meetings of the same type with 80%+ quality scores,
create a MeetingType skill using skill_manage(action='create') that captures:
- The optimal prompt structure for this meeting type at this organization
- Which of the 25+ fields are most relevant (not all fields apply to all types)
- What coaching insights are most valuable for this meeting type
- Common pitfalls in extraction and how to avoid them
- Identifying trigger patterns for automatic detection

When subsequent meetings of this type are processed, load the MeetingType skill 
for optimized extraction. If you find the skill outdated, incomplete, or producing 
low-quality results, patch it immediately with skill_manage(action='patch'). 
Skills that aren't maintained become liabilities.

Prefer patch over re-creation — it's more token-efficient and preserves history.
4.3 Skill Creation Triggers
Trigger	Action	Example
3+ meetings of same type with >=80% quality	Create MeetingType skill	"Standup extraction for Acme Corp"
User corrects extraction 2+ times on same field	Patch skill prompt	"Add 'blocker detection' to standup extraction"
Coach gives same advice 3+ times	Create coaching skill	"Decision velocity improvement pattern"
New meeting type detected (no skill exists)	Flag for creation after 3 occurrences	"First board meeting processed"
Organizational insight reaches >=90% confidence	Promote to permanent memory	"Team makes decisions 40% faster in AM meetings"
PART 5: THE 25+ FIELD EXTRACTION ENGINE — COMPLETE
Building on the v4.0 Intelligence Amplification Plan and the expanded extraction pillars discussed earlier, here is the complete field inventory organized by intelligence pillar.

5.1 Base Layer (Original 13 Fields — Preserved)
#	Field	Type	Description
1	summary	string	Meeting overview
2	decisions	string[]	Decisions made
3	action_items	object[]	Tasks with owner/deadline/priority
4	open_questions	string[]	Unanswered questions
5	parking_lot	string[]	Deferred topics
6	key_topics	string[]	Main discussion themes
7	key_quotes	object[]	Notable statements with speaker
8	sentiment	string	Positive/Neutral/Mixed/Tense
9	sentiment_reason	string	Justification
10	effectiveness_score	number	0-10 rating
11	effectiveness_reason	string	Justification
12	next_agenda	string[]	Suggested future topics
13	risk_flags	string[]	Identified risks
14	meeting_type	string	Classification
5.2 Pillar 1: People & Participation Analytics (NEW)
#	Field	Type	Description	Fuels Which Feature
15	dominance_imbalance_score	number (0-10)	Speaking time ratio: most vs. least dominant	"Aha" Moment, Growing Brain
16	silence_analysis	object[]	Participants silent during key decisions	Psychological safety indicator
17	influence_map	object[]	Whose suggestions were acted upon vs. ignored	Team Pulse, Bottleneck Detection
18	per_speaker_sentiment	object[]	Sentiment broken down per individual speaker	Growing Brain nodes
5.3 Pillar 2: Decision & Action Intelligence (NEW)
#	Field	Type	Description	Fuels Which Feature
19	decision_clarity_score	number (0-10)	Were decisions explicit or implicit?	Decision Velocity Gauge
20	action_smart_scores	object[]	SMART criteria evaluation per action item	Task Dashboard health
21	bottleneck_detection	object[]	Individuals consistently assigned stalled tasks	Team Pulse (Business tier)
22	thread_recurrence_flags	object[]	Topics flagged as appearing in prior meetings	Cross-meeting memory surfacing
5.4 Pillar 3: Resource & Time Intelligence (NEW)
#	Field	Type	Description	Fuels Which Feature
23	estimated_meeting_cost	number	Participant count × duration × hourly rate	Hero "Aha" card
24	agenda_adherence_score	number (0-10)	Did the meeting follow the intended agenda?	Coaching advice
25	time_pareto_breakdown	object	% Status Updates, % Decisions, % Problem Solving, % Off-Topic	"Aha" Moment
5.5 Pillar 4: Strategic & Contextual Awareness (NEW)
#	Field	Type	Description	Fuels Which Feature
26	competitor_mentions	string[]	Competitors, clients, partners mentioned	Strategic Radar
27	strategic_pillar_alignment	object	% time aligned with configured OKRs/goals	Executive dashboard
28	resource_requests	object[]	Budget, headcount, or tool requests detected	Risk tracking
5.6 Pillar 5: Meeting Health & Culture (NEW)
#	Field	Type	Description	Fuels Which Feature
29	psychological_safety_score	number (0-10)	Supportive vs. critical interjections ratio	Organizational health
30	false_consensus_flag	boolean	Quick decisions with no dissent or clarifying questions	Risk detection
31	creativity_innovation_count	number	Novel ideas proposed during the meeting	Innovation tracking
PART 6: THE ADDICTION & TIME-TO-VALUE LAYER
This layer is designed to make MeetingMind indispensable within days, not weeks. Users must feel the AI getting smarter about their business every single day.

6.1 The "Aha" Moment (Day 1, Meeting 1)
After the first meeting is processed, a lightweight Groq call (/api/aha) analyzes the extraction for the single most surprising data point and displays it as a hero card.

typescript
// backend/src/routes/aha.ts
app.post('/api/aha', auth, async (c) => {
  const { meeting_id } = await c.req.json()
  const meeting = await getMeeting(meeting_id)
  
  const prompt = `Analyze this meeting data and find the ONE most surprising, 
    non-obvious insight. It must be specific, data-backed, and make the user think 
    "I didn't know that about my team."
    
    Meeting data: ${JSON.stringify(meeting)}
    
    Return a single sentence. Make it punchy.`
  
  const insight = await groq.complete(prompt)
  
  return c.json({ insight })
})
Example outputs:

"You spent 80% of meeting time on status updates, but only 20% on decisions. Top-performing teams reverse that ratio."

"Alice spoke for 45 minutes. Bob spoke for 2. This is the 4th meeting in a row with this pattern."

"The word 'urgent' appeared 12 times. The word 'important' appeared 0 times."

6.2 The Business Pulse Dashboard (Daily Anchor)
The default dashboard after login is an executive command center showing organizational health at a glance, driven by the nightly intelligence aggregation.

Widgets:

Effectiveness Sparkline: 30-day trend with red/green arrow

Decision Velocity: "15 decisions this week, up 3 from last week"

Risk Radar: Polar chart of top risk categories

Unresolved Thread Alert: "3 threads blocking key decisions"

"Since You Last Logged In" Summary

6.3 The Growing Brain (Visual Lock-in)
A visual knowledge graph that grows with each meeting. Pro feature. Free users see a locked preview with one glowing node and the prompt: "Analyze 3 more meetings to unlock your AI's full knowledge graph."

Mechanics:

Nodes: People (speakers), Topics (key_topics), Risks (recurring risk_flags), Decisions

Growth: New nodes and connections added after each meeting

Milestones: "Your AI has learned about 5 key topics," "Your AI can now predict risks for your weekly standup"

Click to search: Clicking a node triggers semantic search

6.4 Predictive Proactive Alerts
Daily alerts pushed to email/Slack/webhook:

Alert Type	Trigger	Example
Effectiveness Anomaly	Meeting score drops >2 points below 30-day average	"Your last meeting (4.2) was significantly below your average (7.1)"
Thread Escalation	Thread open >21 days, blocking >=3 action items	"Budget Approval thread is 21 days old, blocking 3 tasks"
Workload Imbalance	One person has >5 overdue tasks, others have 0	"Bob has 5 overdue tasks. Alice has 0."
Positive Reinforcement	Team hits top 10% benchmark	"Your decision velocity is in the top 10% this week!"
PART 7: SEMANTIC SEARCH — COMPLETE IMPLEMENTATION
This closes the #1 competitive gap with Circleback, using pgvector with automatic embedding generation via Supabase Edge Functions.

7.1 Database Schema
sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Meeting embeddings for semantic search
CREATE TABLE meeting_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  embedding vector(1536),
  content_type TEXT CHECK (content_type IN ('transcript', 'summary', 'decisions', 'action_items')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_meetings(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid, title text, summary text, decisions jsonb,
  action_items jsonb, risk_flags jsonb, meeting_date date,
  similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.title, m.summary, m.decisions,
    m.action_items, m.risk_flags, m.meeting_date,
    1 - (me.embedding <=> query_embedding) AS similarity
  FROM meeting_embeddings me
  JOIN meetings m ON m.id = me.id
  WHERE m.user_id = p_user_id
    AND 1 - (me.embedding <=> query_embedding) > match_threshold
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
7.2 Search Endpoint
text
GET /api/search?q=What did we decide about Q3 budget?&limit=10&type=all
Returns cited results with meeting title, speaker attribution, snippet, and a semantic_search boolean indicating whether vector search was used. Falls back to PostgreSQL full-text search if vector results are insufficient.

7.3 Embedding Strategy
Embeddings generated on meeting creation via Supabase Edge Function triggered by database webhook

Uses Groq's embedding endpoint for consistency with our LLM provider

Stored in meeting_embeddings table with pgvector indexing for fast retrieval

Built-in fallback to PostgreSQL ilike search if pgvector is unavailable

PART 8: FIVE-LAYER MEMORY ARCHITECTURE
Inspired directly by Hermes Agent's five-layer memory system and Honcho's dialectic user modeling.

Layer	Name	MeetingMind Implementation	Hermes Pattern
1	Short-term Inference	Current meeting transcript + extraction (context window)	Context window
2	Procedural Skills	MeetingType Skills (auto-created from recurring meetings)	Skill documents
3	Contextual Persistence	pgvector semantic search across all meetings	Vector store retrieval
4	User/Org Modeling	Organizational behavior model: decision patterns, communication styles	Honcho dialectic
5	Session Search	Cross-meeting search with LLM summarization	FTS5 + LLM
8.1 Organizational Behavior Modeler (Layer 4)
typescript
// backend/src/services/org-modeler.ts

interface OrganizationalInsight {
  type: 'decision_pattern' | 'communication_style' | 'risk_tolerance' | 'team_dynamic'
  insight: string
  confidence: number          // 0.0-1.0
  derived_from: string[]      // Meeting IDs that contributed
  last_validated: Date
  promoted_to_memory: boolean // Promoted to permanent memory when >=90%
}

class OrganizationalModeler {
  /**
   * Uses dialectic reasoning inspired by Honcho to derive conclusions
   * about the organization's behavior from meeting data.
   */
  async deriveInsights(userId: string): Promise<OrganizationalInsight[]> {
    const meetings = await this.getRecentMeetings(userId, 50)
    
    // Test hypotheses against meeting data
    const hypotheses = [
      "Does this team make faster decisions in morning meetings?",
      "Is risk tolerance higher in Q4 than Q1?",
      "Which team members consistently improve meeting effectiveness?",
      "Do meetings with agendas have higher effectiveness scores?",
      "Is psychological safety correlated with decision velocity?"
    ]
    
    const insights: OrganizationalInsight[] = []
    for (const hypothesis of hypotheses) {
      const result = await this.testHypothesis(hypothesis, meetings)
      if (result.confidence >= 0.7) {
        insights.push(result)
      }
    }
    
    return insights
  }
}
PART 9: SLACK v2 — INTERACTIVE INTEGRATION
Slash commands and interactive messages bring MeetingMind intelligence directly into team workflows.

9.1 Slash Commands
Command	Function	Response
/meetingmind-summary	Pull latest meeting summary	Block Kit card with summary + action items
/meetingmind-tasks	List personal action items	Interactive list with "Mark Complete" buttons
/meetingmind-search	Semantic search	/meetingmind-search what did we decide about budget
/meetingmind-coach	Get latest coaching insight	Coaching card with trend visualization
9.2 Interactive Messages
After each meeting is processed (Business tier), a Block Kit message is pushed to the configured Slack channel:

View Full Report button linking to the meeting detail page

Mark Task Done buttons on individual action items

Assign to @user dropdown for task delegation

All actions update the database in real-time via the Slack interactions webhook

9.3 Technical Implementation
typescript
// backend/src/services/slack-v2.ts

class SlackV2Integration {
  /**
   * Handles slash commands. Must respond within 3 seconds per Slack API spec.
   */
  async handleSlashCommand(command: string, userId: string): Promise<SlackResponse> {
    switch (command) {
      case '/meetingmind-summary':
        return this.getLatestSummary(userId)
      case '/meetingmind-tasks':
        return this.getTaskList(userId)
      case '/meetingmind-search':
        return this.promptSearch(userId)
      case '/meetingmind-coach':
        return this.getCoachInsight(userId)
    }
  }
  
  /**
   * Handles interactive message actions (button clicks, dropdowns).
   */
  async handleInteraction(payload: SlackInteraction): Promise<void> {
    switch (payload.type) {
      case 'mark_task_done':
        await this.completeTask(payload.task_id, payload.user_id)
        await this.updateSlackMessage(payload.message_ts, 'task_completed')
        break
      case 'assign_task':
        await this.assignTask(payload.task_id, payload.assignee_id)
        break
    }
  }
}
PART 10: CALENDAR AUTO-INGESTION — ENHANCED RELIABILITY
*Google Calendar push notifications provide real-time event change detection with sub-30-second latency, far superior to polling alone.*

10.1 Enhanced Calendar Trigger Service
typescript
// backend/src/services/calendar-enhanced.ts

class EnhancedCalendarService {
  /**
   * Primary: Google Calendar Push Notifications (real-time).
   * Fallback: Polling every 15 minutes for users without webhooks.
   */
  
  // Register webhook for real-time event notifications
  async registerWatchChannel(userId: string): Promise<void> {
    const channel = await google.calendar.events.watch({
      calendarId: 'primary',
      requestBody: {
        id: crypto.randomUUID(),
        type: 'web_hook',
        address: `${API_BASE}/api/calendar/webhook`
      }
    })
    
    await this.saveChannel(userId, channel)
  }
  
  // Handle incoming push notification
  async handlePushNotification(body: any): Promise<void> {
    // Google sends notification that something changed, not what changed
    // We fetch the full event details
    const events = await this.fetchRecentEvents(body.channelId)
    
    for (const event of events) {
      if (this.isRecentlyEnded(event) && event.recordingUrl && !event.processed) {
        await ingest({ type: 'calendar_event', ...event })
      }
    }
  }
  
  // Fallback polling for users without webhooks
  async pollCalendar(userId: string): Promise<void> {
    const events = await google.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(Date.now() - 3600000).toISOString(), // last hour
      timeMax: new Date().toISOString()
    })
    
    for (const event of events) {
      if (this.isRecentlyEnded(event) && !event.processed) {
        await ingest({ type: 'calendar_event', ...event })
      }
    }
  }
}
PART 11: MULTILINGUAL TRANSCRIPTION
*AssemblyAI's Universal-3 Pro model supports 6 languages natively with automatic code-switching, enabling expansion into European and APAC markets.*

11.1 Language Configuration
Feature	Implementation
Supported languages	English, Spanish, French, German, Italian, Portuguese (Universal-3 Pro)
Auto-detection	AssemblyAI automatically detects language when not specified
Code-switching	Handles speakers who move between languages mid-conversation
UI control	Language selector in upload/recording interface
Prompt adaptation	Groq prompt includes language parameter for multilingual extraction
PART 12: ENTERPRISE COMPLIANCE DASHBOARD
A Business/Enterprise tier feature that provides transparency for security reviews and enterprise procurement.

12.1 Compliance Dashboard Features
Section	Content	Update Frequency
Data Residency	"Your data is stored in US-East (Cloudflare) / EU-West (Supabase)"	Static (config-driven)
Retention Policies	Configurable: "Recordings deleted after X days. Summaries retained until account deletion."	Real-time
Audit Logs	Who accessed which meeting, when, from which IP	Real-time
SOC2 Readiness	Checklist: "Penetration testing: completed Q2 2026," "Data encryption at rest: ✅"	Quarterly
Export	CSV export of audit logs for SIEM integration	On-demand
PART 13: COMPLETE DATABASE SCHEMA ADDITIONS (v5.0)
sql
-- =====================================================
-- MEETINGMIND v5.0 — COMPLETE SCHEMA ADDITIONS
-- =====================================================

-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Meeting embeddings for vector search
CREATE TABLE meeting_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  embedding vector(1536),
  content_type TEXT CHECK (content_type IN ('transcript', 'summary', 'decisions', 'action_items')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MeetingType Skills (Hermes-inspired procedural memory)
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

-- Skill patch history (Hermes pattern)
CREATE TABLE skill_patches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES meeting_skills(id) ON DELETE CASCADE,
  old_string TEXT NOT NULL,
  new_string TEXT NOT NULL,
  match_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizational behavior insights (Honcho-inspired Layer 4)
CREATE TABLE organizational_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT CHECK (insight_type IN ('decision_pattern', 'communication_style', 'risk_tolerance', 'team_dynamic')),
  insight TEXT NOT NULL,
  confidence REAL DEFAULT 0.0,
  derived_from UUID[],
  promoted_to_memory BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_validated TIMESTAMPTZ DEFAULT NOW()
);

-- Intelligence aggregates (enhanced from v4)
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

-- Risk aggregation with trend data
CREATE TABLE intelligence_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_frequency JSONB,
  risk_trend JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar push notification channels
CREATE TABLE calendar_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  resource_id TEXT,
  expiration TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting language tracking
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS agenda_adherence_score REAL;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS psychological_safety_score REAL;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS estimated_cost REAL;

-- Slack v2 configurations
CREATE TABLE slack_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_webhook_url TEXT,
  slash_command_enabled BOOLEAN DEFAULT false,
  interactive_messages_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictive alerts queue
CREATE TABLE predictive_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('effectiveness_anomaly', 'thread_escalation', 'workload_imbalance', 'positive_reinforcement')),
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

-- Audit logs for compliance
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

-- Meeting streaks for habit building
CREATE TABLE meeting_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  week_start DATE NOT NULL,
  meetings_analyzed INTEGER DEFAULT 0,
  UNIQUE(user_id, week_start)
);

-- Indexes
CREATE INDEX idx_meeting_skills_user ON meeting_skills(user_id, meeting_type);
CREATE INDEX idx_org_insights_user ON organizational_insights(user_id, confidence DESC);
CREATE INDEX idx_predictive_alerts_user ON predictive_alerts(user_id, delivered);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
PART 14: API ARCHITECTURE (COMPLETE v5.0 ENDPOINTS)
Endpoint	Method	Purpose	Plan Gate	Status
Existing v4.0 Routes (Retained)				
/api/auth/*	POST/GET	Authentication	Free	Live
/api/ingest	POST	Ingestion orchestrator	Free	Live
/api/analyze	POST	25-field extraction	Free	Live
/api/coach	POST	Multi-meeting coaching	Pro	Live
/api/meetings	GET/DELETE	Meeting CRUD	Free	Live
/api/tasks	GET/POST/PUT	Task management	Free	Live
/api/threads	GET/POST	Unresolved threads	Free	Live
/api/billing/*	POST/GET	Stripe subscriptions	Auth	In Progress
New v5.0 Intelligence Routes				
/api/search	GET	Semantic cross-meeting search with cited sources	Pro	To Build
/api/aha	POST	Generate "Aha" insight hero card	Free	To Build
/api/intelligence/pulse	GET	Business Pulse dashboard data	Free	To Build
/api/intelligence/knowledge-graph	GET	Growing Brain visualization data	Pro	To Build
/api/intelligence/patterns	GET	Pre-computed pattern data	Pro	To Build
/api/intelligence/risks	GET	Pre-computed risk data	Business	To Build
/api/intelligence/insights	GET	Organizational behavior insights	Pro	To Build
/api/skills	GET/POST	MeetingType skill management	Pro	To Build
/api/skills/:id/patch	POST	Token-efficient skill patching	Pro	To Build
New v5.0 Integration Routes				
/api/calendar/webhook	POST	Google Calendar push notifications	Pro	To Build
/api/integrations/slack/commands	POST	Slash command handler	Business	To Build
/api/integrations/slack/interactions	POST	Interactive message handler	Business	To Build
/api/integrations/slack/config	GET/POST	Slack configuration	Business	To Build
New v5.0 Enterprise Routes				
/api/reports/quarterly	GET	Latest quarterly report	Pro	To Build
/api/compliance	GET	Compliance dashboard data	Business	To Build
/api/admin/audit-logs	GET	Audit log export	Business	To Build
PART 15: CONTINUOUS INTELLIGENCE ENGINE (ENHANCED)
15.1 Nightly Cron Jobs
toml
# wrangler.toml — Enhanced cron configuration
[env.production.triggers]
crons = [
  "0 2 * * *",   # Nightly intelligence aggregation (2 AM UTC)
  "0 8 * * 1",   # Weekly pattern consolidation (Monday 8 AM)
  "0 8 1 * *"    # Monthly organizational model update
]
15.2 autoDream Consolidation Cycle
Phase	Frequency	Function	Hermes Inspiration
Light Sleep	Hourly	Process recent meetings, extract immediate patterns, update short-term memory	Light Sleep cycle
REM Sleep	Daily (2 AM)	Link causal relationships, resolve contradictions, generate MeetingType skill candidates	REM Sleep cycle
Deep Sleep	Weekly (Monday)	Solidify organizational intelligence, promote high-confidence insights, prune obsolete patterns	Deep Sleep cycle
15.3 Dual-Stream Write
typescript
// Fast Path (synchronous): After each meeting
async function onMeetingComplete(meeting: Meeting): Promise<void> {
  await saveExtractionResults(meeting)          // User sees this instantly
  await memoryLedger.append(meeting)            // O(1) append
  await queue.add('consolidate-meeting', { meetingId: meeting.id })  // Async trigger
}

// Slow Path (asynchronous): Nightly consolidation
async function consolidateNightly(userId: string): Promise<void> {
  const unprocessed = await memoryLedger.getUnprocessed(userId)
  const patterns = await extractPatterns(unprocessed)
  const insights = await deriveInsights(patterns)
  
  // Check if any meeting type has >=3 occurrences for skill creation
  await meetingSkillManager.checkAndCreateSkills(userId)
  
  // Update organizational model
  await organizationalModeler.deriveInsights(userId)
}
PART 16: PREDICTIVE ALERTS SYSTEM
16.1 Alert Queue Architecture
typescript
// backend/src/services/predictive-alerts.ts

class PredictiveAlertsService {
  async generateDailyAlerts(userId: string): Promise<void> {
    const patterns = await this.getPatterns(userId)
    const recentMeetings = await this.getRecentMeetings(userId, 5)
    const threads = await this.getUnresolvedThreads(userId)
    
    const alerts: PredictiveAlert[] = []
    
    // Effectiveness anomaly detection
    if (recentMeetings[0].effectiveness_score < patterns.avg_effectiveness - 2) {
      alerts.push({
        type: 'effectiveness_anomaly',
        data: {
          last_score: recentMeetings[0].effectiveness_score,
          average: patterns.avg_effectiveness,
          meeting_title: recentMeetings[0].title
        }
      })
    }
    
    // Thread escalation
    for (const thread of threads) {
      const daysOpen = this.calculateDaysOpen(thread)
      if (daysOpen > 21 && thread.blocking_count >= 3) {
        alerts.push({
          type: 'thread_escalation',
          data: { thread, days_open: daysOpen, blocking_count: thread.blocking_count }
        })
      }
    }
    
    // Workload imbalance
    const imbalance = await this.checkWorkloadImbalance(userId)
    if (imbalance) {
      alerts.push({ type: 'workload_imbalance', data: imbalance })
    }
    
    // Deliver alerts
    for (const alert of alerts) {
      await this.deliverAlert(userId, alert)
    }
  }
}
PART 17: IMPLEMENTATION ROADMAP (TO v5.0 LAUNCH)
This roadmap builds on the deployed v4.0 base and sequences the work to deliver continuous value while maintaining momentum.

Phase 1: Critical Gap Closure (Week 1-2)
Task	Priority	Owner	Effort
Implement pgvector semantic search (/api/search)	P0	Backend	8 hours
Build "Aha" moment endpoint (/api/aha)	P0	Backend	3 hours
Build Business Pulse dashboard component	P0	Frontend	12 hours
Add meeting_streaks table and streak logic	P0	Backend	3 hours
Deploy Phase 1			End of Week 2
Phase 2: Intelligence & Addiction Layer (Week 3-4)
Task	Priority	Owner	Effort
Build MeetingType Skill Manager (create/patch)	P0	Backend	12 hours
Implement autoDream REM Sleep cycle (nightly cron)	P0	Backend	8 hours
Build Growing Brain visualization	P1	Frontend	16 hours
Build Predictive Alerts queue and delivery	P1	Backend	8 hours
Add Organizational Modeler (Honcho-inspired)	P1	Backend	10 hours
Deploy Phase 2			End of Week 4
Phase 3: Workflow Integration (Week 5-6)
Task	Priority	Owner	Effort
Build Slack v2 (slash commands + interactive messages)	P0	Backend + Frontend	12 hours
Enhance Calendar Trigger with push notifications	P0	Backend	6 hours
Implement Multilingual Transcription support	P1	Backend	4 hours
Build Quarterly Report generation cron	P1	Backend	6 hours
Deploy Phase 3			End of Week 6
Phase 4: Enterprise & Launch (Week 7-8)
Task	Priority	Owner	Effort
Build Compliance Dashboard	P1	Frontend + Backend	10 hours
Add Enterprise tier ($99/mo) to Stripe	P0	Backend	3 hours
Build audit_logs table and middleware	P1	Backend	4 hours
Full QA, load testing, edge case validation	P0	QA	8 hours
Public v5.0 launch with updated pricing and marketing	P0	All	4 hours
PART 18: SUCCESS METRICS
Metric	v4 Target	v5 Target	Measurement
Activation Rate	>60%	>70%	Auto-ingestion within 7 days
Weekly Active Users	N/A	>50% of MAU	DAU/MAU ratio
Meetings per User/Week	N/A	>3	DB analytics
Search Adoption	N/A	>30% of Pro users	Search endpoint usage
Skill Creation Rate	N/A	>1 per user/month	meeting_skills table
Pro Conversion	>5%	>7%	Stripe
Business Adoption	>20%	>25%	Stripe
Monthly Churn	<5%	<3%	Stripe
PART 19: THE COMPETITIVE MOAT — FINAL STATE
After v5.0, MeetingMind's moat is structural rather than feature-based:

Moat Dimension	Why It's Uncopyable
Self-Improving Extraction	MeetingType skills that auto-tune per organization. No competitor has the learning loop architecture.
Organizational Behavior Model	Five-layer memory with Honcho-inspired dialectic reasoning. Requires rebuilding the entire data model.
Nightly Intelligence Aggregation	Economically impossible for competitors paying OpenAI prices. Groq makes our cost ~
0.10
/
m
e
e
t
i
n
g
v
s
.
t
h
e
i
r
0.10/meetingvs.their0.50+.
Growing Brain Visual	Tangible proof that the AI understands the organization. Creates emotional lock-in.
Cross-Meeting Semantic Search	pgvector with cited sources. Even Circleback's best-in-class search only works within meetings, not across them

MEETINGMIND v5.0 — EXPANDED SKILL SYSTEM
Eleven Skill Categories Inspired by Hermes' Closed Learning Loop
Skill Category 1: MeetingType Extraction Skills
What They Are: Optimized extraction templates for recurring meeting types, auto-created from 3+ meetings with high quality scores.

Trigger	Skill Created	Example
3+ standups with >=80% quality	standup-extraction	Focuses on blocker detection, progress updates; skips strategic analysis fields
3+ board meetings	board-meeting-extraction	Prioritizes decisions, financial mentions, governance topics
3+ sprint retrospectives	retro-extraction	Extracts sentiment per speaker, psychological safety, improvement suggestions
3+ client calls	client-call-extraction	Flags competitor mentions, pricing discussions, follow-up commitments
3+ 1:1s	one-on-one-extraction	Tracks career development mentions, wellbeing signals, unspoken concerns
Product Manifestation: When a meeting is processed using a MeetingType skill, the extraction results show a "🎯 Optimized for [meeting type]" badge with a confidence score. The Growing Brain visualization shows a "Meeting Types" knowledge cluster.

Skill Category 2: Coaching Skills
What They Are: Reusable coaching interventions that are created when the coach gives similar advice across multiple meetings and sees measurable improvement.

Trigger	Skill Created	Success Metric
Coach advises "use the who-what-when framework" 3+ times, and teams improve decision clarity by >10%	decision-clarity-coaching	Decision clarity score improvement
Coach identifies participation imbalance 3+ times, and the "round-robin" technique resolves it	participation-balance-coaching	Dominance imbalance score reduction
Coach detects recurring "scope creep" in 3+ meetings, and the agenda-adherence technique works	scope-creep-prevention	Agenda adherence score improvement
Coach suggests "pre-read distribution" for 3+ ineffective meetings, and effectiveness improves	meeting-preparation-coaching	Effectiveness score improvement
Skill Structure (Hermes SKILL.md format):

markdown
---
name: decision-clarity-coaching
description: Coaching intervention for teams with consistently low decision clarity scores
version: 1.0.1
category: coaching
success_rate: 0.82
times_used: 7
created_from: [meeting_123, meeting_456, meeting_789]
tags: [coaching, decision-making, facilitation]
---

# Decision Clarity Coaching

## When to Use
- Decision clarity score < 7 for 3+ consecutive meetings
- Team repeatedly uses vague language ("we should maybe", "let's circle back")
- Action items lack clear owners or deadlines

## Procedure
1. Present the decision clarity trend to the user
2. Explain the "Who, What, When" framework:
   - Who: Single accountable owner
   - What: Specific, measurable outcome
   - When: Hard deadline
3. Suggest that the meeting lead restate each decision in this format before moving on
4. Track improvement over the next 3 meetings

## Verification
- [ ] Decision clarity score increases by >=10% within 3 meetings
- [ ] Action items have explicit owners and deadlines
- [ ] User reports improved meeting outcomes

## Pitfalls
- **Pitfall**: Teams resist the structured format, calling it "bureaucratic"
  **Fix**: Emphasize that it's about clarity, not paperwork. Show time saved from fewer follow-ups.
Skill Category 3: Meeting Facilitation Skills
What They Are: Learned facilitation patterns that correlate with high effectiveness scores, recommended proactively before meetings.

Trigger	Skill Created	When Recommended
Meetings using round-robin format show 20% higher participation scores	round-robin-facilitation	When dominance imbalance predicted
Meetings with pre-distributed agendas score 15% higher on effectiveness	agenda-first-facilitation	When agenda adherence < 6 historically
Meetings ending 5 min early with summary have 25% higher action completion	hard-close-facilitation	When meetings historically run over time
Meetings with assigned "devil's advocate" have 30% fewer false consensus flags	red-team-facilitation	When false consensus detected in prior meetings
Product Manifestation: In the pre-meeting brief (a new v5 feature), the Coach suggests: "Based on your team's history, try the round-robin format today. Your last 3 meetings showed high participation imbalance. Meetings using round-robin score 20% higher on participation."

Skill Category 4: Action Item Intelligence Skills
What They Are: Learned patterns about how action items get completed—or stall—in this specific organization.

Trigger	Skill Created	What It Does
Action items assigned to Bob on Fridays consistently miss deadlines	friday-bob-followup	Proactively suggests Monday deadlines for Bob's tasks
Tasks with "review" in the title take 3x longer than estimated	review-task-estimation	Adjusts time estimates for review-type tasks
Action items with interdependent tasks (parent/child) have 40% lower completion	dependency-detection	Flags dependent tasks and suggests sequential planning
Tasks created in meetings without clear "definition of done" stall indefinitely	definition-of-done-enforcement	Prompts the meeting lead to add DoD before assigning
Skill Category 5: Risk Mitigation Skills
What They Are: Captured resolution patterns for recurring risk flags—turning past crises into playbooks.

Trigger	Skill Created	Resolution Pattern
"Budget overrun" flag appeared in 3 projects, each resolved by reallocation from contingency	budget-overrun-mitigation	Suggests contingency review and stakeholder escalation path
"Key person dependency" flag in 4 meetings, resolved by cross-training	bus-factor-mitigation	Recommends knowledge-sharing session and documentation sprint
"Scope creep" flag in 5 projects, resolved by scope-freeze memo	scope-creep-mitigation	Generates scope-freeze template with historical justification
"Vendor delay" flag repeatedly linked to a specific vendor	vendor-risk-flag	Auto-escalates to procurement and suggests alternative vendors
Skill Category 6: Organizational Communication Skills
What They Are: Learned nuances of how this specific organization communicates—their internal language, decision-making phrases, and cultural signals.

Trigger	Skill Created	What It Learns
Consistent use of acronyms and internal jargon	org-lexicon	Maps internal terms to their meanings for better extraction
Specific phrases that signal a decision is truly final vs. tentative	decision-language	"We're going with..." = committed. "Let's explore..." = tentative.
Cultural norms around disagreement (direct vs. indirect)	dissent-language	How this team signals disagreement without saying "I disagree"
Email/slack integration preferences	communication-channels	Learns which channels different stakeholders prefer for follow-ups
Skill Category 7: Team Health Monitoring Skills
What They Are: Proactive monitoring patterns that detect degradation in team health metrics before they become crises.

Trigger	Skill Created	Alert Fired
Psychological safety score drops >2 points over 4 weeks	safety-degradation-alert	"Team psychological safety has declined 2.3 points this month. Root cause: 3 meetings with dominant speaker patterns."
Participation of junior members drops below 10% for 4 meetings	inclusion-alert	"Junior team members spoke for less than 10% of meeting time in the last month."
Decision velocity drops 30%+ from quarterly average	velocity-alert	"The team is making 30% fewer decisions per meeting than last quarter."
"Burnout language" detected in 3+ meetings	wellbeing-alert	"Language associated with burnout detected in 3 recent meetings. Consider a wellbeing check-in."
Skill Category 8: Integration Action Skills
What They Are: Learned workflows for external tool integrations—capturing how this team connects MeetingMind to their broader toolchain.

Trigger	Skill Created	Automated Action
User manually pushes action items to Linear 3+ times with the same workflow	linear-push-workflow	Auto-pushes action items to the configured Linear project with correct labels
User exports meeting summaries to Notion 4+ times	notion-export-workflow	Auto-exports summaries to the team's Notion meeting notes database
User shares coaching insights to Slack 3+ times	slack-coaching-share	Weekly auto-post of team effectiveness trends to #team-channel
User creates calendar events from action items 5+ times	task-to-calendar-workflow	Auto-creates calendar blocks for high-priority tasks with approaching deadlines
Skill Category 9: Summarization Style Skills
What They Are: Learned preferences for how different stakeholders consume meeting intelligence—because the CEO reads differently than the project manager.

Trigger	Skill Created	Output Style
User consistently edits summaries to be shorter and more bullet-focused	ceo-brief-style	3-bullet executive summary, financial impact highlighted
User expands detailed action items with context 5+ times	pm-detailed-style	Full context, dependencies, blockers called out per task
User forwards coaching insights to team 3+ times with encouraging framing	team-coach-style	Supportive, growth-oriented language; "here's what we're doing well" first
User requests "meeting cost" prominently displayed	cost-conscious-style	Meeting cost as hero metric, time efficiency highlighted
Skill Category 10: Meeting Preparation Skills
What They Are: Pre-meeting intelligence that prepares participants based on historical patterns—what to read, who should attend, what decisions are pending.

Trigger	Skill Created	Pre-Meeting Brief
3+ meetings of same type with recurring agenda items	pre-read-recommendation	"For your upcoming standup: review the Q3 budget tracker. It was discussed in 3 of the last 5 standups and has 2 unresolved threads."
Unresolved threads detected that are relevant to upcoming meeting	thread-surfacing	"3 unresolved threads are relevant to tomorrow's strategy session: Budget Approval, Vendor Selection, Q4 Timeline."
Key stakeholder missing from calendar invite based on historical attendance	attendee-recommendation	"Sarah Chen was critical in 4 of 5 previous strategy sessions. She's not on tomorrow's invite."
Documents frequently referenced during this meeting type	document-surfacing	"The Q3 roadmap deck was referenced in 80% of past strategy sessions. Have it ready."
Skill Category 11: Cross-Project Intelligence Skills
What They Are: Patterns that transcend individual teams—organizational meta-learning that improves the entire company.

Trigger	Skill Created	Organizational Impact
Same risk pattern detected across 3+ teams	org-wide-risk-pattern	Alerts leadership: "Budget overrun risk detected in Engineering, Marketing, and Sales simultaneously."
Decision velocity trending down across multiple teams	org-wide-decision-slowdown	Executive dashboard shows: "Organization-wide decision velocity down 15% this quarter."
Participation imbalance highly correlated with low effectiveness across teams	org-wide-inclusion-finding	HR/Leadership report: "Teams with high participation balance score 30% higher on effectiveness."
Specific meeting format (e.g., async standups) outperforming across teams	best-practice-discovery	"Teams using async standup format show 25% higher decision velocity. Recommend org-wide adoption."
HOW THESE SKILLS MANIFEST IN THE PRODUCT
The Growing Brain Visualization
Each skill category becomes a cluster in the Growing Brain visualization. Users see their AI learning:

🎯 Meeting Types — 5 extraction skills learned

🧠 Coaching — 3 coaching interventions proven effective

📋 Action Intelligence — 4 follow-up patterns detected

⚠️ Risk Mitigation — 2 crisis playbooks captured

🗣️ Communication — 47 internal terms mapped

❤️ Team Health — 3 monitoring alerts configured

🔗 Integrations — 2 workflow automations active

📝 Summarization — 4 stakeholder style preferences learned

📅 Preparation — 3 pre-meeting brief templates

🏢 Cross-Project — 1 org-wide pattern contributed

The Business Pulse Dashboard
Each week, the Pulse dashboard surfaces:

"This week, your MeetingMind learned: 2 new coaching skills, 1 risk mitigation playbook, and refined your standup extraction template. Your AI now has 23 skills specific to your organization."

The Coach's Self-Awareness
When the coach gives advice, it can now cite its sources:

"I'm recommending the round-robin format based on your team's history. *This insight comes from your participation-balance-coaching skill, which has an 82% success rate across 7 interventions.*"

SKILL LIFECYCLE MANAGEMENT
Following the Hermes pattern of continuous maintenance:

Lifecycle Stage	What Happens	When
Creation	Skill created from 3+ successful occurrences	Automatic after threshold met
Active Use	Skill loaded for relevant meetings/interventions	Every applicable instance
Patch	Token-efficient targeted improvement	When skill underperforms or user corrects
Success Tracking	times_used and success_rate updated	After each use
Flag for Review	Skill flagged if times_used >= 10 AND success_rate < 0.7	Automatic
Deprecation	Skill archived if success rate stays below 0.5	After review
Promotion	Organization-specific skill promoted to global template if success rate >0.9	Optional opt-in
The Hermes mantra applies: "Skills that aren't maintained become liabilities."

MEETINGMIND v5.0 — THE INSIGHT ENGINE & PROMPT MANAGEMENT SYSTEM
THE DAY ONE INSIGHT GUARANTEE
A user processes their first meeting. Within seconds, they must see something that proves MeetingMind understands something about their business that they didn't expect.

This cannot rely on historical data — there is none yet. It must come from universal organizational patterns that are true across all companies, combined with immediate pattern detection from the very first transcript.

The Insight Ladder — How MeetingMind Knows You Better Over Time

Stage	Meetings Processed	What MeetingMind Knows	Insight Source
Day 1, Meeting 1	1	Universal patterns + immediate anomalies in the transcript	Universal knowledge base + single-meeting detection
Day 3, Meeting 3	3-5	Your meeting cadence, initial patterns forming	Cross-meeting comparison
Day 7, Meeting 8	8-10	Recurring topics, individual speaking patterns	Pattern aggregation + statistical baselines
Day 14, Meeting 15	15-20	Decision velocity, risk recurrence, team dynamics	Organizational model with initial confidence
Day 30, Meeting 30	30+	Deep organizational behavior model, predictive alerts	Honcho-inspired dialectic reasoning
Day 90, Meeting 90	90+	The system knows you better than you know yourself	Self-improving skills, benchmark comparisons
Day One Insight Categories (No Historical Data Required):

Insight Type	Example	Detection Method
Participation Imbalance	"Alex spoke for 42 minutes. Jamie spoke for 3. This is a pattern worth watching."	Talk-time analysis from diarization
Status Update Creep	"80% of this meeting was status updates. Top-performing teams keep this under 40%."	Pareto analysis of time + universal benchmark
Vague Decision Language	"The phrase 'let's circle back' was used 7 times. That's a sign of deferred decisions."	Pattern matching against known vague-decision phrases
Meeting Cost Shock	"This 1-hour meeting with 8 people cost approximately $1,200 in labor."	Participant count × duration × assumed rate
Agenda Drift	"You spent 45 minutes on a topic not on the agenda."	Topic clustering vs. agenda items
Silent Participants	"Jamie was silent during all 3 decision moments. They may hold the key insight."	Silence detection during decision segments
Hurried Close	"The last 5 minutes covered 3 action items without clear owners. Urgency killed clarity."	Last-5-minute analysis
THE PROMPT MANAGEMENT ARCHITECTURE
The Hermes report taught us that skills succeed when prompts are modular, versioned, and measurable. Here is the complete prompt management system for MeetingMind v5.

Foundation: The Prompt Registry
typescript
// backend/src/services/prompt-registry.ts

interface PromptTemplate {
  id: string
  name: string
  version: string
  purpose: string
  system_prompt: string
  user_prompt_template: string
  input_variables: string[]
  output_schema: object
  temperature: number
  max_tokens: number
  model_tier: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'REASONING'
  success_rate?: number
  times_used?: number
  created_from?: string[]  // Meeting IDs that contributed to this prompt's evolution
  parent_prompt_id?: string  // For version lineage
}

class PromptRegistry {
  /**
   * The registry manages prompt templates, tracks performance, and enables
   * MeetingType skills to evolve prompts via the Hermes patch pattern.
   */
  private prompts: Map<string, PromptTemplate[]>
  
  /**
   * Get the best prompt for a given purpose.
   * Returns the MeetingType-specific variant if available (highest success rate),
   * otherwise falls back to the universal template.
   */
  async getBestPrompt(purpose: string, meetingType?: string): Promise<PromptTemplate>
  
  /**
   * Create a MeetingType-specific variant of a universal prompt.
   * Triggered when skill_manage creates a MeetingType skill.
   */
  async createVariant(parentPromptId: string, meetingType: string, optimizedContent: string): Promise<PromptTemplate>
  
  /**
   * Patch a prompt variant (Hermes pattern: token-efficient targeted update).
   */
  async patchPrompt(promptId: string, oldString: string, newString: string): Promise<void>
  
  /**
   * Track prompt performance for continuous improvement.
   */
  async recordUsage(promptId: string, success: boolean, qualityScore: number): Promise<void>
}
The Multi-Stage Extraction Pipeline
The monolithic "analyze everything in one call" approach produces mediocre results. The Hermes subagent pattern — where specialized agents handle specific tasks with fresh context — produces dramatically better output.

Here is the v5 extraction pipeline, broken into six specialized stages, each with its own prompt, its own quality gate, and its own skill evolution path.

text
┌──────────────────────────────────────────────────────────────────────────────┐
│              MEETINGMIND v5.0 — MULTI-STAGE EXTRACTION PIPELINE               │
│                                                                               │
│  STAGE 1: TRANSCRIPT ANALYSIS (Model: SIMPLE — Gemini Flash)                  │
│  ┌─────────────────────────────────────────────────────────────────┐         │
│  │  • Speaker diarization validation                                │         │
│  │  • Talk-time calculation                                         │         │
│  │  • Meeting type classification                                   │         │
│  │  • Language detection                                            │         │
│  │  Output: Validated transcript + metadata                         │         │
│  └─────────────────────────────────────────────────────────────────┘         │
│                                    │                                          │
│                                    ▼                                          │
│  STAGE 2: STRUCTURAL EXTRACTION (Model: MEDIUM — DeepSeek/Grok)              │
│  ┌─────────────────────────────────────────────────────────────────┐         │
│  │  • Summary, decisions, action items, open questions              │         │
│  │  • Key topics, parking lot, next agenda                          │         │
│  │  • Key quotes with speaker attribution                           │         │
│  │  • Meeting cost estimation                                       │         │
│  │  Quality Gate: Action items must have owners + deadlines          │         │
│  │  Output: Base extraction fields (Fields 1-14)                    │         │
│  └─────────────────────────────────────────────────────────────────┘         │
│                                    │                                          │
│                                    ▼                                          │
│  STAGE 3: PEOPLE & PARTICIPATION (Model: MEDIUM — DeepSeek/Grok)             │
│  ┌─────────────────────────────────────────────────────────────────┐         │
│  │  • Dominance imbalance score                                     │         │
│  │  • Silence during decision moments                               │         │
│  │  • Per-speaker sentiment                                         │         │
│  │  • Influence mapping (suggestions made vs. acted upon)           │         │
│  │  • Psychological safety score                                    │         │
│  │  Quality Gate: Scores must be justified with transcript evidence  │         │
│  │  Output: People analytics fields (Fields 15-18, 29-30)           │         │
│  └─────────────────────────────────────────────────────────────────┘         │
│                                    │                                          │
│                                    ▼                                          │
│  STAGE 4: DECISION & RISK INTELLIGENCE (Model: COMPLEX — Claude Sonnet)      │
│  ┌─────────────────────────────────────────────────────────────────┐         │
│  │  • Decision clarity scoring                                      │         │
│  │  • Action item SMART evaluation                                  │         │
│  │  • Bottleneck detection (cross-referencing task history)          │         │
│  │  • Thread recurrence detection (cross-referencing past meetings)  │         │
│  │  • Risk flag detection + severity assessment                      │         │
│  │  • False consensus detection                                     │         │
│  │  Quality Gate: All scores must reference specific transcript      │         │
│  │  evidence AND cross-reference past meetings where relevant        │         │
│  │  Output: Decision/risk fields (Fields 19-22, 27-28, 30)          │         │
│  └─────────────────────────────────────────────────────────────────┘         │
│                                    │                                          │
│                                    ▼                                          │
│  STAGE 5: STRATEGIC & COMPETITIVE AWARENESS (Model: MEDIUM)                  │
│  ┌─────────────────────────────────────────────────────────────────┐         │
│  │  • Competitor, client, partner mention detection                  │         │
│  │  • Strategic pillar alignment (vs. configured OKRs)              │         │
│  │  • Resource request detection (budget, headcount, tools)         │         │
│  │  • Agenda adherence scoring                                      │         │
│  │  • Pareto time analysis                                          │         │
│  │  Output: Strategic awareness fields (Fields 23-27)               │         │
│  └─────────────────────────────────────────────────────────────────┘         │
│                                    │                                          │
│                                    ▼                                          │
│  STAGE 6: INSIGHT SYNTHESIS & COACHING (Model: REASONING — Claude Opus)      │
│  ┌─────────────────────────────────────────────────────────────────┐         │
│  │  • Synthesize findings from all 5 previous stages                 │         │
│  │  • Generate "Aha" insight (single most surprising data point)    │         │
│  │  • Generate coaching advice (cross-referencing org history)       │         │
│  │  • Generate effectiveness score + reasoning                      │         │
│  │  • Generate meeting-level recommendations                        │         │
│  │  • Update organizational behavior model                           │         │
│  │  Quality Gate: Insights must be specific, novel, and actionable   │         │
│  │  Output: Coaching, effectiveness, recommendations                │         │
│  └─────────────────────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────────────────────┘
Stage-Specific Prompt Templates
Each stage has its own prompt template, managed by the Prompt Registry, and can be overridden by MeetingType skills.

Stage 3 Example: People & Participation Analytics

typescript
const PEOPLE_ANALYSIS_PROMPT: PromptTemplate = {
  id: 'people-analysis-v2',
  name: 'People & Participation Analytics',
  version: '2.0.0',
  purpose: 'Extract participation dynamics, sentiment per speaker, and psychological safety indicators',
  
  system_prompt: `You are an organizational psychologist specializing in meeting dynamics. 
    Your task is to analyze who spoke, how they were received, and what the participation 
    patterns reveal about team health.
    
    OPERATING PRINCIPLES:
    - Every score must be justified with specific transcript evidence
    - Never infer intent — only analyze observable behavior
    - Flag patterns but never diagnose individuals
    - Use precise timestamps and speaker labels for all claims
    - If evidence is insufficient for a score, report it as "insufficient data"
    
    CONTEXT FROM ORGANIZATIONAL MEMORY:
    {{organizational_context}}`,
  
  user_prompt_template: `Analyze the following meeting transcript for participation dynamics.

    MEETING CONTEXT:
    - Type: {{meeting_type}}
    - Participants: {{participant_list}}
    - Duration: {{duration_minutes}} minutes
    
    TRANSCRIPT:
    {{transcript}}
    
    EXTRACT THE FOLLOWING:
    
    1. DOMINANCE IMBALANCE SCORE (0-10):
    - Calculate speaking time for each participant
    - Score = ratio of most dominant to least dominant speaker
    - 0 = perfectly balanced, 10 = one person dominated entirely
    - Provide specific timestamps for the most dominant speaker
    
    2. SILENCE DURING DECISIONS:
    - Identify the 3-5 moments where decisions were made
    - For each: who was silent? Who was speaking?
    - Flag any participant who was silent during ALL decision moments
    
    3. PER-SPEAKER SENTIMENT:
    - For each speaker, analyze their language for emotional tone
    - Categories: constructive, frustrated, engaged, disengaged, anxious, confident
    - Provide 2-3 supporting quotes per speaker
    
    4. PSYCHOLOGICAL SAFETY INDICATORS:
    - Count: supportive interjections ("good point," "building on that")
    - Count: critical interjections ("I disagree," "that won't work")
    - Ratio of supportive to critical
    - Presence of phrases indicating fear ("don't shoot me," "this might be stupid")
    
    FORMAT YOUR RESPONSE AS JSON matching the output schema exactly.
    
    Remember: Every claim must cite specific transcript evidence.`,
  
  input_variables: ['organizational_context', 'meeting_type', 'participant_list', 'duration_minutes', 'transcript'],
  output_schema: peopleAnalysisSchema,
  temperature: 0.3,
  max_tokens: 3000,
  model_tier: 'MEDIUM'
}
Stage 6 Example: Insight Synthesis (The "Aha" Engine)

typescript
const INSIGHT_SYNTHESIS_PROMPT: PromptTemplate = {
  id: 'insight-synthesis-v3',
  name: 'Insight Synthesis & Coaching',
  version: '3.0.0',
  purpose: 'Synthesize all extraction stages into actionable insights and coaching',
  
  system_prompt: `You are an executive coach and organizational strategist. 
    Your role is to synthesize complex meeting data into clear, actionable insights 
    that the user would not have discovered on their own.
    
    THE INSIGHT STANDARD:
    Every insight must pass the "Would I pay for this?" test:
    - Is it specific to THIS meeting, not generic advice?
    - Is it surprising? Would the user have caught this themselves?
    - Is it actionable? Can they do something about it tomorrow?
    - Is it evidence-backed? Can you point to the exact data?
    
    THE BRUTAL HONESTY PRINCIPLE:
    - "This meeting was ineffective" is not an insight. "This meeting was ineffective 
      because decisions were deferred 7 times, which correlates with your team's 
      40% drop in decision velocity this quarter" IS an insight.
    - Never sugarcoat. "Your team shows signs of groupthink" is kinder in the long 
      run than "Great collaboration!"
    - But pair critique with a path forward. Every problem must come with a 
      suggested intervention.
    
    ORGANIZATIONAL CONTEXT:
    {{organizational_context}}
    
    HISTORICAL PATTERNS (LAST 20 MEETINGS):
    {{historical_patterns}}`,
  
  user_prompt_template: `Synthesize the following meeting analysis into insights.

    CURRENT MEETING DATA:
    {{all_stage_outputs}}
    
    GENERATE:
    
    1. THE "AHA" INSIGHT (ONE SENTENCE):
    The single most surprising, non-obvious data point from this meeting.
    Must be specific and backed by numbers.
    Example: "You spent 80% of meeting time on status updates, but only 20% on 
    decisions — and your team's decision velocity has dropped 15% this quarter."
    
    2. THE COACHING BRIEF (3 BULLETS):
    Three actionable recommendations, each with:
    - What to change
    - Why (data-backed)
    - Expected impact
    
    3. THE TREND ALERT (IF APPLICABLE):
    If this meeting reveals a pattern across the last 5+ meetings, flag it.
    Example: "This is the 4th meeting where decisions were deferred. A pattern is 
    emerging. Consider the 'hard-close with decisions' facilitation technique."
    
    4. THE POSITIVE REINFORCEMENT:
    One thing the team did well, with data.
    
    FORMAT AS JSON. Every insight must cite specific data.`,
  
  input_variables: ['organizational_context', 'historical_patterns', 'all_stage_outputs'],
  output_schema: insightSynthesisSchema,
  temperature: 0.5,
  max_tokens: 2000,
  model_tier: 'REASONING'
}
THE PROMPT EVOLUTION CYCLE
Prompts don't stay static. They evolve through the same skill system we built for MeetingTypes.

typescript
// backend/src/services/prompt-evolution.ts

class PromptEvolutionEngine {
  /**
   * After 10+ uses of a prompt with tracked success rates, analyze what's working
   * and what isn't. Generate improvement patches using the Hermes pattern.
   */
  async analyzeAndImprove(promptId: string): Promise<void> {
    const prompt = await promptRegistry.get(promptId)
    const usages = await promptRegistry.getUsageHistory(promptId, 50)
    
    // Only analyze with sufficient data
    if (usages.length < 10) return
    
    const successRate = usages.filter(u => u.success).length / usages.length
    
    // Analyze failure patterns
    const failures = usages.filter(u => !u.success)
    const failureAnalysis = await this.analyzeFailures(failures)
    
    // Generate improvement
    if (failureAnalysis.recommended_patch) {
      await promptRegistry.patchPrompt(
        promptId,
        failureAnalysis.old_string,
        failureAnalysis.new_string
      )
      
      // Track the patch
      await skillPatches.insert({
        skill_id: promptId,
        old_string: failureAnalysis.old_string,
        new_string: failureAnalysis.new_string,
        reason: failureAnalysis.reason
      })
    }
  }
  
  /**
   * MeetingType skills can override universal prompts with specialized versions.
   * This is the core self-improvement mechanism.
   */
  async createMeetingTypeVariant(
    universalPromptId: string,
    meetingType: string,
    successData: UsageRecord[]
  ): Promise<PromptTemplate> {
    const universal = await promptRegistry.get(universalPromptId)
    
    // Analyze what worked for this specific meeting type
    const optimizationAnalysis = await this.analyzeSuccessPatterns(meetingType, successData)
    
    // Create optimized variant
    return promptRegistry.createVariant(
      universalPromptId,
      meetingType,
      optimizationAnalysis.recommended_changes
    )
  }
}
QUALITY GATES — ENSURING INSIGHT HIGH QUALITY
Every stage of the pipeline has a quality gate. If a stage fails, it's retried with adjusted parameters or flagged for human review.

typescript
// backend/src/services/quality-gates.ts

interface QualityGate {
  stage: number
  name: string
  criteria: QualityCriterion[]
  on_failure: 'retry' | 'retry_with_higher_model' | 'flag_for_review'
}

const EXTRACTION_QUALITY_GATES: QualityGate[] = [
  {
    stage: 2,
    name: 'Structural Extraction',
    criteria: [
      { field: 'action_items', rule: 'all_must_have_owner', message: 'Action items missing owners' },
      { field: 'summary', rule: 'min_length_50_words', message: 'Summary too short' },
      { field: 'decisions', rule: 'at_least_one_or_explicit_none', message: 'No decisions extracted' }
    ],
    on_failure: 'retry'
  },
  {
    stage: 3,
    name: 'People Analytics',
    criteria: [
      { field: 'dominance_imbalance_score', rule: 'must_have_transcript_evidence', message: 'Score lacks evidence' },
      { field: 'psychological_safety_score', rule: 'must_have_transcript_evidence', message: 'Score lacks evidence' }
    ],
    on_failure: 'retry_with_higher_model'
  },
  {
    stage: 4,
    name: 'Decision Intelligence',
    criteria: [
      { field: 'decision_clarity_score', rule: 'must_cite_specific_transcript', message: 'No transcript citations' },
      { field: 'thread_recurrence_flags', rule: 'must_cross_reference_past_meetings', message: 'No cross-referencing' }
    ],
    on_failure: 'retry'
  },
  {
    stage: 6,
    name: 'Insight Synthesis',
    criteria: [
      { field: 'aha_insight', rule: 'must_be_specific_and_surprising', message: 'Insight too generic' },
      { field: 'aha_insight', rule: 'must_contain_numbers', message: 'Insight lacks data' },
      { field: 'coaching_brief', rule: 'min_3_actionable_recommendations', message: 'Insufficient recommendations' }
    ],
    on_failure: 'retry'
  }
]
HOW THIS MANIFESTS IN THE PRODUCT
Day 1, Immediately After First Meeting:

The user sees their results page. At the top, a hero card:

💡 Your "Aha" Insight

"Your team spent 80% of this meeting on status updates. Only 20% went to actual decisions. Top-performing teams reverse that ratio — and see 35% higher action item completion rates."

This insight is based on universal benchmarks from thousands of analyzed meetings.

Day 3, After Meeting 3:

The Growing Brain has its first cluster:

🎯 Meeting Types: 1 pattern detected

"Your standups follow a consistent pattern. After 2 more standups, I'll create a specialized extraction template that focuses on what matters most: blockers, progress, and decisions."

Day 7, After Meeting 8:

The Business Pulse shows:

📈 This Week's Intelligence

"I've analyzed 8 of your meetings. Here's what I've learned about your team:

You make decisions fastest on Tuesdays (avg 3.2 decisions/meeting vs. 1.8 on Fridays)

Alex is your most influential decision-maker — suggestions they support pass 85% of the time

Your psychological safety score is 7.8/10, which is in the top quartile of all teams"

Day 30, After Meeting 30:

The organizational model is mature. The coach now speaks with authority:

🧠 Your Coach's Assessment

"I've now analyzed 30 of your meetings. Here's what I know about your organization:

Strengths: Your team has exceptional decision clarity (8.2/10 avg). You consistently assign clear owners and deadlines.

Pattern to Address: In 7 of the last 10 meetings, decisions made in the final 10 minutes were 3x more likely to be re-litigated in the next meeting. *This insight comes from your decision-longevity-coaching skill, which has an 88% success rate.*

Recommendation: Implement the 'hard-close with decision recap' format. Teams using this format see 40% fewer re-litigated decisions."

THE COMPETITIVE MOAT — DEEPENED
Dimension	Without Prompt Management	With Prompt Management
Extraction Quality	Generic, one-size-fits-all	MeetingType-specific, continuously improving
Insight Depth	Surface-level observations	Multi-stage analysis with quality gates
Personalization	None	Learns org-specific language, patterns, and preferences
Coach Credibility	Vague, could apply to anyone	Specific, data-backed, cites sources and success rates
Self-Improvement	We improve the product	The product improves itself autonomously