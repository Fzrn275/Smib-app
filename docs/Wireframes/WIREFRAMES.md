# WIREFRAMES.md
## S-MIB — Sarawak Maker-In-A-Box
### Screen Specifications & Navigation Reference


## 1. Overview

S-MIB (Sarawak Maker-In-A-Box) is a self-directed mobile STEM/TVET learning platform for rural Sarawak secondary school students. Learners complete project-based challenges guided by step-by-step instructions, earn XP and badges, and track their progress. Creators publish projects. Parents monitor their children. An AI helper assists stuck learners.

These wireframes cover all 29 screens across three role flows, built in React Native with Expo and Supabase, using the approved Sarawak glassmorphism style — dark gradient background, asymmetric glass cards, Nunito + Inter fonts, amber/teal/green accent palette.

### 1.1 Total Screen Count

| Role | Screens | File | Accent Colour |
|---|---|---|---|
| Auth (all roles) | 6 screens (01–06) | `WIREFRAMES_Auth.html` | — |
| Learner | 12 screens (07–18) | `WIREFRAMES_Learner.html` | Amber `#F59E0B` |
| Creator | 7 screens (19–25) | `WIREFRAMES_Creator_Parent.html` | Teal `#0E7490` |
| Parent | 4 screens (26–29) | `WIREFRAMES_Creator_Parent.html` | Green `#22C55E` |
| **Total** | **29 screens** | **3 HTML files** | |

### 1.2 Wireframe Files

| File | Screens | Description |
|---|---|---|
| `WIREFRAMES_Auth.html` | 01–06 | Login, Error State, Forgot Password, Register Step 1 (Role), Register Step 2 (Form), Success |
| `WIREFRAMES_Learner.html` | 07–18 | Home, Project List, Project Detail, Step Detail, Progress, Achievements, Certificate, AI Help, Leaderboard, Profile, Notifications, Explore |
| `WIREFRAMES_Creator_Parent.html` | 19–29 | Creator Dashboard, My Projects, Project Detail (Creator), New Project, Edit Project, Analytics, Creator Profile, Parent Dashboard, Child Progress, Activity Feed, Parent Profile |

### 1.3 Design Tokens

| Token | Value | Usage |
|---|---|---|
| Background | `#064E3B → #0E7490 → #0C4A6E → #78350F → #1A3A1A` | Full-screen gradient on every screen |
| Primary font | Nunito 800–900 | Headings, names, labels, nav tabs |
| Body font | Inter 400–700 | Body text, captions, metadata |
| Amber / Yellow | `#F59E0B` | XP bars, level badges, active nav tab |
| Teal | `#0E7490` | Creator accent, AI chip, teal cards |
| Cyan | `#67E8F9` | Active steps, AI bubbles, context chips |
| Green | `#22C55E` | Completed states, parent accent |
| Navy | `#0C1A2E` | Card backgrounds, nav pill base |
| Border radius pill | `999px` | Nav pill, chips, badges, avatars |

---

## 2. Auth Screens (01–06)

Entry point for all users. Handles login, password recovery, and role-based registration. No bottom nav bar. All screens share the Sarawak gradient background.

### 2.1 Screen Inventory

| Screen ID | Screen Name | Role | Nav Bar |
|---|---|---|---|
| `login-default` | Login — Default State | All | None |
| `login-error` | Login — Error State | All | None |
| `fp-modal` | Forgot Password Modal | All | None |
| `reg-step1-back` | Register — Step 1 (Role Selection) | New User | None |
| `reg-step2` | Register — Step 2 (Form) | New User | None |
| `reg-success` | Registration Success | New User | None |

### 2.2 Screen Descriptions

#### Screen 01 — Login (Default) `login-default`

Full-screen Sarawak gradient. S-MIB hornbill logo centred at top. Email and password input fields with glassmorphism styling. "Sign In" teal button. "Forgot password?" link triggers `fp-modal` overlay. Google SSO button below divider. Register link at bottom.

> **Supabase:** `auth.users` (Supabase Auth) + `users` (public table — role, name, school, xp, level)
>
> **Note:** Sign In and Create Account buttons should show a loading/spinner state while the Supabase auth call is in progress to prevent double-taps.

#### Screen 02 — Login (Error State) `login-error`

Same layout as Screen 01. An inline red error card appears below the input fields showing "Invalid email or password." The Sign In button remains active. Error is cleared when user edits any field.

