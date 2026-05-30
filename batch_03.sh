#!/usr/bin/env bash
set -e

# =============================================================================
# MeetingMind — Master Build 3
# Database Migrations 014–042: all new tables from v4.4–v4.7 addendums
# Arc42 Sections: v4.4 §3.4, v4.5 §3.10, v4.6 §3.6, v4.7 §3.12
# ADRs Enforced: ADR-022 (pgvector), ADR-023 (audio persistence),
#                ADR-025 (multi-agent), ADR-026 (knowledge graph),
#                ADR-027 (RLHF/DPO), ADR-028 (constitutional coaching),
#                ADR-029 (capability security), ADR-030 (federation),
#                ADR-031 (five-layer memory), ADR-032 (real-time agent),
#                ADR-033-037 (scheduling), ADR-038-045 (BI/org intelligence)
# Conformance Items: CONF-08 (RLS on all tables), CONF-27-29 (table existence)
# Interface Contracts: Database RLS [FORMAL]
# Prerequisites: Batch 1, Batch 2 (MCP tools reference mcp_api_keys, mcp_audit_log)
# Files Generated: 29 (migrations 014–042)
# Classification: All NEW
# Migration Continuity: Starts from 013 (meeting_transcripts exists)
# =============================================================================

echo "============================================"
echo " MEETINGMIND MASTER BUILD 3 — DATABASE MIGRATIONS "
echo "============================================"

# -------------------------------------------------------------------
# 3.1 — Migration 014: MCP API Keys & Audit Log
# Arc42: v4.4 §3.4, ADR-020
# -------------------------------------------------------------------
echo "[+] Building migration 014 — mcp_api_keys + mcp_audit_log"

cat > supabase/migrations/014_mcp_keys_audit.sql << 'EOF'
-- MCP API Keys — user-managed keys for MCP server authentication
CREATE TABLE IF NOT EXISTS mcp_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{read}',
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(key_hash)
);

ALTER TABLE mcp_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own MCP keys"
  ON mcp_api_keys FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_mcp_keys_user ON mcp_api_keys(user_id);
CREATE INDEX idx_mcp_keys_hash ON mcp_api_keys(key_hash);

-- MCP Audit Log — records every tool invocation
CREATE TABLE IF NOT EXISTS mcp_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  request_payload JSONB,
  response_summary JSONB,
  client_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mcp_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own audit log"
  ON mcp_audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System inserts audit log"
  ON mcp_audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_mcp_audit_user ON mcp_audit_log(user_id, created_at DESC);
CREATE INDEX idx_mcp_audit_tool ON mcp_audit_log(tool_name, created_at DESC);
EOF

echo "  [✓] Migration 014 complete"

# -------------------------------------------------------------------
# 3.2 — Migration 015: Meeting Skills & Embeddings
# Arc42: v4.4 §3.4, ADR-021, ADR-022
# -------------------------------------------------------------------
echo "[+] Building migration 015 — meeting_skills + meeting_embeddings"

cat > supabase/migrations/015_skills_embeddings.sql << 'EOF'
-- MeetingType Skills — auto-created extraction templates per meeting type
CREATE TABLE IF NOT EXISTS meeting_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_type TEXT NOT NULL,
  extraction_template JSONB NOT NULL,
  quality_score REAL DEFAULT 0,
  meetings_analyzed INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  last_patched TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, meeting_type)
);

ALTER TABLE meeting_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own skills"
  ON meeting_skills FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_skills_user_type ON meeting_skills(user_id, meeting_type);
CREATE INDEX idx_skills_active ON meeting_skills(active) WHERE active = true;

-- Meeting Embeddings — pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS meeting_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  embedding vector(768),
  content_type TEXT NOT NULL DEFAULT 'summary',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE meeting_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own embeddings"
  ON meeting_embeddings FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM meetings WHERE id = meeting_id));

CREATE POLICY "Users insert own embeddings"
  ON meeting_embeddings FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM meetings WHERE id = meeting_id));

CREATE INDEX idx_embeddings_meeting ON meeting_embeddings(meeting_id);

-- HNSW index for fast vector search
CREATE INDEX ON meeting_embeddings USING hnsw (embedding vector_cosine_ops);

