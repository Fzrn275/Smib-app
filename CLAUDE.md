# CLAUDE.md
# Sarawak Maker-In-A-Box (S-MIB)
# Master Instructions for Claude Code

---

## Who You Are Building This For

Lead Developer: Fazrin Ezan Darwish Bin Hamzah (BCS25020024)
Institution: Universiti Teknologi Sarawak (UTS)
Course: CSS3133 Object Oriented Programming
Deadline: 25 May 2026
Repository: github.com/Nazz752/Smib-app

This is a real product with a real deadline. Build it to production standard,
not prototype standard. Every file you create will be submitted for assessment
and may be shown to potential funders.

---

## Read These Documents First — In This Order

Before writing any code at all, read these documents:

1. `/docs/ERD/ERD.md` — 12 database tables, all columns, all relationships
2. `/docs/ARCHITECTURE/ARCHITECTURE.md` — all 29 screens, all service files, all data flows
3. `/docs/StyleGuide & Mockup/STYLE_GUIDE.md` — every colour, font, component rule
4. `/docs/Wireframes/WIREFRAMES.md` — layout of every screen with navigation flows
5. `/docs/SRS/SRS.md` — every functional requirement with acceptance criteria
6. `/docs/DFD/DFD.md` — how data flows through the system (use for service logic)
7. `/database/smib_schema.sql` — the exact SQL to run in Supabase

Do not write a single line of application code until you have read all seven.

---

## Project Structure

```
smib-app/
├── /docs                        ← All documentation (read-only reference)
│   ├── /PRD
│   ├── /ERD
│   ├── /ARCHITECTURE
│   ├── /StyleGuide & Mockup
│   ├── /Wireframes
│   ├── /SRS
│   └── /DFD
├── /database
│   └── smib_schema.sql          ← Run this in Supabase SQL Editor first
├── /src
│   ├── /models                  ← OOP classes (14 files) — build these first
│   ├── /services                ← Supabase query functions (never put queries in screens)
│   ├── /screens                 ← One file per screen (29 screens total)
│   ├── /navigation              ← AppNavigator, RootNavigator
│   ├── /context                 ← AuthContext.js
│   └── theme.js                 ← All colours, fonts, spacing tokens
├── /supabase
│   └── /functions
│       └── /ai-helper           ← Edge Function (Claude API lives here — not in app)
├── App.js
├── app.json
├── .env                         ← EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
├── .gitignore                   ← Must include .env
└── CLAUDE.md                    ← This file
```

---

## Build Order — Follow This Exactly

Build in this sequence. Do not skip steps. Do not build screens before
models and services exist.

### Phase 1 — Foundation
1. `smib_schema.sql` run in Supabase (already done if database is set up)
2. `.env` with Supabase URL and anon key
3. `src/theme.js` — all Style Guide tokens as JS constants
4. All 14 OOP model classes in `src/models/`
5. `src/context/AuthContext.js`
6. `src/services/supabaseClient.js`

### Phase 2 — Services
7. `src/services/authService.js`
8. `src/services/projectService.js`
9. `src/services/progressService.js`
10. `src/services/achievementService.js`
11. `src/services/streakService.js`
12. `src/services/notificationService.js`
13. `src/services/aiService.js`

### Phase 3 — Navigation
14. `src/navigation/RootNavigator.js`
15. `src/navigation/AppNavigator.js` (role-based bottom tab navigators)

### Phase 4 — Auth Screens (6 screens)
16. `LoginScreen` + error state
17. `ForgotPasswordModal`
18. `RegisterStep1Screen`
19. `RegisterStep2Screen`
20. `RegisterSuccessScreen`

### Phase 5 — Learner Screens (12 screens)
21. `HomeScreen`
22. `ExploreScreen`
23. `ProjectListScreen`
24. `ProjectDetailScreen`
25. `StepDetailScreen`
26. `ProgressScreen`
27. `AchievementsScreen`
28. `CertificateScreen`
29. `AIHelpScreen`
30. `LeaderboardScreen`
31. `ProfileScreen`
32. `NotificationsScreen`

### Phase 6 — Creator Screens (7 screens)
33. `CreatorDashboardScreen`
34. `MyProjectsScreen`
35. `CreatorProjectDetailScreen`
36. `NewProjectScreen`
37. `EditProjectScreen`
38. `AnalyticsScreen`
39. `CreatorProfileScreen`

### Phase 7 — Parent Screens (4 screens)
40. `ParentDashboardScreen`
41. `ChildProgressScreen`
42. `ActivityFeedScreen`
43. `ParentProfileScreen`