#### Screen 03 — Forgot Password `fp-modal`

Sheet overlay slides up from bottom. Single email input field. "Send Reset Link" teal button. Dismisses via × or tap outside. On success: confirmation message replaces form.

> **Supabase:** `supabase.auth.resetPasswordForEmail()`

#### Screen 04 — Register Step 1 (Role Selection) `reg-step1-back`

Four role cards in a 2×2 grid: Learner (student icon), Creator (tools icon), Parent (family icon), Mentor (graduation icon). Tapping a card highlights it with amber border and checkmark. "Continue" button activates only when a role is selected. Role stored in local state before Step 2.

> **Note:** Mentor screens are not yet wireframed — the Mentor role is registered here but the Mentor home flow is a future phase.

#### Screen 05 — Register Step 2 (Form) `reg-step2`

Full registration form: Full Name, Email, School (text input), Grade/Form Level (dropdown: Form 1–6), Password (with show/hide toggle), Confirm Password, Terms & Conditions checkbox. "Create Account" teal button. Back button returns to Step 1. On success: navigates to `reg-success`.

> **Supabase:** `users` (role, school, grade_level)

#### Screen 06 — Registration Success `reg-success`

Celebration screen. Large animated hornbill icon, "Welcome to S-MIB!" heading, user's name displayed, role badge shown. "Start Exploring" button navigates to the appropriate home screen based on role.

### 2.3 Auth Navigation Flow

| From | Action | Goes To |
|---|---|---|
| `login-default` | Tap Sign In (valid credentials) | Role home screen |
| `login-default` | Tap Sign In (invalid credentials) | `login-error` |
| `login-default` | Tap Forgot Password | `fp-modal` overlay |
| `login-default` | Tap Register link | `reg-step1-back` |
| `login-error` | Tap Sign In (valid credentials) | Role home screen |
| `fp-modal` | Tap × or outside modal | `login-default` |
| `reg-step1-back` | Tap Continue | `reg-step2` |
| `reg-step2` | Tap ← Back | `reg-step1-back` |
| `reg-step2` | Tap Create Account (success) | `reg-success` |
| `reg-success` | Tap Start Exploring | Role home screen |

---

## 3. Learner Screens (07–18)

Core learning flow. 12 screens inside one phone frame. Bottom nav bar with 4 tabs: Home, Explore, Progress, Profile. The XP/gamification system (levels, streaks, badges, certificates) is fully represented.

### 3.1 Screen Inventory

| Screen ID | Screen Name | Role | Nav Bar |
|---|---|---|---|
| `s-home` | Learner Home | Learner | 4-tab (Home active) |
| `s-list` | Project List | Learner | 4-tab (Explore active) |
| `s-detail` | Project Detail | Learner | ← Back + AI Help |
| `s-step` | Step Detail | Learner | ← Back + Ask AI |
| `s-progress` | Progress | Learner | 4-tab (Progress active) |
| `s-achieve` | Achievements | Learner | 4-tab (Profile active) |
| `s-cert` | Certificate View | Learner | ← Back |
| `s-aichat` | AI Help Chat | Learner | ← Back |
| `s-lb` | Leaderboard | Learner | 4-tab (Profile active) |
| `s-profile` | Profile | Learner | 4-tab (Profile active) |
| `s-notif` | Notifications | Learner | ← Back |
| `s-explore` | Explore Projects | Learner | 4-tab (Explore active) |

### 3.2 Screen Descriptions

#### Screen 07 — Learner Home `s-home`

Full app header with S-MIB logo, notification bell (→ `s-notif`), avatar. Greeting, name, 12-day streak badge. Level badge and rank title. XP progress bar (620/1000 XP, amber fill with glow dot). Three stat cards: Active Projects (cyan), Done (amber), Badges (green). "My Projects" horizontal scroll with project cards (category, emoji, difficulty, progress bar). "Explore New" horizontal scroll. Bottom 4-tab nav.

> **Supabase:** `users` (xp, level), `progress` (status), `achievements` (count)

#### Screen 08 — Project List `s-list`

Back button, "All Projects" heading, search bar, filter chips (All / Electronics / Agriculture / Renewable / Coding), result count label, project list cards. Each card shows category colour thumbnail, project name, metadata (category · difficulty · steps), progress bar with percentage. Tapping navigates to `s-detail`.

