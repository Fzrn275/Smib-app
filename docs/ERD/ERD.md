# Entity Relationship Diagram (ERD)
# Sarawak Maker-In-A-Box (S-MIB)
# Version 1.1

---

## 1. Overview

This document defines the complete database schema for S-MIB. Every table,
column, data type, constraint, and relationship is specified here. The schema
is designed to mirror the OOP class structure defined in `/docs/Models_explained.md`
and to support all features listed in `/docs/PRD.md`.

The database is hosted on Supabase (PostgreSQL). All tables live in the
`public` schema. There are **12 tables** in total.

---

## 2. Design Principles

### 2.1 OOP Mirroring
The database structure intentionally reflects the OOP class hierarchy:
- `users` maps to the `User` base class
- `creators` extends `users` — mirrors `Creator extends User`
- `certificates` references `achievements` — mirrors `Certificate extends Achievement`
- `steps` and `materials` use `ON DELETE CASCADE` — mirrors composition
- `progress` and `achievements` use standard foreign keys — mirrors association
- `step_submissions` records each step completion — mirrors the action of `Progress.completeStep()`

### 2.2 Role-Based Access
A single `users` table handles all user types. The `role` field determines
what data each user can access. Supabase Row Level Security (RLS) policies
enforce this at the database level in production.

### 2.3 Scalability
UUIDs are used as primary keys throughout. This supports distributed inserts
and future horizontal scaling without ID collision. Timestamps use `TIMESTAMPTZ`
for timezone-aware storage, important for multi-district reporting.

---

## 3. Table Definitions

### 3.1 users

The base table for every person in the system. Mirrors the `User` OOP base class.
The `xp` and `level` columns power the gamification system (home screen XP bar,
leaderboard rankings).

```sql
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
```

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `name` | VARCHAR | Display name |
| `email` | VARCHAR UNIQUE | Login identifier |
| `password_hash` | VARCHAR | Managed by Supabase Auth |
| `role` | VARCHAR | Determines access level |
| `grade_level` | VARCHAR | e.g. "Year 5", "Form 3" — nullable for non-students |
| `school_name` | VARCHAR | Used for leaderboard grouping |
| `district` | VARCHAR | Used for future district-level reporting |
| `avatar_url` | VARCHAR | Optional profile photo |
| `xp` | INTEGER | Total XP earned — drives level calculation |
| `level` | INTEGER | Current level (1–10), updated when XP threshold is crossed |

---

### 3.2 creators

Extends `users` for content creators. Mirrors `Creator extends User`.
Only users with a creator-type role have a row in this table.

```sql
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
```

| Column | Type | Notes |
|---|---|---|
| `user_id` | UUID FK | References users — CASCADE delete |
| `creator_type` | VARCHAR | Mirrors OOP subclass distinction |
| `organisation` | VARCHAR | e.g. "TEGAS", "SMK Kuching" |
| `focus_area` | VARCHAR | e.g. "Electronics", "Agriculture" |
| `is_verified` | BOOLEAN | FALSE until manually approved |
| `verified_by` | UUID FK | Admin user who approved this creator |

---

### 3.3 projects

All STEM project content. Mirrors the `Project` OOP base class.
`type` field distinguishes `GuidedProject` from `OpenProject`.
`status` replaces a simple boolean for richer state tracking (draft → in_review → published).

```sql
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
```

| Column | Type | Notes |
|---|---|---|
| `creator_id` | UUID FK | SET NULL if creator is deleted — projects persist |
| `type` | VARCHAR | `guided` = GuidedProject, `open` = OpenProject |
| `instruction_level` | VARCHAR | GuidedProject only |
| `estimated_duration` | INTEGER | Minutes — GuidedProject only |
| `creativity_score` | INTEGER | OpenProject only — awarded by creator |
| `status` | VARCHAR | `draft` → `in_review` → `published` lifecycle |
| `tags` | VARCHAR[] | Array of keyword tags for search and category filtering |
| `cover_image_url` | VARCHAR | URL to project thumbnail in Supabase Storage `project-thumbnails` bucket |

---

### 3.4 steps

Individual instructions within a project. Each step has a title and full
instructions as separate fields. Composition relationship — deleted
automatically when parent project is deleted.

