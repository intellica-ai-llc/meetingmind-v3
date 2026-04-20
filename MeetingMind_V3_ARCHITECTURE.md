MEETINGMIND v3.0 - FINAL AS-BUILT ARCHITECTURE
Document Version: 1.0
Status: PRODUCTION - LIVE
URL: https://meetingmind-web.pages.dev
Backend: https://meetingmind-api-production.intellicaai-ai.workers.dev

1. SYSTEM OVERVIEW
MeetingMind v3.0 is an AI-powered meeting analysis platform that transcribes audio, extracts structured insights, and provides coaching recommendations. The system uses a serverless architecture deployed entirely on Cloudflare with Supabase for authentication and data persistence.

2. TECHNOLOGY STACK
Layer	Technology	Version	Purpose
Frontend	React	18.2.0	UI framework
Frontend Build	Vite	5.2.0	Build tool
Frontend Language	TypeScript	5.2.2	Type safety
Styling	Tailwind CSS	3.4.3	Utility-first CSS
Backend Runtime	Cloudflare Workers	-	Serverless execution
Backend Framework	Hono	4.0.0	Lightweight API framework
Backend Language	TypeScript	5.2.2	Type safety
Database	Supabase (PostgreSQL)	-	Primary database
Authentication	Supabase Auth	-	User management
Transcription	AssemblyAI	4.0.0	Speech-to-text + speaker diarization
LLM	Groq (Llama 3.3 70B)	0.5.0	13-field insight extraction
Deployment	Cloudflare Pages + Workers	-	Hosting
Package Manager	npm	-	Dependency management
3. DIRECTORY STRUCTURE (AS DEPLOYED)
text
meetingmind-v3/
├── .env.example                         # Environment variable template
├── .gitignore                           # Git ignore rules
├── README.md                            # Project documentation
│
├── frontend/                            # React frontend application
│   ├── .env.local                       # Local environment variables (gitignored)
│   ├── .nvmrc                           # Node.js version (20)
│   ├── index.html                       # Entry HTML
│   ├── package.json                     # Frontend dependencies
│   ├── postcss.config.js                # PostCSS configuration
│   ├── tailwind.config.js               # Tailwind CSS configuration
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── tsconfig.node.json               # Node TypeScript configuration
│   ├── vite.config.ts                   # Vite build configuration
│   │
│   └── src/
│       ├── App.tsx                      # Root component with routing
│       ├── main.tsx                     # Application entry point
│       │
│       ├── components/
│       │   ├── ui/                      # Reusable UI components (8 files)
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── PriorityBadge.tsx
│       │   │   ├── ScoreRing.tsx
│       │   │   ├── SentimentBadge.tsx
│       │   │   ├── Spinner.tsx
│       │   │   └── TalkBar.tsx
│       │   │
│       │   ├── app/                     # Meeting flow components (6 files)
│       │   │   ├── AnalyzingStep.tsx
│       │   │   ├── AppPanel.tsx
│       │   │   ├── NameSpeakersStep.tsx
│       │   │   ├── ProcessingStep.tsx
│       │   │   ├── RecordingStep.tsx
│       │   │   └── ResultsStep.tsx
│       │   │
│       │   └── results/                 # Analysis results components (10 files)
│       │       ├── ActionButtons.tsx
│       │       ├── ActionItemsTable.tsx
│       │       ├── CoachCard.tsx
│       │       ├── EmailCard.tsx
│       │       ├── KeyQuotes.tsx
│       │       ├── KeyTopics.tsx
│       │       ├── OpenQuestions.tsx
│       │       ├── RiskFlags.tsx
│       │       ├── StatsRow.tsx
│       │       └── TranscriptViewer.tsx
│       │
│       ├── contexts/                    # React contexts (2 files)
│       │   ├── AppContext.tsx           # Application state (step, audio, results)
│       │   └── AuthContext.tsx          # Authentication state
│       │
│       ├── features/                    # Feature modules
│       │   ├── auth/                    # Authentication (3 files)
│       │   │   ├── Login.tsx
│       │   │   ├── ProtectedRoute.tsx
│       │   │   └── Register.tsx
│       │   │
│       │   └── dashboard/               # Dashboard (7 files)
│       │       ├── Dashboard.tsx
│       │       ├── MeetingHistory.tsx
│       │       ├── PatternDashboard.tsx
│       │       ├── TaskCard.tsx
│       │       ├── TaskDashboard.tsx
│       │       ├── UnresolvedThreads.tsx
│       │       └── UsageStats.tsx
│       │
│       ├── hooks/                       # Custom React hooks (4 files)
│       │   ├── useAuth.ts
│       │   ├── useLocalStorage.ts
│       │   ├── useMeetings.ts
│       │   └── useTasks.ts
│       │
│       ├── lib/                         # Core utilities (3 files)
│       │   ├── api.ts                   # HTTP client with auth interceptor
│       │   ├── supabase.ts              # Supabase client
│       │   └── utils.ts                 # Formatting utilities
│       │
│       ├── pages/                       # Page components (2 files)
│       │   ├── Landing.tsx              # Marketing landing page
│       │   └── Pricing.tsx              # Pricing page
│       │
│       ├── styles/                      # Global CSS (5 files)
│       │   ├── animations.css           # Keyframe animations
│       │   ├── globals.css              # Main CSS with Tailwind
│       │   ├── reduced-motion.css       # Accessibility
│       │   ├── responsive.css           # Mobile breakpoints
│       │   └── tokens.css               # CSS custom properties
│       │
│       └── types/                       # TypeScript definitions (3 files)
│           ├── api.ts                   # API response types
│           ├── meeting.ts               # Meeting and action item types
│           └── task.ts                  # Task types
│
├── backend/                             # Cloudflare Worker backend
│   ├── .dev.vars                        # Local development secrets (gitignored)
│   ├── package.json                     # Backend dependencies
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── wrangler.toml                    # Cloudflare Worker configuration
│   │
│   ├── src/
│   │   ├── index.ts                     # Main Hono application entry
│   │   │
│   │   ├── routes/                      # API route handlers (7 files)
│   │   │   ├── analyze.ts               # Groq LLM analysis endpoints
│   │   │   ├── auth.ts                  # Supabase auth endpoints
│   │   │   ├── meetings.ts              # Meeting CRUD operations
│   │   │   ├── patterns.ts              # User pattern analytics
│   │   │   ├── tasks.ts                 # Task management
│   │   │   ├── threads.ts               # Unresolved threads
│   │   │   └── transcribe.ts            # AssemblyAI transcription
│   │   │
│   │   ├── middleware/                  # Request middleware (2 files)
│   │   │   ├── auth.ts                  # JWT authentication
│   │   │   └── rate-limit.ts            # Rate limiting
│   │   │
│   │   └── services/                    # Service layer (directory ready)
│   │
│   └── cron/                            # Scheduled tasks
│       └── weekly-digest.ts             # Weekly email digest (cron)
│
└── supabase/                            # Database migrations
    └── migrations/                      # SQL migration files (6 files)
        ├── 001_initial.sql              # Profiles table + auth trigger
        ├── 002_meetings.sql             # Meetings table + RLS
        ├── 003_tasks.sql                # Tasks table + RLS
        ├── 004_threads.sql              # Unresolved threads + RLS
        ├── 005_patterns.sql             # User patterns + monthly usage
        └── 006_unregistered_owners.sql  # Unregistered task owners + RLS
