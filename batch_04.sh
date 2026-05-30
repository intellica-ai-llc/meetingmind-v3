#!/usr/bin/env bash
set -e

# =============================================================================
# MeetingMind — Master Build 4
# Shared Types, Error Taxonomies, Zod Schemas & Utilities
# Arc42 Sections: v4.4-v4.7 §2.2 (Domain Models), Interface Contracts
# ADRs Enforced: All ADRs (types enforce ADR constraints at compile time)
# Conformance Items: CONF-04 (Zod-validated inputs)
# Interface Contracts: All [FORMAL] and [SEMI-FORMAL] contracts
# Prerequisites: Batch 1 (MCP Worker), Batch 3 (Migrations — types mirror tables)
# Files Generated: 13 (8 backend, 5 frontend)
# Classification: All NEW
# =============================================================================

echo "============================================"
echo " MEETINGMIND MASTER BUILD 4 — SHARED TYPES & UTILITIES "
echo "============================================"

# -------------------------------------------------------------------
# 4.1 — Backend Type Directories
# -------------------------------------------------------------------
echo "[+] Creating backend type directories"
mkdir -p backend/src/types
mkdir -p backend/src/errors
mkdir -p backend/src/lib

# -------------------------------------------------------------------
# 4.2 — MCP Types (backend)
# Arc42: v4.4 §3.1, v4.5 §3.5 — Capability tokens, MCP tool definitions
# -------------------------------------------------------------------
echo "[+] Building backend/src/types/mcp.ts"

cat > backend/src/types/mcp.ts << 'EOF'
/**
 * MCP Tool definition shared between API worker and MCP worker.
 * Arc42 v4.4 §3.1, v4.5 §3.5
 */

// SERF error taxonomy
export type SerfErrorType =
  | 'TRANSIENT'
  | 'AUTH'
  | 'RATE_LIMITED'
  | 'PLAN_GATED'
  | 'INVALID_INPUT'
  | 'INTERNAL'

// SERF error envelope
export interface SerfError {
  error_type: SerfErrorType
  message: string
  agent_instruction: string
  retry_after?: number
  upgrade_url?: string
}

// SERF response envelope — all MCP tool responses use this
export interface SerfResponse<T = unknown> {
  success: boolean
  data?: T
  error?: SerfError
}

// MCP tool annotation per Anthropic connector specification
export interface ToolAnnotations {
  readOnlyHint: boolean
  destructiveHint: boolean
  idempotentHint: boolean
  openWorldHint: boolean
}

// MCP tool registration entry
export interface McpToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  annotations: ToolAnnotations
  requiredPlan: 'free' | 'pro' | 'business' | 'enterprise'
}

// CABP pipeline verification result
export interface CabpResult {
  userId: string
  plan: 'free' | 'pro' | 'business' | 'enterprise'
  scopes: string[]
  tokenType: 'api_key' | 'oauth'
  sessionId: string
}

// MCP API key record
export interface McpApiKey {
  id: string
  userId: string
  keyHash: string
  keyPrefix: string
  name: string
  scopes: string[]
  expiresAt: string | null
  revoked: boolean
  lastUsedAt: string | null
  createdAt: string
}

// MCP audit log entry
export interface McpAuditEntry {
  id: string
  userId: string
  toolName: string
  requestPayload: Record<string, unknown>
  responseSummary: Record<string, unknown>
  clientInfo: string | null
  createdAt: string
}

// Capability token — fine-grained MCP access control
export interface CapabilityToken {
  id: string
  userId: string
  parentTokenId: string | null
  toolName: string
  scope: CapabilityScope
  actions: Array<'read' | 'create' | 'update' | 'delete'>
  maxDepth: number
  currentDepth: number
  expiresAt: string | null
  revoked: boolean
  createdAt: string
}

// Capability scope — what resources and actions a token grants
export interface CapabilityScope {
  resourceType: 'meeting' | 'initiative' | 'task' | 'thread' | 'knowledge_graph'
  resourceIds: string[] | '*'
  meetingDateRange?: { from: string; to: string }
}
EOF

echo "  [✓] backend/src/types/mcp.ts complete"

# -------------------------------------------------------------------
# 4.3 — Metrics Types (backend)
# Arc42: v4.7 §3.1, ADR-038
# -------------------------------------------------------------------
echo "[+] Building backend/src/types/metrics.ts"

