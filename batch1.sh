#!/bin/bash
set -euo pipefail

# BATCH 1: CONFIGURATION FILES
# Creates: 16 files (frontend configs, backend configs, 6 supabase migrations)

mkdir -p frontend backend supabase/migrations

cat > frontend/package.json << 'EOF'
{
  "name": "meetingmind",
  "private": true,
  "version": "3.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.28.0",
    "axios": "^1.6.8",
    "hono": "^4.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^7.2.0",
    "@typescript-eslint/parser": "^7.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.2.2",
    "vite": "^5.2.0",
    "vitest": "^1.4.0"
  }
}
EOF

cat > frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

cat > frontend/tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
EOF

cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
EOF

cat > frontend/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'meetingmind': {
          bg: '#020b18',
          card: '#0d1f35',
          gold: '#f59e0b',
          cyan: '#0ea5e9',
          purple: '#8b5cf6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['"SF Pro Display"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'drift': 'gridDrift 20s linear infinite',
      }
    },
  },
  plugins: [],
}
EOF

cat > frontend/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

cat > frontend/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/intellica_ai_favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Intellica AI · MeetingMind</title>
    <meta name="description" content="AI-powered meeting analysis. Record, transcribe, extract action items, get coaching advice." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > backend/package.json << 'EOF'
{
  "name": "meetingmind-backend",
  "version": "3.0.0",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev src/index.ts",
    "deploy": "wrangler deploy",
    "deploy:staging": "wrangler deploy --env staging",
    "deploy:prod": "wrangler deploy --env production",
    "cf-typegen": "wrangler types"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "assemblyai": "^4.0.0",
    "groq-sdk": "^0.5.0",
    "hono": "^4.0.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240320.0",
    "typescript": "^5.2.2",
    "wrangler": "^3.48.0"
  }
}
EOF

cat > backend/wrangler.toml << 'EOF'
name = "meetingmind-api"
main = "src/index.ts"
compatibility_date = "2024-03-20"

[[env.staging]]
name = "meetingmind-api-staging"
vars = { ENVIRONMENT = "staging" }

[[env.production]]
name = "meetingmind-api"
vars = { ENVIRONMENT = "production" }

[env.production.triggers]
crons = ["0 9 * * 1"]

[vars]
SUPABASE_URL = ""
SUPABASE_SERVICE_ROLE_KEY = ""
ASSEMBLYAI_API_KEY = ""
GROQ_API_KEY_1 = ""
GROQ_API_KEY_2 = ""
GROQ_API_KEY_3 = ""
EOF

cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "types": ["@cloudflare/workers-types"],
    "moduleResolution": "node",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

cat > supabase/migrations/001_initial.sql << 'EOF'
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EOF

cat > supabase/migrations/002_meetings.sql << 'EOF'
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  meeting_date DATE,
  duration_minutes INT,
  summary TEXT,
  decisions JSONB,
  action_items JSONB,
  open_questions JSONB,
  parking_lot JSONB,
  key_topics JSONB,
  key_quotes JSONB,
  sentiment TEXT,
  sentiment_reason TEXT,
  effectiveness_score INT,
  effectiveness_reason TEXT,
  next_agenda JSONB,
  risk_flags JSONB,
  meeting_type TEXT,
  assemblyai_job_id TEXT,
  confidence_score DECIMAL(5,2),
  talk_time JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own meetings" ON public.meetings
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX idx_meetings_created_at ON public.meetings(created_at DESC);
CREATE INDEX idx_meetings_meeting_date ON public.meetings(meeting_date);
EOF

cat > supabase/migrations/003_tasks.sql << 'EOF'
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  owner_name TEXT,
  owner_user_id UUID REFERENCES public.profiles(id),
  due_date DATE,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMP,
  completion_notes TEXT,
  parent_task_id UUID REFERENCES public.tasks(id),
  depends_on_task_id UUID REFERENCES public.tasks(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EOF

cat > supabase/migrations/004_threads.sql << 'EOF'
CREATE TABLE public.unresolved_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  first_mentioned_meeting_id UUID REFERENCES public.meetings(id),
  last_mentioned_meeting_id UUID REFERENCES public.meetings(id),
  mention_count INT DEFAULT 1,
  severity TEXT DEFAULT 'medium',
  assigned_to_user_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'open',
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.unresolved_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own threads" ON public.unresolved_threads
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_threads_user_id ON public.unresolved_threads(user_id);
CREATE INDEX idx_threads_status ON public.unresolved_threads(status);
EOF

cat > supabase/migrations/005_patterns.sql << 'EOF'
CREATE TABLE public.user_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  baseline_value DECIMAL,
  current_trend DECIMAL,
  confidence_score DECIMAL,
  sample_size INT,
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.user_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patterns" ON public.user_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update patterns" ON public.user_patterns
  FOR ALL USING (true);

CREATE TABLE public.monthly_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  meetings_count INT DEFAULT 0,
  minutes_processed INT DEFAULT 0,
  storage_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

ALTER TABLE public.monthly_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.monthly_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_usage_user_period ON public.monthly_usage(user_id, period_start);
EOF

cat > supabase/migrations/006_unregistered_owners.sql << 'EOF'
CREATE TABLE public.unregistered_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  email_hint TEXT,
  task_count INT DEFAULT 0,
  last_assigned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.unregistered_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own unregistered owners" ON public.unregistered_owners
  FOR ALL USING (auth.uid() = user_id);
EOF

echo "✅ Batch 1 complete (16 files: 7 frontend, 3 backend, 6 migrations)"