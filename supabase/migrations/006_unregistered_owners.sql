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