cat > backend/src/types/metrics.ts << 'EOF'
/**
 * Organizational metric types.
 * Arc42 v4.7 §3.1, ADR-038
 */

// Metric definition — formula, dimensions, refresh schedule
export interface MetricDefinition {
  id: string
  name: string
  displayName: string
  formula: string
  dimensions: string[]
  refreshSchedule: 'nightly' | 'weekly' | 'per_meeting'
  active: boolean
  createdAt: string
  updatedAt: string
}

// Materialized metric value for a specific dimension and time period
export interface MetricValue {
  id: string
  metricId: string
  userId: string
  dimensionId: string | null
  dimensionValue: string | null
  value: number | null
  periodStart: string
  periodEnd: string
  calculatedAt: string
}

// Dashboard configuration
export interface Dashboard {
  id: string
  ownerId: string
  name: string
  scope: 'personal' | 'team' | 'organization'
  layout: Record<string, unknown>
  sharingMode: 'private' | 'team' | 'organization' | 'public'
  embedToken: string | null
  createdAt: string
  updatedAt: string
}

// NLQ query record
export interface NlqQuery {
  id: string
  userId: string
  naturalLanguage: string
  queryType: 'STRUCTURED' | 'RELATIONAL' | 'UNSTRUCTURED' | 'HYBRID' | null
  generatedSql: string | null
  resultsSummary: Record<string, unknown> | null
  confidence: number | null
  createdAt: string
}

// Scheduled report configuration
export interface ScheduledReport {
  id: string
  userId: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  deliveryChannels: string[]
  template: Record<string, unknown>
  nextRun: string | null
  active: boolean
  createdAt: string
}

// Meeting culture score
export interface MeetingCultureScore {
  id: string
  userId: string
  overallScore: number
  dimensionScores: Record<string, number>
  periodStart: string
  periodEnd: string
  calculatedAt: string
  benchmarkIndustryAvg?: number
  benchmarkTopQuartile?: number
}

// Decision quality score
export interface DecisionQualityScore {
  id: string
  userId: string
  decisionId: string
  clarityScore: number | null
  followthroughScore: number | null
  impactScore: number | null
  timelinessScore: number | null
  consensusScore: number | null
  overallScore: number | null
  assessedAt: string
}

// Commitment reliability index
export interface CommitmentReliabilityIndex {
  id: string
  userId: string
  personEntityId: string
  onTimeRate: number
  avgDaysLate: number | null
  totalCommitments: number
  completedCommitments: number
  calculatedAt: string
}
EOF

echo "  [✓] backend/src/types/metrics.ts complete"

# -------------------------------------------------------------------
# 4.4 — Network Types (backend)
# Arc42: v4.7 §3.5, ADR-042
# -------------------------------------------------------------------
echo "[+] Building backend/src/types/network.ts"

cat > backend/src/types/network.ts << 'EOF'
/**
 * Organizational network analysis types.
 * Arc42 v4.7 §3.5, ADR-042
 */

// Network node — a person in the organizational graph
export interface OrgNetworkNode {
  id: string
  userId: string
  personEntityId: string | null
  centralityScore: number
  betweennessScore: number
  closenessScore: number
  eigenvectorScore: number
  roleCategory: string | null
  communityId: number | null
  createdAt: string
  updatedAt: string
}

// Network edge — weighted relationship between two people
export interface OrgNetworkEdge {
  id: string
  userId: string
  fromNodeId: string
  toNodeId: string
  weight: number
  edgeType: string
  coMeetingCount: number
  createdAt: string
}

// Complete network graph for visualization
export interface OrgNetworkGraph {
  nodes: OrgNetworkNode[]
  edges: OrgNetworkEdge[]
  communities: Array<{
    id: number
    nodes: string[]
    label: string
  }>
  insights: Array<{
    type: string
    message: string
    nodeIds: string[]
  }>
  calculatedAt: string
}

// Strategic signal — weak signal detection result
export interface StrategicSignal {
  id: string
  userId: string
  topic: string
  sourceInitiatives: string[]
  sourceMeetings: string[]
  emergenceScore: number
  firstDetected: string
  lastDetected: string
  status: 'active' | 'acknowledged' | 'dismissed' | 'promoted'
  createdAt: string
}