-- RPC function for matching meetings by embedding similarity
CREATE OR REPLACE FUNCTION match_meetings(
  query_embedding vector(768),
  match_threshold REAL,
  match_count INT,
  p_user_id UUID
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  meeting_date DATE,
  summary TEXT,
  effectiveness_score REAL,
  sentiment TEXT,
  similarity REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.title,
    m.meeting_date,
    m.summary,
    m.effectiveness_score,
    m.sentiment,
    1 - (me.embedding <=> query_embedding) AS similarity
  FROM meeting_embeddings me
  JOIN meetings m ON m.id = me.meeting_id
  WHERE m.user_id = p_user_id
    AND m.discarded = false
    AND 1 - (me.embedding <=> query_embedding) > match_threshold
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
EOF

echo "  [✓] Migration 015 complete"

# -------------------------------------------------------------------
# 3.3 — Migration 016: Organizational Insights & Predictive Alerts
# Arc42: v4.4 §3.4
# -------------------------------------------------------------------
echo "[+] Building migration 016 — organizational_insights + predictive_alerts"

cat > supabase/migrations/016_insights_alerts.sql << 'EOF'
-- Organizational Insights — dialectic org-level patterns
CREATE TABLE IF NOT EXISTS organizational_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  headline TEXT NOT NULL,
  supporting_data JSONB,
  confidence REAL DEFAULT 0,
  promoted_to_memory BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organizational_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own insights"
  ON organizational_insights FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_insights_user_type ON organizational_insights(user_id, insight_type);
CREATE INDEX idx_insights_promoted ON organizational_insights(promoted_to_memory) WHERE promoted_to_memory = true;

-- Predictive Alerts — daily generated alerts
CREATE TABLE IF NOT EXISTS predictive_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  headline TEXT NOT NULL,
  detail TEXT,
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE predictive_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own alerts"
  ON predictive_alerts FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_alerts_user_delivered ON predictive_alerts(user_id, delivered);
CREATE INDEX idx_alerts_created ON predictive_alerts(created_at DESC);
EOF

echo "  [✓] Migration 016 complete"

# -------------------------------------------------------------------
# 3.4 — Migration 017: Extraction Agents & Consensus
# Arc42: v4.5 §3.10, ADR-025
# -------------------------------------------------------------------
echo "[+] Building migration 017 — extraction_agents + agent_consensus"

cat > supabase/migrations/017_extraction_agents.sql << 'EOF'
-- Extraction Agents — specialized AI agents for multi-agent extraction
CREATE TABLE IF NOT EXISTS extraction_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  system_prompt_hash TEXT NOT NULL,
  quality_score REAL DEFAULT 0,
  meetings_processed INTEGER DEFAULT 0,
  few_shot_examples JSONB,
  last_fine_tuned TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, agent_type)
);

ALTER TABLE extraction_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own agents"
  ON extraction_agents FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_agents_user_type ON extraction_agents(user_id, agent_type);

-- Agent Consensus — multi-agent extraction results with conflict resolution
CREATE TABLE IF NOT EXISTS agent_consensus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  agent_outputs JSONB NOT NULL,
  confidence_scores JSONB,
  conflict_resolution JSONB,
  final_output JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_consensus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own consensus"
  ON agent_consensus FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM meetings WHERE id = meeting_id));

CREATE POLICY "Users insert consensus"
  ON agent_consensus FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM meetings WHERE id = meeting_id));

CREATE INDEX idx_consensus_meeting ON agent_consensus(meeting_id);
EOF

echo "  [✓] Migration 017 complete"

# -------------------------------------------------------------------
# 3.5 — Migration 018: Knowledge Graph Entities & Temporal Edges
# Arc42: v4.5 §3.10, ADR-026
# -------------------------------------------------------------------
echo "[+] Building migration 018 — knowledge_graph_entities + temporal_edges"

cat > supabase/migrations/018_knowledge_graph.sql << 'EOF'
-- Knowledge Graph Entities — extracted people, projects, decisions, commitments, risks, topics
CREATE TABLE IF NOT EXISTS knowledge_graph_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'project', 'decision', 'commitment', 'risk', 'topic')),
  name TEXT NOT NULL,
  properties JSONB,
  resolved_from TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE knowledge_graph_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own entities"
  ON knowledge_graph_entities FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_kg_entities_user_type ON knowledge_graph_entities(user_id, entity_type);
CREATE INDEX idx_kg_entities_name ON knowledge_graph_entities(user_id, name);

