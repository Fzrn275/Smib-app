# Software Requirements Specification (SRS)
# Sarawak Maker-In-A-Box (S-MIB)
# Version 1.0

---

## Document Information

| Field | Detail |
|---|---|
| Document | Software Requirements Specification |
| Product | Sarawak Maker-In-A-Box (S-MIB) |
| Version | 1.0 |
| Status | Active |
| Lead Developer | Fazrin Ezan Darwish Bin Hamzah (BCS25020024) |
| Institution | Universiti Teknologi Sarawak (UTS) |
| Course | CSS3133 Object Oriented Programming |
| Submission Deadline | 25 May 2026 |

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification defines the complete functional and
non-functional requirements for S-MIB (Sarawak Maker-In-A-Box). It serves as
the formal contract between what the system must do and what will be built and
tested. Claude Code uses this document alongside the PRD, ERD, Architecture,
Style Guide, and Wireframes when building the application.

### 1.2 Scope

S-MIB is a mobile application for Android (built with React Native and Expo)
that enables rural Sarawak students to complete self-directed STEM projects,
earn gamified rewards, and receive verifiable certificates. The system includes
three user roles — Learner, Creator, and Parent — with distinct access levels
and screens. The backend is Supabase (PostgreSQL). AI features are powered by
Anthropic Claude API via a server-side Supabase Edge Function.

### 1.3 Definitions

| Term | Definition |
|---|---|
| Learner | A student user with role `junior_learner` or `senior_learner` |
| Creator | A content creator with role `creator`, `verified_creator`, or `content_mentor` |
| Parent | A guardian user with role `parent` |
| XP | Experience Points — earned by completing steps and projects |
| Level | Calculated from total XP — 1000 XP per level, max level 10 |
| Streak | Count of consecutive days the learner has been active in the app |
| Step Submission | Record created when a learner marks a step complete, optionally with a photo |
| Certificate | Verifiable achievement with a unique UUID verification code |
| Edge Function | Server-side Supabase function that calls the Claude API — never the client directly |
| GuidedProject | A project with numbered step-by-step instructions |
| OpenProject | A project with an open-ended goal and creativity scoring |

### 1.4 References

- PRD v2.1 — `/docs/PRD/PRD.md`
- ERD v1.1 — `/docs/ERD/ERD.md`
- Architecture v1.1 — `/docs/ARCHITECTURE/ARCHITECTURE.md`
- Style Guide v1.0 — `/docs/StyleGuide & Mockup/STYLE_GUIDE.md`
- Wireframes v1.0 — `/docs/Wireframes/WIREFRAMES.md`
- SQL Schema — `/database/smib_schema.sql`

---

## 2. Overall Description

### 2.1 Product Perspective

S-MIB is a standalone mobile application. It does not integrate with any
existing school management system or government platform in its current version.
All data is stored in Supabase. The only external dependency at runtime is the
Supabase platform and the Claude API (called server-side via Edge Function).

### 2.2 Product Functions Summary

- Role-based authentication and registration (Learner, Creator, Parent)
- Project discovery, enrolment, and step-by-step guided completion
- XP, level, streak, badge, and certificate gamification system
- AI-powered troubleshooter and motivational feedback
- Creator project management (create, edit, publish, delete, analytics)
- Parent monitoring dashboard with read-only child progress view
- In-app notification system
- Offline support for project step content

### 2.3 User Classes

| Class | Description | Technical Proficiency |
|---|---|---|
| JuniorLearner | Year 4–6 student, 10–12 years old | Low — first app may be this one |
| SeniorLearner | Form 1–5 student, 13–17 years old | Low-Medium |
| Creator | Verified educator or TVET practitioner | Medium |
| Parent | Guardian monitoring child's activity | Low |

### 2.4 Operating Environment

- **Platform:** Android 10 and above
- **Test Device:** Budget Android phone (tested via Expo Go)
- **Network:** Works offline for viewing cached steps; requires internet for login, sync, and AI
- **Build:** Expo EAS Build producing `.apk` for internal testing

### 2.5 Assumptions and Dependencies

