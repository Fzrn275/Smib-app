# Architecture Diagram
# Sarawak Maker-In-A-Box (S-MIB)
# Version 1.1

---

## 1. Overview

S-MIB uses a three-layer architecture:

1. **Client** — React Native + Expo mobile app running on the user's phone
2. **Backend** — Supabase providing database, authentication, file storage, and realtime
3. **External Services** — Claude API (via Supabase Edge Function), Expo EAS for builds, GitHub for version control

There is no separate custom backend server. Supabase replaces it entirely,
providing all the API, auth, and data layer functionality in one managed platform.
This reduces infrastructure complexity and allows the app to reach production
without managing a server.

---

## 2. Layer 1 — Client (Mobile App)

### 2.1 Technology
- **Framework:** React Native with Expo (SDK 54)
- **Language:** JavaScript ES6 with OOP class syntax
- **Navigation:** React Navigation v6 (Stack + Bottom Tabs)
- **State:** React Context API for global auth state
- **UI:** React Native Paper + custom theme from `src/theme.js`
- **Animations:** React Native `Animated` API (spring physics per Style Guide)
- **Offline:** `AsyncStorage` for caching project steps and materials

### 2.2 Internal Structure

The client is organised into three internal areas:

#### Screens (`/src/screens/`)

Every screen the user sees. Organised into four role flows.
Total: **29 screens** across Auth, Learner, Creator, and Parent.

**Auth Screens (all roles)**

| Screen | File | Visible To |
|---|---|---|
| `LoginScreen` (default + error states) | `LoginScreen.js` | All |
| `ForgotPasswordModal` | `ForgotPasswordModal.js` | All |
| `RegisterStep1Screen` (role selection) | `RegisterStep1Screen.js` | New User |
| `RegisterStep2Screen` (details form) | `RegisterStep2Screen.js` | New User |
| `RegisterSuccessScreen` | `RegisterSuccessScreen.js` | New User |

**Learner Screens (12 screens)**

| Screen ID | Screen | Purpose |
|---|---|---|
| `s-home` | `HomeScreen` | Dashboard — XP, streak, active projects |
| `s-list` | `ProjectListScreen` | Browse and search all projects |
| `s-detail` | `ProjectDetailScreen` | Step list, enrol, continue step |
| `s-step` | `StepDetailScreen` | Step instructions, materials, mark done |
| `s-progress` | `ProgressScreen` | Level journey, streak, completed projects |
| `s-achieve` | `AchievementsScreen` | Badge grid, certificate cards |
| `s-cert` | `CertificateScreen` | Certificate detail with verification code |
| `s-aichat` | `AIHelpScreen` | AI troubleshooter chat interface |
| `s-lb` | `LeaderboardScreen` | XP rankings — School / Sarawak / Global |
| `s-profile` | `ProfileScreen` | Personal info, settings, sign out |
| `s-notif` | `NotificationsScreen` | XP, badge, streak, leaderboard notifications |
| `s-explore` | `ExploreScreen` | Browse newest projects — entry point for new enrolments |

**Creator Screens (7 screens)**

| Screen ID | Screen | Purpose |
|---|---|---|
| `c-dash` | `CreatorDashboardScreen` | Stats, recent projects, quick actions |
| `c-myprojects` | `MyProjectsScreen` | Full project list with status filter |
| `c-projdetail` | `CreatorProjectDetailScreen` | Per-project stats, step funnel, edit/delete |
| `c-newproject` | `NewProjectScreen` | Create project form |
| `c-editproject` | `EditProjectScreen` | Edit project + manage steps |
| `c-analytics` | `AnalyticsScreen` | Weekly trend chart, top projects, activity feed |
| `c-profile` | `CreatorProfileScreen` | Creator profile and settings |

**Parent Screens (4 screens)**

| Screen ID | Screen | Purpose |
|---|---|---|
| `p-dash` | `ParentDashboardScreen` | Linked children list with status |
| `p-child` | `ChildProgressScreen` | Detailed read-only view of child's progress |
| `p-activity` | `ActivityFeedScreen` | Chronological activity feed per child |
| `p-profile` | `ParentProfileScreen` | Parent account settings |

#### OOP Models (`/src/models/`)
All 14 JavaScript class files. These are the core of the OOP assignment.
They define the data structures and behaviours used throughout the app.
See `/docs/Models_explained.md` for full documentation.

