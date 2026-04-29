# OOP Implementation Report
## S-MIB — Sarawak Maker-In-A-Box
### CSS3133 Object-Oriented Programming — UTS

---

## 1. Overview

This document describes the Object-Oriented Programming implementation in the S-MIB
React Native application. All 15 model classes in `src/models/` are active — each is
imported and used by at least one running screen. The classes demonstrate the four core
OOP pillars: **Encapsulation**, **Inheritance**, **Polymorphism**, and **Abstraction**.

---

## 2. Class Hierarchy

```
User (base)
├── Student (extends User)
│   ├── JuniorLearner (extends Student)
│   └── SeniorLearner (extends Student)
└── Creator (extends User)
    ├── VerifiedCreator (extends Creator)
    └── ContentMentor (extends Creator)

Project (abstract base)
├── GuidedProject (extends Project)
│   ├── composition → Step[]
│   └── composition → Material[]
└── OpenProject (extends Project)
    ├── composition → Step[]
    └── composition → Material[]

Achievement (standalone)
└── Certificate (extends Achievement)

Progress (standalone)
Step (standalone)
Material (standalone)
```

---

## 3. Class Definitions

### 3.1 User — `src/models/User.js`

**OOP Concepts:** Encapsulation (private fields), base class for inheritance

| Detail       | Value |
|---|---|
| Extends      | — (base class) |
| Extended by  | Student, Creator |
| Private fields | `#id`, `#name`, `#email`, `#role`, `#avatarUrl` |

**Key methods:**
- `get id()`, `get name()`, `get email()`, `get role()`, `get avatarUrl()` — typed getters
- `set name(value)` — validates non-empty (trims before checking)
- `getRoleLabel()` — returns human-readable role string (e.g. `'Junior Learner'`)
- `getDetails()` — returns a plain object snapshot of all fields

```js
const u = new User('uid-1', 'Aishah', 'aishah@email.com', 'junior_learner', null);
u.getRoleLabel(); // → 'Junior Learner'
```

---

### 3.2 Student — `src/models/Student.js`

**OOP Concepts:** Inheritance (extends User), encapsulation, computed properties

| Detail       | Value |
|---|---|
| Extends      | User |
| Extended by  | JuniorLearner, SeniorLearner |
| Private fields | `#xp`, `#level`, `#schoolName`, `#gradeLevel` |

**Key methods:**
- `set xp(value)` — automatically recalculates `#level = Math.min(Math.floor(value / 1000) + 1, 10)`
- `getRankTitle()` — returns rank string from a 10-element array indexed by level - 1

```js
// Level is auto-derived from XP — no separate setter needed
const s = new Student('uid', 'Budi', 'b@e.com', 'senior_learner', null, 2500, 1, 'SMK Kuching', 'Form 3');
s.xp = 2500;
s.level;       // → 3
s.getRankTitle(); // → 'STEM Explorer'
```

**Rank title array:**
```
Level 1 → 'Curious Maker'
Level 2 → 'Junior Builder'
Level 3 → 'STEM Explorer'
Level 4 → 'Maker Apprentice'
Level 5 → 'Project Maker'
Level 6 → 'Circuit Crafter'
Level 7 → 'Innovation Scout'
Level 8 → 'STEM Champion'
Level 9 → 'Master Builder'
Level 10 → 'Sarawak Maker'
```

---

### 3.3 JuniorLearner — `src/models/JuniorLearner.js`

**OOP Concepts:** Inheritance (3-level chain), polymorphism

| Detail  | Value |
|---|---|
| Extends | Student → User |

**Key method:**
- `getRecommendedProjects(allProjects)` — filters to `difficulty === 'beginner'` AND `type === 'guided'` only. Returns `{ projects, count }`.

```js
const jr = new JuniorLearner('uid', 'Amir', 'a@e.com', 'junior_learner', null, 0, 1, 'SK Batu', 'Year 4');
const { projects } = jr.getRecommendedProjects(allProjs);
// projects: only beginner guided projects
```

---

### 3.4 SeniorLearner — `src/models/SeniorLearner.js`

**OOP Concepts:** Inheritance (3-level chain), polymorphism

| Detail  | Value |
|---|---|
| Extends | Student → User |

**Key method:**
- `getRecommendedProjects(allProjects)` — filters to `type === 'open'` OR `(type === 'guided' && difficulty ∈ ['beginner', 'intermediate'])`. Returns `{ projects, count }`.