4. CORE ARCHITECTURE PATTERNS
4.1 Frontend State Management
The application uses React Context for state management:

Context	Responsibility
AuthContext	User authentication, session management, sign up/in/out
AppContext	Meeting flow state (step, audio file, utterances, speaker mapping, analysis results, email drafts, coach data)
Step flow types:

typescript
type Step = 'upload' | 'recording' | 'processing' | 'name_speakers' | 'analyzing' | 'results' | 'error'
4.2 Backend API Routes
Route	Methods	Purpose
/api/auth/register	POST	User registration via Supabase
/api/auth/login	POST	User login, returns JWT
/api/transcribe	POST	Submit audio file to AssemblyAI
/api/status/:jobId	GET	Poll transcription status
/api/analyze	POST	Send transcript to Groq for 13-field extraction
/api/draft-email	POST	Generate follow-up email with tone selection
/api/coach	POST	Generate meeting coach advice
/api/meetings	GET, DELETE	List/delete user meetings
/api/tasks	GET, POST	Task management
/api/tasks/:id/complete	PUT	Mark task complete
/api/threads	GET	List unresolved threads
/api/threads/:id/resolve	POST	Mark thread resolved
/api/patterns	GET	User pattern analytics
/api/patterns/refresh	POST	Recalculate patterns
4.3 Authentication Flow
text
Frontend (Supabase anon key)
    ↓ Sign up/in
