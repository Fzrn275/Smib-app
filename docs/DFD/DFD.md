# Data Flow Diagram (DFD)
# Sarawak Maker-In-A-Box (S-MIB)
# Version 1.0

---

## Document Information

| Field | Detail |
|---|---|
| Document | Data Flow Diagram |
| Product | Sarawak Maker-In-A-Box (S-MIB) |
| Version | 1.0 |
| Status | Active |
| Lead Developer | Fazrin Ezan Darwish Bin Hamzah (BCS25020024) |
| Institution | Universiti Teknologi Sarawak (UTS) |

---

## 1. Overview

A Data Flow Diagram (DFD) shows how data moves through a system — who sends it,
where it goes, what processes it, and where it ends up. It does not show code
logic or UI design; it shows information flow.

S-MIB has four types of actors that interact with data:

| Symbol | Meaning | Examples in S-MIB |
|---|---|---|
| Rectangle | External entity — a person or system outside our app | Learner, Creator, Parent, Claude API, Supabase Auth |
| Rounded rectangle | Process — something the app does to data | Authenticate User, Award XP, Generate Certificate |
| Open rectangle / two parallel lines | Data store — where data lives at rest | `users` table, `progress` table, `step_submissions` table |
| Arrow | Data flow — data moving from one place to another | Login request, XP update, AI response |

---

## 2. Level 0 DFD — Context Diagram

The context diagram shows S-MIB as a single system with all external actors
and the high-level data flows between them.

```
                    ┌──────────────┐
                    │              │
  Login credentials │              │ Auth token + role
  ─────────────────>│              │────────────────────> Learner
  Step completion   │              │ XP update, badge, cert
  ─────────────────>│              │
  AI question       │              │ AI response
  ─────────────────>│   S-MIB      │
                    │   App        │ Project list, step content
                    │   System     │────────────────────> Creator
  New project data  │              │ Analytics data
  ─────────────────>│              │
                    │              │ Child progress data
  Parent requests   │              │────────────────────> Parent
  ─────────────────>│              │
                    │              │
                    │              │<─────────────────── Supabase Auth
                    │              │  Token validation
                    │              │
                    │              │<─────────────────── Claude API
                    │              │  AI response (via Edge Function)
                    └──────────────┘
```

**External Entities:**
- **Learner** — sends actions (login, enrolment, step completion, AI question); receives XP, badges, certificates, project content, AI responses
- **Creator** — sends project data; receives analytics, enrolment stats
- **Parent** — sends link requests; receives child progress data
- **Supabase Auth** — validates JWT tokens on every database request
- **Claude API** — receives context + question from Edge Function; returns AI response

---

## 3. Level 1 DFD — Main Processes

The Level 1 DFD breaks S-MIB into its six main processes and shows data
flows between them, external entities, and the data stores.

### Process List

| Process ID | Process Name | Description |
|---|---|---|
| P1 | Authenticate User | Handle login, registration, session |
| P2 | Manage Projects | Fetch, filter, enrol, display projects and steps |
| P3 | Track Progress | Record step completions, update XP, manage streaks |
| P4 | Award Achievements | Check triggers, create badges and certificates |
| P5 | AI Help | Send context to Edge Function, receive and display response |
| P6 | Monitor Child | Fetch linked child data for parent, display activity feed |

### Data Store List

| Store ID | Table | Key Data Held |
|---|---|---|
| DS1 | `users` | id, role, xp, level, school, district |
| DS2 | `projects` | id, title, category, difficulty, status, tags |
| DS3 | `steps` | id, project_id, step_number, title, instructions |
| DS4 | `progress` | student_id, project_id, completed_steps, progress_pct |
| DS5 | `step_submissions` | student_id, step_id, photo_url, xp_awarded |
| DS6 | `achievements` | student_id, title, type, trigger_type |
| DS7 | `certificates` | student_id, cert_type, verification_code |
| DS8 | `streaks` | student_id, current_streak, longest_streak |
| DS9 | `notifications` | user_id, type, title, is_read |
| DS10 | `parent_student_links` | parent_id, student_id |
| DS11 | `creators` | user_id, creator_type, is_verified |