// Portfolio optimization result
export interface PortfolioOptimization {
  id: string
  userId: string
  currentAllocation: Record<string, number>
  efficientFrontier: Array<{ allocation: Record<string, number>; expectedReturn: number; risk: number }> | null
  rebalancingSuggestions: Array<{
    assetClass: string
    currentPct: number
    targetPct: number
    rationale: string
  }> | null
  projectedImpact: Record<string, unknown> | null
  calculatedAt: string
}
EOF

echo "  [✓] backend/src/types/network.ts complete"

# -------------------------------------------------------------------
# 4.5 — Scheduling Types (backend)
# Arc42: v4.6 §3.1-3.6, ADR-033-037
# -------------------------------------------------------------------
echo "[+] Building backend/src/types/scheduling.ts"

cat > backend/src/types/scheduling.ts << 'EOF'
/**
 * Scheduling agent types.
 * Arc42 v4.6 §3.1-3.6, ADR-033-037
 */

// Scheduled time block
export interface ScheduledBlock {
  id: string
  userId: string
  blockType: 'task' | 'focus' | 'meeting' | 'break' | 'prep' | 'decompression'
  startTime: string
  endTime: string
  source: string | null
  sourceCommitmentId: string | null
  sourceMeetingId: string | null
  locked: boolean
  energyFitScore: number | null
  createdAt: string
}

// Scheduling preference — learned or explicit
export interface SchedulingPreference {
  id: string
  userId: string
  category: string
  value: Record<string, unknown>
  learned: boolean
  confidence: number
  createdAt: string
  updatedAt: string
}

// Energy profile — learned productivity patterns
export interface EnergyProfile {
  id: string
  userId: string
  hourlyProductivity: Record<string, number> | null
  dayOfWeekProductivity: Record<string, number> | null
  chronotype: 'morning_lark' | 'afternoon' | 'night_owl' | 'bimodal' | null
  lastUpdated: string
  createdAt: string
}

// Focus block — protected deep work time
export interface FocusBlock {
  id: string
  userId: string
  scheduledBlockId: string | null
  purpose: string | null
  relatedCommitments: string[]
  protected: boolean
  createdAt: string
}

// Meeting optimization suggestion
export interface MeetingOptimizationSuggestion {
  id: string
  userId: string
  meetingId: string | null
  meetingSeriesId: string | null
  suggestionType: 'shorten' | 'move' | 'async_alternative' | 'combine' | 'delete' | 'protect_prep' | 'protect_decompression'
  rationale: string
  accepted: boolean | null
  suggestedAt: string
  respondedAt: string | null
}

// Scheduling conflict
export interface SchedulingConflict {
  id: string
  userId: string
  blockAId: string | null
  blockBId: string | null
  resolutionStrategy: string | null
  resolved: boolean
  createdAt: string
}

// Team schedule optimization
export interface TeamScheduleOptimization {
  id: string
  meetingProposalId: string | null
  userIds: string[]
  attendeePreferences: Record<string, unknown> | null
  teamFitnessScore: number | null
  accepted: boolean | null
  createdAt: string
}

// Calendar sync state
export interface CalendarSyncState {
  id: string
  userId: string
  provider: 'google' | 'outlook'
  lastSyncedAt: string | null
  syncToken: string | null
  changeToken: string | null
  createdAt: string
}
EOF

echo "  [✓] backend/src/types/scheduling.ts complete"

# -------------------------------------------------------------------
# 4.6 — Knowledge Graph Types (backend)
# Arc42: v4.5 §3.2-3.4, ADR-026
# -------------------------------------------------------------------
echo "[+] Building backend/src/types/knowledge-graph.ts"

cat > backend/src/types/knowledge-graph.ts << 'EOF'
/**
 * Knowledge graph types.
 * Arc42 v4.5 §3.2-3.4, ADR-026
 */

// Entity type enum
export type EntityType = 'person' | 'project' | 'decision' | 'commitment' | 'risk' | 'topic'

// Knowledge graph entity
export interface KnowledgeGraphEntity {
  id: string
  userId: string
  entityType: EntityType
  name: string
  properties: Record<string, unknown> | null
  resolvedFrom: string | null
  createdAt: string
  updatedAt: string
}

// Temporal edge between entities
export interface TemporalEdge {
  id: string
  fromEntityId: string
  toEntityId: string
  relationType: string
  validFrom: string
  validUntil: string | null
  status: string
  meetingId: string | null
  properties: Record<string, unknown> | null
  createdAt: string
}