#### Screen 09 — Project Detail `s-detail`

Hero image area with gradient overlay, category label, project title. Back button + AI Help button row. Creator credit (small avatar + "by Ahmad Khalil") and rating (4.9★ · 142 ratings). Progress bar showing 3/6 steps done. Steps list: completed (green checkmark), active (cyan numbered, tappable), locked (grey numbered). Continue Step button + AI shortcut button. Info note: unstarted projects show "Enrol → Start Project" instead of Continue.

> **Supabase:** `projects` (creator_id, difficulty, category), `steps` (title), `progress` (current_step, progress_pct)

#### Screen 10 — Step Detail `s-step`

Step header with back + Ask AI buttons. Six-segment progress bar (3 done green, 1 active cyan glow, 2 remaining grey). Step badge showing "Step 4 of 6 · Solar Phone Charger". Step title and instruction text. Yellow tip card (💡 contextual hint for struggling students). Materials checklist with check icons. Photo upload zone. Mark Step Done button triggers XP celebration overlay (+50 XP, Back to Project button). `finishStep()` clears step history so back returns cleanly to the project.

> **Supabase:** `steps` (instructions, materials), `step_submissions` (photo_url, completed_at), `progress` (current_step)

#### Screen 11 — Progress `s-progress`

Header with My Progress logo and XP bar. Level Journey glass card: 10-level map with completed nodes (green ✓), current node (amber glow "Level 4 — Maker Apprentice ← You"), and future nodes (grey). Streak badge (🔥 12 day streak) inline with card title. Completed Projects card with See All → button, one completed project card, "+5 more completed projects" label.

#### Screen 12 — Achievements `s-achieve`

Badges section with 4×2 grid showing earned badges (Bronze, Silver, Gold tiers) and locked badges (greyscale, opacity 0.3). Certificate section with Project Completion certificate card (tap → `s-cert`). Nav bar with Profile tab active.

#### Screen 13 — Certificate View `s-cert`

Two certificate card variants stacked vertically. (1) **Project Completion** — S-MIB hornbill logo, amber tag, project name, learner name and date, verification ID (SMIB-2026-A4F2-9C1E), copy button. (2) **Category Mastery** — same layout with cyan tag and category name (Electronics). Share and Verify buttons below first cert.

#### Screen 14 — AI Help Chat `s-aichat`

Dark navy-teal gradient background. Top bar: back button, hornbill avatar, "S-MIB AI Helper" name, green "Ready to help" status dot, project name right-aligned. Context chip showing active step (📌 Step 4 — Test output voltage). Conversation bubbles: user right-aligned (navy), AI left-aligned (glass). Input bar pinned at bottom. Accessible from `s-detail` and `s-step` via 🤖 button.

> **Note:** AI helper calls Anthropic Claude API via backend edge function. Context (project_id, step_id, learner_name) is sent automatically with each message.

#### Screen 15 — Leaderboard `s-lb`

Three scope tabs: My School (active), Sarawak, Global. Ranked rows with rank number, avatar, name, school, XP total. Your row highlighted with teal background. Top 3 ranks use gold/silver/bronze colours. Accessible from Profile settings list.

#### Screen 16 — Profile `s-profile`

Profile header: large avatar, display name, role + school, level. Stats row: Projects (cyan), Badges (amber), Certs (green). Settings list: Achievements → `s-achieve`, Leaderboard → `s-lb`, Notifications (placeholder), Language (placeholder), Privacy & Security (placeholder), Sign Out (red).

#### Screen 17 — Notifications `s-notif`

Accessed from bell icon on home screen. Back button. Date group labels (Today, Yesterday). Notification rows with colour-coded icon, title, subtitle, timestamp, amber unread dot. Types: ⚡ XP reward, 🏆 badge unlock, 📊 leaderboard change, 🔥 streak reminder.

> **Supabase:** `notifications` (user_id, type, title, body, is_read, created_at)

#### Screen 18 — Explore Projects `s-explore`

Search bar, filter chips (All / Electronics / Agriculture / Coding / Biology), result count label, project list cards sorted by newest. Cards show "Not started" status. Tapping navigates to `s-detail` where Enrol button appears for unstarted projects.

### 3.3 Learner Navigation Flow