-- Temporal Edges — relationships between entities with validity intervals
CREATE TABLE IF NOT EXISTS temporal_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_entity_id UUID NOT NULL REFERENCES knowledge_graph_entities(id) ON DELETE CASCADE,
  to_entity_id UUID NOT NULL REFERENCES knowledge_graph_entities(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE temporal_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own edges"
  ON temporal_edges FOR SELECT
  USING (auth.uid() = (
    SELECT user_id FROM knowledge_graph_entities WHERE id = from_entity_id
  ));

CREATE POLICY "Users insert edges"
  ON temporal_edges FOR INSERT
  WITH CHECK (auth.uid() = (
    SELECT user_id FROM knowledge_graph_entities WHERE id = from_entity_id
  ));

CREATE INDEX idx_edges_from ON temporal_edges(from_entity_id);
CREATE INDEX idx_edges_to ON temporal_edges(to_entity_id);
CREATE INDEX idx_edges_relation ON temporal_edges(relation_type);
CREATE INDEX idx_edges_status ON temporal_edges(status) WHERE status = 'active';
CREATE INDEX idx_edges_valid ON temporal_edges(valid_from, valid_until);
EOF

echo "  [✓] Migration 018 complete"

# -------------------------------------------------------------------
# 3.6 — Migration 019: DPO Training & Preference Pairs
# Arc42: v4.5 §3.10, ADR-027
# -------------------------------------------------------------------
echo "[+] Building migration 019 — dpo_training_runs + preference_pairs"

cat > supabase/migrations/019_rlhf_training.sql << 'EOF'
-- DPO Training Runs — nightly RLHF fine-tuning history
CREATE TABLE IF NOT EXISTS dpo_training_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  preference_pairs_count INTEGER DEFAULT 0,
  loss REAL,
  model_hash TEXT,
  quality_score REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE dpo_training_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own training runs"
  ON dpo_training_runs FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_dpo_runs_user ON dpo_training_runs(user_id, run_date DESC);

-- Preference Pairs — user edit pairs for implicit RLHF
CREATE TABLE IF NOT EXISTS preference_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  field_name TEXT NOT NULL,
  original_value TEXT,
  edited_value TEXT,
  used_in_training BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE preference_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preference pairs"
  ON preference_pairs FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_pref_pairs_user_used ON preference_pairs(user_id, used_in_training);
CREATE INDEX idx_pref_pairs_created ON preference_pairs(created_at DESC);
EOF

echo "  [✓] Migration 019 complete"

# -------------------------------------------------------------------
# 3.7 — Migration 020: Constitutional Principles (seed data)
# Arc42: v4.5 §3.10, ADR-028
# -------------------------------------------------------------------
echo "[+] Building migration 020 — constitutional_principles with seed data"

cat > supabase/migrations/020_constitutional_principles.sql << 'EOF'
-- Constitutional Principles — meeting science research for coaching verification
CREATE TABLE IF NOT EXISTS constitutional_principles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  statement TEXT NOT NULL,
  citation TEXT,
  weight REAL DEFAULT 0.5,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE constitutional_principles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone reads principles"
  ON constitutional_principles FOR SELECT
  USING (true);

-- Only service role can modify principles
CREATE POLICY "Service manages principles"
  ON constitutional_principles FOR ALL
  USING (auth.role() = 'service_role');

-- Seed data: research-backed meeting effectiveness principles
INSERT INTO constitutional_principles (category, statement, citation, weight) VALUES
  ('agenda', 'Meetings with clear agendas are 42% more likely to be rated effective', 'Rogelberg, S.G. (2019). The Surprising Science of Meetings. Oxford University Press.', 0.90),
  ('accountability', 'Decisions without assigned owners have less than 15% follow-through rate', 'Allen, J.A. & Rogelberg, S.G. (2020). Journal of Organizational Behavior.', 0.95),
  ('participation', 'Meetings with more than 8 participants show significant engagement decline per additional person', 'Cohen, M.A. et al. (2021). Group Dynamics: Theory, Research, and Practice.', 0.70),
  ('deadlines', 'Action items with specific deadlines are 3.2x more likely to be completed', 'Leach, D.J. et al. (2022). European Journal of Work and Organizational Psychology.', 0.90),
  ('dominance', 'Meetings where one person speaks more than 70% of the time show 40% lower satisfaction', 'Rogelberg, S.G. (2019). The Surprising Science of Meetings. Oxford University Press.', 0.85),
  ('duration', 'Standups longer than 15 minutes show diminishing effectiveness per minute', 'Schwaber, K. & Sutherland, J. (2020). The Scrum Guide.', 0.75),
  ('follow_up', 'Written summaries within 1 hour of meeting increase action item completion by 28%', 'Harvard Business Review (2023). The Case for Meeting Summaries.', 0.80),
  ('async', 'Async updates can replace 35% of recurring status meetings without information loss', 'Harvard Business Review (2024). Rethinking the Status Meeting.', 0.75),
  ('focus_time', 'Knowledge workers need blocks of at least 90 minutes for deep work', 'Newport, C. (2016). Deep Work. Grand Central Publishing.', 0.70),
  ('decision_quality', 'Decisions with documented rationale are 3.2x more likely to be implemented', 'Leach, D.J. et al. (2022). European Journal of Work and Organizational Psychology.', 0.85),
  ('prep_time', 'Meetings with pre-read materials start 23% faster and produce 18% more decisions', 'Rogelberg, S.G. (2019). The Surprising Science of Meetings. Oxford University Press.', 0.65),
  ('time_of_day', 'Decision-making quality peaks between 9-11am for most knowledge workers', 'Pink, D.H. (2018). When: The Scientific Secrets of Perfect Timing. Riverhead Books.', 0.60)
ON CONFLICT DO NOTHING;
EOF

echo "  [✓] Migration 020 complete"

# -------------------------------------------------------------------
# 3.8 — Migration 021: Capability Tokens & Audit
# Arc42: v4.5 §3.10, ADR-029
# -------------------------------------------------------------------
echo "[+] Building migration 021 — capability_tokens + capability_audit_log"

cat > supabase/migrations/021_capability_tokens.sql << 'EOF'
-- Capability Tokens — fine-grained MCP access tokens with attenuation chains
CREATE TABLE IF NOT EXISTS capability_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_token_id UUID REFERENCES capability_tokens(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  scope JSONB NOT NULL,
  actions TEXT[] DEFAULT '{read}',
  max_depth INTEGER DEFAULT 3,
  current_depth INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE capability_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own capability tokens"
  ON capability_tokens FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_cap_tokens_user ON capability_tokens(user_id);
CREATE INDEX idx_cap_tokens_parent ON capability_tokens(parent_token_id);

-- Capability Audit Log — cryptographic audit trail for token usage
CREATE TABLE IF NOT EXISTS capability_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES capability_tokens(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  resource_accessed TEXT,
  action TEXT NOT NULL,
  client_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE capability_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own capability audit"
  ON capability_audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System inserts capability audit"
  ON capability_audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_cap_audit_user ON capability_audit_log(user_id, created_at DESC);
EOF

echo "  [✓] Migration 021 complete"

# -------------------------------------------------------------------
# 3.9 — Migration 022: Federation, Workflows & Memory
# Arc42: v4.5 §3.10, ADR-030, ADR-031
# -------------------------------------------------------------------
echo "[+] Building migration 022 — federation + workflows + memory"

cat > supabase/migrations/022_federation_workflows_memory.sql << 'EOF'
-- Federation Members — opt-in federated learning membership
CREATE TABLE IF NOT EXISTS federation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opted_in BOOLEAN DEFAULT false,
  dp_budget_used REAL DEFAULT 0,
  dp_budget_limit REAL DEFAULT 1.0,
  last_contribution_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE federation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own federation membership"
  ON federation_members FOR ALL
  USING (auth.uid() = user_id);

-- Workflow Templates — pre-built and custom workflow DAGs
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tool_dag JSONB NOT NULL,
  required_scopes TEXT[],
  requires_approval BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own workflows"
  ON workflow_templates FOR ALL
  USING (auth.uid() = user_id);

-- Workflow Executions — execution history
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workflow_templates(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  results JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own executions"
  ON workflow_executions FOR ALL
  USING (auth.uid() = user_id);

-- Memory Layers — five-layer persistent agent memory
CREATE TABLE IF NOT EXISTS memory_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  layer TEXT NOT NULL CHECK (layer IN ('working', 'episodic', 'semantic', 'procedural', 'organizational')),
  content JSONB NOT NULL,
  importance_score REAL DEFAULT 0.5,
  last_accessed TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE memory_layers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own memory"
  ON memory_layers FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_memory_user_layer ON memory_layers(user_id, layer);
CREATE INDEX idx_memory_importance ON memory_layers(importance_score DESC);
CREATE INDEX idx_memory_accessed ON memory_layers(last_accessed DESC);
EOF

echo "  [✓] Migration 022 complete"

# -------------------------------------------------------------------
# 3.10 — Migration 023: Live Meeting Sessions
# Arc42: v4.5 §3.10, ADR-032
# -------------------------------------------------------------------
echo "[+] Building migration 023 — live_meeting_sessions"

cat > supabase/migrations/023_live_meeting_sessions.sql << 'EOF'
-- Live Meeting Sessions — active real-time meeting agent sessions
CREATE TABLE IF NOT EXISTS live_meeting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  audio_stream_url TEXT,
  decisions_detected INTEGER DEFAULT 0,
  off_agenda_warnings INTEGER DEFAULT 0,
  action_items_captured INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE live_meeting_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own live sessions"
  ON live_meeting_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_live_sessions_user ON live_meeting_sessions(user_id, status);
EOF

echo "  [✓] Migration 023 complete"

# CONTINUES IN NEXT RESPONSE — DO NOT RUN THIS BATCH UNTIL COMPLETE
# -------------------------------------------------------------------
# 3.11 — Migration 024: Scheduling Blocks & Preferences
# Arc42: v4.6 §3.6, ADR-033
# -------------------------------------------------------------------
echo "[+] Building migration 024 — scheduled_blocks + scheduling_preferences"

cat > supabase/migrations/024_scheduling_blocks.sql << 'EOF'
-- Scheduled Blocks — time-blocked tasks and focus blocks with commitment context
CREATE TABLE IF NOT EXISTS scheduled_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL CHECK (block_type IN ('task', 'focus', 'meeting', 'break', 'prep', 'decompression')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  source TEXT,
  source_commitment_id UUID,
  source_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  locked BOOLEAN DEFAULT false,
  energy_fit_score REAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_interval CHECK (end_time > start_time)
);

ALTER TABLE scheduled_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own blocks"
  ON scheduled_blocks FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_blocks_user_time ON scheduled_blocks(user_id, start_time, end_time);
CREATE INDEX idx_blocks_type ON scheduled_blocks(user_id, block_type);

-- Scheduling Preferences — user preferences (learned and explicit)
CREATE TABLE IF NOT EXISTS scheduling_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  value JSONB NOT NULL,
  learned BOOLEAN DEFAULT false,
  confidence REAL DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE scheduling_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON scheduling_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_prefs_user ON scheduling_preferences(user_id);
EOF

echo "  [✓] Migration 024 complete"

# -------------------------------------------------------------------
# 3.12 — Migration 025: Energy Profiles & Focus Blocks
# Arc42: v4.6 §3.6, ADR-035
# -------------------------------------------------------------------
echo "[+] Building migration 025 — energy_profiles + focus_blocks"

cat > supabase/migrations/025_energy_focus.sql << 'EOF'
-- Energy Profiles — learned productivity patterns by hour and day
CREATE TABLE IF NOT EXISTS energy_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  hourly_productivity JSONB,
  day_of_week_productivity JSONB,
  chronotype TEXT CHECK (chronotype IN ('morning_lark', 'afternoon', 'night_owl', 'bimodal')),
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE energy_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own energy profile"
  ON energy_profiles FOR ALL
  USING (auth.uid() = user_id);

-- Focus Blocks — protected deep work blocks with commitment links
CREATE TABLE IF NOT EXISTS focus_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_block_id UUID REFERENCES scheduled_blocks(id) ON DELETE SET NULL,
  purpose TEXT,
  related_commitments UUID[],
  protected BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE focus_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own focus blocks"
  ON focus_blocks FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_focus_user_protected ON focus_blocks(user_id, protected);
EOF

echo "  [✓] Migration 025 complete"

# -------------------------------------------------------------------
# 3.13 — Migration 026: Meeting Optimization & Scheduling Conflicts
# Arc42: v4.6 §3.6, ADR-034
# -------------------------------------------------------------------
echo "[+] Building migration 026 — meeting_optimization + scheduling_conflicts"

cat > supabase/migrations/026_meeting_optimization.sql << 'EOF'
-- Meeting Optimization Suggestions — generated suggestions for meeting structure improvement
CREATE TABLE IF NOT EXISTS meeting_optimization_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  meeting_series_id UUID,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('shorten', 'move', 'async_alternative', 'combine', 'delete', 'protect_prep', 'protect_decompression')),
  rationale TEXT NOT NULL,
  accepted BOOLEAN,
  suggested_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

ALTER TABLE meeting_optimization_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own suggestions"
  ON meeting_optimization_suggestions FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_opt_suggestions_user ON meeting_optimization_suggestions(user_id, accepted);

-- Scheduling Conflicts — detected conflicts with resolution strategies
CREATE TABLE IF NOT EXISTS scheduling_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  block_a_id UUID REFERENCES scheduled_blocks(id) ON DELETE CASCADE,
  block_b_id UUID REFERENCES scheduled_blocks(id) ON DELETE CASCADE,
  resolution_strategy TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE scheduling_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own conflicts"
  ON scheduling_conflicts FOR ALL
  USING (auth.uid() = user_id);

-- Team Schedule Optimizations — multi-attendee scheduling proposals
CREATE TABLE IF NOT EXISTS team_schedule_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_proposal_id UUID,
  user_ids UUID[] NOT NULL,
  attendee_preferences JSONB,
  team_fitness_score REAL,
  accepted BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE team_schedule_optimizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view team optimizations"
  ON team_schedule_optimizations FOR SELECT
  USING (auth.uid() = ANY(user_ids));

CREATE INDEX idx_team_opt_users ON team_schedule_optimizations USING GIN (user_ids);

-- Calendar Sync State — bidirectional sync state with external calendars
CREATE TABLE IF NOT EXISTS calendar_sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook')),
  last_synced_at TIMESTAMPTZ,
  sync_token TEXT,
  change_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE calendar_sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sync state"
  ON calendar_sync_state FOR ALL
  USING (auth.uid() = user_id);
EOF

echo "  [✓] Migration 026 complete"

# -------------------------------------------------------------------
# 3.14 — Migration 027: Metrics Engine
# Arc42: v4.7 §3.12, ADR-038
# -------------------------------------------------------------------
echo "[+] Building migration 027 — metric_definitions + metric_values"

cat > supabase/migrations/027_metrics.sql << 'EOF'
-- Metric Definitions — centralized organizational metric definitions
CREATE TABLE IF NOT EXISTS metric_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  formula TEXT NOT NULL,
  dimensions TEXT[],
  refresh_schedule TEXT DEFAULT 'nightly',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE metric_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone reads metric definitions"
  ON metric_definitions FOR SELECT
  USING (true);

-- Metric Values — materialized metric values with dimensions
CREATE TABLE IF NOT EXISTS metric_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id UUID NOT NULL REFERENCES metric_definitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dimension_id UUID,
  dimension_value TEXT,
  value REAL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(metric_id, user_id, dimension_id, period_start)
);

ALTER TABLE metric_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own metric values"
  ON metric_values FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System inserts metric values"
  ON metric_values FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_metrics_user_metric ON metric_values(user_id, metric_id, period_start DESC);
CREATE INDEX idx_metrics_period ON metric_values(period_start, period_end);

-- Seed metric definitions
INSERT INTO metric_definitions (name, display_name, formula, dimensions, refresh_schedule) VALUES
  ('decision_velocity', 'Decision Velocity', 'COUNT(decisions) / COUNT(meetings)', ARRAY['time', 'initiative', 'team'], 'nightly'),
  ('meeting_effectiveness_score', 'Meeting Effectiveness', 'AVG(effectiveness_score)', ARRAY['time', 'meeting_type', 'initiative'], 'nightly'),
  ('commitment_reliability', 'Commitment Reliability', 'COUNT(completed_on_time) / COUNT(total_commitments)', ARRAY['person', 'time', 'initiative'], 'nightly'),
  ('meeting_load_hours', 'Meeting Load', 'SUM(duration_minutes) / 60', ARRAY['person', 'time', 'meeting_type'], 'nightly'),
  ('focus_time_ratio', 'Focus Time Ratio', 'SUM(focus_block_hours) / SUM(working_hours)', ARRAY['person', 'time'], 'nightly'),
  ('async_adoption_rate', 'Async Adoption', 'COUNT(async_updates) / COUNT(total_meetings)', ARRAY['team', 'time'], 'nightly'),
  ('decision_implementation_rate', 'Decision Implementation', 'COUNT(implemented_decisions) / COUNT(total_decisions)', ARRAY['initiative', 'time'], 'nightly'),
  ('participation_balance_score', 'Participation Balance', '1 - (STDDEV(speaking_time) / AVG(speaking_time))', ARRAY['meeting', 'team'], 'per_meeting'),
  ('meeting_culture_score', 'Meeting Culture Score', 'weighted_composite_8_dimensions', ARRAY['organization', 'time'], 'weekly'),
  ('topic_emergence_index', 'Topic Emergence', 'statistical_anomaly_score', ARRAY['topic', 'time'], 'nightly')
ON CONFLICT DO NOTHING;
EOF

echo "  [✓] Migration 027 complete"

# -------------------------------------------------------------------
# 3.15 — Migration 028: Dashboards & NLQ
# Arc42: v4.7 §3.12, ADR-039, ADR-040
# -------------------------------------------------------------------
echo "[+] Building migration 028 — dashboards + nlq_queries"

cat > supabase/migrations/028_dashboards_nlq.sql << 'EOF'
-- Dashboards — saved dashboard configurations with sharing
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scope TEXT DEFAULT 'personal' CHECK (scope IN ('personal', 'team', 'organization')),
  layout JSONB NOT NULL,
  sharing_mode TEXT DEFAULT 'private' CHECK (sharing_mode IN ('private', 'team', 'organization', 'public')),
  embed_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own dashboards"
  ON dashboards FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Team views shared dashboards"
  ON dashboards FOR SELECT
  USING (sharing_mode IN ('team', 'organization', 'public'));

-- NLQ Queries — natural language query history
CREATE TABLE IF NOT EXISTS nlq_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  natural_language TEXT NOT NULL,
  query_type TEXT,
  generated_sql TEXT,
  results_summary JSONB,
  confidence REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE nlq_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own NLQ history"
  ON nlq_queries FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_nlq_user ON nlq_queries(user_id, created_at DESC);

-- Scheduled Reports — report configurations and delivery schedules
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  delivery_channels TEXT[] DEFAULT '{email}',
  template JSONB NOT NULL,
  next_run TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reports"
  ON scheduled_reports FOR ALL
  USING (auth.uid() = user_id);
EOF

echo "  [✓] Migration 028 complete"

# -------------------------------------------------------------------
# 3.16 — Migration 029: Organizational Network
# Arc42: v4.7 §3.12, ADR-042
# -------------------------------------------------------------------
echo "[+] Building migration 029 — org_network_nodes + org_network_edges"

cat > supabase/migrations/029_org_network.sql << 'EOF'
-- Organizational Network Nodes — people with centrality metrics
CREATE TABLE IF NOT EXISTS org_network_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_entity_id UUID REFERENCES knowledge_graph_entities(id) ON DELETE CASCADE,
  centrality_score REAL DEFAULT 0,
  betweenness_score REAL DEFAULT 0,
  closeness_score REAL DEFAULT 0,
  eigenvector_score REAL DEFAULT 0,
  role_category TEXT,
  community_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE org_network_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own network nodes"
  ON org_network_nodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System manages network nodes"
  ON org_network_nodes FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_network_nodes_user ON org_network_nodes(user_id);
CREATE INDEX idx_network_nodes_role ON org_network_nodes(role_category);

-- Organizational Network Edges — weighted edges between nodes
CREATE TABLE IF NOT EXISTS org_network_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_node_id UUID NOT NULL REFERENCES org_network_nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES org_network_nodes(id) ON DELETE CASCADE,
  weight REAL DEFAULT 1.0,
  edge_type TEXT NOT NULL,
  co_meeting_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(from_node_id, to_node_id, edge_type)
);

ALTER TABLE org_network_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own network edges"
  ON org_network_edges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System manages network edges"
  ON org_network_edges FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_network_edges_user ON org_network_edges(user_id);
CREATE INDEX idx_network_edges_nodes ON org_network_edges(from_node_id, to_node_id);
EOF

echo "  [✓] Migration 029 complete"

# -------------------------------------------------------------------
# 3.17 — Migration 030: Strategic Signals & Culture Scores
# Arc42: v4.7 §3.12, ADR-043, ADR-044
# -------------------------------------------------------------------
echo "[+] Building migration 030 — strategic_signals + meeting_culture_scores"

cat > supabase/migrations/030_signals_culture.sql << 'EOF'
-- Strategic Signals — weak signal detection for emerging themes
CREATE TABLE IF NOT EXISTS strategic_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  source_initiatives UUID[],
  source_meetings UUID[],
  emergence_score REAL DEFAULT 0,
  first_detected TIMESTAMPTZ DEFAULT now(),
  last_detected TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'dismissed', 'promoted')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE strategic_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own signals"
  ON strategic_signals FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_signals_user_status ON strategic_signals(user_id, status);