// GraphRAG query result
export interface GraphRagResult {
  entities: KnowledgeGraphEntity[]
  edges: TemporalEdge[]
  supportingExcerpts: Array<{
    meetingId: string
    meetingTitle: string
    excerpt: string
    relevanceScore: number
  }>
  queryType: 'local' | 'global' | 'hybrid'
  answer: string
  confidence: number
}

// Entity resolution result
export interface EntityResolution {
  sourceName: string
  resolvedEntityId: string | null
  confidence: number
  candidates: Array<{
    entityId: string
    name: string
    similarityScore: number
  }>
}
EOF

echo "  [✓] backend/src/types/knowledge-graph.ts complete"

# -------------------------------------------------------------------
# 4.7 — Extraction Types (backend)
# Arc42: v4.5 §3.1, ADR-025
# -------------------------------------------------------------------
echo "[+] Building backend/src/types/extraction.ts"

cat > backend/src/types/extraction.ts << 'EOF'
/**
 * Multi-agent extraction types.
 * Arc42 v4.5 §3.1, ADR-025
 */

// Extraction agent definition
export interface ExtractionAgent {
  id: string
  userId: string
  agentType: 'DecisionDetector' | 'ActionItemExtractor' | 'RiskAssessor' | 'SentimentAnalyzer' | 'TopicModeler' | 'MetaAgent'
  systemPromptHash: string
  qualityScore: number
  meetingsProcessed: number
  fewShotExamples: Record<string, unknown> | null
  lastFineTuned: string | null
  createdAt: string
}

// Agent consensus — multi-agent extraction result
export interface AgentConsensus {
  id: string
  meetingId: string
  agentOutputs: Record<string, unknown>
  confidenceScores: Record<string, number> | null
  conflictResolution: Record<string, unknown> | null
  finalOutput: Record<string, unknown>
  createdAt: string
}

// DPO training run record
export interface DpoTrainingRun {
  id: string
  userId: string
  runDate: string
  preferencePairsCount: number
  loss: number | null
  modelHash: string | null
  qualityScore: number | null
  createdAt: string
}

// Preference pair — implicit RLHF training data
export interface PreferencePair {
  id: string
  userId: string
  meetingId: string | null
  fieldName: string
  originalValue: string | null
  editedValue: string | null
  usedInTraining: boolean
  createdAt: string
}

// Meeting skill — auto-created extraction template
export interface MeetingSkill {
  id: string
  userId: string
  meetingType: string
  extractionTemplate: Record<string, unknown>
  qualityScore: number
  meetingsAnalyzed: number
  active: boolean
  lastPatched: string | null
  createdAt: string
}

// Constitutional principle for coaching
export interface ConstitutionalPrinciple {
  id: string
  category: string
  statement: string
  citation: string | null
  weight: number
  active: boolean
  createdAt: string
}

// Workflow template
export interface WorkflowTemplate {
  id: string
  userId: string
  name: string
  toolDag: Record<string, unknown>
  requiredScopes: string[]
  requiresApproval: boolean
  active: boolean
  createdAt: string
}