---

## 4. Level 2 DFDs — Process Detail

Each process is expanded here to show its internal data flows.

---

### 4.1 P1 — Authenticate User

**Trigger:** User opens the app or submits login/register form.

```
Learner ──── email + password ────────────────────> [P1.1 Validate Credentials]
                                                            │
                                               Supabase Auth│ token or error
                                                            │
                                                    ┌───────┴────────┐
                                             error  │                │ token
                                                    ▼                ▼
                                            Show error msg    [P1.2 Load User Profile]
                                                                     │
                                                              DS1 users
                                                                     │ role, xp, level
                                                                     ▼
                                                            Store in AuthContext
                                                                     │
                                                                     ▼
                                                        Route to role home screen
```

**Data flows:**
- Learner → P1.1: `{ email, password }`
- P1.1 → Supabase Auth: credential check request
- Supabase Auth → P1.1: JWT token or error response
- P1.1 → P1.2: JWT token (on success)
- P1.2 → DS1: `SELECT * FROM users WHERE id = auth.uid()`
- DS1 → P1.2: `{ id, name, role, xp, level, school_name, avatar_url }`
- P1.2 → AuthContext: full user object stored globally

**Registration data flows (new user):**
- Learner → P1.1: `{ name, email, password, role, grade_level, school_name }`
- P1.1 → Supabase Auth: `auth.signUp()` call
- Supabase Auth → P1.1: new user UUID
- P1.1 → DS1: `INSERT INTO users (id, name, email, role, grade_level, school_name)`
- P1.1 → DS11 (if creator role): `INSERT INTO creators (user_id, creator_type)`

---

### 4.2 P2 — Manage Projects

**Trigger:** Learner opens Project List, Explore, or Project Detail screen.

```
Learner ──── filter / search query ────────────────> [P2.1 Fetch Projects]
                                                            │
                                                     DS2 projects
                                                            │ published projects list
                                                            ▼
                                                    [P2.2 Fetch Progress]
                                                            │
                                                     DS4 progress
                                                            │ progress_pct per project
                                                            ▼
                                                    [P2.3 Render Project List]
                                                            │
                                                            ▼
Learner <──── project cards (title, category, ────────────────────────────────
              difficulty, progress_pct)


Learner ──── tap project ──────────────────────────> [P2.4 Fetch Steps + Materials]
                                                            │
                                                     DS3 steps
                                                            │ step list + instructions
                                                            ▼
                                                    Cache to AsyncStorage
                                                            │
Learner <──── project detail screen ───────────────────────


Learner ──── tap Enrol ────────────────────────────> [P2.5 Create Enrolment]
                                                            │
                                                     DS4 progress
                                                            │ INSERT row
                                                            │
Learner <──── navigate to first step ──────────────────────
```

**Key data objects:**
- Project list item: `{ id, title, category, difficulty, cover_image_url, progress_pct }`
- Project detail: `{ title, creator_name, description, steps[], enrolled_count }`
- Step item: `{ step_number, title, instructions, image_ref, materials[] }`

---

### 4.3 P3 — Track Progress

**Trigger:** Learner taps "Mark Step Done" on Step Detail screen.

```
Learner ──── mark step done (step_id, photo?) ─────> [P3.1 Create Step Submission]
                                                            │
                                             ┌──────────────┴────────────┐
                                      photo? │                           │ always
                                             ▼                           ▼
                                   Upload to Storage            DS5 step_submissions
                                   proof-photos bucket          INSERT { student_id,
                                             │                    step_id, photo_url,
                                        photo_url                 xp_awarded=50 }
                                             │                           │
                                             └──────────────┬────────────┘
                                                            │
                                                            ▼
                                                    [P3.2 Update Progress]
                                                            │
                                                     DS4 progress
                                                            │ UPDATE completed_steps[],
                                                            │ current_step, progress_pct
                                                            │
                                                            ▼
                                                    [P3.3 Award XP]
                                                            │
                                                     DS1 users
                                                            │ UPDATE xp += 50
                                                            │ UPDATE level if threshold
                                                            │
                                                            ▼
                                                    [P3.4 Update Streak]
                                                            │
                                                     DS8 streaks
                                                            │ UPDATE current_streak
                                                            │ UPDATE last_active_date
                                                            │
                                                            ▼
                                                    [P3.5 Create Notification]
                                                            │
                                                     DS9 notifications
                                                            │ INSERT xp_reward notification
                                                            │
Learner <──── XP overlay (+50 XP) ─────────────────────────


                          ┌── Is project now complete? ──┐
                          │ all steps done               │
                          ▼                              ▼
                   Yes: P4 Award Achievement          No: stay on step
```

