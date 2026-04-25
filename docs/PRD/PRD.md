# Product Requirements Document (PRD)
# Sarawak Maker-In-A-Box (S-MIB)
# Version 2.1

---

## Document Information

| Field | Detail |
|---|---|
| Product | Sarawak Maker-In-A-Box (S-MIB) |
| Version | 2.1 |
| Status | Active Development |
| Lead Developer | Fazrin Ezan Darwish Bin Hamzah (BCS25020024) |
| Institution | Universiti Teknologi Sarawak (UTS) |
| Current Milestone | CSS3133 OOP Assignment — May 2026 |
| Long-Term Target | GovTech deployment — Sarawak |
| Potential Partners | TEGAS, MDEC, Sarawak Digital Economy |

---

## 1. Executive Summary

S-MIB is a self-directed mobile learning platform that guides rural Sarawak
students through hands-on STEM projects using recycled and easily available
materials. Designed in the spirit of Duolingo but for TVET pathways, the app
gamifies practical learning through XP, badges, streaks, and verifiable
certificates — making STEM education accessible to students regardless of
school resources or internet connectivity.

S-MIB is being developed incrementally across university semesters with the
long-term goal of becoming a government-endorsed platform under Sarawak's
Post-COVID Development Strategy (PCDS) 2030. The current version establishes
the core architecture, OOP class structure, and working mobile application.
Each subsequent semester adds capability toward full production deployment.

---

## 2. Problem Statement

### 2.1 The Gap
Sarawak's rural youth face a compounding disadvantage:

- Schools in rural areas are under-resourced, limiting practical STEM exposure
- Students learn STEM theory but have no structured way to apply it practically
- The transition from STEM education to TVET pathways is poorly supported
- The State's 2025 targets — 40% science enrollment, 20% TVET enrollment —
  are at risk without accessible, practical intervention (Mail, 2022)

### 2.2 The Consequence
This gap does not just affect individual students. It undermines Sarawak's
ability to build the skilled workforce required for key PCDS 2030 sectors
including Manufacturing, Basic Infrastructure, and Digital Transformation.

### 2.3 The Opportunity
A mobile-first, offline-friendly, gamified STEM learning platform — designed
specifically for rural Sarawak conditions — can bridge this gap at scale.
Digital delivery removes the dependency on school infrastructure. Gamification
drives self-directed engagement. Verifiable certificates create a pathway from
informal learning to formal TVET recognition.

---

## 3. Strategic Alignment

| Framework | Specific Alignment |
|---|---|
| SDG 4 — Quality Education | Target 4.3: Equal access to technical and vocational training |
| SDG 4 — Quality Education | Target 4.4: Skills for employment and entrepreneurship |
| PCDS 2030 Sector 06 | Social Inclusivity — reaching rural and remote populations |
| PCDS 2030 Enabler 07 | Education and Human Capital — cultivating skilled workforce |
| Malaysia TVET Blueprint | Increasing TVET enrollment and perception among youth |

---

## 4. Product Vision

S-MIB is built to reach production deployment as fast as development allows.
There is no artificial roadmap tied to an academic calendar. Development
advances as far as it can go — whether that means a basic working app or a
fully deployed government-endorsed platform. The target does not move based
on what year it is.

**Stage 1 — Foundation (current focus)**
Complete learner journey working end-to-end. Creator and Parent roles
functional. All OOP classes used in a running app. Certificate system
working. AI troubleshooter integrated. Deployable APK ready.

**Stage 2 — Platform (next focus, no fixed timeline)**
Full Creator upload workflow with content moderation. Community features.
AI-powered project and learning path recommendations. Push notifications.
Bahasa Malaysia support. School and district-level analytics dashboard.

**Stage 3 — GovTech Deployment (as soon as Stage 2 is solid)**
Government partnership with TEGAS, MDEC, or Sarawak Digital Economy.
Official endorsement under PCDS 2030. Certificates integrated with TVET
enrollment recognition. District-level dashboards for education authorities.
Potential expansion to other Malaysian states.