- Supabase project is configured with all 12 tables from `smib_schema.sql`
- Supabase Auth is enabled with email/password sign-in
- Supabase Edge Function `ai-helper` is deployed with `CLAUDE_API_KEY` set
- Expo SDK 54 and all listed packages are installed
- GitHub repository `Nazz752/Smib-app` is the source of truth for code

---

## 3. Functional Requirements

Requirements are labelled FR-[Role]-[Number]. Each requirement maps to one
or more features from PRD Section 6.

---

### 3.1 Authentication Requirements

**FR-AUTH-01 — Email/Password Login**
The system shall allow any user to log in using an email address and password.
On invalid credentials the system shall display an inline error card on the
Login screen without navigating away.
*Implements: F10*

**FR-AUTH-02 — Role-Based Routing**
After successful login the system shall route the user to their role-specific
home screen: `HomeScreen` for learners, `CreatorDashboardScreen` for creators,
`ParentDashboardScreen` for parents.
*Implements: F10*

**FR-AUTH-03 — Registration with Role Selection**
The system shall allow new users to register in two steps: (1) select a role
from Learner, Creator, Parent, or Mentor; (2) fill in name, email, school,
grade level, password, and accept terms.
*Implements: F10*

**FR-AUTH-04 — Forgot Password**
The system shall allow users to request a password reset email via the
Forgot Password modal. Supabase `resetPasswordForEmail()` handles delivery.
*Implements: F10*

**FR-AUTH-05 — Session Persistence**
The system shall persist the user's session across app restarts using
Supabase's built-in session storage. Users shall not need to log in again
unless they explicitly sign out or the session expires.
*Implements: F10*

**FR-AUTH-06 — Sign Out**
The system shall allow users to sign out from the Profile screen. On sign out
the session shall be cleared and the user shall be returned to the Login screen.
*Implements: F10*

---

### 3.2 Learner Requirements

**FR-LRN-01 — Home Dashboard**
The system shall display on the HomeScreen: the user's name, current streak,
level and rank title, XP progress bar, three stat cards (Active Projects,
Completed, Badges), a horizontal scroll of active projects, and a horizontal
scroll of new projects to explore.
*Implements: F03, F05, F08, F09*

**FR-LRN-02 — Project Discovery**
The system shall display all published projects on the Project List and Explore
screens. The learner shall be able to search by keyword and filter by category
(Electronics, Agriculture, Renewable, Coding, Biology).
*Implements: F01*

**FR-LRN-03 — Project Enrolment**
The system shall allow a learner to enrol in a project by tapping "Start Project"
on the Project Detail screen. Enrolment shall create a row in the `progress` table
with `is_completed = false` and `current_step = 1`. A learner cannot enrol in the
same project twice.
*Implements: F04*

**FR-LRN-04 — Step-by-Step Instructions**
The system shall display each step with a title, numbered position, full
instruction text, image (if available), materials checklist, and a contextual
tip card. Only the current active step shall be fully interactive; past steps
shall show a green checkmark; future steps shall appear locked.
*Implements: F02*

**FR-LRN-05 — Mark Step Done**
The system shall allow a learner to mark a step complete by tapping "Mark Step Done"
on the Step Detail screen. This shall:
(1) Create a row in `step_submissions` with `xp_awarded = 50`
(2) Update `progress.completed_steps`, `current_step`, and `progress_pct`
(3) Add 50 XP to `users.xp`
(4) Recalculate `users.level` if XP crosses a 1000-XP threshold
(5) Show an XP celebration overlay (+50 XP) before returning to Project Detail
*Implements: F03, F08, F15*

**FR-LRN-06 — Project Completion**
When all steps in a project are marked done the system shall set
`progress.is_completed = true`, create an `achievements` row of type `certificate`,
and create a `certificates` row with a unique `verification_code`.
*Implements: F06*

**FR-LRN-07 — Step Proof Photo**
The system shall allow a learner to optionally capture a photo using the device
camera before marking a step done. The photo shall be uploaded to the Supabase
Storage `proof-photos` bucket. The URL shall be stored in `step_submissions.photo_url`.
*Implements: F15*

