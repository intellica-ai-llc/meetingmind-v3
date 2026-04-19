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

This document represents the final, as-built architecture of MeetingMind v3.0 as deployed on April 19, 2026.