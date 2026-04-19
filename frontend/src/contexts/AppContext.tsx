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