**FR-LRN-08 — XP and Level System**
The system shall calculate the learner's level as `floor(total_xp / 1000) + 1`,
capped at level 10. The XP bar shall display XP within the current level
(e.g. at 3620 total XP, level 4, the bar shows 620/1000). Rank titles shall
follow the ten-level table defined in the Style Guide.
*Implements: F08*

**FR-LRN-09 — Daily Streak**
The system shall increment `streaks.current_streak` on each calendar day the
learner opens the app. If the learner misses a day `current_streak` resets to 0.
`longest_streak` shall update when `current_streak` exceeds the previous record.
*Implements: F09*

**FR-LRN-10 — Achievement Badges**
The system shall award badge achievements for the following triggers:
`first_project` (first enrolment), `first_completion` (first project completed),
`streak_7` (7-day streak), `streak_30` (30-day streak),
`category_complete` (all projects in a category completed).
*Implements: F05*

**FR-LRN-11 — Certificate Display**
The system shall display earned certificates on the Achievements screen and a
dedicated Certificate screen. Each certificate shall show: cert type tag,
project or category name, learner name, date issued, and the unique verification
code with a copy button.
*Implements: F06*

**FR-LRN-12 — AI Troubleshooter**
The system shall provide an AI chat screen accessible from the Project Detail
and Step Detail screens. On each message the app shall call the Supabase Edge
Function `ai-helper` passing the current `project_id`, `step_id`, `step_title`,
learner name, and grade level. The Edge Function shall call the Claude API
and return the response. Responses shall display in a chat bubble format.
The conversation history shall be stored in component state for the session only
and shall not be persisted to Supabase.
*Implements: F14, F17*

**FR-LRN-13 — Leaderboard**
The system shall display a leaderboard with three scope tabs: My School,
Sarawak, Global. Each row shall show rank, avatar, name, school, and XP total.
The logged-in user's row shall be highlighted. The top 3 rows shall use
gold, silver, and bronze colours.
*Implements: F16*

**FR-LRN-14 — Progress Screen**
The system shall display a level journey map on the Progress screen showing
10 nodes: completed nodes (green checkmark), current node (amber glow + label),
future nodes (grey). The screen shall also show the learner's streak and a list
of completed projects.
*Implements: F03, F08, F09*

**FR-LRN-15 — Notifications**
The system shall display in-app notifications on the Notifications screen,
grouped by date (Today, Yesterday). Each notification shall show a colour-coded
icon, title, subtitle, and timestamp. Unread notifications shall show an amber
dot. Tapping a notification shall mark it as read.
*Implements: F18*


**FR-LRN-16 — Learner Profile Screen**
The system shall display on the Profile screen: a large avatar, the learner's
display name, role and school name, and current level. Below the header, a
stats row shall show total Projects completed (cyan), Badges earned (amber),
and Certificates earned (green). A settings list shall include navigation to
Achievements, Leaderboard, Notifications, and a Sign Out option styled in red.
*Implements: F07*

**FR-LRN-17 — Offline Project Cache**
The system shall cache project step content (step title, instructions, image
references, and materials list) to `AsyncStorage` on first successful load.
Cached content shall be served when the device has no internet connection.
The UI shall show an offline indicator banner when operating without connectivity.
Step submissions made offline shall be queued in `AsyncStorage` and synced to
Supabase automatically when the connection is restored.
*Implements: F13*

---

### 3.3 Creator Requirements

**FR-CRE-01 — Creator Dashboard**
The system shall display on the Creator Dashboard: four stat cards (Published,
Drafts, Students, Completion %), a list of the creator's three most recent
projects with status badges, and Quick Action buttons (+ New Project, Analytics).
*Implements: F11*

**FR-CRE-02 — Project List**
The system shall display all of the creator's projects on the My Projects screen
with filter tabs (All, Published, Drafts). Each project card shall show enrolment
count, completion rate, and status badge.
*Implements: F11*

**FR-CRE-03 — Create Project**
The system shall allow a creator to create a new project by filling in: Project
Title (required), Category (required), Difficulty, Estimated Duration, Description,
Tags, and Cover Image. On save, a `projects` row shall be inserted with
`status = 'draft'` and `creator_id` set to the creator's ID. The creator shall
be navigated to the Edit Project screen to add steps.
*Implements: F19*