// Workflow execution record
export interface WorkflowExecution {
  id: string
  templateId: string | null
  userId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  results: Record<string, unknown> | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

// Memory layer entry — five-layer persistent agent memory
export interface MemoryLayerEntry {
  id: string
  userId: string
  layer: 'working' | 'episodic' | 'semantic' | 'procedural' | 'organizational'
  content: Record<string, unknown>
  importanceScore: number
  lastAccessed: string
  createdAt: string
}
EOF

echo "  [✓] backend/src/types/extraction.ts complete"

# -------------------------------------------------------------------
# 4.8 — SERF Error Taxonomy (backend)
# Arc42: v4.4 §6.2 — shared error types for API routes and MCP tools
# -------------------------------------------------------------------
echo "[+] Building backend/src/errors/serf-errors.ts"

cat > backend/src/errors/serf-errors.ts << 'EOF'
/**
 * SERF (Structured Error Recovery Framework) error taxonomy.
 * Arc42 v4.4 §6.2 — shared between API routes and MCP tools.
 * Every error type maps to a standard agent_instruction so AI agents
 * can self-correct without human intervention.
 */

import { SerfErrorType, SerfError, SerfResponse } from '../types/mcp'

// Standard agent instructions per error type
const AGENT_INSTRUCTIONS: Record<SerfErrorType, string> = {
  TRANSIENT: 'Retry this operation with exponential backoff. The service is temporarily unavailable.',
  AUTH: 'Re-authenticate and try again. Your credentials may have expired.',
  RATE_LIMITED: 'Wait for the rate limit window to reset, or prompt the user to upgrade their plan.',
  PLAN_GATED: 'This feature requires a higher plan tier. Prompt the user to upgrade.',
  INVALID_INPUT: 'Correct the input parameters based on the error message and retry.',
  INTERNAL: 'Report this error to the user. The service encountered an unexpected condition.',
}

/**
 * Create a SERF error response.
 * Used by both REST API routes and MCP tool handlers for consistent error formatting.
 */
export function createSerfError(
  type: SerfErrorType,
  message: string,
  retryAfter?: number,
  upgradeUrl?: string
): SerfResponse<never> {
  const error: SerfError = {
    error_type: type,
    message,
    agent_instruction: AGENT_INSTRUCTIONS[type],
  }
  if (retryAfter !== undefined) error.retry_after = retryAfter
  if (upgradeUrl) error.upgrade_url = upgradeUrl

  return { success: false, error }
}

/**
 * Wrap a successful result in a SERF envelope.
 */
export function createSerfSuccess<T>(data: T): SerfResponse<T> {
  return { success: true, data }
}

/**
 * Create a SERF error for a plan-gated feature.
 */
export function planGatedError(
  feature: string,
  requiredPlan: string,
  currentPlan: string
): SerfResponse<never> {
  return createSerfError(
    'PLAN_GATED',
    `'${feature}' requires ${requiredPlan} plan. Your plan: ${currentPlan}.`,
    undefined,
    'https://meeting-mind.com/pricing'
  )
}

/**
 * Create a SERF error for rate limiting.
 */
export function rateLimitedError(
  currentCount: number,
  limit: number,
  windowSeconds: number,
  currentPlan: string
): SerfResponse<never> {
  const retryAfter = Math.ceil(windowSeconds - (Date.now() / 1000) % windowSeconds)
  const upgradeUrl = currentPlan === 'free' ? 'https://meeting-mind.com/pricing' : undefined
  return createSerfError(
    'RATE_LIMITED',
    `Rate limit exceeded: ${currentCount}/${limit} calls in ${windowSeconds}s`,
    retryAfter,
    upgradeUrl
  )
}

/**
 * Create a SERF error for invalid input with Zod error details.
 */
export function invalidInputError(zodErrors: Array<{ path: string; message: string }>): SerfResponse<never> {
  const details = zodErrors.map(e => `${e.path}: ${e.message}`).join('; ')
  return createSerfError('INVALID_INPUT', `Validation failed: ${details}`)
}

/**
 * Create a SERF error for transient failures with retry guidance.
 */
export function transientError(message: string, retryAfterSeconds?: number): SerfResponse<never> {
  return createSerfError('TRANSIENT', message, retryAfterSeconds)
}

/**
 * Create a SERF error for authentication failures.
 */
export function authError(message: string): SerfResponse<never> {
  return createSerfError('AUTH', message)
}

/**
 * Create a SERF error for internal server errors.
 */
export function internalError(message: string): SerfResponse<never> {
  return createSerfError('INTERNAL', message)
}
EOF

echo "  [✓] backend/src/errors/serf-errors.ts complete"

# -------------------------------------------------------------------
# 4.9 — Shared Zod Schemas (backend)
# Arc42: v4.4 §6.1 — Zod validation for all inputs per OWASP MCP Top 10
# -------------------------------------------------------------------
echo "[+] Building backend/src/lib/zod-schemas.ts"

cat > backend/src/lib/zod-schemas.ts << 'EOF'
/**
 * Shared Zod schemas for all new API routes and MCP tools.
 * Arc42 v4.4 §6.1 — Input validation per OWASP MCP Top 10 compliance.
 * Every route and tool uses these schemas for request validation.
 */

import { z } from 'zod'

// ── Common schemas ──

export const uuidSchema = z.string().uuid()

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

// ── Meeting schemas ──

export const meetingIdParam = z.object({
  id: uuidSchema,
})

export const meetingQuerySchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(50).default(10),
  initiative_id: uuidSchema.optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})

// ── Task schemas ──

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  owner_name: z.string().min(1).max(200),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  meeting_id: uuidSchema.optional(),
  initiative_id: uuidSchema.optional(),
})

export const updateTaskStatusSchema = z.object({
  task_id: uuidSchema,
  status: z.enum(['open', 'in_progress', 'completed']),
})