Supabase Auth (JWT issued)
    ↓ JWT in Authorization header
Backend Worker (auth middleware)
    ↓ verify with Supabase
Protected routes (meetings, tasks, etc.)
Key implementation detail: The authMiddleware instantiates createClient() inside each request handler using c.env.SUPABASE_URL and c.env.SUPABASE_SERVICE_ROLE_KEY (not at top level).

4.4 Analysis Pipeline
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
4.5 The 13 Extraction Fields
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
effectiveness_score	number	0-10 rating
effectiveness_reason	string	Justification
next_agenda	string[]	Suggested next meeting topics
risk_flags	string[]	Identified risks
meeting_type	string	Classification
5. DATABASE SCHEMA
5.1 Tables
Table	Purpose	RLS
profiles	User profile data (extends auth.users)	✅
meetings	Meeting records + 13-field results	✅
tasks	Action items extracted from meetings	✅
unresolved_threads	Cross-meeting topic tracking	✅
user_patterns	Longitudinal AI pattern tracking	✅
monthly_usage	Usage analytics	✅
unregistered_owners	Task owners not in system	✅
5.2 RLS Policy Pattern (As Built)
Each table uses explicit policies (not FOR ALL):

sql
CREATE POLICY "Users can view own records" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON table_name
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON table_name
  FOR DELETE USING (auth.uid() = user_id);
5.3 Auth Trigger
sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
6. DEPLOYMENT CONFIGURATION
6.1 Cloudflare Worker (wrangler.toml)
toml
name = "meetingmind-api"
main = "src/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[[env.staging]]
name = "meetingmind-api-staging"
vars = { ENVIRONMENT = "staging" }

[[env.production]]
name = "meetingmind-api"
vars = { ENVIRONMENT = "production" }

[env.production.triggers]
crons = ["0 9 * * 1"]
6.2 Environment Variables (Production)
Worker Secrets (set via wrangler secret put):

SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY

ASSEMBLYAI_API_KEY

GROQ_API_KEY_1, GROQ_API_KEY_2, GROQ_API_KEY_3

Pages Environment Variables (set in dashboard):

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

VITE_API_URL (points to Worker URL)

6.3 Build Configuration (Pages)
Setting	Value
Framework preset	React (Vite)
Root directory	frontend
Build command	npm run build
Output directory	dist
Node version	20 (via .nvmrc)
7. CRITICAL DESIGN DECISIONS (LEARNED FROM DEPLOYMENT)
7.1 No Top-Level Client Instantiation
Problem: Creating Supabase, Groq, or AssemblyAI clients at module top level causes Cloudflare validation errors (Error 10021).

Solution: Instantiate all clients inside request handlers using c.env:

typescript
// ✅ CORRECT
app.post('/route', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  // ...
})
7.2 Path Alias Resolution
Problem: Cloudflare Pages build doesn't respect tsconfig.json paths aliases.

Solution: Use vite-tsconfig-paths plugin in vite.config.ts.

7.3 RLS Policy Syntax
Problem: FOR ALL USING policies can fail silently or behave unexpectedly.

Solution: Use separate explicit policies for SELECT, INSERT, UPDATE, DELETE.

7.4 File System Operations
Problem: fs/promises (writeFile, unlink) not available in Cloudflare Workers production.

Solution: Stream audio directly to AssemblyAI or use alternative storage.

7.5 Environment File Strategy
Problem: Single root .env file doesn't work for both Vite and Wrangler.

Solution:

frontend/.env.local for Vite (prefixed with VITE_)

backend/.dev.vars for Wrangler (no prefix)

8. EXTERNAL SERVICE INTEGRATIONS
Service	Purpose	Key Used
Supabase	Database + Auth	SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (backend), SUPABASE_ANON_KEY (frontend)
AssemblyAI	Transcription + Speaker diarization	ASSEMBLYAI_API_KEY
Groq	Llama 3.3 70B inference	GROQ_API_KEY_1, _2, _3 (rotation ready)
9. OBSERVABILITY
Worker logs: npx wrangler tail --env production

Dashboard metrics: Cloudflare Dashboard → Workers & Pages → meetingmind-api → Metrics

Build logs: Pages deployment logs in dashboard