**Key data flows:**
- Step submission: `{ student_id, step_id, project_id, photo_url?, xp_awarded: 50 }`
- Progress update: `{ completed_steps: [...old, step_number], current_step: step_number + 1, progress_pct: (done/total * 100) }`
- XP update: `{ xp: old_xp + 50, level: floor(new_xp / 1000) + 1 }`

---

### 4.4 P4 — Award Achievements

**Trigger:** Called after P3 when a trigger condition is met.

```
P3 (progress update) ──── trigger event ──────────> [P4.1 Check Trigger Conditions]
                                                            │
                                                    Evaluate: first_project?
                                                    first_completion? streak_7?
                                                    streak_30? category_complete?
                                                            │
                                              trigger met? │
                                                            ▼
                                                    [P4.2 Create Achievement]
                                                            │
                                                     DS6 achievements
                                                            │ INSERT { student_id, title,
                                                            │ type, trigger_type }
                                                            │
                                              cert type? ──┤
                                                            │
                                                    [P4.3 Create Certificate]
                                                            │
                                                     DS7 certificates
                                                            │ INSERT { achievement_id,
                                                            │ cert_type, verification_code }
                                                            │
                                                    [P4.4 Create Notification]
                                                            │
                                                     DS9 notifications
                                                            │ INSERT badge_unlock notification
                                                            │
Learner <──── badge awarded / certificate earned ───────────
```

**Trigger conditions evaluated by P4.1:**

| Trigger | Condition |
|---|---|
| `first_project` | `COUNT(progress WHERE student_id = ?) = 1` (just enrolled) |
| `first_completion` | `COUNT(progress WHERE student_id = ? AND is_completed = true) = 1` |
| `streak_7` | `streaks.current_streak = 7` |
| `streak_30` | `streaks.current_streak = 30` |
| `category_complete` | All published projects in a category have `is_completed = true` |

---

### 4.5 P5 — AI Help

**Trigger:** Learner submits a message in the AI Help Chat screen.

```
Learner ──── typed message ────────────────────────> [P5.1 Build Context Payload]
                                                            │
                                               From AuthContext + navigation params:
                                               project_id, step_id, step_title,
                                               learner_name, grade_level
                                                            │
                                                            ▼
                                                    [P5.2 Call Edge Function]
                                                            │
                                                   HTTP POST to Supabase
                                                   Edge Function: ai-helper
                                                   { context + message }
                                                            │
                                                            ▼
                                           ┌────── Edge Function (server-side) ──────┐
                                           │                                          │
                                           │  Read CLAUDE_API_KEY from env            │
                                           │  Build system prompt with context        │
                                           │  POST to api.anthropic.com/v1/messages   │
                                           │                                          │
                                           └──────────────────────────────────────────┘
                                                            │
                                                   Claude API ──── AI response ────>
                                                            │
                                                    [P5.3 Display Response]
                                                            │
Learner <──── AI bubble in chat UI ─────────────────────────

Note: Message history stored in component state only.
Not written to any Supabase table (no persistence needed for current version).
```

**Context payload sent to Edge Function:**
```json
{
  "project_id": "uuid",
  "step_id": "uuid",
  "step_title": "Test output voltage",
  "learner_name": "Fazrin",
  "grade_level": "junior_learner",
  "message": "My motor is spinning but the LED is not lighting up"
}
```

---

### 4.6 P6 — Monitor Child (Parent Flow)

**Trigger:** Parent opens Parent Dashboard or Child Progress screen.

