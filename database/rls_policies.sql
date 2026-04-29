-- =============================================================
-- S-MIB ROW LEVEL SECURITY POLICIES
-- Sarawak Maker-In-A-Box
--
-- Run this in the Supabase SQL Editor AFTER smib_schema.sql.
-- Required if your Supabase project has "Secure by Default" enabled
-- (any project created after mid-2024 may have this on).
--
-- How to check if you need this:
--   1. Open Supabase Dashboard → Table Editor → users table
--   2. If the lock icon is on, RLS is active — run this file.
--   3. If you see data in the Table Editor but the app can't read it,
--      RLS is active without policies — run this file.
-- =============================================================

-- ─── ENABLE RLS ──────────────────────────────────────────────────────────────

ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators             ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps                ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials            ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress             ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_submissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;

-- ─── USERS ───────────────────────────────────────────────────────────────────

-- Each user can read their own profile row
CREATE POLICY "users_own_read" ON users
  FOR SELECT USING (auth.uid() = id);

-- Authenticated users can read learner profiles (leaderboard, parent view, creator join)
CREATE POLICY "users_learners_read" ON users
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND role IN ('junior_learner', 'senior_learner')
  );

-- Users insert their own row during signup (auth.uid() must match the id they insert)
CREATE POLICY "users_own_insert" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile fields (name, school, avatar, etc.)
CREATE POLICY "users_own_update" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ─── CREATORS ────────────────────────────────────────────────────────────────

-- Any authenticated user can read creator profiles (shown on ProjectDetailScreen)
CREATE POLICY "creators_read" ON creators
  FOR SELECT USING (auth.role() = 'authenticated');

-- Creators can insert and update their own creator row
CREATE POLICY "creators_own_insert" ON creators
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "creators_own_update" ON creators
  FOR UPDATE USING (user_id = auth.uid());

-- ─── PROJECTS ────────────────────────────────────────────────────────────────

-- Any authenticated user can read published projects (ExploreScreen, HomeScreen)
CREATE POLICY "projects_published_read" ON projects
  FOR SELECT USING (
    status = 'published'
    AND auth.role() = 'authenticated'
  );

-- Creators can read all their own projects (all statuses, for dashboard/editor)
CREATE POLICY "projects_creator_read" ON projects
  FOR SELECT USING (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

-- Creators can insert, update, and delete their own projects
CREATE POLICY "projects_creator_write" ON projects
  FOR INSERT WITH CHECK (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

CREATE POLICY "projects_creator_update" ON projects
  FOR UPDATE USING (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

CREATE POLICY "projects_creator_delete" ON projects
  FOR DELETE USING (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

-- ─── STEPS ───────────────────────────────────────────────────────────────────

-- Authenticated users can read steps of published projects
CREATE POLICY "steps_published_read" ON steps
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE status = 'published')
    AND auth.role() = 'authenticated'
  );

-- Creators can read steps of their own projects (all statuses, for editing)
CREATE POLICY "steps_creator_read" ON steps
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN creators c ON c.id = p.creator_id
      WHERE c.user_id = auth.uid()
    )
  );

-- Creators can manage steps of their own projects
CREATE POLICY "steps_creator_write" ON steps
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN creators c ON c.id = p.creator_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "steps_creator_update" ON steps
  FOR UPDATE USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN creators c ON c.id = p.creator_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "steps_creator_delete" ON steps
  FOR DELETE USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN creators c ON c.id = p.creator_id
      WHERE c.user_id = auth.uid()
    )
  );

-- ─── MATERIALS ───────────────────────────────────────────────────────────────

-- Same access pattern as steps
CREATE POLICY "materials_published_read" ON materials
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE status = 'published')
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "materials_creator_read" ON materials
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN creators c ON c.id = p.creator_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "materials_creator_write" ON materials
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN creators c ON c.id = p.creator_id
      WHERE c.user_id = auth.uid()
    )
  );

-- ─── PROGRESS ────────────────────────────────────────────────────────────────

-- Students can fully manage their own progress rows
CREATE POLICY "progress_own_all" ON progress
  FOR ALL USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Parents can read linked children's progress
CREATE POLICY "progress_parent_read" ON progress
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

-- Creators can read aggregate progress for their projects (analytics)
CREATE POLICY "progress_creator_read" ON progress
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN creators c ON c.id = p.creator_id
      WHERE c.user_id = auth.uid()
    )
  );

-- ─── STEP_SUBMISSIONS ────────────────────────────────────────────────────────

-- Students can fully manage their own submissions
CREATE POLICY "submissions_own_all" ON step_submissions
  FOR ALL USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Parents can read linked children's submissions (activity feed)
CREATE POLICY "submissions_parent_read" ON step_submissions
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

-- ─── ACHIEVEMENTS ────────────────────────────────────────────────────────────

-- Students can read their own achievements
CREATE POLICY "achievements_own_read" ON achievements
  FOR SELECT USING (student_id = auth.uid());

-- Achievement service inserts on behalf of the authenticated student
CREATE POLICY "achievements_own_insert" ON achievements
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Parents can read linked children's achievements
CREATE POLICY "achievements_parent_read" ON achievements
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

-- ─── CERTIFICATES ────────────────────────────────────────────────────────────

-- Students can read their own certificates
CREATE POLICY "certificates_own_read" ON certificates
  FOR SELECT USING (student_id = auth.uid());

-- Certificate service inserts on behalf of the authenticated student
CREATE POLICY "certificates_own_insert" ON certificates
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Parents can read linked children's certificates
CREATE POLICY "certificates_parent_read" ON certificates
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

-- ─── STREAKS ─────────────────────────────────────────────────────────────────

-- Students can fully manage their own streak row
CREATE POLICY "streaks_own_all" ON streaks
  FOR ALL USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Parents can read linked children's streaks
CREATE POLICY "streaks_parent_read" ON streaks
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

-- ─── PARENT_STUDENT_LINKS ────────────────────────────────────────────────────

-- Parents can manage their own child links
CREATE POLICY "links_parent_all" ON parent_student_links
  FOR ALL USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Students can see who has linked to them
CREATE POLICY "links_student_read" ON parent_student_links
  FOR SELECT USING (student_id = auth.uid());

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

-- Users can read their own notifications
CREATE POLICY "notifications_own_read" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can mark their own notifications as read
CREATE POLICY "notifications_own_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Any authenticated user can insert notifications (progressService, achievementService)
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