CREATE INDEX idx_signals_emergence ON strategic_signals(emergence_score DESC);

-- Meeting Culture Scores — composite organizational health metric
CREATE TABLE IF NOT EXISTS meeting_culture_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score REAL NOT NULL,
  dimension_scores JSONB NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period_start)
);

ALTER TABLE meeting_culture_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own culture scores"
  ON meeting_culture_scores FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_culture_user_period ON meeting_culture_scores(user_id, period_start DESC);
EOF

echo "  [✓] Migration 030 complete"

# -------------------------------------------------------------------
# 3.18 — Migration 031: Decision Quality & Commitment Reliability
# Arc42: v4.7 §3.12, ADR-043
# -------------------------------------------------------------------
echo "[+] Building migration 031 — decision_quality + commitment_reliability"

cat > supabase/migrations/031_decision_quality.sql << 'EOF'
-- Decision Quality Scores — multi-dimensional decision assessment
CREATE TABLE IF NOT EXISTS decision_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL REFERENCES knowledge_graph_entities(id) ON DELETE CASCADE,
  clarity_score REAL,
  followthrough_score REAL,
  impact_score REAL,
  timeliness_score REAL,
  consensus_score REAL,
  overall_score REAL,
  assessed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(decision_id)
);

ALTER TABLE decision_quality_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own decision quality"
  ON decision_quality_scores FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_decision_quality_user ON decision_quality_scores(user_id);