| From | Action | Goes To |
|---|---|---|
| `s-home` | Tap bell icon | `s-notif` |
| `s-home` | Tap See All → | `s-list` |
| `s-home` | Tap Browse → | `s-explore` |
| `s-home` | Tap project card | `s-detail` |
| `s-home` | Nav: Explore tab | `s-explore` |
| `s-home` | Nav: Progress tab | `s-progress` |
| `s-home` | Nav: Profile tab | `s-profile` |
| `s-list` | Tap project card | `s-detail` |
| `s-detail` | Tap ← Back | Previous screen (history stack) |
| `s-detail` | Tap 🤖 AI Help | `s-aichat` |
| `s-detail` | Tap active step row | `s-step` |
| `s-detail` | Tap Continue Step button | `s-step` |
| `s-step` | Tap ← Back | `s-detail` |
| `s-step` | Tap Ask AI button | `s-aichat` |
| `s-step` | Tap Mark Step Done | XP overlay (same screen) |
| `s-step` XP overlay | Tap Back to Project | `s-detail` (step history cleared) |
| `s-progress` | Tap See All → | `s-list` |
| `s-achieve` | Tap certificate card | `s-cert` |
| `s-profile` | Tap Achievements | `s-achieve` |
| `s-profile` | Tap Leaderboard | `s-lb` |
| `s-notif` | Tap ← Back | `s-home` |
| `s-aichat` | Tap ← Back | Previous screen (history stack) |

---

## 4. Creator Screens (19–25)

Project management flow for Verified Creators. 7 screens. Bottom nav bar with 4 tabs: Dashboard, Projects, Analytics, Profile. Teal accent colour scheme.

### 4.1 Screen Inventory

| Screen ID | Screen Name | Role | Nav Bar |
|---|---|---|---|
| `c-dash` | Creator Dashboard | Creator | 4-tab (Dashboard active) |
| `c-myprojects` | My Projects List | Creator | 4-tab (Projects active) |
| `c-projdetail` | Project Detail (Creator View) | Creator | 4-tab (Projects active) |
| `c-newproject` | New Project Form | Creator | ← Back / Cancel |
| `c-editproject` | Edit Project Form | Creator | ← Back / Cancel |
| `c-analytics` | Analytics Dashboard | Creator | 4-tab (Analytics active) |
| `c-profile` | Creator Profile | Creator | 4-tab (Profile active) |

### 4.2 Screen Descriptions

#### Screen 19 — Creator Dashboard `c-dash`

Header with greeting, name, Verified Creator teal badge, notification bell (toast on tap). Four stat cards: Published (cyan), Drafts (amber), Students (green), Completion % (orange). "My Projects" section with 3 recent cards showing all status types: Published, Draft, and In Review (cyan left border + "⏳ Awaiting admin approval"). See All → button. Quick Actions row: "+ New Project" and "📊 Analytics" buttons.

#### Screen 20 — My Projects List `c-myprojects`

Search bar for filtering. Filter tabs: All (11), Published (8), Drafts (3). Project list cards with enrollment count, completion rate, and status badge. In Review card has cyan left border. "+ Create New Project" button at bottom.

#### Screen 21 — Project Detail (Creator View) `c-projdetail`

Hero image, project title, category/difficulty. Three stat cards: Enrolled (cyan), Completion (green), Rating (amber ★). "Step Completion Funnel" section with visual progress bars per step showing completion rate per step. Edit and 🗑️ Delete buttons. Delete triggers a confirmation overlay: project name shown, enrolled student warning, Cancel / Yes Delete. "👁️ Preview as Learner" button below.

#### Screen 22 — New Project Form `c-newproject`

Form fields: Project Title (*required), Category (*required), Difficulty dropdown, Est. Duration dropdown, Description textarea, Tags input (for search discoverability), Cover Image upload zone. Info notice: steps are added after saving the project metadata. "Save & Add Steps →" button. Cancel button.

> **Supabase:** `projects` (title, category, difficulty, duration, description, tags, cover_image_url, status=draft, creator_id)

#### Screen 23 — Edit Project Form `c-editproject`

Same form as `c-newproject` pre-filled with existing data. Warning banner: "This project has 142 enrolled students. Major changes may affect their progress." Below the form, a Steps section lists existing step titles with Edit links and an "+ Add new step" option. "Save & View Project" button navigates to `c-projdetail` after saving.

#### Screen 24 — Analytics Dashboard `c-analytics`