| Class | Level | Relationship |
|---|---|---|
| `User` | Base | Inheritance parent |
| `Student` | Level 2 | Extends User |
| `JuniorLearner` | Level 3 | Extends Student |
| `SeniorLearner` | Level 3 | Extends Student — Polymorphism |
| `Creator` | Level 2 | Extends User |
| `VerifiedCreator` | Level 3 | Extends Creator |
| `ContentMentor` | Level 3 | Extends Creator |
| `Project` | Base | Inheritance parent |
| `GuidedProject` | Level 2 | Extends Project |
| `OpenProject` | Level 2 | Extends Project |
| `Step` | Supporting | Composition with Project |
| `Material` | Supporting | Composition with Project |
| `Progress` | Supporting | Association |
| `Achievement` | Supporting | Association |
| `Certificate` | Supporting | Extends Achievement |

#### Services + Navigation (`/src/services/`, `/src/navigation/`, `/src/context/`)
The connection layer between screens and the backend.

| File | Purpose |
|---|---|
| `supabaseClient.js` | Supabase connection using `.env` keys |
| `authService.js` | Login, register, logout, session management |
| `projectService.js` | Fetch projects, steps, materials from database |
| `progressService.js` | Track and update student progress and step submissions |
| `achievementService.js` | Fetch and award achievements and certificates |
| `aiService.js` | Calls Supabase Edge Function `ai-helper` (never Claude API directly) |
| `streakService.js` | Read and update daily streak records |
| `notificationService.js` | Fetch and mark notifications read |
| `AppNavigator.js` | Bottom tab navigation with animated pill per role |
| `RootNavigator.js` | Stack navigator wrapping tabs + detail screens |
| `AuthContext.js` | Global state for logged-in user, role, and session |

### 2.3 Offline Support
Project steps and materials are cached using `AsyncStorage` after the
first load. This allows students to follow instructions without an active
internet connection — critical for rural connectivity conditions.

Step submissions (photo + XP) are queued locally when offline and synced
to Supabase when connectivity is restored.

---

## 3. Layer 2 — Backend (Supabase)

### 3.1 Technology
- **Platform:** Supabase (cloud-hosted PostgreSQL)
- **Region:** Asia-Pacific (Singapore) — closest to Sarawak
- **Auth:** Supabase Auth with JWT tokens and role claims
- **Storage:** Supabase Storage for photos and images
- **Realtime:** Supabase Realtime for live leaderboard updates
- **Edge Functions:** Supabase Edge Functions (Deno runtime) for server-side logic

### 3.2 Authentication Flow
1. User submits email and password on LoginScreen
2. `authService.js` calls `supabase.auth.signInWithPassword()`
3. Supabase validates credentials and returns a JWT token
4. JWT is stored automatically by Supabase client
5. `AuthContext.js` reads the session and stores user role globally
6. Every subsequent API call automatically includes the JWT in headers
7. Supabase validates the token on every request server-side

### 3.3 Database
All **12 tables** as defined in `/docs/ERD.md`. The database enforces:
- Foreign key constraints for data integrity
- `ON DELETE CASCADE` for composition relationships
- `UNIQUE` constraints to prevent duplicate records
- `CHECK` constraints to enforce valid enum values
- Indexes on all frequently queried columns

### 3.4 Storage Buckets

| Bucket | Contents | Access |
|---|---|---|
| `proof-photos` | Student step completion proof photos | Private — owner only |
| `avatars` | User profile photos | Public read |
| `project-thumbnails` | Project cover images uploaded by creators | Public read |

### 3.5 Edge Functions

| Function | Purpose |
|---|---|
| `ai-helper` | Receives student message + project context, calls Claude API, returns response — API key never exposed to client |

### 3.6 Realtime Subscriptions
- Leaderboard — updates when any student in the same school earns XP
- Notification badge count — updates when a new notification is inserted

---

## 4. Layer 3 — External Services

### 4.1 Claude API (Anthropic) — via Edge Function
Used for two features — AI Troubleshooter (F14) and Motivational Feedback (F17).

**How it works (secure server-side flow):**
1. Student types a problem in AIHelpScreen
2. `aiService.js` calls the Supabase Edge Function `ai-helper` — **not Claude API directly**
3. The Edge Function reads the Claude API key from its server-side environment
4. The Edge Function calls `https://api.anthropic.com/v1/messages` with context + student message
5. Claude responds — Edge Function returns the response to the app
6. Response is displayed in the chat-style AIHelpScreen UI

**Context sent with each message:**
- Current project name and category
- Which step the student is on
- Step title
- Student's grade level (JuniorLearner vs SeniorLearner)
- Student's display name (for personalised responses)

