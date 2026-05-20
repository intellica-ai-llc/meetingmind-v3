-- MeetingMind v5.1 – Full transcript & audio storage
CREATE TABLE IF NOT EXISTS meeting_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  full_transcript TEXT,
  named_transcript TEXT,
  utterances_json JSONB,
  audio_r2_key TEXT,
  audio_duration_seconds REAL,
  language TEXT DEFAULT 'en',
  speaker_count INTEGER,
  confidence_score REAL,
  talk_time JSONB,
  retained BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transcripts"
  ON meeting_transcripts FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM meetings WHERE id = meeting_id));

CREATE POLICY "Users insert own transcripts"
  ON meeting_transcripts FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM meetings WHERE id = meeting_id));

CREATE POLICY "Users update own transcripts"
  ON meeting_transcripts FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM meetings WHERE id = meeting_id));

CREATE INDEX idx_transcripts_meeting ON meeting_transcripts(meeting_id);
CREATE INDEX idx_transcripts_retained ON meeting_transcripts(retained);