The gap between Stage 1 and Stage 3 is determined by execution speed,
not by university timetables. If funding is secured at Stage 1, Stage 2
and 3 accelerate accordingly.

---

## 5. Target Users

### 5.1 Primary User — Learner

| Attribute | Detail |
|---|---|
| Who | Rural Sarawak students |
| Age range | 10–17 years (Year 4 to Form 5) |
| Classes | `JuniorLearner` (Year 4–6), `SeniorLearner` (Form 1–5) |
| Motivation | Learn by doing, earn recognition, progress at own pace |
| Constraint | Budget Android phone, low or intermittent connectivity |
| Self-directed | Yes — no teacher required to use the app |

### 5.2 Secondary User — Creator

| Attribute | Detail |
|---|---|
| Who | Verified educators, curriculum designers, TVET practitioners |
| Classes | `Creator` (base), `VerifiedCreator` (certified), `ContentMentor` (also answers questions) |
| Role | Uploads and maintains STEM project content |
| Verification | Manually verified for current version, approval workflow in future version |
| Long-term | Could include government agencies, NGOs, corporate STEM sponsors |

### 5.3 Secondary User — Parent / Guardian

| Attribute | Detail |
|---|---|
| Who | Parents or guardians of student users |
| Class | `User` with role `'parent'` |
| Role | Views child's progress, completed projects, and earned certificates |
| Access | Read-only view of their linked child's data |

---

## 6. Feature List

### 6.1 Core Features — Current Version (May 2026)

| ID | Feature | Description | User |
|---|---|---|---|
| F01 | Project Library | Browse all STEM projects with search and category filter | Learner |
| F02 | Step-by-Step Guide | Follow numbered instructions with image support | Learner |
| F03 | Progress Tracking | Track completed steps and project completion percentage | Learner |
| F04 | Project Enrolment | Enrol in a project and track it in active list | Learner |
| F05 | Achievement Badges | Earn badges for milestones — first completion, streaks, mastery | Learner |
| F06 | Certificate System | Earn verifiable certificates for project and category completion | Learner |
| F07 | Learner Profile | View personal info, XP level, rank title, badges, certificates | Learner |
| F08 | XP and Level System | Earn XP for steps and completions, level up automatically | Learner |
| F09 | Daily Streak | Track consecutive days of activity with streak counter and rewards | Learner |
| F10 | Role-Based Access | Different screens and data shown based on user role | All |
| F11 | Creator Dashboard | View uploaded projects and basic stats | Creator |
| F12 | Parent View | View linked child's progress, badges, and certificates | Parent |
| F13 | Offline-Friendly | Project steps cached locally after first load | Learner |

### 6.2 Enhanced Features — Target for Current Version

| ID | Feature | Description | User |
|---|---|---|---|
| F14 | AI Troubleshooter | Student types a problem, AI responds with step-specific help via Supabase Edge Function | Learner |
| F15 | Step Proof Submission | Snap a photo of completed work per step; stored in `step_submissions` table | Learner |
| F16 | Leaderboard | Top learners ranked by XP within school, Sarawak, and globally | Learner |
| F17 | Motivational AI Feedback | AI gives personalised encouragement based on progress and grade level | Learner |
| F18 | Notifications | In-app notifications for XP rewards, badge unlocks, streak reminders | All |
| F19 | Creator Project Management | Full project create, edit, delete, and step management by creators | Creator |
| F20 | Creator Analytics | Weekly enrolment trend, top projects, step completion funnel per project | Creator |
| F21 | Parent Activity Feed | Chronological log of child's app activity for parent monitoring | Parent |

### 6.3 Future Features — Subsequent Semesters / Post-Funding

| ID | Feature | Description |
|---|---|---|
| F22 | Creator Upload Portal | Web-based project upload with rich content editor |
| F23 | Project Approval Workflow | Admin reviews and approves creator content before publishing |
| F24 | Community Posts | Students post build photos, others like and comment |
| F25 | Embedded Video Tutorial | Curated YouTube video per project step |
| F26 | Multi-Language Toggle | Switch between English and Bahasa Malaysia |
| F27 | Push Notifications | Daily reminder for streaks and project continuation |
| F28 | QR Code Project Unlock | Scan physical kit QR code to unlock project |
| F29 | District Dashboard | Education authorities view aggregate progress data by district |
| F30 | TVET Enrollment Link | Certificate feeds into official TVET pre-enrollment system |