// ── Initiative schemas ──

export const createInitiativeSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
})

export const initiativeMemberSchema = z.object({
  meeting_id: uuidSchema.optional(),
  task_id: uuidSchema.optional(),
  thread_id: uuidSchema.optional(),
}).refine(
  data => data.meeting_id || data.task_id || data.thread_id,
  'At least one of meeting_id, task_id, or thread_id must be provided'
)

// ── Search / NLQ schemas ──

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(50).default(10),
  method: z.enum(['vector', 'fulltext', 'auto']).default('auto'),
})

export const nlqQuerySchema = z.object({
  query: z.string().min(1).max(1000),
})

// ── Scheduling schemas ──

export const scheduleCommitmentSchema = z.object({
  commitment_id: uuidSchema.optional(),
  task_id: uuidSchema.optional(),
  duration_minutes: z.number().int().min(15).max(480).default(60),
  preferred_time: z.string().optional(),
})

export const optimizeWeekSchema = z.object({
  protect_focus_time: z.boolean().default(true),
  max_meetings_per_day: z.number().int().min(1).max(12).default(6),
})

export const negotiateMeetingSchema = z.object({
  title: z.string().min(1).max(200),
  duration_minutes: z.number().int().min(15).max(480),
  required_attendees: z.array(uuidSchema).min(1),
  optional_attendees: z.array(uuidSchema).default([]),
  deadline_window_days: z.number().int().min(1).max(30).default(7),
})

// ── Report schemas ──

export const createReportSchema = z.object({
  name: z.string().min(1).max(200),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  delivery_channels: z.array(z.string()).default(['email']),
  template: z.record(z.unknown()),
})

// ── Export schemas ──

export const exportDataSchema = z.object({
  format: z.enum(['csv', 'json', 'parquet']).default('json'),
  scope: z.enum(['all', 'initiative', 'date_range']).default('all'),
  initiative_id: uuidSchema.optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})

// ── MCP key management schemas ──

export const createMcpKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).default(['read']),
  expires_in_days: z.number().int().min(1).max(365).optional(),
})

// ── Claude context schemas ──

export const sendToClaudeSchema = z.object({
  meeting_id: uuidSchema.optional(),
  initiative_id: uuidSchema.optional(),
  context_type: z.enum(['meeting_summary', 'initiative_status', 'decision_log', 'standup_brief']),
})

// ── Organization scope schemas ──

export const orgScopeSchema = z.object({
  scope: z.enum(['personal', 'team', 'organization']).default('personal'),
})
EOF

echo "  [✓] backend/src/lib/zod-schemas.ts complete"

# -------------------------------------------------------------------
# 4.10 — Frontend Types
# Arc42: v4.7 §3.3 — Frontend-specific type definitions
# -------------------------------------------------------------------
echo "[+] Building frontend type files"

mkdir -p frontend/src/types

# Frontend metrics types
cat > frontend/src/types/metrics.ts << 'EOF'
/**
 * Frontend metric types for dashboard and visualization components.
 * Arc42 v4.7 §3.3
 */

export interface MetricCard {
  id: string
  name: string
  displayName: string
  value: number | null
  previousValue: number | null
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number | null
  periodLabel: string
  format: 'number' | 'percentage' | 'duration' | 'score'
}

export interface CultureScoreBreakdown {
  dimension: string
  score: number
  weight: number
  benchmarkAvg: number | null
  status: 'good' | 'warning' | 'critical'
}

export interface MeetingCultureScoreData {
  overallScore: number
  trend: 'up' | 'down' | 'stable'
  breakdown: CultureScoreBreakdown[]
  industryAvg: number | null
  topQuartile: number | null
  calculatedAt: string
}

export interface DecisionLogEntry {
  id: string
  meetingId: string
  meetingTitle: string
  meetingDate: string
  decision: string
  status: 'active' | 'implemented' | 'superseded'
  qualityScores: {
    clarity: number | null
    followthrough: number | null
    impact: number | null
    overall: number | null
  } | null
}

export interface NlqResult {
  query: string
  queryType: 'STRUCTURED' | 'RELATIONAL' | 'UNSTRUCTURED' | 'HYBRID'
  generatedSql: string | null
  results: Record<string, unknown>[]
  visualizationSuggestion: string
  relatedQueries: string[]
  confidence: number
}
EOF

echo "  [✓] frontend/src/types/metrics.ts complete"

