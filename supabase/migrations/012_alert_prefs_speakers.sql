-- Alert Preferences
CREATE TABLE alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  risk_escalation_threshold INT DEFAULT 2,
  stale_thread_days INT DEFAULT 10,
  overdue_task_reminders BOOLEAN DEFAULT true,
  coach_digest_frequency TEXT DEFAULT 'weekly'
    CHECK (coach_digest_frequency IN ('never','weekly','daily')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own alert prefs" ON alert_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Speaker Profiles
CREATE TABLE speaker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  merged_aliases TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE speaker_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own speaker profiles" ON speaker_profiles
  FOR ALL USING (auth.uid() = user_id);