```sql
CREATE TABLE steps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title       VARCHAR(200) NOT NULL,
  instructions TEXT NOT NULL,
  image_ref   VARCHAR(500),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| `project_id` | UUID FK | CASCADE — step deleted with project |
| `step_number` | INTEGER | Determines display order |
| `title` | VARCHAR | Short step name shown in step list and Step Detail header |
| `instructions` | TEXT | Full instruction body shown on Step Detail screen |
| `image_ref` | VARCHAR | Optional — path or URL to step image |

---

### 3.5 materials

Physical items required for a project. Composition relationship —
deleted automatically when parent project is deleted.

```sql
CREATE TABLE materials (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  is_recyclable BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| `project_id` | UUID FK | CASCADE — material deleted with project |
| `is_recyclable` | BOOLEAN | Supports sustainability filtering |

---

### 3.6 progress

Tracks how far a student has gone through a project. `current_step` and
`progress_pct` are kept in sync by the app whenever a step is marked done.
Association — both student and project can exist independently.

```sql
CREATE TABLE progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id       UUID REFERENCES projects(id) ON DELETE CASCADE,
  completed_steps  INTEGER[] DEFAULT '{}',
  current_step     INTEGER DEFAULT 1,
  progress_pct     NUMERIC(5,2) DEFAULT 0.00,
  is_completed     BOOLEAN DEFAULT FALSE,
  enrolled_at      TIMESTAMPTZ DEFAULT NOW(),
  last_updated     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, project_id)
);
```

| Column | Type | Notes |
|---|---|---|
| `student_id` | UUID FK | CASCADE — progress removed if student deleted |
| `project_id` | UUID FK | CASCADE — progress removed if project deleted |
| `completed_steps` | INTEGER[] | Array of completed step numbers e.g. {1,2,3} |
| `current_step` | INTEGER | The next step the student needs to do |
| `progress_pct` | NUMERIC | Percentage completion — shown on project cards and Project Detail |
| `UNIQUE` constraint | — | Prevents duplicate enrolment |

---

### 3.7 step_submissions

Records each step completion by a student. Stores the proof photo URL and
XP awarded for that step. This is what gets created when a student taps
"Mark Step Done" on the Step Detail screen. Mirrors the action of
`Progress.completeStep()` in the OOP layer.

```sql
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
```

| Column | Type | Notes |
|---|---|---|
| `student_id` | UUID FK | CASCADE — submissions removed if student deleted |
| `step_id` | UUID FK | CASCADE — submissions removed if step deleted |
| `project_id` | UUID FK | Redundant but useful for efficient per-project queries |
| `photo_url` | VARCHAR | Supabase Storage URL — `proof-photos` bucket — nullable if no photo taken |
| `caption` | TEXT | Optional student note about the submission |
| `xp_awarded` | INTEGER | How much XP was given for this step completion |

---

### 3.8 achievements

Badges awarded to students for milestones. Association — linked to
student but independent. Mirrors the `Achievement` OOP class.

```sql
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
```

| Column | Type | Notes |
|---|---|---|
| `type` | VARCHAR | `badge` = Achievement, `certificate` = Certificate |
| `trigger_type` | VARCHAR | e.g. "first_project", "streak_7", "category_complete" |

---

### 3.9 certificates

Verifiable certificates that extend achievements. Mirrors
`Certificate extends Achievement` OOP relationship.

```sql
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
```

| Column | Type | Notes |
|---|---|---|
| `achievement_id` | UUID FK | CASCADE — cert deleted if achievement deleted |
| `cert_type` | VARCHAR | Type of certificate earned |
| `verification_code` | VARCHAR UNIQUE | For external verification of authenticity |
| `issued_by` | VARCHAR | Future: could be "TEGAS" or official body name |

---

### 3.10 streaks

Daily activity tracking per student. One row per student — updated
on each app open. Supports feature F09.

```sql
CREATE TABLE streaks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak   INTEGER DEFAULT 0,
  longest_streak   INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| `student_id` | UUID FK UNIQUE | One streak record per student |
| `current_streak` | INTEGER | Resets to 0 if a day is missed |
| `longest_streak` | INTEGER | All-time personal best |
| `last_active_date` | DATE | Used to calculate if streak is broken |

---

### 3.11 parent_student_links

Links a parent user to their child student account. Without this table
a parent has no way to know which student's data belongs to their child.
One parent can be linked to multiple children. One child can have multiple
parents linked (e.g. two guardians).

```sql
CREATE TABLE parent_student_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  student_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);
```

| Column | Type | Notes |
|---|---|---|
| `parent_id` | UUID FK | Must be a user with role `'parent'` |
| `student_id` | UUID FK | Must be a user with a learner role |
| `UNIQUE` constraint | — | Prevents duplicate links |

---

### 3.12 notifications

Stores in-app notifications for all users. Triggered when XP is awarded,
badges are earned, or streaks need reminding. Displayed in the `s-notif` screen.

```sql
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
```

| Column | Type | Notes |
|---|---|---|
| `user_id` | UUID FK | References users — CASCADE delete |
| `type` | VARCHAR | Drives icon and colour in notifications screen |
| `is_read` | BOOLEAN | Default FALSE — updated when user views notification |

---

## 4. Relationship Summary

| Relationship | Type | FK Behaviour |
|---|---|---|
| users → creators | One to one (optional) | CASCADE |
| creators → projects | One to many | SET NULL |
| projects → steps | One to many | CASCADE (composition) |
| projects → materials | One to many | CASCADE (composition) |
| users → progress | One to many | CASCADE |
| projects → progress | One to many | CASCADE |
| users → step_submissions | One to many | CASCADE |
| steps → step_submissions | One to many | CASCADE |
| users → achievements | One to many | CASCADE |
| achievements → certificates | One to one | CASCADE |
| users → streaks | One to one | CASCADE |
| parent → student | Many to many | CASCADE (via parent_student_links) |
| users → notifications | One to many | CASCADE |

---

## 5. Cardinality Reference

| Relationship | Cardinality | Meaning |
|---|---|---|
| user → creator | 1 to 0..1 | A user may or may not be a creator |
| creator → projects | 1 to many | A creator can make many projects |
| project → steps | 1 to many | A project has many steps |
| project → materials | 1 to many | A project requires many materials |
| student → progress | 1 to many | A student tracks many projects |
| project → progress | 1 to many | A project is tracked by many students |
| student → step_submissions | 1 to many | A student can submit many steps |
| step → step_submissions | 1 to many | A step can be submitted by many students |
| student → achievements | 1 to many | A student earns many achievements |
| achievement → certificate | 1 to 0..1 | Only cert-type achievements have a certificate |
| student → streaks | 1 to 1 | Each student has exactly one streak record |
| parent → student | many to many | A parent can have multiple children; a child can have multiple parents |
| user → notifications | 1 to many | A user can receive many notifications |

---

## 6. OOP to Database Mapping

| OOP Class | Database Table | Relationship Type |
|---|---|---|
| `User` | `users` | Direct mapping |
| `Student` / `JuniorLearner` / `SeniorLearner` | `users` (role field) | Role discriminator |
| `Creator` / `VerifiedCreator` / `ContentMentor` | `users` + `creators` | Table extension |
| `Project` / `GuidedProject` / `OpenProject` | `projects` (type field) | Type discriminator |
| `Step` | `steps` | Composition — CASCADE |
| `Material` | `materials` | Composition — CASCADE |
| `Progress` | `progress` | Association |
| `Progress.completeStep()` action | `step_submissions` | Records each step completion |
| `Achievement` | `achievements` | Association |
| `Certificate` | `certificates` | Extends achievements |
| Parent role | `users` + `parent_student_links` | Role + link table |

---

## 7. Indexes

Recommended indexes for query performance:

```sql
CREATE INDEX idx_progress_student          ON progress(student_id);
CREATE INDEX idx_progress_project          ON progress(project_id);
CREATE INDEX idx_step_submissions_student  ON step_submissions(student_id);
CREATE INDEX idx_step_submissions_step     ON step_submissions(step_id);
CREATE INDEX idx_achievements_student      ON achievements(student_id);
CREATE INDEX idx_certificates_student      ON certificates(student_id);
CREATE INDEX idx_projects_creator          ON projects(creator_id);
CREATE INDEX idx_projects_difficulty       ON projects(difficulty);
CREATE INDEX idx_projects_category         ON projects(category);
CREATE INDEX idx_projects_status           ON projects(status);
CREATE INDEX idx_steps_project             ON steps(project_id, step_number);
CREATE UNIQUE INDEX idx_streaks_student    ON streaks(student_id);
CREATE INDEX idx_parent_links_parent       ON parent_student_links(parent_id);
CREATE INDEX idx_parent_links_student      ON parent_student_links(student_id);
CREATE INDEX idx_notifications_user        ON notifications(user_id);
CREATE INDEX idx_notifications_unread      ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_users_xp                  ON users(xp DESC);
```

---

## 8. Supabase Setup Instructions

Run the table definitions from Section 3 in this exact order in the
Supabase SQL Editor (order matters due to foreign key dependencies):

1. `users`
2. `creators`
3. `projects`
4. `steps`
5. `materials`
6. `progress`
7. `step_submissions`
8. `achievements`
9. `certificates`
10. `streaks`
11. `parent_student_links`
12. `notifications`

Then run the indexes from Section 7.

The complete runnable SQL script is in `/database/smib_schema.sql`.

---

*Document version 1.1 — renamed proof_photos to step_submissions (aligned with SQL schema),*
*added xp and level columns to users table, added steps.title and steps.instructions columns,*
*added progress.current_step and progress.progress_pct columns, updated table count to 12.*
*Part of the S-MIB documentation suite: PRD · ERD · Architecture · Style Guide · Wireframes · SRS · DFD*
