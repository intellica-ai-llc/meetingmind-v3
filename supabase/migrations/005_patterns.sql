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