---

## 7. Screen List

### 7.1 Auth Screens (all roles)

| Screen ID | Screen Name | Features | Visible To |
|---|---|---|---|
| `login-default` | Login | F10 | All |
| `login-error` | Login Error State | F10 | All |
| `fp-modal` | Forgot Password | F10 | All |
| `reg-step1-back` | Register — Role Selection | F10 | New User |
| `reg-step2` | Register — Details Form | F10 | New User |
| `reg-success` | Registration Success | F10 | New User |

### 7.2 Learner Screens

| Screen ID | Screen Name | Features | Visible To |
|---|---|---|---|
| `s-home` | Learner Home | F03, F05, F08, F09 | Learner |
| `s-list` | Project List | F01 | Learner |
| `s-detail` | Project Detail | F02, F03, F04 | Learner |
| `s-step` | Step Detail | F02, F03, F15 | Learner |
| `s-progress` | Progress | F03, F08, F09 | Learner |
| `s-achieve` | Achievements | F05, F06 | Learner |
| `s-cert` | Certificate View | F06 | Learner |
| `s-aichat` | AI Help Chat | F14, F17 | Learner |
| `s-lb` | Leaderboard | F16 | Learner |
| `s-profile` | Learner Profile | F07, F08 | Learner |
| `s-notif` | Notifications | F18 | Learner |
| `s-explore` | Explore Projects | F01 | Learner |

### 7.3 Creator Screens

| Screen ID | Screen Name | Features | Visible To |
|---|---|---|---|
| `c-dash` | Creator Dashboard | F11, F19 | Creator |
| `c-myprojects` | My Projects List | F11, F19 | Creator |
| `c-projdetail` | Project Detail (Creator) | F11, F19 | Creator |
| `c-newproject` | New Project Form | F19 | Creator |
| `c-editproject` | Edit Project Form | F19 | Creator |
| `c-analytics` | Analytics Dashboard | F20 | Creator |
| `c-profile` | Creator Profile | F11 | Creator |

### 7.4 Parent Screens

| Screen ID | Screen Name | Features | Visible To |
|---|---|---|---|
| `p-dash` | Parent Dashboard | F12 | Parent |
| `p-child` | Child Progress View | F12 | Parent |
| `p-activity` | Activity Feed | F21 | Parent |
| `p-profile` | Parent Profile | F12 | Parent |

**Total: 29 screens** across 4 role flows.

---

## 8. User Stories

### Learner
- As a learner I want to browse STEM projects so I can find one that interests me
- As a learner I want to follow step-by-step instructions so I know exactly what to do without needing a teacher
- As a learner I want to track my progress so I know how far along I am
- As a learner I want to earn badges and certificates so my learning is recognised
- As a learner I want to see my XP and level so I feel motivated to keep going
- As a learner I want to maintain a daily streak so the app encourages me to keep learning
- As a learner I want to submit a photo of my finished step as proof of completion
- As a learner I want AI help when I am stuck so I can continue without giving up
- As a learner I want to see where I rank on the leaderboard to feel competitive

### Creator
- As a creator I want to create, edit, and manage my STEM projects from one dashboard
- As a creator I want to see which of my projects students are engaging with most
- As a creator I want to understand where students drop off in my project steps

### Parent
- As a parent I want to see my child's completed projects and certificates so I know they are learning productively
- As a parent I want a chronological activity feed so I can see what my child has been doing in the app

---

## 9. OOP Class Mapping

All features are implemented through the OOP class structure. Full class
definitions are documented in `/docs/Models_explained.md`.

