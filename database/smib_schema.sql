-- =============================================================
-- S-MIB DATABASE SCHEMA
-- Sarawak Maker-In-A-Box
-- Run this entire file in the Supabase SQL Editor.
-- Tables must be created in this order (foreign key dependencies).
-- =============================================================

-- 1. USERS
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(30) CHECK (role IN (
                  'junior_learner',
                  'senior_learner',
                  'creator',
                  'verified_creator',
                  'parent'
                )) NOT NULL,
  grade_level   VARCHAR(20),
  school_name   VARCHAR(150),
  district      VARCHAR(100),
  avatar_url    VARCHAR(500),
  xp            INTEGER DEFAULT 0,
  level         INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- 2. CREATORS
CREATE TABLE creators (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  creator_type VARCHAR(30) CHECK (creator_type IN (
                  'creator',
                  'verified_creator'
                )) NOT NULL,
  organisation VARCHAR(150),
  focus_area   VARCHAR(100),
  bio          TEXT,
  is_verified  BOOLEAN DEFAULT FALSE,
  verified_at  TIMESTAMPTZ,
  verified_by  UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROJECTS
CREATE TABLE projects (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id         UUID REFERENCES creators(id) ON DELETE SET NULL,
  title              VARCHAR(200) NOT NULL,
  description        TEXT,
  difficulty         VARCHAR(20) CHECK (difficulty IN (
                       'beginner', 'intermediate', 'advanced'
                     )),
  category           VARCHAR(50),
  type               VARCHAR(20) CHECK (type IN ('guided', 'open')) NOT NULL,
  instruction_level  VARCHAR(20) CHECK (instruction_level IN (
                       'simple', 'detailed', 'expert'
                     )),
  estimated_duration INTEGER,
  creativity_score   INTEGER DEFAULT 0,
  status             VARCHAR(20) CHECK (status IN (
                       'draft', 'in_review', 'published'
                     )) DEFAULT 'draft',
  tags               VARCHAR(50)[],
  cover_image_url    VARCHAR(500),
  youtube_url        VARCHAR(500),
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STEPS
CREATE TABLE steps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  step_number  INTEGER NOT NULL,
  title        VARCHAR(200) NOT NULL,
  instructions TEXT NOT NULL,
  image_ref    VARCHAR(500),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MATERIALS
CREATE TABLE materials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  is_recyclable BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROGRESS
CREATE TABLE progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  completed_steps INTEGER[] DEFAULT '{}',
  current_step    INTEGER DEFAULT 1,
  progress_pct    NUMERIC(5,2) DEFAULT 0.00,
  is_completed    BOOLEAN DEFAULT FALSE,
  enrolled_at     TIMESTAMPTZ DEFAULT NOW(),
  last_updated    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, project_id)
);

-- 7. STEP_SUBMISSIONS
CREATE TABLE step_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  step_id      UUID REFERENCES steps(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  photo_url    VARCHAR(500),
  caption      TEXT,
  xp_awarded   INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACHIEVEMENTS
CREATE TABLE achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(150) NOT NULL,
  description     TEXT,
  badge_image_ref VARCHAR(500),
  type            VARCHAR(30) CHECK (type IN (
                    'badge', 'certificate'
                  )) DEFAULT 'badge',
  trigger_type    VARCHAR(50),
  date_awarded    TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CERTIFICATES
CREATE TABLE certificates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id    UUID REFERENCES achievements(id) ON DELETE CASCADE,
  student_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  cert_type         VARCHAR(30) CHECK (cert_type IN (
                      'project_completion',
                      'category_mastery',
                      'tvet_readiness',
                      'streak'
                    )) NOT NULL,
  project_id        UUID REFERENCES projects(id) ON DELETE SET NULL,
  category          VARCHAR(50),
  verification_code VARCHAR(64) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  issued_by         VARCHAR(150) DEFAULT 'S-MIB Platform',
  issued_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STREAKS
CREATE TABLE streaks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak   INTEGER DEFAULT 0,
  longest_streak   INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PARENT_STUDENT_LINKS
CREATE TABLE parent_student_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  student_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- 12. NOTIFICATIONS
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(30) CHECK (type IN (
               'xp_reward',
               'badge_unlock',
               'leaderboard_change',
               'streak_reminder'
             )) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- INDEXES (run after all tables are created)
-- =============================================================

CREATE INDEX idx_progress_student         ON progress(student_id);
CREATE INDEX idx_progress_project         ON progress(project_id);
CREATE INDEX idx_step_submissions_student ON step_submissions(student_id);
CREATE INDEX idx_step_submissions_step    ON step_submissions(step_id);
CREATE INDEX idx_achievements_student     ON achievements(student_id);
CREATE INDEX idx_certificates_student     ON certificates(student_id);
CREATE INDEX idx_projects_creator         ON projects(creator_id);
CREATE INDEX idx_projects_difficulty      ON projects(difficulty);
CREATE INDEX idx_projects_category        ON projects(category);
CREATE INDEX idx_projects_status          ON projects(status);
CREATE INDEX idx_steps_project            ON steps(project_id, step_number);
CREATE UNIQUE INDEX idx_streaks_student   ON streaks(student_id);
CREATE INDEX idx_parent_links_parent      ON parent_student_links(parent_id);
CREATE INDEX idx_parent_links_student     ON parent_student_links(student_id);
CREATE INDEX idx_notifications_user       ON notifications(user_id);
CREATE INDEX idx_notifications_unread     ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- =============================================================
-- AUTH TRIGGER — auto-insert into public.users on signup
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, password_hash)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'junior_learner'),
    'SUPABASE_MANAGED'
  )
  ON CONFLICT (id) DO NOTHING;

  IF COALESCE(NEW.raw_user_meta_data->>'role', '') IN ('creator', 'verified_creator') THEN
    INSERT INTO public.creators (user_id, creator_type)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'creator'))
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY POLICIES
-- All tables have RLS enabled by Supabase by default.
-- These policies must be run in the Supabase SQL Editor.
-- Each block uses DROP IF EXISTS so it is safe to re-run.
-- =============================================================

