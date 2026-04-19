#!/bin/bash
set -euo pipefail

# BATCH 2: CORE UTILITIES & CONTEXTS
# Creates: lib/, contexts/, hooks/, types/

mkdir -p frontend/src/lib frontend/src/contexts frontend/src/hooks frontend/src/types

cat > frontend/src/lib/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getToken = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser()
  return data.user
}
EOF

cat > frontend/src/lib/api.ts << 'EOF'
import axios from 'axios'
import { getToken } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
EOF

cat > frontend/src/lib/utils.ts << 'EOF'
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high': return '#ff4d4d'
    case 'medium': return '#f59e0b'
    case 'low': return '#00e676'
    default: return '#6b7fa3'
  }
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return '#00e676'
    case 'pending': return '#f59e0b'
    case 'overdue': return '#ff4d4d'
    default: return '#6b7fa3'
  }
}

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
EOF

cat > frontend/src/contexts/AuthContext.tsx << 'EOF'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
EOF

cat > frontend/src/contexts/AppContext.tsx << 'EOF'
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

cat > frontend/src/hooks/useAuth.ts << 'EOF'
import { useAuth } from '@/contexts/AuthContext'
export { useAuth }
EOF

cat > frontend/src/hooks/useTasks.ts << 'EOF'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export const useTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks')
      setTasks(response.data.tasks)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: string) => {
    try {
      await api.put(`/tasks/${taskId}/complete`)
      await fetchTasks()
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return { tasks, loading, completeTask, refetch: fetchTasks }
}
EOF

cat > frontend/src/hooks/useMeetings.ts << 'EOF'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export const useMeetings = (limit: number = 10) => {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings', { params: { limit } })
      setMeetings(response.data.meetings)
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [limit])

  return { meetings, loading, refetch: fetchMeetings }
}
EOF

cat > frontend/src/hooks/useLocalStorage.ts << 'EOF'
import { useState, useEffect } from 'react'

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

cat > frontend/src/types/meeting.ts << 'EOF'
export interface Meeting {
  id: string
  title: string
  meeting_date: string
  duration_minutes: number
  summary: string
  decisions: string[]
  action_items: ActionItem[]
  open_questions: string[]
  parking_lot: string[]
  key_topics: string[]
  key_quotes: Quote[]
  sentiment: string
  sentiment_reason: string
  effectiveness_score: number
  effectiveness_reason: string
  next_agenda: string[]
  risk_flags: string[]
  meeting_type: string
  confidence_score: number
  talk_time: Record<string, TalkTimeData>
  created_at: string
}

export interface ActionItem {
  task: string
  owner: string
  deadline: string
  priority: string
}

export interface Quote {
  speaker: string
  quote: string
}

export interface TalkTimeData {
  minutes: number
  percentage: number
}
EOF

cat > frontend/src/types/task.ts << 'EOF'
export interface Task {
  id: string
  title: string
  description?: string
  owner_name: string
  owner_user_id?: string
  due_date?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'archived'
  completed_at?: string
  completion_notes?: string
  parent_task_id?: string
  depends_on_task_id?: string
  meeting_id?: string
  meeting_title?: string
  created_at: string
}
EOF

cat > frontend/src/types/api.ts << 'EOF'
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}
EOF

echo "✅ Batch 2 complete (13 files: lib, contexts, hooks, types)"