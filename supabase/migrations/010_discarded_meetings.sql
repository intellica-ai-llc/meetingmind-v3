-- Add discarded column to meetings
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS discarded BOOLEAN DEFAULT false;

-- Index for fast filtering of active vs. discarded meetings
CREATE INDEX IF NOT EXISTS idx_meetings_discarded ON meetings (discarded);