Header with time filter tabs (All time / This month / This week). Three summary stats: Total Students (cyan), Avg Completion (green), Avg Rating (amber). Weekly enrolment trend chart (7-bar sparkline Mon–Today, today highlighted in cyan). Top Performing Projects section with 3 projects and mini progress bars. Recent Activity feed (new enrolments, step completions, ratings). Export Data button at bottom.

#### Screen 25 — Creator Profile `c-profile`

Teal avatar, name, "Verified Creator · STEM Educator" label, teal Verified Creator badge. Stats row: Projects, Students, Rating. Settings list: My Projects, Analytics, Notifications (placeholder), Creator Guidelines (placeholder), Sign Out (red).

### 4.3 Creator Navigation Flow

| From | Action | Goes To |
|---|---|---|
| `c-dash` | Tap See All → | `c-myprojects` |
| `c-dash` | Tap project card | `c-projdetail` |
| `c-dash` | Tap + New Project | `c-newproject` |
| `c-dash` | Tap Analytics | `c-analytics` |
| `c-dash` | Nav: Projects tab | `c-myprojects` |
| `c-myprojects` | Tap project card | `c-projdetail` |
| `c-myprojects` | Tap + Create New Project | `c-newproject` |
| `c-projdetail` | Tap ✏️ Edit Project | `c-editproject` |
| `c-projdetail` | Tap 🗑️ Delete → Confirm | `c-myprojects` |
| `c-projdetail` | Tap Preview as Learner | Read-only learner view |
| `c-projdetail` | Nav: Projects tab | `c-myprojects` |
| `c-editproject` | Tap Save & View Project | `c-projdetail` |
| `c-editproject` | Tap Cancel | `c-projdetail` (back) |
| `c-newproject` | Tap Cancel | Previous screen (back) |

---

## 5. Parent Screens (26–29)

Read-only monitoring flow for parents of enrolled learners. 4 screens. Bottom nav bar with 3 tabs: Home, Activity, Profile. Green accent colour scheme. No ability to modify child data.

### 5.1 Screen Inventory

| Screen ID | Screen Name | Role | Nav Bar |
|---|---|---|---|
| `p-dash` | Parent Dashboard | Parent | 3-tab (Home active) |
| `p-child` | Child Progress View | Parent | 3-tab (Home active) |
| `p-activity` | Activity Feed | Parent | 3-tab (Activity active) |
| `p-profile` | Parent Profile | Parent | 3-tab (Profile active) |

### 5.2 Screen Descriptions

#### Screen 26 — Parent Dashboard `p-dash`

Header with greeting, parent name, "2 Children Linked" green badge, notification bell (toast on tap). Combined summary stats row: Active Projects (green), Completed (amber), Badges (teal). "My Children" section with child cards. Each card shows: avatar, name, grade + school + level, Active/Idle status badge, last active timestamp (🟢 Active now / ⚪ Last active 2 days ago), stats row (Active, Completed, Badges, Streak). "+ Link Another Child" button.

> **Supabase:** `parent_student_links` (parent_id, student_id)

#### Screen 27 — Child Progress View `p-child`

Back button, child name in title. Child header: avatar, name, school + grade. Level badge + rank title. XP progress bar (620/1000 XP, amber fill). Four stat cards: Active, Completed, Badges, Streak. "🎯 Current Goal" glass card with target description and deadline. Active Projects section (read-only, no tap interaction, progress bars shown). Recently Completed section with completed project card (✓ Done label, XP earned). Earned Badges mini row (3 visible + "+9 more" count). Read-only notice. "💬 Contact Teacher / Creator" green button.

#### Screen 28 — Activity Feed `p-activity`

Header with logo and "Recent activity" subtitle. "Mark all read" link. Child filter tabs (All / Fazrin / Nurul, green active state). Date group labels (Today, Yesterday). Activity rows: child avatar (colour-coded), type icon (⚡ step completion, 🏆 badge unlock, 📚 new enrolment, 🔥 streak milestone), bold title, subtitle, timestamp.

#### Screen 29 — Parent Profile `p-profile`

Green avatar, parent name, "Parent Account · 2 children linked" subtitle. Settings list: My Children → `p-dash`, Activity Feed → `p-activity`, Notifications (placeholder), Privacy & Security (placeholder), Sign Out (red).

### 5.3 Parent Navigation Flow