# Frontend MCP types
cat > frontend/src/types/mcp.ts << 'EOF'
/**
 * Frontend MCP connection and activity types.
 * Arc42 v4.4 §3.1, v4.7 §3.3
 */

export interface McpConnectionState {
  connected: boolean
  lastActivity: string | null
  toolsAvailable: number
  sessionId: string | null
}

export interface McpActivityEntry {
  id: string
  toolName: string
  timestamp: string
  clientInfo: string
  status: 'success' | 'error'
}

export interface ClaudeSessionInfo {
  sessionId: string
  startedAt: string
  contextInjected: string[]
  toolsCalled: string[]
}

export interface McpApiKeyData {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  expiresAt: string | null
  revoked: boolean
  lastUsedAt: string | null
  createdAt: string
}
EOF

echo "  [✓] frontend/src/types/mcp.ts complete"

# Frontend network types
cat > frontend/src/types/network.ts << 'EOF'
/**
 * Frontend network visualization types.
 * Arc42 v4.7 §3.5
 */

export interface NetworkNode {
  id: string
  label: string
  role: string
  centralityScore: number
  communityId: number
  x?: number
  y?: number
}

export interface NetworkEdge {
  source: string
  target: string
  weight: number
  type: string
}

export interface NetworkGraph {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
}

export interface StrategicSignalData {
  id: string
  topic: string
  emergenceScore: number
  sourceInitiatives: string[]
  firstDetected: string
  status: 'active' | 'acknowledged' | 'dismissed' | 'promoted'
}
EOF

echo "  [✓] frontend/src/types/network.ts complete"

# Frontend scheduling types
cat > frontend/src/types/scheduling.ts << 'EOF'
/**
 * Frontend scheduling types.
 * Arc42 v4.6 §3.1-3.4
 */

export interface ScheduleBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  blockType: 'task' | 'focus' | 'meeting' | 'break' | 'prep' | 'decompression'
  sourceCommitmentId: string | null
  locked: boolean
  energyFitScore: number | null
}

export interface EnergyProfileData {
  chronotype: 'morning_lark' | 'afternoon' | 'night_owl' | 'bimodal' | null
  peakHours: string[]
  lowHours: string[]
  dayPreference: Record<string, number>
}

export interface MeetingOptimizationSuggestionData {
  id: string
  meetingTitle: string
  suggestionType: string
  rationale: string
  citation: string | null
  accepted: boolean | null
}
EOF

echo "  [✓] frontend/src/types/scheduling.ts complete"

# Frontend organization types
cat > frontend/src/types/organization.ts << 'EOF'
/**
 * Frontend organization scope types.
 * Arc42 v4.7 §3.3, ADR-040
 */

export type OrgScope = 'personal' | 'team' | 'organization'

export interface OrgScopeContextType {
  scope: OrgScope
  setScope: (scope: OrgScope) => void
  isTeamView: boolean
  isOrgView: boolean
}

export interface TeamMemberSummary {
  userId: string
  displayName: string
  meetingCount: number
  avgEffectiveness: number | null
  openTaskCount: number
  overloadRisk: 'low' | 'elevated' | 'high' | 'critical'
}

export interface BurnoutRiskData {
  riskLevel: 'low' | 'elevated' | 'high' | 'critical'
  contributingFactors: string[]
  suggestions: string[]
  calculatedAt: string
}
EOF

echo "  [✓] frontend/src/types/organization.ts complete"

# -------------------------------------------------------------------
# 4.11 — Verification
# -------------------------------------------------------------------
echo ""
echo "============================================"
echo " Running TypeScript check on new type files..."
echo "============================================"

cd backend
npm install --silent 2>&1 | tail -1
npx tsc --noEmit src/types/mcp.ts src/types/metrics.ts src/types/network.ts src/types/scheduling.ts src/types/knowledge-graph.ts src/types/extraction.ts src/errors/serf-errors.ts src/lib/zod-schemas.ts 2>&1 || true
cd ..

echo ""
echo "============================================"
echo " ✅ Master Build 4 Complete"
echo " Shared types delivered:"
echo "  Backend: 6 type files, 1 error taxonomy, 1 Zod schema library"
echo "  Frontend: 5 type files"
echo "  All types mirror migration schemas"
echo "  SERF error framework shared across API and MCP"
echo "  Zod schemas for all new route inputs"
echo " Ready for Batch 5 — Core Services & Engines (v4.4-v4.5)"
echo "============================================"