| Feature Area | Classes Responsible |
|---|---|
| User authentication and profiles | `User` base class |
| Self-directed learner journey | `Student`, `JuniorLearner`, `SeniorLearner` |
| Project difficulty recommendations | `getRecommendedProjects()` — Polymorphism |
| Step-by-step guided learning | `GuidedProject`, `Step` |
| Open-ended creative projects | `OpenProject` |
| Progress and completion tracking | `Progress` |
| Badges and milestone rewards | `Achievement` |
| Verifiable certificates | `Certificate` extends `Achievement` |
| Verified content creation | `Creator`, `VerifiedCreator` |
| Student mentoring and Q&A | `ContentMentor` extends `Creator` |
| Materials and sustainability | `Material`, `Project` |

---

## 10. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Performance | Screens load within 2 seconds on budget Android device |
| Offline support | Project steps accessible without internet after first load |
| Accessibility | Minimum 14px font, high contrast, tap targets minimum 44×44px |
| Compatibility | Android 10 and above, tested via Expo Go |
| Security | Supabase Auth with JWT, role-based data isolation via RLS, AI API key kept server-side in Supabase Edge Function |
| Scalability | Database designed to support 500+ students per school |
| Extensibility | All classes and schema designed for future feature additions |
| Verifiability | Certificates include unique UUID verification code for authenticity |

---

## 11. Technical Stack

| Layer | Technology | Reason |
|---|---|---|
| Mobile App | React Native + Expo (SDK 54) | Cross-platform, beginner-accessible, production-capable |
| Database + Auth | Supabase (PostgreSQL, Asia-Pacific region) | All-in-one, free tier, scales to production |
| AI Features | Claude API via Supabase Edge Function | Powers troubleshooter and motivational feedback — API key stays server-side |
| Camera | expo-camera | Native camera access for step proof photos |
| Offline Cache | AsyncStorage | Local caching of project steps and materials |
| Version Control | Git + GitHub (Nazz752/Smib-app) | Full history, collaboration-ready |
| Build | Expo EAS Build | Production APK generation |
| Language | JavaScript ES6 OOP | Assignment requirement, industry-standard |

---

## 12. Out of Scope — Current Version

The following are explicitly excluded from the May 2026 submission but are
planned for future versions:

- F22–F30 as listed in Section 6.3
- Web version of the app
- Payment or premium subscription features
- Real-time multiplayer or collaborative features
- Integration with external TVET enrollment databases
- Mentor role home flow (role can be registered, home flow is future phase)

---

## 13. Success Criteria

### Assignment Milestone (May 25, 2026)
- All Core Features (F01–F13) working on a real Android device
- Minimum 4 Enhanced Features (F14–F21) working
- All OOP classes demonstrably used in the running app
- Complete learner journey working end-to-end:
  Register → Browse → Enrol → Complete Steps → Earn Certificate
- Creator Dashboard shows uploaded projects with analytics
- Parent Dashboard shows linked child's progress
- App runs without crashing through a full demo session

### Product Milestone (Ongoing)
- App codebase is structured for long-term extensibility
- Documentation is of sufficient quality to present to a potential funder
- Certificate system is designed with real verifiability in mind
- Architecture supports future government dashboard integration

---

## 14. Product Ambition Statement

S-MIB is not an academic exercise with a production goal attached as an
afterthought. It is a product. Every architecture decision, every class
design, every database table, and every line of documentation is built
to the standard of something that will be deployed, used, and potentially
funded — because that is the actual intention.

The self-directed learning model addresses a real, documented problem in
Sarawak. The certificate system is designed with genuine verifiability in
mind. The Creator role is built to support real educators and institutions
uploading real content. The data collected through Progress and Achievement
tables is structured to support district-level reporting for education
authorities — because that is the kind of insight a government partner needs.

Development will progress as fast as execution allows. There is no ceiling.
If the foundation is solid enough to attract a funding conversation today,
that conversation happens today. If the platform is deployment-ready before
the end of this academic year, it deploys before the end of this academic year.

The only limit is the quality of what gets built. That is what this
documentation suite exists to ensure.

---

*Document version 2.1 — updated screen list to 29 screens, added F18–F21 to enhanced features,*
*aligned AI implementation to Supabase Edge Function, renamed F15 to match step_submissions table.*
*Part of the S-MIB documentation suite: PRD · ERD · Architecture · Style Guide · Wireframes · SRS · DFD*