### Phase 8 — Edge Function
44. `supabase/functions/ai-helper/index.ts`

### Phase 9 — Offline Support
45. AsyncStorage caching in `projectService.js`
46. Offline queue in `progressService.js`

---

## OOP Model Requirements

All 14 classes must be built. The OOP layer is the core of the assignment mark.

```
src/models/
├── User.js              ← Base class. Properties: id, name, email, role, avatarUrl
├── Student.js           ← Extends User. Adds: xp, level, school, gradeLevel
├── JuniorLearner.js     ← Extends Student. getRecommendedProjects() → beginner only
├── SeniorLearner.js     ← Extends Student. getRecommendedProjects() → intermediate + advanced
├── Creator.js           ← Extends User. Adds: organisation, focusArea, bio
├── VerifiedCreator.js   ← Extends Creator. Adds: isVerified, verifiedAt
├── ContentMentor.js     ← Extends Creator. Adds: answerQuestion() method
├── Project.js           ← Abstract base. Properties: id, title, description, difficulty, category
├── GuidedProject.js     ← Extends Project. Adds: instructionLevel, estimatedDuration, steps[]
├── OpenProject.js       ← Extends Project. Adds: creativityScore
├── Step.js              ← Properties: id, stepNumber, title, instructions, imageRef
├── Material.js          ← Properties: id, name, description, isRecyclable
├── Progress.js          ← Properties: studentId, projectId, completedSteps[], progressPct
│                          Methods: completeStep(stepNumber), getProgressPercentage()
├── Achievement.js       ← Properties: id, studentId, title, type, triggerType, dateAwarded
└── Certificate.js       ← Extends Achievement. Adds: certType, verificationCode, issuedBy
```

### OOP Rules
- `Project` is abstract — throw an error if directly instantiated
- `getRecommendedProjects()` in `JuniorLearner` and `SeniorLearner` must behave differently (polymorphism)
- `GuidedProject` holds an array of `Step` objects (composition)
- `GuidedProject` holds an array of `Material` objects (composition)
- `Progress.completeStep()` updates `completedSteps[]` and recalculates `progressPct`
- `Certificate` must call `super()` in its constructor (inheritance chain)
- All class properties use private naming convention (`#name` or `_name`) with getters

---

## Style Rules — Non-Negotiable

Read `STYLE_GUIDE.md` fully. The key rules Claude Code must never break:

### Background
```js
// This gradient is FIXED behind the root navigator — not per-screen
// Use expo-linear-gradient wrapping the entire app
colors={['#064E3B', '#0E7490', '#0C4A6E', '#78350F', '#1A3A1A']}
start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
```

### Glass Card Recipe
```js
backgroundColor: 'rgba(255,255,255,0.08)',
borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)',
borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)',
borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)',
borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
borderRadius: 18,
// Note: backdropFilter blur works on iOS, may not render on Android Expo Go
// Still include it — it will work in the production APK
```

### Fonts
```js
// Headings: Nunito_900Black or Nunito_800ExtraBold
// Body: Inter_400Regular, Inter_600SemiBold, Inter_700Bold
// Load via useFonts() in App.js — show SplashScreen until loaded
```

### Never Use
- Hardcoded colour strings not from theme.js
- `translateY` animations on cards inside ScrollView (causes clipping)
- Direct Supabase client calls inside screen files
- `localStorage` or any browser API (this is React Native, not web)

---

## Database — Canonical Table Names

The ERD uses clean names. The Wireframes reference some Supabase-idiomatic names.
Use the ERD/SQL names in all code. This table maps any discrepancy:

| ERD / SQL Name (USE THIS) | Wireframe Reference Name |
|---|---|
| `users` | `profiles` |
| `steps` | `project_steps` |
| `progress` | `user_projects` |
| `step_submissions` | `step_submissions` (same) |
| `parent_student_links` | `parent_children` |

Always use the left column (ERD/SQL name) in your code.

---

## AI Feature — Edge Function is Mandatory

The Gemini API key must NEVER be in the app code. This is a security requirement.

App → aiService.js → Supabase Edge Function (ai-helper) → Google Gemini API

The Edge Function lives at supabase/functions/ai-helper/index.ts.
It reads GEMINI_API_KEY from Deno.env.get('GEMINI_API_KEY').
The client calls it using supabase.functions.invoke('ai-helper', { body: payload }).