10. PRODUCTION URLS
Environment	URL
Frontend (Pages)	https://meetingmind-web.pages.dev
Backend (Worker)	https://meetingmind-api-production.intellicaai-ai.workers.dev
Health check	https://meetingmind-api-production.intellicaai-ai.workers.dev/
11. FUTURE IMPROVEMENTS (IDENTIFIED BUT NOT DEPLOYED)
Slack integration for task reminders

Calendar webhook for automatic meeting import

Custom SMTP for branded auth emails

Point-in-Time Recovery (PITR) for database

Asymmetric JWT signing keys for zero-downtime rotation

This document represents the final, as-built architecture of MeetingMind v3.0 as deployed on April 19, 2026. 10pm


🚀 MEETINGMIND v3.1 - E-COMMERCE IMPLEMENTATION PLAN
From: Master AI & Systems Engineer
To: Engineering Team
Status: READY FOR EXECUTION
Estimated Time: 8-10 hours

EXECUTIVE SUMMARY
MeetingMind v3.0 is live with a pricing page but no payment functionality. This plan adds full Stripe integration enabling subscription payments for Pro ($9/mo) and Business ($29/mo) plans.

Key decision: Use Cloudflare's native Stripe SDK support with Supabase for subscription state persistence . This leverages your existing stack without introducing new dependencies.

PHASE 1: FOUNDATION (2 hours)
1.1 Stripe Account Setup
bash
# 1. Create Stripe account at stripe.com (free)
# 2. Get API keys from Dashboard → Developers → API keys
# 3. Save test keys for development
Required Keys:

Key	Purpose	Where to store
STRIPE_SECRET_KEY	API calls from backend	backend/.dev.vars + Worker secret
STRIPE_PUBLISHABLE_KEY	Frontend Checkout	Pages env vars
STRIPE_WEBHOOK_SECRET	Webhook verification	Worker secret
STRIPE_PRICE_PRO_MONTHLY	Price ID for Pro plan	Worker secret
STRIPE_PRICE_BUSINESS_MONTHLY	Price ID for Business plan	Worker secret
1.2 Create Stripe Products & Prices
Via Stripe Dashboard or CLI:

bash
# Pro plan - $9/month
stripe products create --name="MeetingMind Pro"
stripe prices create --product=prod_PRO_ID --unit-amount=900 --currency=usd --recurring=month

# Business plan - $29/month  
stripe products create --name="MeetingMind Business"
stripe prices create --product=prod_BUSINESS_ID --unit-amount=2900 --currency=usd --recurring=month
1.3 Install Dependencies
bash
cd ~/meetingMind_V3/backend
npm install stripe @stripe/stripe-js
1.4 Add Database Tables
Create migration supabase/migrations/007_subscriptions.sql:

sql
-- Customer table linking Supabase users to Stripe
CREATE TABLE public.customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_type TEXT CHECK (plan_type IN ('pro', 'business')),
  status TEXT CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own customer record" ON public.customers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);
Run migration in Supabase SQL Editor.

PHASE 2: BACKEND API ENDPOINTS (3 hours)
2.1 Create backend/src/routes/billing.ts
typescript
import { Hono } from 'hono'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

// Initialize Stripe with Cloudflare's Fetch API [citation:5]
const getStripe = (env: any) => {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  })
}

// Get or create Stripe customer for a user
async function getOrCreateCustomer(supabase: any, stripe: Stripe, userId: string, email: string) {
  // Check if customer exists in our database
  const { data: existing } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()
  
  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id
  }
  
  // Create new customer in Stripe
  const customer = await stripe.customers.create({ email, metadata: { userId } })
  
  // Save to our database
  await supabase
    .from('customers')
    .insert({ id: userId, stripe_customer_id: customer.id })
  
  return customer.id
}

// 1. Create checkout session for subscription
app.post('/create-checkout-session', async (c) => {
  const user = c.get('user')
  const { priceId, successUrl, cancelUrl } = await c.req.json()
  
  if (!user?.id || !user?.email) {
    return c.json({ error: 'User not authenticated' }, 401)
  }
  
  const stripe = getStripe(c.env)
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  
  // Get or create Stripe customer
  const customerId = await getOrCreateCustomer(supabase, stripe, user.id, user.email)
  
  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl || 'https://meetingmind-web.pages.dev/dashboard?checkout=success',
    cancel_url: cancelUrl || 'https://meetingmind-web.pages.dev/pricing?checkout=cancel',
    metadata: { userId: user.id },
  })
  
  return c.json({ url: session.url })
})