```js
const sr = new SeniorLearner('uid', 'Zara', 'z@e.com', 'senior_learner', null, 1500, 2, 'SMK Miri', 'Form 2');
const { projects } = sr.getRecommendedProjects(allProjs);
// projects: open projects + guided beginner/intermediate
```

**Polymorphism demonstration:**
`JuniorLearner` and `SeniorLearner` share the same method signature `getRecommendedProjects(allProjects)` but return different project sets — beginner-only vs. broader selection. `HomeScreen` and `ExploreScreen` call this single method without knowing which subclass they hold.

---

### 3.5 Creator — `src/models/Creator.js`

**OOP Concepts:** Inheritance (extends User), encapsulation

| Detail       | Value |
|---|---|
| Extends      | User |
| Extended by  | VerifiedCreator, ContentMentor |
| Private fields | `#organisation`, `#focusArea`, `#bio` |

**Key method:**
- `getPublicProfile()` — returns `{ id, name, organisation, focusArea, bio }` for display or export

---

### 3.6 VerifiedCreator — `src/models/VerifiedCreator.js`

**OOP Concepts:** Inheritance (extends Creator → User), encapsulation

| Detail       | Value |
|---|---|
| Extends      | Creator → User |
| Private fields | `#isVerified` (always `true`), `#verifiedAt` (ISO timestamp) |

**Key method:**
- `getVerificationStatus()` — returns `{ isVerified: true, verifiedAt, badgeLabel: 'Verified Creator' }`

**Usage:** `instanceof VerifiedCreator` drives the "Verified Creator" badge in `CreatorDashboardScreen` and `CreatorProfileScreen` without checking a raw boolean flag.

---

### 3.7 ContentMentor — `src/models/ContentMentor.js`

**OOP Concepts:** Inheritance (extends Creator → User), specialised behaviour

| Detail  | Value |
|---|---|
| Extends | Creator → User |

**Key method:**
- `answerQuestion(context, question)` — returns `{ mentorName, focusArea, context, question }` for enriching the AI payload

```js
const mentor = new ContentMentor('uid', 'Dr. Tan', 't@e.com', 'content_mentor', null, 'UTS', 'Electronics', 'IoT researcher');
const ctx = mentor.answerQuestion({ projectId: 'p1', stepId: 's2' }, 'What is Ohm's Law?');
// ctx.mentorName  → 'Dr. Tan'
// ctx.focusArea   → 'Electronics'
```

---

### 3.8 Project — `src/models/Project.js`

**OOP Concepts:** Abstraction (cannot be instantiated directly), composition

| Detail      | Value |
|---|---|
| Abstract    | Yes — `new.target === Project` throws `Error('Project is abstract...')` |
| Extended by | GuidedProject, OpenProject |
| Private fields | `#id`, `#title`, `#description`, `#difficulty`, `#category`, `#steps[]`, `#materials[]` |

**Key methods:**
- `addStep(step)` / `getSteps()` — composition: Project owns Step objects
- `addMaterial(material)` / `getMaterials()` — composition: Project owns Material objects
- `getRecyclableMaterials()` — filters materials to `isRecyclable === true`

---

### 3.9 GuidedProject — `src/models/GuidedProject.js`

**OOP Concepts:** Inheritance (extends Project), composition (Step[], Material[])

| Detail       | Value |
|---|---|
| Extends      | Project |
| Private fields | `#instructionLevel`, `#estimatedDuration` (minutes) |

**Key method:**
- `getFormattedDuration()` — converts raw minutes to human-readable string, e.g. `'About 1 hour 30 minutes'`

```js
const gp = new GuidedProject('id', 'LED Circuit', '...', 'beginner', 'Electronics', 'simple', 90);
gp.getFormattedDuration(); // → 'About 1 hour 30 minutes'
```

**Usage in app:** `ProjectDetailScreen` displays `projectModel.getFormattedDuration()` in the metadata row.

---

### 3.10 OpenProject — `src/models/OpenProject.js`

**OOP Concepts:** Inheritance (extends Project)

| Detail       | Value |
|---|---|
| Extends      | Project |
| Private fields | `#creativityScore` (0–100) |