Model to use: gemini-1.5-flash (free tier, fast responses)
Gemini API endpoint:
  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=GEMINI_API_KEY

Context sent with every request:
{
  "project_id": "...",
  "step_id": "...",
  "step_title": "...",
  "learner_name": "...",
  "grade_level": "junior_learner | senior_learner",
  "message": "student's typed question"
}

The Edge Function builds a prompt from this context, calls Gemini, and
returns the response text to the app. The API key never touches client code.
```

---

## Navigation Structure

```
RootNavigator (Stack)
├── AuthStack (Stack) — shown when no session
│   ├── LoginScreen
│   ├── ForgotPasswordModal (modal presentation)
│   ├── RegisterStep1Screen
│   ├── RegisterStep2Screen
│   └── RegisterSuccessScreen
│
└── AppNavigator — shown when session exists, role-based
    ├── LearnerTabs (BottomTab) — role: junior_learner | senior_learner
    │   ├── HomeStack → HomeScreen → ProjectDetailScreen → StepDetailScreen
    │   ├── ExploreStack → ExploreScreen → ProjectListScreen → ProjectDetailScreen
    │   ├── ProgressStack → ProgressScreen
    │   └── ProfileStack → ProfileScreen → AchievementsScreen → CertificateScreen
    │                                    → LeaderboardScreen → NotificationsScreen
    │
    ├── CreatorTabs (BottomTab) — role: creator | verified_creator | content_mentor
    │   ├── DashboardStack → CreatorDashboardScreen
    │   ├── ProjectsStack → MyProjectsScreen → CreatorProjectDetailScreen
    │   │                                    → NewProjectScreen → EditProjectScreen
    │   ├── AnalyticsStack → AnalyticsScreen
    │   └── ProfileStack → CreatorProfileScreen
    │
    └── ParentTabs (BottomTab) — role: parent
        ├── HomeStack → ParentDashboardScreen → ChildProgressScreen
        ├── ActivityStack → ActivityFeedScreen
        └── ProfileStack → ParentProfileScreen
```

Navigation rules:
- All `← Back` buttons use `navigation.goBack()` — never hardcode screen names
- AI Help is accessible from ProjectDetailScreen and StepDetailScreen via 🤖 button
- Notifications screen accessible from bell icon in header (not in tab bar)
- Bottom tab uses animated sliding pill — use `onLayout` to measure positions

---

## XP and Level Logic

```js
// XP awarded per step completion: 50 XP
// Level calculation:
const level = Math.min(Math.floor(totalXp / 1000) + 1, 10);

// XP within current level (for the bar display):
const xpInLevel = totalXp % 1000;
const xpToNextLevel = 1000;

// Rank titles:
const rankTitles = [
  'Curious Maker',     // Level 1
  'Junior Builder',    // Level 2
  'STEM Explorer',     // Level 3
  'Maker Apprentice',  // Level 4
  'Project Maker',     // Level 5
  'Circuit Crafter',   // Level 6
  'Innovation Scout',  // Level 7
  'STEM Champion',     // Level 8
  'Master Builder',    // Level 9
  'Sarawak Maker',     // Level 10
];
```

---

## Error Handling Rules

- All Supabase calls must be wrapped in try/catch
- Never show raw error objects to users — show a friendly message
- Offline state must be gracefully handled — show cached content, not error screen
- Loading states must be shown for all async operations (spinner or skeleton)
- All forms must show inline validation errors before submitting

---

## What Not to Build

These are explicitly out of scope for the May 2026 submission:

- F22–F30 from PRD Section 6.3
- Web version
- Payment or subscription features
- Real-time chat between students
- TVET enrollment integration
- Mentor role home screen (Mentor can register but has no dedicated home flow yet)
- Push notifications (in-app notifications only)

---

## Definition of Done

The app is done when:

- [ ] A new user can register as Learner, Creator, or Parent
- [ ] A learner can browse projects, enrol, complete steps, earn XP, reach a new level
- [ ] A learner can earn at least one badge and one certificate in a single session
- [ ] A learner can ask the AI a question and receive a contextual response
- [ ] A creator can see their dashboard with project stats
- [ ] A parent can see their linked child's progress
- [ ] The app does not crash when internet is disconnected while viewing a cached project
- [ ] All 14 OOP classes are used in the running app
- [ ] The app runs without errors through a full demo session on a real Android device

---

*CLAUDE.md — v1.0 — Primary instruction file for Claude Code*
*Do not modify this file without updating the corresponding documentation.*