**FR-CRE-04 — Add and Edit Steps**
On the Edit Project screen the creator shall be able to add, reorder, and delete
steps. Each step has a title and full instructions. Steps shall be inserted into
the `steps` table linked to the project.
*Implements: F19*

**FR-CRE-05 — Publish Project**
The system shall allow a creator to change a project's status from `draft` to
`in_review` (submitted for admin review) or directly to `published` (current
version — no admin queue yet). Published projects appear in the learner project
discovery screens.
*Implements: F19*

**FR-CRE-06 — Delete Project**
The system shall allow a creator to delete a project from the Project Detail
(Creator View) screen. A confirmation modal shall display the project name and
a warning if enrolled students exist. On confirmation the `projects` row is
deleted; all linked `steps`, `materials`, and `progress` rows are deleted via
CASCADE.
*Implements: F19*

**FR-CRE-07 — Analytics Dashboard**
The system shall display on the Analytics screen: three summary stats (Total
Students, Avg Completion, Avg Rating), a weekly enrolment trend sparkline chart
(7 bars, Mon–Today, today highlighted in cyan), a Top Performing Projects list
with mini progress bars, and a Recent Activity feed (new enrolments, step
completions, ratings). An Export Data button shall be present (functionality:
future phase).
*Implements: F20*

**FR-CRE-08 — Step Completion Funnel**
On the Project Detail (Creator View) screen the system shall display a step
completion funnel showing, for each step, the percentage of enrolled students
who have completed that step. This is calculated from `step_submissions` counts
divided by `progress` enrolment count.
*Implements: F20*

---

### 3.4 Parent Requirements

**FR-PAR-01 — Parent Dashboard**
The system shall display on the Parent Dashboard all children linked to the
parent via `parent_student_links`. Each child card shall show: avatar, name,
grade, school, level, last active timestamp, and stats (Active, Completed,
Badges, Streak).
*Implements: F12*

**FR-PAR-02 — Child Progress View**
The system shall display a read-only detailed view of a linked child's progress:
level, XP bar, stat cards, current goal, active projects (read-only, no
interaction), recently completed projects, and earned badge row.
All interactive elements shall be disabled or absent.
*Implements: F12*

**FR-PAR-03 — Activity Feed**
The system shall display a chronological activity feed for the parent showing
events across all linked children. Events include: step completions, badge
unlocks, new enrolments, and streak milestones. The feed shall support
filtering by child via tab selector.
*Implements: F21*

**FR-PAR-04 — Certificate Access**
The parent shall be able to view their child's earned certificates including
the verification code. The parent cannot download or share certificates on
behalf of the child — this is the child's own action.
*Implements: F12*

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-PERF-01** — All screens shall load and render within 2 seconds on a
budget Android device (2GB RAM, Snapdragon 4xx processor class) on a 4G
connection.

**NFR-PERF-02** — The Supabase Edge Function `ai-helper` shall return the first
token of the AI response within 5 seconds under normal load.

**NFR-PERF-03** — The leaderboard shall support up to 500 students per school
without performance degradation.

### 4.2 Usability

**NFR-USE-01** — All tap targets shall be a minimum of 44×44 pixels.

**NFR-USE-02** — All body text shall be a minimum of 14px font size.

**NFR-USE-03** — Colour contrast ratios shall meet WCAG AA standard (4.5:1 for
normal text, 3:1 for large text) against the glassmorphism background.

**NFR-USE-04** — All interactive elements shall provide visual feedback on press
(scale animation per Style Guide) within 100ms.

### 4.3 Security

**NFR-SEC-01** — The Claude API key shall never be present in the app binary,
client-side `.env`, or any file committed to GitHub. It shall only exist in
the Supabase Edge Function environment variables.

**NFR-SEC-02** — All Supabase table access shall be governed by Row Level
Security (RLS) policies. Learners shall not be able to read other learners'
`step_submissions` or `achievements`. Parents shall only read data belonging
to their linked children.

**NFR-SEC-03** — XP and level updates shall only be made by the server-side
Edge Function, not by direct client-side Supabase calls, to prevent manipulation.