```
Parent ──── open app ──────────────────────────────> [P6.1 Fetch Linked Children]
                                                            │
                                                     DS10 parent_student_links
                                                            │ [{ student_id }]
                                                            ▼
                                                    [P6.2 Fetch Child Data]
                                                            │
                                   ┌────────────────────────┼────────────────────────┐
                                   │                        │                        │
                              DS1 users              DS4 progress               DS8 streaks
                              xp, level,             active count,              current_streak
                              school, grade           completed count
                                   │                        │                        │
                                   └────────────────────────┼────────────────────────┘
                                                            │
                                                            ▼
                                                    [P6.3 Render Child Cards]
                                                            │
Parent <──── child card (name, level, stats, ──────────────
             last active, streak)


Parent ──── tap child card ────────────────────────> [P6.4 Fetch Full Child Progress]
                                                            │
                                   ┌────────────────────────┼───────────────────────┐
                                   │                        │                       │
                              DS4 progress            DS6 achievements         DS7 certificates
                              project list            badge list               cert list
                                   │                        │                       │
                                   └────────────────────────┼───────────────────────┘
                                                            │
Parent <──── read-only Child Progress screen ───────────────


Parent ──── tap Activity tab ──────────────────────> [P6.5 Fetch Activity Feed]
                                                            │
                                   ┌────────────────────────┼───────────────────────┐
                                   │                        │                       │
                              DS5 step_submissions    DS6 achievements         DS4 progress
                              step completions        badge unlocks            new enrolments
                                   │                        │                       │
                                   └────────────────────────┼───────────────────────┘
                                                            │
                                                    Sort by timestamp
                                                            │
Parent <──── activity feed rows ────────────────────────────
```

---

## 5. Data Store Summary

For reference — a consolidated view of what data each store holds and which
processes read and write to it.

| Store | Written By | Read By |
|---|---|---|
| DS1 `users` | P1 (register), P3 (XP update) | P1, P2, P6, Leaderboard |
| DS2 `projects` | Creator (P2.5 via Creator flow) | P2 (all learner discovery) |
| DS3 `steps` | Creator (EditProject) | P2.4, P5 context, AsyncStorage |
| DS4 `progress` | P2.5 (enrol), P3.2 (step update) | P2, P3, P6 |
| DS5 `step_submissions` | P3.1 | P6.5 (activity feed), Creator analytics |
| DS6 `achievements` | P4.2 | P4, P6.4, Achievements screen |
| DS7 `certificates` | P4.3 | Achievements screen, P6.4 |
| DS8 `streaks` | P3.4 | P3, Home screen, Progress screen, P6.2 |
| DS9 `notifications` | P3.5, P4.4 | Notifications screen, bell icon badge |
| DS10 `parent_student_links` | Registration / Link Child flow | P6.1 |
| DS11 `creators` | P1 (creator registration) | Creator screens |

---

## 6. Key Design Decisions Reflected in the DFD

**Why XP is awarded server-side (P3.3):**
If the client updated `users.xp` directly, a user could modify the request
and award themselves any amount of XP. By routing XP through the Edge Function,
the server controls the award — the client only triggers the event.

**Why AI context is built client-side but sent to Edge Function (P5):**
The client knows the current project and step because it is rendering them.
Building context client-side is efficient. But sending it to the Edge Function
ensures the Claude API key never leaves the server. The client never talks to
Claude directly.

**Why step_submissions is separate from progress (P3.1 vs P3.2):**
`progress` tracks the current state (where the student is). `step_submissions`
is the historical log (what the student did, when, with what photo). Separating
them allows the Creator Analytics to show step completion funnels without
querying the progress table, and allows the Parent Activity Feed to show a
chronological history without joining multiple tables.

**Why notifications are server-triggered (P3.5, P4.4):**
Notifications in DS9 are created by server-side processes (P3 and P4) not by
the client. This ensures a notification is always created regardless of which
device the student used, and prevents duplicate notifications if the client
retries a failed request.

---

*Document version 1.0*
*Part of the S-MIB documentation suite: PRD · ERD · Architecture · Style Guide · Wireframes · SRS · DFD*
