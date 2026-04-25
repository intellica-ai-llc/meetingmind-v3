-- Intelligence patterns (pre-computed per user)
CREATE TABLE IF NOT EXISTS public.intelligence_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avg_effectiveness REAL,
  decision_velocity REAL,
  sentiment_trend TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.intelligence_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own patterns" ON public.intelligence_patterns
  FOR SELECT USING (auth.uid() = user_id);

-- Intelligence risks (aggregated risk frequency)
CREATE TABLE IF NOT EXISTS public.intelligence_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_frequency JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.intelligence_risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own risks" ON public.intelligence_risks
  FOR SELECT USING (auth.uid() = user_id);

-- Calendar events for auto-ingestion
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_google_id TEXT,
  processed BOOLEAN DEFAULT false,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own calendar events" ON public.calendar_events
  FOR SELECT USING (auth.uid() = user_id);

-- Slack configurations
CREATE TABLE IF NOT EXISTS public.slack_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_webhook_url TEXT,
  notify_on_completion BOOLEAN DEFAULT true
);

ALTER TABLE public.slack_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own slack config" ON public.slack_configs
  FOR SELECT USING (auth.uid() = user_id);