**NFR-SEC-04** — Proof photos shall be stored in the private Supabase Storage
bucket `proof-photos`. Only the owner can access their own photos.

### 4.4 Reliability

**NFR-REL-01** — The app shall not crash when the device loses internet
connectivity. Project steps that have been previously loaded shall remain
accessible via `AsyncStorage` cache.

**NFR-REL-02** — Step submissions attempted while offline shall be queued
locally and synced automatically when connectivity is restored.

**NFR-REL-03** — The app shall handle Supabase API errors (timeout, 5xx)
gracefully by displaying a user-friendly error message and offering a retry
action — not a crash screen.

### 4.5 Compatibility

**NFR-COMP-01** — The app shall support Android 10 (API 29) and above.

**NFR-COMP-02** — The app shall be testable via Expo Go without building a
full APK during development.

**NFR-COMP-03** — The production APK shall be generated via Expo EAS Build
using the `preview` profile.

### 4.6 Maintainability

**NFR-MAINT-01** — All OOP class files shall be in `/src/models/`. Classes
shall not be defined inline inside screen files.

**NFR-MAINT-02** — All Supabase queries shall be in service files under
`/src/services/`. Screens shall not contain raw Supabase client calls.

**NFR-MAINT-03** — All colour values, font sizes, and spacing tokens shall
be defined in `src/theme.js` and imported — never hardcoded in component files.

---

## 5. Interface Requirements

### 5.1 User Interface
All UI must follow the Style Guide (`/docs/StyleGuide & Mockup/STYLE_GUIDE.md`)
and match the layouts defined in the Wireframes (`/docs/Wireframes/WIREFRAMES.md`).
Key rules:
- Sarawak glassmorphism background gradient is fixed behind the root navigator
- Bottom navigation uses animated sliding pill indicator
- All cards use asymmetric glass borders (bright top-left, subtle right-bottom)
- Fonts: Nunito (headings) + Inter (body) — no other fonts permitted

### 5.2 Hardware Interface
- **Camera:** `expo-camera` for step proof photo capture (FR-LRN-07)
- **Storage:** `AsyncStorage` for offline content caching
- **Network:** Standard HTTP/HTTPS via Supabase JS client and `fetch` for Edge Function

### 5.3 Software Interface
- **Supabase JS Client:** `@supabase/supabase-js` for all database and auth operations
- **Expo Camera:** `expo-camera` for photo capture
- **AsyncStorage:** `@react-native-async-storage/async-storage` for offline cache
- **React Navigation:** `@react-navigation/native` v6 for screen navigation
- **Expo Google Fonts:** `@expo-google-fonts/nunito`, `@expo-google-fonts/inter`

---

## 6. OOP Requirements

These requirements are specific to the OOP assignment marking criteria.

**FR-OOP-01 — Inheritance**
The system shall implement at minimum two levels of inheritance:
`JuniorLearner extends Student extends User` and
`VerifiedCreator extends Creator extends User` and
`Certificate extends Achievement`.

**FR-OOP-02 — Encapsulation**
All OOP class properties shall be declared as private or protected where
appropriate. Public getters and setters shall be used for external access.
Class internals shall not be accessed directly from screen components.

**FR-OOP-03 — Polymorphism**
The `getRecommendedProjects()` method shall be implemented differently in
`JuniorLearner` (returns beginner projects) and `SeniorLearner` (returns
intermediate and advanced projects), demonstrating method overriding.

**FR-OOP-04 — Abstraction**
The `Project` class shall be defined as an abstract base class. It shall
not be instantiated directly. Only `GuidedProject` and `OpenProject` shall
be instantiated.

**FR-OOP-05 — Composition**
The `Project` class shall hold arrays of `Step` and `Material` objects.
These objects shall not exist independently of a project in the OOP layer.
This mirrors the `ON DELETE CASCADE` relationship in the database.

**FR-OOP-06 — All Classes Used**
All 14 OOP classes defined in `/docs/Models_explained.md` shall be
instantiated and used in at least one running screen of the app. The
assignment submission shall be able to demonstrate each class in action.

---

*Document version 1.0*
*Part of the S-MIB documentation suite: PRD · ERD · Architecture · Style Guide · Wireframes · SRS · DFD*
