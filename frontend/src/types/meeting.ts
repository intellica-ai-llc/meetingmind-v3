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