**Key method:**
- `getCreativityLabel()` — maps score to label: `0–39 → 'Structured'`, `40–69 → 'Creative'`, `70+ → 'Highly Creative'`

---

### 3.11 Step — `src/models/Step.js`

**OOP Concepts:** Encapsulation, composition (owned by Project)

| Detail       | Value |
|---|---|
| Private fields | `#id`, `#stepNumber`, `#title`, `#instructions`, `#imageRef` |

**Key method:**
- `getSummary()` — returns `{ stepNumber, title }` for navigation and progress display

---

### 3.12 Material — `src/models/Material.js`

**OOP Concepts:** Encapsulation, composition (owned by Project)

| Detail       | Value |
|---|---|
| Private fields | `#id`, `#name`, `#description`, `#isRecyclable` |

**Key methods:**
- `getDetails()` — returns all four fields as a plain object
- `get isRecyclable` — boolean; used by `Project.getRecyclableMaterials()` to filter

---

### 3.13 Progress — `src/models/Progress.js`

**OOP Concepts:** Encapsulation, state mutation with validation

| Detail       | Value |
|---|---|
| Private fields | `#studentId`, `#projectId`, `#completedSteps[]`, `#progressPct` |

**Key methods:**
- `completeStep(stepNumber, totalSteps)` — adds stepNumber to `#completedSteps` only if not already present; recalculates `#progressPct = (completedSteps.length / totalSteps) * 100`
- `getProgressPercentage()` — returns `#progressPct`

```js
const prog = new Progress('uid', 'pid', [1, 2], 5);
prog.completeStep(3, 5);
prog.getProgressPercentage(); // → 60
prog.completeStep(3, 5);      // no-op: already completed
```

---

### 3.14 Achievement — `src/models/Achievement.js`

**OOP Concepts:** Encapsulation, association (links to student by ID)

| Detail       | Value |
|---|---|
| Extended by  | Certificate |
| Private fields | `#id`, `#studentId`, `#title`, `#type`, `#triggerType`, `#dateAwarded` |

**Key method:**
- `getDetails()` — returns all six fields as a plain object

---

### 3.15 Certificate — `src/models/Certificate.js`

**OOP Concepts:** Inheritance (extends Achievement), encapsulation

| Detail       | Value |
|---|---|
| Extends      | Achievement |
| Fields       | `_achievementId` (non-private, used by service layer), `#certType`, `#verificationCode`, `#issuedBy` |

**Key method:**
- `getCertTypeLabel()` — maps raw DB enum to display string:
  - `'project_completion'` → `'Project Completion'`
  - `'category_mastery'` → `'Category Mastery'`
  - `'streak_milestone'` → `'Streak Milestone'`
  - any other → `'Achievement'`

```js
const cert = new Certificate('cid', 'aid', 'uid', 'First Project!', 'first_project', 'project_completion', 'SMIB-2025-ABCD1234', 'S-MIB Platform');
cert.getCertTypeLabel();    // → 'Project Completion'
cert.verificationCode;      // → 'SMIB-2025-ABCD1234'
```

---

## 4. Class-to-Screen Usage Map

The table below maps each model class to the screen(s) that import and actively use it.