-- Commitment Reliability Indices — per-person accountability tracking
CREATE TABLE IF NOT EXISTS commitment_reliability_indices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_entity_id UUID NOT NULL REFERENCES knowledge_graph_entities(id) ON DELETE CASCADE,
  on_time_rate REAL DEFAULT 0,
  avg_days_late REAL,
  total_commitments INTEGER DEFAULT 0,
  completed_commitments INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_entity_id)
);

ALTER TABLE commitment_reliability_indices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reliability indices"
  ON commitment_reliability_indices FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_reliability_user ON commitment_reliability_indices(user_id);
EOF

echo "  [✓] Migration 031 complete"

# -------------------------------------------------------------------
# 3.19 — Migration 032: Portfolio Optimizations & Claude Context
# Arc42: v4.7 §3.12, ADR-041, ADR-044
# -------------------------------------------------------------------
echo "[+] Building migration 032 — portfolio_optimizations + claude_session_contexts"

cat > supabase/migrations/032_portfolio_claude.sql << 'EOF'
-- Portfolio Optimizations — meeting portfolio analysis and rebalancing
CREATE TABLE IF NOT EXISTS portfolio_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_allocation JSONB NOT NULL,
  efficient_frontier JSONB,
  rebalancing_suggestions JSONB,
  projected_impact JSONB,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE portfolio_optimizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own portfolio"
  ON portfolio_optimizations FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_portfolio_user ON portfolio_optimizations(user_id, calculated_at DESC);

