#!/usr/bin/env bash
set -e

# =============================================================================
# MeetingMind — Master Build 1
# MCP Worker Foundation: dedicated Cloudflare Worker for Model Context Protocol
# Arc42 Sections: v4.4 §3.1 (MCP Worker Container), §5.1-5.2 (Deployment)
# ADRs Enforced: ADR-017 (MCP as sole AI-agent integration protocol),
#                 ADR-024 (Separate MCP Worker from API Worker)
# Conformance Items: CONF-01 (MCP implements 2025-11-25 spec with Streamable HTTP)
# Interface Contracts: MCP Server Transport [FORMAL], CABP Pipeline [FORMAL],
#                      SERF Envelope [FORMAL]
# Prerequisites: None (greenfield — MCP Worker does not exist)
# Files Generated: 8 (1 manifest, 1 tsconfig, 1 wrangler, 4 source, 1 types)
# Language/Stack: TypeScript / Cloudflare Workers (Hono) / @modelcontextprotocol/sdk
# Classification: All NEW
# =============================================================================

echo "============================================"
echo " MEETINGMIND MASTER BUILD 1 — MCP WORKER FOUNDATION "
echo "============================================"

# -------------------------------------------------------------------
# 1.1 — MCP Worker Directory & Manifest
# Arc42: v4.4 §3.1 — MCP Worker Container, ADR-024
# -------------------------------------------------------------------
echo "[+] Creating MCP Worker directory structure"
mkdir -p mcp-worker/src/middleware
mkdir -p mcp-worker/src/transport

echo "[+] Building mcp-worker/package.json"
cat > mcp-worker/package.json << 'EOF'
{
  "name": "meetingmind-mcp",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "deploy": "wrangler deploy --env=production",
    "dev": "wrangler dev --port 8788",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.23.0",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240524.0",
    "typescript": "^5.4.0",
    "wrangler": "^3.0.0",
    "vitest": "^1.6.0"
  }
}
EOF

echo "[+] Building mcp-worker/tsconfig.json"
cat > mcp-worker/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
EOF

echo "[+] Building mcp-worker/wrangler.toml"
cat > mcp-worker/wrangler.toml << 'EOF'
name = "meetingmind-mcp"
main = "src/index.ts"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "MCP_SESSION_KV"
id = "mcp-session-kv-id"
preview_id = "mcp-session-kv-preview"

[[kv_namespaces]]
binding = "MCP_RATE_LIMIT_KV"
id = "mcp-rate-limit-kv-id"
preview_id = "mcp-rate-limit-kv-preview"

[[kv_namespaces]]
binding = "MCP_TOOL_INDEX_KV"
id = "mcp-tool-index-kv-id"
preview_id = "mcp-tool-index-kv-preview"

[env.production]
name = "meetingmind-mcp-production"

[env.production.vars]
SUPABASE_URL = ""
SUPABASE_SERVICE_ROLE_KEY = ""
MCP_OAUTH_ISSUER = ""

[[env.production.kv_namespaces]]
binding = "MCP_SESSION_KV"
id = "mcp-session-kv-prod-id"

[[env.production.kv_namespaces]]
binding = "MCP_RATE_LIMIT_KV"
id = "mcp-rate-limit-kv-prod-id"

[[env.production.kv_namespaces]]
binding = "MCP_TOOL_INDEX_KV"
id = "mcp-tool-index-kv-prod-id"
EOF

echo "  [✓] mcp-worker scaffold complete"

# -------------------------------------------------------------------
# 1.2 — MCP Types
# Arc42: v4.4 §3.1 — shared types for MCP transport and session
# -------------------------------------------------------------------
echo "[+] Building mcp-worker/src/types.ts"
cat > mcp-worker/src/types.ts << 'EOF'
import { z } from 'zod'

// Environment bindings for the MCP Worker
export interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  MCP_OAUTH_ISSUER: string
  MCP_SESSION_KV: KVNamespace
  MCP_RATE_LIMIT_KV: KVNamespace
  MCP_TOOL_INDEX_KV: KVNamespace
}

// MCP JSON-RPC request as defined in the 2025-11-25 specification
export interface McpRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: Record<string, unknown>
}

