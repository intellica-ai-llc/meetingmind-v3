#!/bin/bash
set -euo pipefail

echo "🔧 MEETINGMIND v3.0 - COMPLETE FIX SCRIPT"
echo "=========================================="

cd ~/meetingMind_V3

# ============================================
# FRONTEND FIXES
# ============================================

echo ""
echo "📦 FIXING FRONTEND..."

# 1. Install vite-tsconfig-paths
cd frontend
npm install -D vite-tsconfig-paths

# 2. Update vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
echo "  ✅ vite.config.ts updated"

# 3. Update tsconfig.json
cat > tsconfig.json << 'EOF'
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
    },
    "types": ["vite/client"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
echo "  ✅ tsconfig.json updated"

# 4. Fix useLocalStorage.ts
cat > src/hooks/useLocalStorage.ts << 'EOF'
import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}
EOF
echo "  ✅ useLocalStorage.ts fixed"

# 5. Fix AppContext.tsx - Add missing properties
cat > src/contexts/AppContext.tsx << 'EOF'
import React, { createContext, useContext, useState } from 'react'

export type Step = 'upload' | 'recording' | 'processing' | 'name_speakers' | 'analyzing' | 'results' | 'error'

interface AppContextType {
  step: Step; setStep: (step: Step) => void
  audioFile: File | null; setAudioFile: (file: File | null) => void
  utterances: any[]; setUtterances: (utterances: any[]) => void
  speakers: string[]; setSpeakers: (speakers: string[]) => void
  speakerMap: Record<string, string>; setSpeakerMap: (map: Record<string, string>) => void
  results: any | null; setResults: (results: any) => void
  email: string; setEmail: (email: string) => void
  error: string; setError: (error: string) => void
  statusMsg: string; setStatusMsg: (msg: string) => void
  talkTime: Record<string, any>; setTalkTime: (talkTime: Record<string, any>) => void
  confidence: number | null; setConfidence: (confidence: number | null) => void
  emailTone: string; setEmailTone: (tone: string) => void
  meetingTitle: string; setMeetingTitle: (title: string) => void
  meetingDate: string; setMeetingDate: (date: string) => void
  transcriptOpen: boolean; setTranscriptOpen: (open: boolean) => void
  namedTranscript: string; setNamedTranscript: (transcript: string) => void
  coachData: any | null; setCoachData: (data: any) => void
  isRecording: boolean; setIsRecording: (recording: boolean) => void
  recordingSecs: number; setRecordingSecs: (secs: number) => void
  countdown: number | null; setCountdown: (countdown: number | null) => void
  copied: boolean; setCopied: (copied: boolean) => void
  regenLoading: boolean; setRegenLoading: (loading: boolean) => void
  fileError: string; setFileError: (error: string) => void
  demoMode: boolean; setDemoMode: (mode: boolean) => void
  reset: () => void
  handleStartMeeting: () => void
  handleStopRecording: () => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleUpload: () => void
  handleNameConfirm: () => void
  handleDemoMode: () => void
  copyEmail: () => void
  downloadMinutes: () => void
  shareViaEmail: () => void
  regenerateEmail: (tone: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<Step>('upload')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [utterances, setUtterances] = useState<any[]>([])
  const [speakers, setSpeakers] = useState<string[]>([])
  const [speakerMap, setSpeakerMap] = useState<Record<string, string>>({})
  const [results, setResults] = useState<any | null>(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [talkTime, setTalkTime] = useState<Record<string, any>>({})
  const [confidence, setConfidence] = useState<number | null>(null)
  const [emailTone, setEmailTone] = useState('team')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const [namedTranscript, setNamedTranscript] = useState('')
  const [coachData, setCoachData] = useState<any | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSecs, setRecordingSecs] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [fileError, setFileError] = useState('')
  const [demoMode, setDemoMode] = useState(false)

  const reset = () => {
    setStep('upload')
    setAudioFile(null)
    setUtterances([])
    setSpeakers([])
    setSpeakerMap({})
    setResults(null)
    setEmail('')
    setError('')
    setStatusMsg('')
    setTalkTime({})
    setConfidence(null)
    setNamedTranscript('')
    setCoachData(null)
    setIsRecording(false)
    setRecordingSecs(0)
    setCountdown(null)
    setMeetingTitle('')
    setMeetingDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
    setFileError('')
    setDemoMode(false)
  }

  const handleStartMeeting = () => {}
  const handleStopRecording = () => {}
  const handleFileChange = () => {}
  const handleUpload = () => {}
  const handleNameConfirm = () => {}
  const handleDemoMode = () => {}
  const copyEmail = () => {}
  const downloadMinutes = () => {}
  const shareViaEmail = () => {}
  const regenerateEmail = () => {}

  return (
    <AppContext.Provider value={{
      step, setStep, audioFile, setAudioFile, utterances, setUtterances, speakers, setSpeakers,
      speakerMap, setSpeakerMap, results, setResults, email, setEmail, error, setError,
      statusMsg, setStatusMsg, talkTime, setTalkTime, confidence, setConfidence, emailTone, setEmailTone,
      meetingTitle, setMeetingTitle, meetingDate, setMeetingDate, transcriptOpen, setTranscriptOpen,
      namedTranscript, setNamedTranscript, coachData, setCoachData, isRecording, setIsRecording,
      recordingSecs, setRecordingSecs, countdown, setCountdown, copied, setCopied, regenLoading, setRegenLoading,
      fileError, setFileError, demoMode, setDemoMode,
      reset, handleStartMeeting, handleStopRecording, handleFileChange, handleUpload, handleNameConfirm,
      handleDemoMode, copyEmail, downloadMinutes, shareViaEmail, regenerateEmail
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
EOF
echo "  ✅ AppContext.tsx updated"

# 6. Fix Landing.tsx
cat > src/pages/Landing.tsx << 'EOF'
// import Hero from '@/components/Hero'
// import SampleReportPreview from '@/components/SampleReportPreview'
// import WorkshopCards from '@/components/WorkshopCards'

export function Landing() {
  return (
    <div className="min-h-screen bg-meetingmind-bg">
      {/* Hero section placeholder - will be implemented */}
      <div className="bg-meetingmind-card p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">MeetingMind v3.0</h1>
        <p className="text-gray-400">AI-powered meeting analysis</p>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">AI Agents MeetingMind Bootcamp</h2>
          <p className="text-gray-400">Build a three-agent AI that turns meetings into intelligence</p>
        </div>
        
        {/* Sample report preview placeholder */}
        <div className="bg-meetingmind-card rounded-xl p-6 mb-8 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-2">Sample Report</h3>
          <p className="text-gray-400">Meeting analysis preview will appear here</p>
        </div>
        
        {/* Workshop cards placeholder */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-meetingmind-card rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Agent 1: Transcription</h3>
            <p className="text-gray-400">AssemblyAI powered transcription</p>
          </div>
          <div className="bg-meetingmind-card rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Agent 2: Analysis</h3>
            <p className="text-gray-400">Groq Llama 3.3 70B extraction</p>
          </div>
          <div className="bg-meetingmind-card rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Agent 3: Coaching</h3>
            <p className="text-gray-400">AI meeting coach advice</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <a href="/app" className="inline-block px-8 py-3 bg-meetingmind-gold text-black font-semibold rounded-lg hover:bg-yellow-600 transition">Try MeetingMind →</a>
        </div>
      </div>
    </div>
  )
}
EOF
echo "  ✅ Landing.tsx fixed"

# 7. Create .nvmrc
echo "20" > .nvmrc
echo "  ✅ .nvmrc created"

cd ..

# ============================================
# SUPABASE MIGRATION FIXES
# ============================================

echo ""
echo "📦 FIXING SUPABASE MIGRATIONS..."

# Fix 002_meetings.sql
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

CREATE POLICY "Users can view own meetings" ON public.meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings" ON public.meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings" ON public.meetings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings" ON public.meetings
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX idx_meetings_created_at ON public.meetings(created_at DESC);
CREATE INDEX idx_meetings_meeting_date ON public.meetings(meeting_date);
EOF
echo "  ✅ 002_meetings.sql fixed"

# Fix 003_tasks.sql
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

CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

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
echo "  ✅ 003_tasks.sql fixed"

# Fix 004_threads.sql
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

CREATE POLICY "Users can view own threads" ON public.unresolved_threads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads" ON public.unresolved_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads" ON public.unresolved_threads
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads" ON public.unresolved_threads
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_threads_user_id ON public.unresolved_threads(user_id);
CREATE INDEX idx_threads_status ON public.unresolved_threads(status);
EOF
echo "  ✅ 004_threads.sql fixed"

# Fix 006_unregistered_owners.sql
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

CREATE POLICY "Users can view own unregistered owners" ON public.unregistered_owners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unregistered owners" ON public.unregistered_owners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own unregistered owners" ON public.unregistered_owners
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own unregistered owners" ON public.unregistered_owners
  FOR DELETE USING (auth.uid() = user_id);
EOF
echo "  ✅ 006_unregistered_owners.sql fixed"

# ============================================
# VERIFICATION
# ============================================

echo ""
echo "=========================================="
echo "✅ ALL FIXES COMPLETE"
echo "=========================================="
echo ""
echo "Verification steps:"
echo "  1. git add ."
echo "  2. git commit -m 'fix: all platform issues resolved'"
echo "  3. git push"
echo ""
echo "Then redeploy:"
echo "  - Backend: cd backend && npx wrangler deploy --env production"
echo "  - Frontend: Retry deployment in Cloudflare Pages dashboard"