-- USERS -------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read"        ON users;
DROP POLICY IF EXISTS "users_insert_own"  ON users;
DROP POLICY IF EXISTS "users_update_own"  ON users;

CREATE POLICY "users_read" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  WITH CHECK (
    id = auth.uid()
    OR auth.uid() IS NULL
  );

CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- CREATORS ----------------------------------------------------
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "creators_read"        ON creators;
DROP POLICY IF EXISTS "creators_insert_own"  ON creators;
DROP POLICY IF EXISTS "creators_update_own"  ON creators;

CREATE POLICY "creators_read" ON creators
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "creators_insert_own" ON creators
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "creators_update_own" ON creators
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- PROJECTS ----------------------------------------------------
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_read"           ON projects;
DROP POLICY IF EXISTS "projects_creator_insert" ON projects;
DROP POLICY IF EXISTS "projects_creator_update" ON projects;
DROP POLICY IF EXISTS "projects_creator_delete" ON projects;

CREATE POLICY "projects_read" ON projects
  FOR SELECT TO authenticated
  USING (
    status = 'published'
    OR creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

CREATE POLICY "projects_creator_insert" ON projects
  FOR INSERT TO authenticated
  WITH CHECK (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

CREATE POLICY "projects_creator_update" ON projects
  FOR UPDATE TO authenticated
  USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

CREATE POLICY "projects_creator_delete" ON projects
  FOR DELETE TO authenticated
  USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

-- STEPS -------------------------------------------------------
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "steps_read"  ON steps;
DROP POLICY IF EXISTS "steps_write" ON steps;

CREATE POLICY "steps_read" ON steps
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "steps_write" ON steps
  FOR ALL TO authenticated
  USING (project_id IN (
    SELECT id FROM projects
    WHERE creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  ))
  WITH CHECK (project_id IN (
    SELECT id FROM projects
    WHERE creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  ));

-- MATERIALS ---------------------------------------------------
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "materials_read"  ON materials;
DROP POLICY IF EXISTS "materials_write" ON materials;

CREATE POLICY "materials_read" ON materials
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "materials_write" ON materials
  FOR ALL TO authenticated
  USING (project_id IN (
    SELECT id FROM projects
    WHERE creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  ))
  WITH CHECK (project_id IN (
    SELECT id FROM projects
    WHERE creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  ));

-- PROGRESS ----------------------------------------------------
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "progress_read"        ON progress;
DROP POLICY IF EXISTS "progress_insert_own"  ON progress;
DROP POLICY IF EXISTS "progress_update_own"  ON progress;

-- Students read own rows; parents read linked children; creators read for their projects
CREATE POLICY "progress_read" ON progress
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR student_id IN (SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid())
    OR project_id IN (
      SELECT id FROM projects
      WHERE creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "progress_insert_own" ON progress
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

CREATE POLICY "progress_update_own" ON progress
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- STEP_SUBMISSIONS --------------------------------------------
ALTER TABLE step_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "step_submissions_own" ON step_submissions;

CREATE POLICY "step_submissions_own" ON step_submissions
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ACHIEVEMENTS ------------------------------------------------
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "achievements_read"   ON achievements;
DROP POLICY IF EXISTS "achievements_insert" ON achievements;

CREATE POLICY "achievements_read" ON achievements
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR student_id IN (SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid())
  );

CREATE POLICY "achievements_insert" ON achievements
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

-- CERTIFICATES ------------------------------------------------
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certificates_read"   ON certificates;
DROP POLICY IF EXISTS "certificates_insert" ON certificates;

CREATE POLICY "certificates_read" ON certificates
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR student_id IN (SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid())
  );

CREATE POLICY "certificates_insert" ON certificates
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

-- STREAKS -----------------------------------------------------
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "streaks_own" ON streaks;

CREATE POLICY "streaks_own" ON streaks
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- NOTIFICATIONS -----------------------------------------------
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_read"   ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;

CREATE POLICY "notifications_read" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- PARENT_STUDENT_LINKS ----------------------------------------
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parent_links_read"   ON parent_student_links;
DROP POLICY IF EXISTS "parent_links_insert" ON parent_student_links;

CREATE POLICY "parent_links_read" ON parent_student_links
  FOR SELECT TO authenticated
  USING (parent_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "parent_links_insert" ON parent_student_links
  FOR INSERT TO authenticated WITH CHECK (parent_id = auth.uid());
CREATE INDEX idx_users_xp                 ON users(xp DESC);

-- ATOMIC XP INCREMENT FUNCTION
-- Safely increments XP and recalculates level in a single DB operation.
-- Prevents race condition where two clients read the same XP value concurrently.
CREATE OR REPLACE FUNCTION public.increment_xp(p_user_id UUID, p_xp_amount INT)
RETURNS TABLE(new_xp INT, new_level INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_xp    INT;
  v_new_level INT;
BEGIN
  UPDATE users
  SET
    xp         = xp + p_xp_amount,
    level      = LEAST(FLOOR((xp + p_xp_amount) / 1000) + 1, 10),
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING xp, level INTO v_new_xp, v_new_level;

  RETURN QUERY SELECT v_new_xp, v_new_level;
END;
$$;