**Why Edge Function and not direct client call:**
The Claude API key must never be shipped inside the app binary or stored in
client-side `.env` — it would be extractable. The Edge Function keeps the
key server-side and only the Supabase anonymous key is ever on the client.

### 4.2 Expo EAS Build
Used to build production APK files for Android distribution.

**Build command:**
```bash
npx eas build --platform android --profile preview
```

**Build profiles:**
- `preview` — internal testing APK, installs directly on Android
- `production` — signed APK for Play Store submission (future)

### 4.3 GitHub
Repository: `github.com/Nazz752/Smib-app`

Used for version control and as the source for EAS builds.
Every working feature is committed with a descriptive message before
moving to the next. The `main` branch is always in a deployable state.

---

## 5. Data Flow Summary

### Student learning flow
```
Student opens app
  → AuthContext checks Supabase session
  → If logged in: fetch user role + xp + level from users table
  → Render HomeScreen with data from progress + achievements + streaks tables
  → Student taps a project → ProjectDetailScreen
  → Steps fetched from steps table (cached in AsyncStorage)
  → Student taps a step → StepDetailScreen
  → Student marks step complete → step_submissions row created
  → progressService updates progress table (completed_steps, current_step, progress_pct)
  → users.xp incremented, users.level recalculated
  → If project complete → achievementService creates achievement + certificate
  → Streak updated via streakService
  → Notification created in notifications table
```

### AI Help flow
```
Student types problem in AIHelpScreen
  → aiService.js calls Supabase Edge Function ai-helper
  → Edge Function reads project context (project_id, step_id, grade_level, name)
  → Edge Function calls Claude API with system prompt + context + student message
  → Claude API responds
  → Edge Function returns response to app
  → Response displayed in chat UI
```

### Creator content flow
```
Creator logs in → CreatorDashboardScreen
  → projectService fetches projects WHERE creator_id = creator.id
  → Creator views per-project stats (enrolled count, completion %, rating)
  → Creator taps + New Project → NewProjectScreen
  → Form submitted → projects row inserted (status = 'draft')
  → Creator adds steps → steps rows inserted
  → Creator publishes → projects.status updated to 'published'
```

### Parent monitoring flow
```
Parent logs in → ParentDashboardScreen
  → parent_student_links fetched to find linked children
  → For each child: fetch users (xp, level), progress (counts), streaks, achievements
  → Parent taps child card → ChildProgressScreen (read-only)
  → Parent taps Activity tab → ActivityFeedScreen
  → activityService fetches step_submissions + achievements for all linked children
```

---

## 6. Security Considerations

| Concern | Mitigation |
|---|---|
| Claude API key exposed | Key stored in Edge Function server-side env — never in app binary or client .env |
| Supabase anon key exposed | Acceptable — anon key is designed to be public; RLS policies enforce data access |
| Unauthorised data access | Supabase RLS policies enforce role-based access |
| JWT expiry | Supabase auto-refreshes tokens transparently |
| Photo privacy | Proof photos stored in private bucket, accessible only by owner |
| Certificate forgery | Each certificate has a unique UUID verification code |
| Client-side XP manipulation | XP is awarded server-side via Edge Function — client cannot self-award XP |

---

## 7. Environment Variables

**Client-side** (`.env` in project root — safe to commit anon key, but not listed in public docs):
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Server-side** (Supabase Edge Function environment — never touches the client):
```
CLAUDE_API_KEY=your_claude_api_key
```

The Claude API key is set in the Supabase Dashboard under
Project Settings → Edge Functions → Environment Variables.
It is never placed in the app codebase.

---

## 8. Future Architecture Additions

| Addition | Purpose | When |
|---|---|---|
| District Dashboard | Web-based analytics for education authorities | Stage 2 |
| Creator Upload Portal | Web interface for uploading projects with rich editor | Stage 2 |
| Push Notifications | Expo Notifications service | Stage 2 |
| Content Moderation Queue | Admin review workflow for new projects | Stage 2 |
| TVET Enrollment API | Integration with official TVET database | Stage 3 |
| CDN for media | Faster image delivery for rural connections | Stage 2 |

---

*Document version 1.1 — updated screen list to all 29 screens across 4 role flows,*
*corrected table count to 12, added Edge Function for AI (Claude API key server-side),*
*added notificationService, expanded data flow to cover all 4 role flows, added Parent flow,*
*expanded security considerations to cover XP manipulation and Edge Function key security.*
*Part of the S-MIB documentation suite: PRD · ERD · Architecture · Style Guide · Wireframes · SRS · DFD*