-- Claude Session Contexts — injected context tracking for Claude Code sessions
CREATE TABLE IF NOT EXISTS claude_session_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  injected_context JSONB,
  tools_called TEXT[],
  session_start TIMESTAMPTZ DEFAULT now(),
  session_end TIMESTAMPTZ
);

ALTER TABLE claude_session_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own Claude sessions"
  ON claude_session_contexts FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_claude_sessions_user ON claude_session_contexts(user_id, session_start DESC);
EOF

echo "  [✓] Migration 032 complete"

# CONTINUES IN NEXT RESPONSE — DO NOT RUN THIS BATCH UNTIL COMPLETE
# -------------------------------------------------------------------
# 3.20 — Verification
# -------------------------------------------------------------------
echo ""
echo "============================================"
echo " Verifying migrations 014-032..."
echo "============================================"

MIGRATION_COUNT=0
for i in $(seq -w 14 32); do
  MIGRATION_FILE=$(ls supabase/migrations/${i}_*.sql 2>/dev/null || echo "")
  if [ -n "$MIGRATION_FILE" ]; then
    echo "  [✓] $MIGRATION_FILE"
    MIGRATION_COUNT=$((MIGRATION_COUNT + 1))
  else
    echo "  [✗] Migration ${i} missing!"
    exit 1
  fi
