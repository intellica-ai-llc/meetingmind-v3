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
