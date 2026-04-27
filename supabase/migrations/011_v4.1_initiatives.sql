-- Initiatives
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy','at_risk','critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own initiatives" ON initiatives
  FOR ALL USING (auth.uid() = user_id);

-- Initiative Memberships (links meetings, tasks, threads)
CREATE TABLE initiative_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES unresolved_threads(id) ON DELETE CASCADE,
  CHECK ( (meeting_id IS NOT NULL AND task_id IS NULL AND thread_id IS NULL) OR
          (task_id IS NOT NULL AND meeting_id IS NULL AND thread_id IS NULL) OR
          (thread_id IS NOT NULL AND meeting_id IS NULL AND task_id IS NULL) )
);
ALTER TABLE initiative_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage memberships for own initiatives" ON initiative_memberships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM initiatives WHERE initiatives.id = initiative_memberships.initiative_id AND initiatives.user_id = auth.uid())
  );

-- Initiative Health Snapshots (for timeline charts)
CREATE TABLE initiative_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  avg_effectiveness REAL,
  open_tasks_count INT,
  unresolved_threads_count INT,
  risk_frequency JSONB,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(initiative_id, snapshot_date)
);
ALTER TABLE initiative_health_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view health for own initiatives" ON initiative_health_snapshots
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM initiatives WHERE initiatives.id = initiative_health_snapshots.initiative_id AND initiatives.user_id = auth.uid())
  );

-- Foreign key columns on existing tables
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS initiative_id UUID REFERENCES initiatives(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS initiative_id UUID REFERENCES initiatives(id) ON DELETE SET NULL;
ALTER TABLE unresolved_threads ADD COLUMN IF NOT EXISTS initiative_id UUID REFERENCES initiatives(id) ON DELETE SET NULL;