import React, { createContext, useContext, useState, useRef, useCallback } from 'react'
import { api } from '@/lib/api'

export type Step = 'upload' | 'recording' | 'processing' | 'name_speakers' | 'analyzing' | 'results' | 'error'

// Demo data
const DEMO_UTTERANCES = [
  { speaker: 'A', text: "Alright, let's finalise the launch plan. Target is end of next week.", start_ms: 0, end_ms: 8200, duration_ms: 8200 },
  { speaker: 'B', text: "Backend is ready. Only blocker is the payment gateway — need one more day to test the Stripe webhooks. Confident we'll be done by Wednesday.", start_ms: 8500, end_ms: 21000, duration_ms: 12500 },
  { speaker: 'C', text: "Marketing side is good. Announcement email is drafted, social posts are scheduled. Just waiting on the final feature list from Bob.", start_ms: 21300, end_ms: 33500, duration_ms: 12200 },
  { speaker: 'A', text: "Decision: we launch Friday if the gateway passes testing Wednesday. Bob owns that. Carol, send the announcement Thursday morning once Bob gives you the green light.", start_ms: 33900, end_ms: 47000, duration_ms: 13100 },
  { speaker: 'B', text: "Understood. One flag — we haven't discussed a rollback plan if something breaks post-launch. Should we park that?", start_ms: 47400, end_ms: 57800, duration_ms: 10400 },
  { speaker: 'A', text: "Good catch. Rollback plan goes to Monday's standup. For now — focus on Friday. Any other blockers?", start_ms: 58200, end_ms: 69000, duration_ms: 10800 },
]
const DEMO_SPEAKER_MAP = { A: 'Alice', B: 'Bob', C: 'Carol' }

// File validation
const MAX_MB = 25
const ALLOWED = ['.mp3', '.m4a', '.webm']