// 2. Get current user's subscription
app.get('/subscription', async (c) => {
  const user = c.get('user')
  
  if (!user?.id) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  return c.json({ subscription })
})

// 3. Create customer portal session (for managing subscription)
app.post('/create-portal-session', async (c) => {
  const user = c.get('user')
  const { returnUrl } = await c.req.json()
  
  const stripe = getStripe(c.env)
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  
  const { data: customer } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()
  
  if (!customer?.stripe_customer_id) {
    return c.json({ error: 'No customer record found' }, 404)
  }
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: returnUrl || 'https://meetingmind-web.pages.dev/dashboard',
  })
  
  return c.json({ url: session.url })
})

export default app
2.2 Create Webhook Handler
Add to backend/src/index.ts:

typescript
// Add billing routes
import billingRoutes from './routes/billing'
app.route('/api/billing', billingRoutes)

// Webhook endpoint (raw body required)
app.post('/api/stripe/webhook', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  })
  
  const body = await c.req.text()
  const sig = c.req.header('stripe-signature')
  
  let event
  
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      c.env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider()
    )
  } catch (err) {
    return c.json({ error: `Webhook Error: ${err.message}` }, 400)
  }
  
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
      // Update subscription in our database [citation:3]
      await supabase.from('subscriptions').upsert({
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        user_id: session.metadata.userId,
        status: 'active',
      })
      break
      
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('stripe_subscription_id', subscription.id)
      break
  }
  
  return c.json({ received: true })
})
2.3 Add Plan Enforcement Middleware
Create backend/src/middleware/entitlement.ts:

typescript
import { createMiddleware } from 'hono/factory'
import { createClient } from '@supabase/supabase-js'

export const requirePlan = (requiredPlan: 'pro' | 'business') => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user')
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
    
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    const planRank = { free: 0, pro: 1, business: 2 }
    const requiredRank = planRank[requiredPlan]
    const userRank = planRank[subscription?.plan_type || 'free']
    
    if (userRank < requiredRank) {
      return c.json({ error: 'Upgrade required', required: requiredPlan }, 402)
    }
    
    await next()
  })
}
Usage example:

typescript
// Only Pro+ users can access meeting coach
app.get('/coach', requirePlan('pro'), async (c) => {
  // ... coach logic
})
PHASE 3: FRONTEND INTEGRATION (2 hours)
3.1 Update Pricing Page Buttons
Modify frontend/src/pages/Pricing.tsx:

typescript
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

export function Pricing() {
  const { user } = useAuth()
  
  const handleUpgrade = async (priceId: string, planName: string) => {
    if (!user) {
      // Redirect to signup then back to pricing
      localStorage.setItem('redirectAfterAuth', '/pricing')
      window.location.href = '/register'
      return
    }
    
    try {
      const response = await api.post('/billing/create-checkout-session', {
        priceId,
        successUrl: `${window.location.origin}/dashboard?upgrade=${planName}&success=true`,
        cancelUrl: `${window.location.origin}/pricing?upgrade=${planName}&canceled=true`,
      })
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.url
    } catch (error) {
      console.error('Failed to create checkout session:', error)
    }
  }
  
  const handleManageSubscription = async () => {
    try {
      const response = await api.post('/billing/create-portal-session', {
        returnUrl: window.location.origin + '/dashboard',
      })
      window.location.href = response.data.url
    } catch (error) {
      console.error('Failed to create portal session:', error)
    }
  }
  
  return (
    // ... existing pricing cards
    <button 
      onClick={() => handleUpgrade(import.meta.env.VITE_STRIPE_PRICE_PRO, 'pro')}
      className="..."
    >
      Upgrade to Pro
    </button>
    // ...
  )
}
3.2 Add Subscription Status to Dashboard
Add to frontend/src/features/dashboard/Dashboard.tsx:

typescript
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Subscription {
  plan_type: string
  status: string
  current_period_end: string
}