| From | Action | Goes To |
|---|---|---|
| `p-dash` | Tap child card | `p-child` |
| `p-dash` | Nav: Activity tab | `p-activity` |
| `p-dash` | Nav: Profile tab | `p-profile` |
| `p-child` | Tap ← Back | `p-dash` |
| `p-activity` | Nav: Home tab | `p-dash` |
| `p-activity` | Nav: Profile tab | `p-profile` |
| `p-profile` | Tap My Children | `p-dash` |
| `p-profile` | Tap Activity Feed | `p-activity` |

---

## 6. Database Table References

Key tables referenced across wireframes. Full schema in `ERD.md` and `database/smib_schema.sql`.

All table names below are the canonical names from the ERD and SQL schema.

| Table | Key Columns | Used In Screens |
|---|---|---|
| `users` | id, name, role, xp, level, school_name, grade_level, avatar_url | All auth, s-home, s-profile, c-profile, p-child |
| `creators` | user_id, creator_type, organisation, is_verified | c-dash, c-profile |
| `projects` | id, creator_id, title, category, difficulty, tags, status, cover_image_url | s-detail, c-dash, c-projdetail, c-newproject |
| `steps` | id, project_id, step_number, title, instructions, image_ref | s-step, c-editproject |
| `materials` | id, project_id, name, is_recyclable | s-step |
| `progress` | student_id, project_id, completed_steps, current_step, progress_pct, is_completed | s-home, s-list, s-detail, s-progress |
| `step_submissions` | student_id, step_id, project_id, photo_url, xp_awarded, completed_at | s-step (mark done), c-analytics |
| `achievements` | student_id, title, type, trigger_type, date_awarded | s-achieve, p-child |
| `certificates` | student_id, cert_type, verification_code, project_id, issued_at | s-cert, p-child |
| `streaks` | student_id, current_streak, longest_streak, last_active_date | s-home, s-progress, p-child |
| `parent_student_links` | parent_id, student_id | p-dash, p-child |
| `notifications` | user_id, type, title, body, is_read, created_at | s-notif |

## 7. Implementation Notes for Claude Code

### 7.1 Navigation

- Use React Navigation v6 with Stack + Tab navigators
- Bottom tab navigator as root for Learner (4 tabs), Creator (4 tabs), Parent (3 tabs)
- Stack navigator inside each tab for nested screens (e.g. Home → ProjectList → ProjectDetail)
- Auth flow uses a separate Stack navigator, switched on Supabase session state
- History-aware back: React Navigation handles this natively — no custom history stack needed

### 7.2 Styling

- Background: fixed `LinearGradient` behind the root navigator — not per-screen
- Glass cards: semi-transparent background + asymmetric borders (see STYLE_GUIDE.md)
- Nav pill sliding indicator: use `onLayout` to measure tab positions, `Animated.Value` for `translateX`
- Card press animation: scale only — NO `translateY` (causes clipping inside `ScrollView`)
- Fonts: `expo-font` with `useFonts()`, Nunito + Inter from Google Fonts

### 7.3 AI Chat

- AI helper calls Anthropic Claude API via a **Supabase Edge Function** `ai-helper` (never directly from the client — API key stays server-side)
- Context sent with each message: `project_id`, `step_id`, `step_title`, `learner_name`, `grade_level`
- Message history stored in component state for session duration only (not persisted to Supabase)
- Input bar: `KeyboardAvoidingView` with `behavior="padding"` on iOS

### 7.4 Offline Support

- Project content (steps, materials, instructions) cached to `AsyncStorage` on first load
- Step submissions queued locally when offline, synced on reconnect via a background task
- XP and badge awards processed server-side to prevent client-side manipulation

### 7.5 Key Wireframe Conventions

- `← Back` buttons: all use `navigation.goBack()` — never hardcode screen names
- Proof photo capture: use `expo-camera` on s-step photo upload zone — photo uploaded to Supabase Storage `proof-photos` bucket, URL stored in `step_submissions.photo_url`
- Status badges (Published / Draft / In Review): driven by `projects.status` field in Supabase
- Locked badges: `opacity: 0.3` + `grayscale(1)` CSS filter, no `onPress` handler
- Read-only screens (`p-child`): remove all `onPress` handlers, use non-interactive components
- Delete confirmation: `Modal` component — not a separate screen
- XP overlay on step completion: absolute-positioned `View` inside the step screen, `zIndex: 50`
