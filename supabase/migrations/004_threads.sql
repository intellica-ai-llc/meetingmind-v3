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