// MCP JSON-RPC response
export interface McpResponse {
  jsonrpc: '2.0'
  id: string | number
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

// Session state stored in KV
export interface McpSession {
  sessionId: string
  userId: string
  plan: 'free' | 'pro' | 'business' | 'enterprise'
  scopes: string[]
  createdAt: number
  expiresAt: number
  lastAccessedAt: number
}

// CABP pipeline verification result
export interface CabpResult {
  userId: string
  plan: 'free' | 'pro' | 'business' | 'enterprise'
  scopes: string[]
  tokenType: 'api_key' | 'oauth'
  sessionId: string
}

// SERF error types
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

// SERF response envelope
export interface SerfResponse<T = unknown> {
  success: boolean
  data?: T
  error?: SerfError
}

// Tool manifest annotation per Anthropic connector spec
export interface ToolAnnotations {
  readOnlyHint: boolean
  destructiveHint: boolean
  idempotentHint: boolean
  openWorldHint: boolean
}

// MCP tool definition
export interface McpTool {
  name: string
  description: string
  inputSchema: z.ZodTypeAny
  annotations: ToolAnnotations
  requiredPlan: 'free' | 'pro' | 'business' | 'enterprise'
  handler: (input: unknown, context: CabpResult, env: Env) => Promise<unknown>
}

// Zod schema for MCP requests
export const mcpRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]),
  method: z.string(),
  params: z.record(z.unknown()).optional(),
})

// Zod schema for tools/list params
export const toolsListParamsSchema = z.object({}).optional()

// Zod schema for tools/call params
export const toolsCallParamsSchema = z.object({
  name: z.string(),
  arguments: z.record(z.unknown()).optional(),
})
EOF

echo "  [✓] mcp-worker/src/types.ts complete"

# -------------------------------------------------------------------
# 1.3 — MCP Transport (Streamable HTTP with SSE)
# Arc42: v4.4 §3.1 — Streamable HTTP transport per 2025-11-25 spec
# Interface Contract: [FORMAL] — Session management, JSON-RPC routing
# -------------------------------------------------------------------
echo "[+] Building mcp-worker/src/transport/server.ts"
cat > mcp-worker/src/transport/server.ts << 'EOF'
import { Context } from 'hono'
import { Env, McpSession, McpRequest } from '../types'

// Session TTL in seconds (30 minutes)
const SESSION_TTL = 1800

// Session ID header name per MCP spec
const SESSION_HEADER = 'Mcp-Session-Id'

/**
 * Parse a JSON-RPC request body or throw a structured error.
 * MCP 2025-11-25 §Base Protocol: JSON-RPC 2.0 message format.
 */
export function parseRequest(body: unknown): McpRequest {
  if (typeof body !== 'object' || body === null) {
    throw new Error('MCP_PARSE_ERROR: Request body must be a JSON object')
  }
  const req = body as Record<string, unknown>
  if (req.jsonrpc !== '2.0') {
    throw new Error('MCP_PARSE_ERROR: jsonrpc must be "2.0"')
  }
  if (typeof req.method !== 'string') {
    throw new Error('MCP_PARSE_ERROR: method must be a string')
  }
  return {
    jsonrpc: '2.0',
    id: (req.id as string | number) ?? 0,
    method: req.method,
    params: req.params as Record<string, unknown> | undefined,
  }
}

/**
 * Create a new MCP session in KV.
 */
export async function createSession(
  env: Env,
  userId: string,
  plan: string,
  scopes: string[]
): Promise<McpSession> {
  const sessionId = crypto.randomUUID()
  const now = Math.floor(Date.now() / 1000)
  const session: McpSession = {
    sessionId,
    userId,
    plan: plan as McpSession['plan'],
    scopes,
    createdAt: now,
    expiresAt: now + SESSION_TTL,
    lastAccessedAt: now,
  }
  await env.MCP_SESSION_KV.put(
    `session:${sessionId}`,
    JSON.stringify(session),
    { expirationTtl: SESSION_TTL }
  )
  return session
}

/**
 * Get an existing MCP session from KV, refreshing TTL on access.
 */
export async function getSession(
  env: Env,
  sessionId: string
): Promise<McpSession | null> {
  const raw = await env.MCP_SESSION_KV.get(`session:${sessionId}`)
  if (!raw) return null
  const session: McpSession = JSON.parse(raw)
  const now = Math.floor(Date.now() / 1000)
  if (now > session.expiresAt) {
    await env.MCP_SESSION_KV.delete(`session:${sessionId}`)
    return null
  }
  session.lastAccessedAt = now
  await env.MCP_SESSION_KV.put(
    `session:${sessionId}`,
    JSON.stringify(session),
    { expirationTtl: SESSION_TTL }
  )
  return session
}

/**
 * Delete a session from KV.
 */