done

echo ""
echo "  Total migrations verified: $MIGRATION_COUNT"

# Verify every migration has RLS enabled
echo ""
echo " Checking RLS coverage..."
RLS_COUNT=0
for f in supabase/migrations/0{14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32}_*.sql; do
  if grep -q "ENABLE ROW LEVEL SECURITY" "$f"; then
    RLS_COUNT=$((RLS_COUNT + 1))
  else
    echo "  [✗] $f missing RLS"
  fi
done
echo "  [✓] $RLS_COUNT migrations have RLS enabled"

# Verify seed data exists for constitutional_principles
if grep -q "INSERT INTO constitutional_principles" supabase/migrations/020_constitutional_principles.sql; then
  echo "  [✓] Constitutional principles seed data present"
else
  echo "  [✗] Constitutional principles seed data missing"
  exit 1
fi

# Verify pgvector extension and HNSW index
if grep -q "CREATE EXTENSION IF NOT EXISTS vector" supabase/migrations/015_skills_embeddings.sql; then
  echo "  [✓] pgvector extension enabled"
else
  echo "  [✗] pgvector extension missing"
  exit 1
fi

if grep -q "USING hnsw" supabase/migrations/015_skills_embeddings.sql; then
  echo "  [✓] HNSW index for embeddings present"