function validateFile(file: File) {
  if (!file) return 'No file selected.'
  const name = file.name.toLowerCase()
  if (!ALLOWED.some(e => name.endsWith(e))) return 'Accepted formats: MP3, M4A, WebM only.'
  if (file.size > MAX_MB * 1024 * 1024)
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max ${MAX_MB} MB.`
  return null
}

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
  // ── State ─────────────────────────────────────────────────
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

  // ── Refs ─────────────────────────────────────────────────
  const pollRef = useRef<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<number | null>(null)

  // ── Reset ────────────────────────────────────────────────
  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    if (mediaRecorderRef.current && isRecording) {
      try { mediaRecorderRef.current.stop() } catch { /* ignore */ }
    }
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

  // ── Recording timer ──────────────────────────────────────
  React.useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => setRecordingSecs(s => s + 1), 1000)
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      setRecordingSecs(0)
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }, [isRecording])

  // ── Upload Audio File ────────────────────────────────────
  const uploadAudioFile = async (file: File) => {
    setStep('processing')
    setStatusMsg('Uploading audio to AssemblyAI...')
    try {
      const form = new FormData()
      form.append('audio', file)
      const res = await api.post('/transcribe', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.error) throw new Error(res.data.error)
      setStatusMsg('Transcribing and identifying speakers... (30–90 sec)')
      startPolling(res.data.job_id)
    } catch (err: any) {
      setError(err.message || 'Upload failed. Make sure the backend is running.')
      setStep('error')
    }
  }

  // ── Polling ──────────────────────────────────────────────
  const startPolling = (id: string) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/status/${id}`)
        if (res.data.status === 'error') {
          if (pollRef.current) clearInterval(pollRef.current)
          setError('AssemblyAI transcription failed. Please try again.')
          setStep('error')
          return
        }
        if (res.data.status === 'complete') {
          if (pollRef.current) clearInterval(pollRef.current)
          setUtterances(res.data.utterances)
          setSpeakers(res.data.speakers)
          setTalkTime(res.data.talk_time || {})
          setConfidence(res.data.confidence)
          const map: Record<string, string> = {}
          res.data.speakers.forEach((s: string) => { map[s] = '' })
          setSpeakerMap(map)
          setStep('name_speakers')
        }
      } catch {
        if (pollRef.current) clearInterval(pollRef.current)
        setError('Lost connection while polling. Please try again.')
        setStep('error')
      }
    }, 3000)
  }

  // ── Run Analysis ─────────────────────────────────────────
  const runAnalysis = useCallback(async (utts: any[], spkMap: Record<string, string>) => {
    try {
      const meeting_context = { title: meetingTitle || 'Meeting', date: meetingDate }

      const transcript = utts.map(u => {
        const name = spkMap[u.speaker] || `Speaker ${u.speaker}`
        return `${name}: ${u.text}`
      }).join('\n')
      setNamedTranscript(transcript)

      setStatusMsg('Groq extracting 13 insights...')
      const r2 = await api.post('/analyze', {
        utterances: utts,
        speaker_map: spkMap,
        meeting_context,
      })
      if (r2.data.error) throw new Error(r2.data.error)
      setResults(r2.data)

      setStatusMsg('Drafting follow-up email...')
      const r3 = await api.post('/draft-email', {
        ...r2.data,
        meeting_context,
        tone: emailTone,
      })
      if (r3.data.error) throw new Error(r3.data.error)
      setEmail(r3.data.email)

      setStatusMsg('Running meeting coach...')
      try {
        const r4 = await api.post('/coach', {
          effectiveness_score: r2.data.effectiveness_score,
          effectiveness_reason: r2.data.effectiveness_reason,
          open_questions: r2.data.open_questions,
          risk_flags: r2.data.risk_flags,
          sentiment: r2.data.sentiment,
          action_items: r2.data.action_items,
          meeting_type: r2.data.meeting_type,
        })
        if (!r4.data.error) setCoachData(r4.data)
      } catch { /* coach is optional */ }

      setStep('results')
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.')
      setStep('error')
    }
  }, [meetingTitle, meetingDate, emailTone])

  // ── Start Browser Recording ──────────────────────────────
  const startBrowserRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      audioChunksRef.current = []
      const mr = new MediaRecorder(stream)
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(tr => tr.stop())
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType })
        uploadAudioFile(new File([blob], 'meeting.webm', { type: mr.mimeType }))
      }
      mediaRecorderRef.current = mr
      mr.start()
      setIsRecording(true)
      setStep('recording')
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.')
      setStep('error')
    }
  }

  // ── Handle Start Meeting (countdown then record) ─────────
  const handleStartMeeting = async () => {
    for (let i = 3; i >= 1; i--) {
      setCountdown(i)
      await new Promise(r => setTimeout(r, 1000))
    }
    setCountdown(null)
    startBrowserRecording()
  }

  // ── Handle Stop Recording ────────────────────────────────
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // ── File upload handlers ─────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setAudioFile(file)
    setFileError(file ? (validateFile(file) || '') : '')
  }

  const handleUpload = async () => {
    if (!audioFile) { setFileError('No file selected.'); return }
    const err = validateFile(audioFile)
    if (err) { setFileError(err); return }
    await uploadAudioFile(audioFile)
  }

  // ── Name confirm ─────────────────────────────────────────
  const handleNameConfirm = async () => {
    const unnamed = speakers.filter(s => !speakerMap[s]?.trim())
    if (unnamed.length > 0) {
      setError(`Please name all speakers. Missing: ${unnamed.map(s => `Speaker ${s}`).join(', ')}`)
      return
    }
    setError('')
    setStep('analyzing')
    setStatusMsg('Extracting insights...')
    await runAnalysis(utterances, speakerMap)
  }

  // ── Demo mode ────────────────────────────────────────────
  const handleDemoMode = async () => {
    setDemoMode(true)
    setSpeakers(Object.keys(DEMO_SPEAKER_MAP))
    setSpeakerMap(DEMO_SPEAKER_MAP)
    setMeetingTitle('Client Portal Launch Planning')
    const raw: Record<string, number> = {}
    let total = 0
    DEMO_UTTERANCES.forEach(u => {
      raw[u.speaker] = (raw[u.speaker] || 0) + u.duration_ms
      total += u.duration_ms
    })
    const tt: Record<string, any> = {}
    Object.entries(raw).forEach(([sp, ms]) => {
      tt[sp] = { ms, minutes: +(ms / 60000).toFixed(1), percentage: +((ms / total) * 100).toFixed(1) }
    })
    setTalkTime(tt)
    setConfidence(96.4)
    setStep('analyzing')
    setStatusMsg('Running demo analysis...')
    await runAnalysis(DEMO_UTTERANCES, DEMO_SPEAKER_MAP)
  }

  // ── Regenerate email ─────────────────────────────────────
  const regenerateEmail = async (tone: string) => {
    if (!results) return
    setRegenLoading(true)
    try {
      const res = await api.post('/draft-email', {
        ...results,
        meeting_context: { title: meetingTitle, date: meetingDate },
        tone,
      })
      if (!res.data.error) setEmail(res.data.email)
    } catch { /* keep existing */ }
    finally { setRegenLoading(false) }
  }

  // ── Copy email ───────────────────────────────────────────
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      const el = document.createElement('textarea')
      el.value = email
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // ── Download minutes ─────────────────────────────────────
  const downloadMinutes = () => {
    if (!results) return
    const lines = [
      `MEETING MINUTES — ${(meetingTitle || 'Meeting').toUpperCase()}`,
      meetingDate, '='.repeat(60), '',
      'SUMMARY', '-'.repeat(40), results.summary || '', '',
      'DECISIONS', '-'.repeat(40),
      ...(results.decisions || []).map((d: string, i: number) => `${i + 1}. ${d}`), '',
      'ACTION ITEMS', '-'.repeat(40),
      ...(results.action_items || []).map((a: any) =>
        `• ${a.task} | Owner: ${a.owner} | Deadline: ${a.deadline} | Priority: ${a.priority}`
      ), '',
      'OPEN QUESTIONS', '-'.repeat(40),
      ...(results.open_questions || []).map((q: string) => `• ${q}`), '',
      'RISK FLAGS', '-'.repeat(40),
      ...(results.risk_flags || []).map((r: string) => `⚠ ${r}`), '',
      'FOLLOW-UP EMAIL', '-'.repeat(40), email || '', '',
      '='.repeat(60), 'Generated by MeetingMind · Intellica AI',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `MeetingMind_${(meetingTitle || 'Minutes').replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Share via email ──────────────────────────────────────
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Meeting Minutes${meetingTitle ? ` — ${meetingTitle}` : ''}`)
    const body = encodeURIComponent(email || '')
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <AppContext.Provider value={{
      step, setStep,
      audioFile, setAudioFile,
      utterances, setUtterances,
      speakers, setSpeakers,
      speakerMap, setSpeakerMap,
      results, setResults,
      email, setEmail,
      error, setError,
      statusMsg, setStatusMsg,
      talkTime, setTalkTime,
      confidence, setConfidence,
      emailTone, setEmailTone,
      meetingTitle, setMeetingTitle,
      meetingDate, setMeetingDate,
      transcriptOpen, setTranscriptOpen,
      namedTranscript, setNamedTranscript,
      coachData, setCoachData,
      isRecording, setIsRecording,
      recordingSecs, setRecordingSecs,
      countdown, setCountdown,
      copied, setCopied,
      regenLoading, setRegenLoading,
      fileError, setFileError,
      demoMode, setDemoMode,
      reset,
      handleStartMeeting,
      handleStopRecording,
      handleFileChange,
      handleUpload,
      handleNameConfirm,
      handleDemoMode,
      copyEmail,
      downloadMinutes,
      shareViaEmail,
      regenerateEmail,
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