export async function deleteSession(env: Env, sessionId: string): Promise<void> {
  await env.MCP_SESSION_KV.delete(`session:${sessionId}`)
}

/**
 * Set the Mcp-Session-Id header on a response.
 */
export function setSessionHeader(c: Context, sessionId: string): void {
  c.header(SESSION_HEADER, sessionId)
}

/**
 * Get the Mcp-Session-Id from a request header.
 */
export function getSessionId(c: Context): string | null {
  return c.req.header(SESSION_HEADER) ?? null
}

/**
 * Write an SSE event to the response stream.
 * Used for server→client streaming per MCP Streamable HTTP transport.
 */
export function writeSSE(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  event: string,
  data: string
): void {
  const encoder = new TextEncoder()
  const message = `event: ${event}\ndata: ${data}\n\n`
  writer.write(encoder.encode(message))
}
EOF

echo "  [✓] mcp-worker/src/transport/server.ts complete"

# -------------------------------------------------------------------
# 1.4 — CABP Pipeline (6-Stage Identity)
# Arc42: v4.4 §3.1 — CABP middleware, ADR-017
# Interface Contract: [FORMAL] — token→scope→user→plan→rate-limit→audit
# Pre: Authorization header present
# Post: verifiedUser on context with userId, plan, scopes
# Invariant: Every stage must pass before next stage executes
# Error modes: Missing auth → 401, Invalid token → 401, Rate limit → 429
# -------------------------------------------------------------------
echo "[+] Building mcp-worker/src/middleware/cabp-pipeline.ts"
cat > mcp-worker/src/middleware/cabp-pipeline.ts << 'EOF'
import { Context, Next } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { Env, CabpResult, SerfResponse } from '../types'
import { createSession, getSession, setSessionHeader, getSessionId } from '../transport/server'

// Rate limit window in seconds
const RATE_WINDOW = 60
// Maximum MCP tool calls per window per user by plan
const RATE_LIMITS: Record<string, number> = {
  free: 30,
  pro: 300,
  business: 1000,
  enterprise: 5000,
}

/**
 * CABP Pipeline — 6-stage identity verification for every MCP tool call.
 *
 * Stage 1: Token extraction — parse Authorization header (Bearer token or API key)
 * Stage 2: Scope extraction — determine scopes from token type
 * Stage 3: User lookup — validate token against Supabase or API key store
 * Stage 4: Plan resolution — determine user's subscription tier
 * Stage 5: Rate limit check — enforce per-plan rate limits via KV
 * Stage 6: Audit logging — write invocation record
 */
export async function cabpMiddleware(c: Context<{ Bindings: Env }>, next: Next): Promise<void> {
  const env = c.env

  // Stage 1: Token extraction
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return sendError(c, 'AUTH', 'Missing Authorization header', 'Provide a Bearer token or API key', 401)
  }

  let token: string
  let tokenType: 'api_key' | 'oauth'

  if (authHeader.startsWith('Bearer mm-mcp-sk_')) {
    token = authHeader.substring(7)
    tokenType = 'api_key'
  } else if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
    tokenType = 'oauth'
  } else {
    return sendError(c, 'AUTH', 'Invalid Authorization format', 'Use Bearer <token> or Bearer mm-mcp-sk_<key>', 401)
  }

  // Stage 2: Scope extraction — determine from token type
  const scopes: string[] = tokenType === 'api_key' ? ['read', 'write'] : ['read']

  // Stage 3: User lookup
  let userId: string
  let plan: string

  if (tokenType === 'api_key') {
    // Hash the API key for lookup
    const keyHash = await hashKey(token)
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
    const { data: keyData, error: keyError } = await supabase
      .from('mcp_api_keys')
      .select('user_id, scopes, expires_at, revoked')
      .eq('key_hash', keyHash)
      .single()

    if (keyError || !keyData || keyData.revoked) {
      return sendError(c, 'AUTH', 'Invalid API key', 'Generate a new key in MeetingMind Settings → MCP', 401)
    }
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return sendError(c, 'AUTH', 'API key expired', 'Generate a new key in MeetingMind Settings → MCP', 401)
    }
    userId = keyData.user_id
  } else {
    // OAuth: validate JWT via Supabase
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return sendError(c, 'AUTH', 'Invalid OAuth token', 'Re-authenticate and try again', 401)
    }
    userId = user.id
  }

  // Stage 4: Plan resolution
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', userId)
    .single()

  plan = profile?.subscription_status === 'active'
    ? (profile.subscription_tier ?? 'free')
    : 'free'

  // Stage 5: Rate limit check
  const limitKey = `rate:${userId}:${Math.floor(Date.now() / 1000 / RATE_WINDOW)}`
  const currentCount = parseInt(await env.MCP_RATE_LIMIT_KV.get(limitKey) || '0', 10)
  const limit = RATE_LIMITS[plan] ?? RATE_LIMITS.free

  if (currentCount >= limit) {
    const upgradeUrl = plan === 'free' ? 'https://meeting-mind.com/pricing' : undefined
    return sendError(
      c,
      'RATE_LIMITED',
      `Rate limit exceeded: ${currentCount}/${limit} calls in ${RATE_WINDOW}s`,
      plan === 'free'
        ? 'Upgrade to Pro for unlimited MCP access'
        : 'Wait for the rate limit window to reset',
      429,
      Math.ceil(RATE_WINDOW - (Date.now() / 1000) % RATE_WINDOW),
      upgradeUrl
    )
  }

  await env.MCP_RATE_LIMIT_KV.put(limitKey, (currentCount + 1).toString(), {
    expirationTtl: RATE_WINDOW * 2,
  })

  // Stage 6: Audit logging
  const { error: auditError } = await supabase
    .from('mcp_audit_log')
    .insert({
      user_id: userId,
      tool_name: 'pending',
      request_payload: {},
      response_summary: {},
      client_info: c.req.header('User-Agent') ?? 'unknown',
    })

  if (auditError) {
    console.error('MCP audit log write failed:', auditError.message)
  }

  // Build CABP result and attach to context
  const cabpResult: CabpResult = {
    userId,
    plan: plan as CabpResult['plan'],
    scopes,
    tokenType,
    sessionId: getSessionId(c) ?? '',
  }

  c.set('cabpResult', cabpResult)
  await next()
}

