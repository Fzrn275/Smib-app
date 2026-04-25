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
                  'content_mentor',
                  'parent'
                )) NOT NULL,
  grade_level   VARCHAR(20),
  school_name   VARCHAR(150),
  district      VARCHAR(100),
  avatar_url    VARCHAR(500),
  xp            INTEGER DEFAULT 0,
  level         INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATORS
CREATE TABLE creators (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  creator_type VARCHAR(30) CHECK (creator_type IN (
                  'creator',
                  'verified_creator',
                  'content_mentor'
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
CREATE INDEX idx_users_xp                 ON users(xp DESC);