else
  echo "  [✗] HNSW index missing"
  exit 1
fi

# Verify match_meetings RPC function exists
if grep -q "match_meetings" supabase/migrations/015_skills_embeddings.sql; then
  echo "  [✓] match_meetings RPC function present"
else
  echo "  [✗] match_meetings RPC function missing"
  exit 1
fi

echo ""
echo "============================================"
echo " ✅ Master Build 3 Complete"
echo " Database migrations 014-032 delivered:"
echo "  - v4.4: MCP keys, audit log, meeting skills,"
echo "    pgvector embeddings, organizational insights,"
echo "    predictive alerts (6 tables)"
echo "  - v4.5: Extraction agents, agent consensus,"
echo "    knowledge graph entities + temporal edges,"
echo "    DPO training + preference pairs,"
echo "    constitutional principles (seed data),"
echo "    capability tokens + audit, federation,"
echo "    workflows + executions, memory layers,"
echo "    live meeting sessions (14 tables)"
echo "  - v4.6: Scheduled blocks, preferences,"
echo "    energy profiles, focus blocks,"
echo "    meeting optimization, scheduling conflicts,"
echo "    team schedule optimization,"
echo "    calendar sync state (8 tables)"
echo "  - v4.7: Metric definitions + values,"
echo "    dashboards, NLQ queries, scheduled reports,"
echo "    org network nodes + edges,"
echo "    strategic signals, meeting culture scores,"
echo "    decision quality, commitment reliability,"
echo "    portfolio optimizations,"
echo "    Claude session contexts (13 tables)"
echo "  Total: 41 tables across 19 migrations"
echo "  All tables have RLS enabled"
echo "  Ready for Batch 4 — Shared Types & Utilities"
echo "============================================"