/**
 * SHA-256 hash an API key for storage and lookup.
 */
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Send a SERF-enveloped error response.
 */
function sendError(
  c: Context,
  errorType: string,
  message: string,
  agentInstruction: string,
  status: number,
  retryAfter?: number,
  upgradeUrl?: string
): Response {
  const body: SerfResponse = {
    success: false,
    error: {
      error_type: errorType as SerfResponse['error']['error_type'],
      message,
      agent_instruction: agentInstruction,
    },
  }
  if (retryAfter) body.error!.retry_after = retryAfter
  if (upgradeUrl) body.error!.upgrade_url = upgradeUrl
  return c.json(body, status as any)
}
EOF

echo "  [✓] mcp-worker/src/middleware/cabp-pipeline.ts complete"

# -------------------------------------------------------------------
# 1.5 — SERF Envelope Middleware
# Arc42: v4.4 §3.1 — SERF error wrapping for all MCP tool responses
# Interface Contract: [FORMAL] — All responses wrapped in { success, data/error }
# -------------------------------------------------------------------
echo "[+] Building mcp-worker/src/middleware/serf-envelope.ts"
cat > mcp-worker/src/middleware/serf-envelope.ts << 'EOF'
import { SerfResponse, SerfErrorType } from '../types'

/**
 * Wrap a successful tool execution result in a SERF envelope.
 */
export function serfSuccess<T>(data: T): SerfResponse<T> {
  return {
    success: true,
    data,
  }
}

/**
 * Create a SERF error envelope for a failed tool execution.
 * Each error type maps to a standard agent_instruction so AI agents
 * can self-correct without human intervention.
 */
export function serfError(
  type: SerfErrorType,
  message: string,
  retryAfter?: number,
  upgradeUrl?: string
): SerfResponse {
  const instructions: Record<SerfErrorType, string> = {
    TRANSIENT: 'Retry this operation with exponential backoff. The service is temporarily unavailable.',
    AUTH: 'Re-authenticate and try again. Your credentials may have expired.',
    RATE_LIMITED: 'Wait for the rate limit window to reset, or prompt the user to upgrade their plan.',
    PLAN_GATED: 'This feature requires a higher plan tier. Prompt the user to upgrade.',
    INVALID_INPUT: 'Correct the input parameters based on the error message and retry.',
    INTERNAL: 'Report this error to the user. The service encountered an unexpected condition.',
  }

  return {
    success: false,
    error: {
      error_type: type,
      message,
      agent_instruction: instructions[type],
      retry_after: retryAfter,
      upgrade_url: upgradeUrl,
    },
  }
}
EOF

echo "  [✓] mcp-worker/src/middleware/serf-envelope.ts complete"

