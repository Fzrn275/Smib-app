# SUPABASE SETUP GUIDE
## S-MIB — Sarawak Maker-In-A-Box
### How to deploy the database schema to Supabase

---

## Before You Start

You need:
- Your Supabase project open at [supabase.com](https://supabase.com)
- The file `smib_schema.sql` ready to paste
- 5 minutes

Your Supabase project ID is: `wwqzqwcekwhgmcetbtkw`

---

## PART 1 — Remove the Previous Schema

If you ran the old schema before, you need to drop everything first.
This deletes all existing tables and data cleanly.

### Step 1 — Open the SQL Editor

1. Go to your Supabase dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2 — Paste and run this DROP script

Copy this entire block and paste it into the SQL Editor, then click **Run**.

```sql
-- ============================================================
-- S-MIB DROP SCRIPT
-- Removes all previous tables safely in reverse FK order
-- Run this BEFORE running the new schema
-- ============================================================

DROP TABLE IF EXISTS notifications          CASCADE;
DROP TABLE IF EXISTS parent_student_links   CASCADE;
DROP TABLE IF EXISTS streaks                CASCADE;
DROP TABLE IF EXISTS step_submissions       CASCADE;
DROP TABLE IF EXISTS step_submissions           CASCADE;
DROP TABLE IF EXISTS certificates           CASCADE;
DROP TABLE IF EXISTS achievements           CASCADE;
DROP TABLE IF EXISTS progress               CASCADE;
DROP TABLE IF EXISTS materials              CASCADE;
DROP TABLE IF EXISTS steps                  CASCADE;
DROP TABLE IF EXISTS projects               CASCADE;
DROP TABLE IF EXISTS creators               CASCADE;
DROP TABLE IF EXISTS users                  CASCADE;
```

> **Why CASCADE?** It tells Postgres to also drop any dependent objects
> (indexes, foreign keys) automatically. Safe to run multiple times.

### Step 3 — Confirm it worked

After running, click the **Table Editor** in the left sidebar.
You should see no tables listed under your schema.

---

## PART 2 — Run the New Schema

### Step 4 — Open a new query

Click **New query** in the SQL Editor.

### Step 5 — Paste the schema

Open the file `smib_schema.sql` and copy the entire contents.
Paste it into the SQL Editor.

### Step 6 — Choose RLS option

When you click **Run**, Supabase may ask:

> *"Run with Row Level Security?"*

**Always choose: Run WITH RLS enabled (or just click Run normally).**

RLS does not activate automatically just from running the schema —
you are just creating the tables. RLS policies are added separately
in Part 3. The reason to keep RLS on is so your project is in the
correct security mode from the start.

### Step 7 — Run

Click **Run**. You should see:

```
Success. No rows returned.
```

### Step 8 — Verify the tables

Click **Table Editor** in the left sidebar.
You should see all 12 tables:

| # | Table |
|---|---|
| 1 | users |
| 2 | creators |
| 3 | projects |
| 4 | steps |
| 5 | materials |
| 6 | progress |
| 7 | step_submissions |
| 8 | achievements |
| 9 | certificates |
| 10 | streaks |
| 11 | parent_student_links |
| 12 | notifications |

---

## PART 3 — Enable Row Level Security

RLS is what keeps each user's data private. Without it, any logged-in
user can read and write any row in any table.

### Step 9 — Enable RLS on all tables

Open a new SQL query and run this:

```sql
-- Enable RLS on all S-MIB tables
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
```

### Step 10 — Add RLS policies

These 22 policies cover all 12 tables with no gaps.
You can either paste the contents of `smib_rls_policies.sql` directly,
or copy the block below into a new SQL query and run it all at once.

> **Note:** If you already ran a partial policy script before, some of these
> may already exist. Supabase will show an error for any duplicate — that is
> fine, just ignore it and check that all policies are visible in Step 11.

```sql
-- USERS
CREATE POLICY "users: read own" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users: update own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- CREATORS (was missing in previous guide — now fixed)
CREATE POLICY "creators: read own" ON creators
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "creators: insert own" ON creators
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- PROJECTS
CREATE POLICY "projects: read published" ON projects
  FOR SELECT USING (status = 'published');
CREATE POLICY "projects: creator reads own" ON projects
  FOR SELECT USING (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );
CREATE POLICY "projects: creator insert" ON projects
  FOR INSERT WITH CHECK (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );
CREATE POLICY "projects: creator update" ON projects
  FOR UPDATE USING (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

-- STEPS
CREATE POLICY "steps: read if published" ON steps
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE status = 'published')
  );

-- MATERIALS
CREATE POLICY "materials: read if published" ON materials
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE status = 'published')
  );

-- PROGRESS
CREATE POLICY "progress: read own" ON progress
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "progress: insert own" ON progress
  FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "progress: update own" ON progress
  FOR UPDATE USING (student_id = auth.uid());

-- STEP_SUBMISSIONS
CREATE POLICY "step_submissions: read own" ON step_submissions
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "step_submissions: insert own" ON step_submissions
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- ACHIEVEMENTS
CREATE POLICY "achievements: read own" ON achievements
  FOR SELECT USING (student_id = auth.uid());

-- CERTIFICATES
CREATE POLICY "certificates: read own" ON certificates
  FOR SELECT USING (student_id = auth.uid());

-- STREAKS
CREATE POLICY "streaks: read own" ON streaks
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "streaks: upsert own" ON streaks
  FOR ALL USING (student_id = auth.uid());

-- PARENT_STUDENT_LINKS
CREATE POLICY "parent_links: read own" ON parent_student_links
  FOR SELECT USING (parent_id = auth.uid());

-- NOTIFICATIONS
CREATE POLICY "notifications: read own" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications: update own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
```

After running, you should see **22 policies across 12 tables** in the Policies page.


---

## PART 4 — Verify Everything

### Step 11 — Check RLS is on

In the Supabase dashboard go to **Authentication → Policies**.
All 12 tables should show a green shield icon.

### Step 12 — Quick sanity test

Run this in a new SQL query to confirm the tables have the right columns:

```sql
-- Quick column check
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users','projects','progress','notifications')
  AND column_name IN ('xp','level','status','tags','current_step',
                      'progress_pct','is_read','cover_image_url')
ORDER BY table_name, column_name;
```

You should get back 8 rows — one for each of those key columns.

---

## PART 5 — Supabase Project Settings

### Step 13 — Get your API keys

Go to **Settings → API** in your Supabase dashboard.

You need these two values for the React Native app:

| Key | Where it goes |
|---|---|
| Project URL | `SUPABASE_URL` in your `.env` file |
| `anon` public key | `SUPABASE_ANON_KEY` in your `.env` file |

Your `.env` file (in the root of the React Native project) should look like:

```
SUPABASE_URL=https://wwqzqwcekwhgmcetbtkw.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
```

> **Never commit `.env` to GitHub.** Make sure `.env` is in your
> `.gitignore` file.

### Step 14 — Enable Email Auth

Go to **Authentication → Providers**.
Make sure **Email** is enabled.
You can disable email confirmation for development (turn off "Confirm email").

---

## PART 6 — Storage Buckets

The app uses Supabase Storage for two types of files.
You need to create these buckets manually.

### Step 15 — Create storage buckets

Go to **Storage** in the left sidebar, then click **New bucket** for each:

| Bucket name | Public? | Purpose |
|---|---|---|
| `proof-photos` | ❌ Private | Student project completion photos |
| `project-thumbnails` | ✅ Public | Project cover images uploaded by creators |
| `avatars` | ✅ Public | User profile photos |

---

## Summary Checklist

Run through this before starting Claude Code:

- [ ] Old tables dropped (Part 1)
- [ ] New schema runs with no errors (Part 2)
- [ ] All 12 tables visible in Table Editor (Part 2 Step 8)
- [ ] RLS enabled on all 12 tables (Part 3 Step 9)
- [ ] Basic RLS policies added (Part 3 Step 10)
- [ ] Sanity test returns 8 rows (Part 4 Step 12)
- [ ] `.env` file created with Supabase URL + anon key (Part 5)
- [ ] Email auth enabled in Supabase dashboard (Part 5 Step 14)
- [ ] 3 storage buckets created (Part 6)

---

*S-MIB Database Setup Guide · CSS3133 OOP · BCS25020024 · UTS*