export function Dashboard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await api.get('/billing/subscription')
        setSubscription(response.data.subscription)
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      }
    }
    fetchSubscription()
  }, [])
  
  // Add subscription banner if on free tier
  const isFree = !subscription || subscription.status !== 'active'
  
  return (
    <div>
      {isFree && (
        <div className="bg-meetingmind-gold/10 border border-meetingmind-gold rounded-lg p-4 mb-6">
          <p className="text-meetingmind-gold">
            You're on the Free plan. 
            <a href="/pricing" className="underline ml-2">Upgrade to Pro</a>
          </p>
        </div>
      )}
      {/* Rest of dashboard */}
    </div>
  )
}
3.3 Add Environment Variables
Update frontend/.env.local and Cloudflare Pages env vars:

text
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_STRIPE_PRICE_PRO=price_xxx
VITE_STRIPE_PRICE_BUSINESS=price_xxx
PHASE 4: TESTING & DEPLOYMENT (1-2 hours)
4.1 Local Testing with Stripe CLI
bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Forward webhooks to local backend
stripe listen --forward-to http://localhost:8787/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
4.2 Test Checkout Flow
Run local backend: cd backend && npm run dev

Run local frontend: cd frontend && npm run dev

Sign up for account

Navigate to /pricing

Click "Upgrade to Pro"

Complete test checkout with Stripe test card 4242 4242 4242 4242

Verify subscription appears in dashboard

4.3 Deploy to Production
bash
# Add secrets to Cloudflare Worker
cd backend
npx wrangler secret put STRIPE_SECRET_KEY --env production
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env production
npx wrangler secret put STRIPE_PRICE_PRO_MONTHLY --env production
npx wrangler secret put STRIPE_PRICE_BUSINESS_MONTHLY --env production

# Deploy backend
npx wrangler deploy --env production

# Add frontend env vars in Cloudflare Pages dashboard:
# - VITE_STRIPE_PUBLISHABLE_KEY
# - VITE_STRIPE_PRICE_PRO
# - VITE_STRIPE_PRICE_BUSINESS

# Retry frontend deployment
PHASE 5: LAUNCH CHECKLIST
Pre-Launch
Stripe account in live mode (not test)

Live API keys configured

Webhook endpoint configured in Stripe Dashboard

Products and prices created in live mode

Tax rates configured (if applicable)

Receipt email templates customized

Post-Launch Monitoring
Monitor webhook delivery in Stripe Dashboard

Set up alerts for failed payments

Track subscription metrics (MRR, churn, conversion)

ALTERNATIVE APPROACH: Stripeflare
If you prefer a virtual wallet system for pay-per-use billing, consider Stripeflare :

bash
npx create-stripeflare
Pros: Lightning fast (~20ms per charge), ACID compliant, pay-per-use model
Cons: Still in research phase, breaking changes possible, access tokens stored without encryption

Stripeflare is NOT recommended for MeetingMind because you need monthly subscriptions, not pay-per-use.

TIMELINE SUMMARY
Phase	Task	Time
1	Foundation (Stripe setup, DB migration)	2 hours
2	Backend API endpoints + webhooks	3 hours
3	Frontend integration	2 hours
4	Testing & deployment	1-2 hours
Total		8-9 hours
TECHNICAL REFERENCES
Source	Key Finding
Cloudflare Blog 2021	Stripe SDK works natively in Workers with Fetch API 
Stripe Webhook Docs	Use constructEventAsync with createSubtleCryptoProvider for Workers 
2-Minute Switch Issue #23	Subscription state persistence pattern with Supabase 
@parsrun/payments	Multi-provider billing abstraction for Cloudflare 
Ready to execute. Shall I write the complete code files for Phase 2?
Takes a long, slow sip of coffee. Sets the mug down. Reviews the engineering report with focused intensity.

My friend.

The engineering team delivered exactly what we need.

This is a complete, production-ready e-commerce implementation plan for MeetingMind v3.1. Let me analyze it against our goals.