| Model Class | Screen File | Usage |
|---|---|---|
| `JuniorLearner` | `HomeScreen.js` | Drives "Explore New" project list — `getRecommendedProjects()` filters to beginner guided projects |
| `SeniorLearner` | `HomeScreen.js` | Same method, broader filter — open + guided intermediate |
| `JuniorLearner` | `ExploreScreen.js` | `getRecommendedProjects()` counts how many displayed projects match the learner's level |
| `SeniorLearner` | `ExploreScreen.js` | Same as above for senior learners |
| `JuniorLearner` | `ProfileScreen.js` | `getRankTitle()` drives the rank badge (e.g. "Curious Maker") |
| `SeniorLearner` | `ProfileScreen.js` | Same for senior learners |
| `GuidedProject` | `ProjectDetailScreen.js` | `getFormattedDuration()` displays estimated time in the detail header |
| `OpenProject` | `ProjectDetailScreen.js` | `getCreativityLabel()` available; model constructed for open-type projects |
| `Step` | `ProjectDetailScreen.js` | Step objects added to project model via `addStep()` after load |
| `Step` | `StepDetailScreen.js` | `new Step(...)` built from DB row; `getSummary()` available |
| `Material` | `StepDetailScreen.js` | `new Material(...)` built for each material; `getDetails()` available |
| `Progress` | `StepDetailScreen.js` | `completeStep(stepNumber, totalSteps)` called before the DB write in `handleMarkDone` |
| `Achievement` | `AchievementsScreen.js` | Achievements mapped to model instances; `type` and `triggerType` getters drive badge display |
| `Achievement` | `ChildProgressScreen.js` | Achievements mapped to model instances; `type` getter used to filter badges |
| `Certificate` | `CertificateScreen.js` | `getCertTypeLabel()` drives the type tag; `verificationCode` getter used for copy/share |
| `ContentMentor` | `AIHelpScreen.js` | `answerQuestion()` enriches the AI payload when `user.role === 'content_mentor'` |
| `Creator` | `CreatorDashboardScreen.js` | Constructed when creator is not verified; `instanceof` check drives verified badge logic |
| `VerifiedCreator` | `CreatorDashboardScreen.js` | `instanceof VerifiedCreator` shows "Verified Creator" badge |
| `Creator` | `CreatorProfileScreen.js` | Constructed for non-verified creators; `getPublicProfile()` called |
| `VerifiedCreator` | `CreatorProfileScreen.js` | `instanceof VerifiedCreator` drives verified badge; `verifiedAt` accessible via getter |

**All 15 model classes confirmed imported in `src/screens/`.**

---

## 5. OOP Pillars Demonstrated

### 5.1 Encapsulation

Every model uses JavaScript private class fields (`#fieldName`). Data can only be
read via typed getters and mutated via validated setters or methods:

```js
// Direct access is impossible:
student.#xp = 9999; // SyntaxError

// Must go through the setter, which auto-recalculates level:
student.xp = 9999;
student.level; // → 10 (auto-derived)
```

### 5.2 Inheritance

Three-level inheritance chains are used for both learner and creator hierarchies:

```
User → Student → JuniorLearner
User → Student → SeniorLearner
User → Creator → VerifiedCreator
User → Creator → ContentMentor
Achievement → Certificate
```

Each subclass calls `super(...)` in its constructor and adds properties and methods
specific to its role.

### 5.3 Polymorphism

`JuniorLearner` and `SeniorLearner` both implement `getRecommendedProjects(allProjects)`
with the same signature but different filtering logic. Screens use the method without
needing to know which subclass they hold:

```js
// HomeScreen — same call, different results based on role:
const LearnerClass = user.role === 'junior_learner' ? JuniorLearner : SeniorLearner;
const learnerModel = new LearnerClass(...);
const { projects } = learnerModel.getRecommendedProjects(allProjects);
// JuniorLearner → beginner guided only
// SeniorLearner → open + guided beginner/intermediate
```

### 5.4 Abstraction

`Project` is an abstract base class. It cannot be instantiated directly:

```js
const p = new Project(...); // throws: 'Project is abstract and cannot be instantiated directly.'
const gp = new GuidedProject(...); // ✓ works
```

The `new.target` guard in `Project`'s constructor enforces this at runtime.

---

## 6. Composition

`GuidedProject` and `OpenProject` own arrays of `Step` and `Material` objects.
These are populated after loading from the database:

```js
// ProjectDetailScreen.js — after DB load:
const model = new GuidedProject(proj.id, proj.title, ...);
stepList.forEach(s =>
  model.addStep(new Step(s.id, s.step_number, s.title, s.instructions, s.image_ref ?? null))
);
```

The `Project.getRecyclableMaterials()` method filters the owned `Material` objects:

```js
model.addMaterial(new Material('m1', 'Cardboard', 'Cereal box', true));
model.addMaterial(new Material('m2', 'Copper wire', '22 AWG', false));
model.getRecyclableMaterials(); // → [ Material { name: 'Cardboard', ... } ]
```

---

## 7. File Locations

```
src/models/
├── User.js
├── Student.js
├── JuniorLearner.js
├── SeniorLearner.js
├── Creator.js
├── VerifiedCreator.js
├── ContentMentor.js
├── Project.js
├── GuidedProject.js
├── OpenProject.js
├── Step.js
├── Material.js
├── Progress.js
├── Achievement.js
└── Certificate.js
```

---

*OOP_Implementation.md — verified against source code as of 2026-04-29*
*All code examples reflect the actual implementations in `src/models/`.*