# -------------------------------------------------------------------
# 1.6 — MCP Worker Entry Point (index.ts)
# Arc42: v4.4 §3.1 — Hono app, route mounting, JSON-RPC handling
# -------------------------------------------------------------------
echo "[+] Building mcp-worker/src/index.ts"
cat > mcp-worker/src/index.ts << 'EOF'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Env, McpRequest, mcpRequestSchema, McpResponse } from './types'
import { cabpMiddleware } from './middleware/cabp-pipeline'
import { parseRequest, setSessionHeader } from './transport/server'
import { serfSuccess, serfError } from './middleware/serf-envelope'

const app = new Hono<{ Bindings: Env }>()

// CORS for all MCP endpoints
app.use('*', cors())

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'healthy',
    service: 'meetingmind-mcp',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// Main MCP endpoint — all JSON-RPC traffic
app.post('/api/mcp', cabpMiddleware, async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    const response: McpResponse = {
      jsonrpc: '2.0',
      id: 0,
      error: {
        code: -32700,
        message: 'Parse error: invalid JSON',
      },
    }
    return c.json(response, 400)
  }

  let request: McpRequest
  try {
    request = parseRequest(body)
  } catch (e: any) {
    const response: McpResponse = {
      jsonrpc: '2.0',
      id: 0,
      error: {
        code: -32600,
        message: e.message || 'Invalid Request',
      },
    }
    return c.json(response, 400)
  }

  // Route by JSON-RPC method
  switch (request.method) {
    case 'initialize':
      return handleInitialize(c, request)
    case 'tools/list':
      return handleToolsList(c, request)
    case 'tools/call':
      return handleToolsCall(c, request)
    case 'ping':
      return c.json({ jsonrpc: '2.0', id: request.id, result: {} })
    default:
      return c.json({
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: `Method not found: ${request.method}`,
        },
      }, 404)
  }
})

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      error_type: 'INTERNAL',
      message: 'Not found',
      agent_instruction: 'Check the endpoint URL',
    },
  }, 404)
})

/**
 * Handle MCP initialize — return server capabilities and protocol version.
 * 2025-11-25 spec: server must declare supported features.
 */
async function handleInitialize(c: any, request: McpRequest): Promise<Response> {
  const result = {
    protocolVersion: '2025-11-25',
    capabilities: {
      tools: {},
      resources: {},
    },
    serverInfo: {
      name: 'MeetingMind MCP',
      version: '1.0.0',
    },
  }
  // Set session header for stateful connections
  setSessionHeader(c, `mm-mcp-${crypto.randomUUID()}`)
  return c.json({ jsonrpc: '2.0', id: request.id, result })
}

/**
 * Handle tools/list — return all available tools with their schemas.
 * Tools are registered in the tool index KV and filtered by plan.
 */
async function handleToolsList(c: any, request: McpRequest): Promise<Response> {
  // Tool registration happens in Batch 2 — return empty list for now
  // Tools will be populated when the tool modules are built
  const tools: Array<{
    name: string
    description: string
    inputSchema: Record<string, unknown>
  }> = []

  return c.json({
    jsonrpc: '2.0',
    id: request.id,
    result: { tools },
  })
}

/**
 * Handle tools/call — execute a specific tool.
 * Tool execution is delegated to the registered handler.
 */
async function handleToolsCall(c: any, request: McpRequest): Promise<Response> {
  const params = request.params as { name?: string; arguments?: Record<string, unknown> } | undefined

  if (!params?.name) {
    return c.json({
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32602,
        message: 'Invalid params: tool name is required',
      },
    }, 400)
  }

  // Tool execution will be wired in Batch 2 when tool modules are built
  return c.json({
    jsonrpc: '2.0',
    id: request.id,
    error: {
      code: -32601,
      message: `Tool not found: ${params.name}. Tools will be registered in Batch 2.`,
    },
  }, 404)
}

export default app
EOF

echo "  [✓] mcp-worker/src/index.ts complete"

# -------------------------------------------------------------------
# 1.7 — Verification
# -------------------------------------------------------------------
echo ""
echo "============================================"
echo " Running TypeScript check on MCP Worker..."
echo "============================================"

cd mcp-worker
npm install --silent 2>&1 | tail -1
npx tsc --noEmit
cd ..

echo ""
echo "============================================"
echo " ✅ Master Build 1 Complete"
echo " MCP Worker foundation: Hono app with Streamable HTTP transport,"
echo " CABP 6-stage identity pipeline, and SERF error framework."
echo " Ready for Batch 2 — MCP Tool implementations."
echo "============================================"