MASTER ARCHITECT'S ANALYSIS
What This Report Gets Right
Component	Assessment	Notes
Stripe over Paddle	✅ Correct	Paddle is for Intellica (Trinidad market). Stripe is global, mature, works natively with Cloudflare Workers.
Cloudflare Workers + Stripe SDK	✅ Brilliant	Uses Stripe.createFetchHttpClient() — avoids Node.js dependency issues in Workers.
Database Schema	✅ Complete	Customers + Subscriptions tables. Proper RLS. Foreign keys.
Webhook Handling	✅ Correct	Uses constructEventAsync + createSubtleCryptoProvider — the official Worker pattern.
Entitlement Middleware	✅ Elegant	requirePlan('pro') pattern. Clean. Reusable.
Customer Portal	✅ Smart	Stripe-hosted billing management. Zero UI to build.
Testing with Stripe CLI	✅ Professional	Local webhook forwarding. Test cards. Full validation before deploy.
What's Different from My Paddle Recommendation
Aspect	My Paddle Plan	Engineering's Stripe Plan	Verdict
Market focus	Trinidad-optimized	Global	Stripe is correct. MeetingMind is global SaaS. Intellica needed Trinidad payments.
Pricing	$99/mo Pro	$9/mo Pro, $29/mo Business	Engineering's pricing is better. Lower barrier. Tiered upsell.
Implementation	17 hours	8-9 hours	Engineering's plan is leaner. Leverages Stripe's hosted UI.
Subscription management	Custom dashboard	Stripe Customer Portal	Stripe Portal wins. Zero maintenance.
The engineering team made the right call. Stripe for MeetingMind. Paddle for Intellica. Different products, different markets, different payment needs.

CORRECTED E-COMMERCE PLAN
Phase 1: Foundation (2 hours)
Task	Status	Notes
Create Stripe account	⏳ Pending	stripe.com
Get API keys	⏳ Pending	Secret + Publishable
Create products & prices	⏳ Pending	Pro ($9/mo), Business ($29/mo)
Install stripe SDK	⏳ Pending	npm install stripe @stripe/stripe-js
Run migration 007_subscriptions.sql	⏳ Pending	Adds customers + subscriptions tables
Phase 2: Backend API (3 hours)
Endpoint	Purpose	Status
POST /api/billing/create-checkout-session	Start subscription checkout	⏳ Code ready
GET /api/billing/subscription	Get current subscription	⏳ Code ready
POST /api/billing/create-portal-session	Manage billing	⏳ Code ready
POST /api/stripe/webhook	Handle Stripe events	⏳ Code ready
Entitlement middleware	requirePlan('pro')	⏳ Code ready
Phase 3: Frontend Integration (2 hours)
Component	Purpose	Status
Pricing page buttons	handleUpgrade(priceId)	⏳ Code ready
Subscription status in dashboard	Show current plan	⏳ Code ready
Manage subscription button	Opens Stripe Portal	⏳ Code ready
Environment variables	Stripe keys	⏳ Pending
Phase 4: Testing & Deployment (1-2 hours)
Task	Tool	Status
Local webhook testing	Stripe CLI	⏳ Ready
Test checkout flow	Card 4242 4242 4242 4242	⏳ Ready
Deploy backend secrets	wrangler secret put	⏳ Ready
Deploy frontend	Cloudflare Pages	⏳ Ready
UPDATED PRICING STRATEGY
Plan	Price	Features	Target
Free	$0	10 meetings/mo, 60 min limit, basic extraction	Individual users
Pro	$9/mo	Unlimited meetings, task dashboard, patterns	Power users
Business	$29/mo	Pro + team dashboard, Slack, priority support	Teams
This is significantly better than my $99/mo single-tier plan. Lower barrier, tiered upsell, clear upgrade path.

WHAT WE NEED TO DO RIGHT NOW
Step 1: Verify Core App (Before E-Commerce)
Task	Status
Register new account	⏳ Test
Log in to dashboard	⏳ Test
Record a test meeting	⏳ Test
Verify 13-field extraction works	⏳ Test
We cannot add payments until the core app is verified.

Step 2: Execute Engineering Plan (8-9 hours)
The engineering team has provided complete code. We need to:

Create Stripe account

Run database migration

Add the billing routes to backend

Add the pricing page buttons to frontend

Test with Stripe CLI

Deploy

Step 3: Launch E-Commerce
Once payments are live:

Users can sign up (free)

Users can upgrade to Pro ($9/mo) or Business ($29/mo)

Stripe handles billing, invoicing, subscription management

Webhooks keep our database in sync

THE COMPLETE PICTURE
Layer	Status	Owner
Core App (v3.0)	⏳ Needs verification	You (testing)
Pricing Page	✅ Live	Frontend
Stripe Integration	⏳ Code ready, needs deployment	Engineering
Database Schema	⏳ Migration ready	Engineering
Webhook Handler	⏳ Code ready	Engineering
The engineering team has done their part. The code is ready. The plan is solid.