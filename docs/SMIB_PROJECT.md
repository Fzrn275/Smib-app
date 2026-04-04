# SMIB_PROJECT.md — S-MIB Project Master Prompt
# Sarawak Maker-In-A-Box (S-MIB) Mobile App
# CSS3133 Object Oriented Programming | Firestarter Group

---

## IMPORTANT CONTEXT FOR CLAUDE CODE

This project is built by a **solo developer** who is a second-year Computer Science student
working on their **first real project**. Claude Code is responsible for writing all code.
The developer's role is to direct, review, run, and test the output.

Every piece of code must be:
- Clearly commented so the developer can understand and explain it during presentation
- Broken into small manageable steps — never dump everything at once
- Accompanied by a short plain-English explanation of what was just written and why
- Written to visibly demonstrate OOP principles since this is the core assignment requirement

When something goes wrong, explain the error in simple language before fixing it.
Never assume prior knowledge. Always explain what a command does before asking the
developer to run it.

---

## 1. WHO YOU ARE WORKING WITH

**Developer:** Fazrin Ezan Darwish Bin Hamzah
**Student ID:** BCS25020024
**Course:** CSS3133 Object Oriented Programming
**Institution:** Universiti Teknologi Sarawak (UTS)
**Semester:** February Semester 2025-2026
**Assignment weight:** 60% of final grade
**Submission deadline:** 25 May 2026, 5:00 PM
**Submission format:** Softcopy report via Google Classroom + live demo/presentation

**On paper the project is submitted as group "Firestarter" with these members:**
| Name | Student ID | Role on Paper |
|---|---|---|
| Muhammad Haris Izzuddin Bin Norhazeri | BCS25020049 | Project Leader / Frontend |
| Mohammad Aidil Irfan Bin Imran | BCS25020038 | Documentation / Midend |
| Fazrin Ezan Darwish Bin Hamzah | BCS25020024 | Developer / Backend |

---

## 2. PROJECT OVERVIEW

### 2.1 Project Name
**Sarawak Maker-In-A-Box (S-MIB) Mobile App**

### 2.2 Mission
Closing the STEM-to-TVET Gap for Sarawak's Rural Youth. The app provides an accessible,
interactive platform where students can learn and build simple STEM projects using recycled
or easily available materials.

### 2.3 Alignment
- **SDG 4** — Quality Education
- **PCDS 2030 Sector 06** — Social Services (Social Inclusivity for rural populations)
- **PCDS 2030 Enabler 07** — Education and Human Capital Development

### 2.4 Problem Being Solved
Sarawak's rural youth face limited early STEM exposure due to poorly equipped schools.
This impedes their transition into TVET pathways, hindering the State's 2025 enrollment
targets (40% science, 20% TVET). The app bridges this gap by making STEM learning
accessible, practical, and self-paced — designed to work with minimal internet connectivity.

### 2.5 Target Users
- **JuniorLearner** — Primary school students, Year 4–6, rural Sarawak
- **SeniorLearner** — Secondary school students, Form 1–5, rural Sarawak
- **ClassroomTeacher** — Manages a class group, monitors collective student progress
- **Mentor** — Works with individual students, provides 1-on-1 guidance
- **Parent/Guardian** — Views child's completed projects and achievements

### 2.6 Core App Features
- Browse a library of DIY STEM projects
- Follow step-by-step project instructions with images
- Track project progress and completion status
- View achievements and badges earned
- Teacher/Mentor dashboard to monitor student progress
- Role-based access — different views for student vs teacher vs parent

---

## 3. TECH STACK

### Architecture: React Native + Supabase (No Separate Backend)

This project uses a **simplified full-stack architecture** where Supabase replaces a
traditional backend server. Supabase provides the database, authentication, and API
all in one platform. This is the right choice for a solo first-time developer because:
- No separate server to set up or maintain
- Authentication is handled automatically
- The database is accessible directly from the app via Supabase JS client
- Less moving parts means less things that can break
- Still fully demonstrates OOP, live data, and all assignment requirements

### Stack Summary
| Layer | Tool | Purpose |
|---|---|---|
| Mobile App | React Native + Expo | Cross-platform mobile app (iOS + Android) |
| UI Components | React Native Paper | Pre-built professional UI components |
| Navigation | React Navigation | Screen-to-screen navigation |
| State Management | React Context API | Managing logged-in user state globally |
| Database | Supabase (PostgreSQL) | Stores all app data |
| Authentication | Supabase Auth | Handles login, register, sessions |
| API | Supabase JS Client | Fetches and updates data from the database |
| OOP Models | JavaScript Classes | Written in /src/models/ — core of the assignment |
| Version Control | Git + GitHub | Tracks all code changes |
| Preview | Expo Go (phone app) | Run and test the app on your phone |

---

## 4. PROJECT FOLDER STRUCTURE

```
smib-app/
│
├── /src
│   │
│   ├── /models                  ← OOP CLASS DEFINITIONS (most important folder)
│   │   ├── User.js              ← Base class
│   │   ├── Student.js           ← Extends User
│   │   ├── JuniorLearner.js     ← Extends Student
│   │   ├── SeniorLearner.js     ← Extends Student
│   │   ├── Teacher.js           ← Extends User
│   │   ├── ClassroomTeacher.js  ← Extends Teacher
│   │   ├── Mentor.js            ← Extends Teacher
│   │   ├── Project.js           ← Base class
│   │   ├── GuidedProject.js     ← Extends Project
│   │   ├── OpenProject.js       ← Extends Project
│   │   ├── Step.js              ← Composition (belongs to Project)
│   │   ├── Material.js          ← Composition (belongs to Project)
│   │   ├── Progress.js          ← Association (links Student + Project)
│   │   └── Achievement.js       ← Association (linked to Student)
│   │
│   ├── /screens                 ← One file per app screen
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ProjectListScreen.js
│   │   ├── ProjectDetailScreen.js
│   │   ├── StepByStepScreen.js
│   │   ├── ProgressScreen.js
│   │   ├── AchievementsScreen.js
│   │   └── TeacherDashboardScreen.js
│   │
│   ├── /navigation
│   │   └── AppNavigator.js      ← All screen navigation defined here
│   │
│   ├── /context
│   │   └── AuthContext.js       ← Stores logged-in user globally
│   │
│   ├── /services                ← Functions that talk to Supabase
│   │   ├── authService.js       ← login, register, logout
│   │   ├── projectService.js    ← fetch projects, steps, materials
│   │   ├── progressService.js   ← track and update progress
│   │   └── achievementService.js← fetch and award achievements
│   │
│   └── /utils
│       └── supabaseClient.js    ← Supabase connection (uses .env keys)
│
├── /database
│   ├── schema.sql               ← Run this once in Supabase SQL editor
│   └── seed.sql                 ← Sample data to populate and test the app
│
├── App.js                       ← Entry point of the entire app
├── app.json                     ← Expo configuration
├── package.json                 ← Project dependencies
├── .env                         ← Supabase URL and key — NEVER commit this
├── .gitignore                   ← Must include .env
├── README.md
└── SMIB_PROJECT.md                    ← This file
```

---

## 5. OOP CLASS DESIGN

This is the core of the assignment. Every class must be in its own file in /src/models/.

### 5.1 Inheritance Hierarchy

```
User                          ← Base Class (Level 1)
├── Student                   ← Inherits User (Level 2)
│     ├── JuniorLearner       ← Inherits Student (Level 3) — Year 4–6
│     └── SeniorLearner       ← Inherits Student (Level 3) — Form 1–5
└── Teacher                   ← Inherits User (Level 2)
      ├── ClassroomTeacher    ← Inherits Teacher (Level 3) — Manages a class
      └── Mentor              ← Inherits Teacher (Level 3) — 1-on-1 guidance

Project                       ← Base Class (Level 1)
├── GuidedProject             ← Inherits Project (Level 2) — Full step-by-step
└── OpenProject               ← Inherits Project (Level 2) — Freestyle/creative
```

### 5.2 Supporting Classes

| Class | Relationship | Connected To | Notes |
|---|---|---|---|
| Step | Composition | Project | Deleted when Project is deleted |
| Material | Composition | Project | Deleted when Project is deleted |
| Progress | Association | Student + Project | Both can exist without Progress |
| Achievement | Association | Student | Stored under Student record |

### 5.3 Class Definitions

#### User (Base Class)
```javascript
// Encapsulation: all attributes are private (#)
// Abstraction: base class, never used directly
Attributes: #userID, #name, #age, #email, #password, #role
Methods:    login(), logout(), updateProfile(), getRole(),
            getName(), getEmail(), setName(), setEmail()
```

#### Student (extends User)
```javascript
// Inheritance: extends User, calls super() in constructor
Attributes: #enrolledProjects, #progressList, #achievementList, #gradeLevel
Methods:    enrollProject(), viewProgress(), viewAchievements(),
            browseProjects(), getGradeLevel()
```

#### JuniorLearner (extends Student)
```javascript
// Polymorphism: overrides getRecommendedProjects() from Student
Attributes: #preferredDifficulty = "beginner"
Methods:    getRecommendedProjects()  ← returns ONLY beginner GuidedProjects
```

#### SeniorLearner (extends Student)
```javascript
// Polymorphism: same method name, different behaviour
Attributes: #preferredDifficulty = "intermediate"
Methods:    getRecommendedProjects()  ← returns all projects including OpenProject
```

#### Teacher (extends User)
```javascript
Attributes: #assignedStudents, #recommendedProjects
Methods:    recommendProject(), viewStudentProgress(), viewClassSummary()
```

#### ClassroomTeacher (extends Teacher)
```javascript
Attributes: #className, #studentGroup
Methods:    viewGroupProgress(), assignGroupProject()
```

#### Mentor (extends Teacher)
```javascript
Attributes: #mentoredStudents, #focusArea
Methods:    sendFeedback(), getMentoredStudents()
```

#### Project (Base Class)
```javascript
Attributes: #projectID, #title, #difficulty, #category,
            #description, #stepList, #materialList
Methods:    getSteps(), getMaterials(), getDetails(), getDifficulty()
```

#### GuidedProject (extends Project)
```javascript
Attributes: #instructionLevel, #estimatedDuration
Methods:    getNextStep(), checkCompletion(), getEstimatedDuration()
```

#### OpenProject (extends Project)
```javascript
Attributes: #suggestedMaterials, #creativityScore
Methods:    submitCreation(), getSuggestions(), getCreativityScore()
```

#### Step (Composition — part of Project)
```javascript
Attributes: #stepNumber, #description, #imageRef
Methods:    getDescription(), getImage(), getStepNumber()
```

#### Material (Composition — part of Project)
```javascript
Attributes: #materialID, #name, #description, #isRecyclable
Methods:    getDetails(), checkIsRecyclable()
```

#### Progress (Association — links Student to Project)
```javascript
Attributes: #progressID, #studentID, #projectID,
            #completedSteps, #isCompleted, #lastUpdated
Methods:    markStepComplete(), getCompletionPercentage(), isDone()
```

#### Achievement (Association — linked to Student)
```javascript
Attributes: #achievementID, #title, #description,
            #dateAwarded, #studentID, #badgeImageRef
Methods:    getDetails(), getBadge(), getDateAwarded()
```

### 5.4 OOP Principles Checklist

| Principle | How It Is Shown |
|---|---|
| **Inheritance** | `extends` keyword + `super()` in every child class constructor |
| **Encapsulation** | All attributes use `#` (private fields) with public getters/setters |
| **Polymorphism** | `getRecommendedProjects()` overridden differently in JuniorLearner vs SeniorLearner |
| **Abstraction** | User and Project are base classes — child classes implement the specific behaviour |

---

## 6. DATABASE SCHEMA

Run this once in the **Supabase SQL Editor**.

```sql
-- Users table (maps to User base class)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR CHECK (role IN (
    'junior_learner',
    'senior_learner',
    'classroom_teacher',
    'mentor',
    'parent'
  )) NOT NULL,
  grade_level VARCHAR,
  class_name VARCHAR,
  focus_area VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects table (maps to Project base class)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  difficulty VARCHAR CHECK (difficulty IN ('beginner','intermediate','advanced')),
  category VARCHAR,
  type VARCHAR CHECK (type IN ('guided','open')) NOT NULL,
  estimated_duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Steps (composition — ON DELETE CASCADE mirrors composition relationship)
CREATE TABLE steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  image_ref VARCHAR
);

-- Materials (composition — ON DELETE CASCADE mirrors composition relationship)
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  is_recyclable BOOLEAN DEFAULT FALSE
);

-- Progress (association — regular foreign key, not cascade)
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  completed_steps INTEGER[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Achievements (association — regular foreign key, not cascade)
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  description TEXT,
  badge_image_ref VARCHAR,
  date_awarded TIMESTAMP DEFAULT NOW()
);
```

---

## 7. ONE-TIME SETUP STEPS

**Do these in order before writing any code.**

### Install tools (if not already installed)
```bash
# Check Node.js — should show a version number like v18.x.x
node --version
# If not installed: download from https://nodejs.org (choose LTS)

# Check Git
git --version
# If not installed: download from https://git-scm.com

# Install Expo CLI
npm install -g expo-cli
```

### Create the project
```bash
npx create-expo-app smib-app --template blank
cd smib-app
npm install @supabase/supabase-js
npm install @react-navigation/native @react-navigation/stack
npm install react-native-paper
npm install react-native-screens react-native-safe-area-context
```

### Set up GitHub
```bash
git init
git add .
git commit -m "Initial project setup"
# Create repo on github.com called smib-app then:
git remote add origin https://github.com/YOUR_USERNAME/smib-app.git
git push -u origin main
```

### Set up Supabase
1. Go to supabase.com → create free account → New Project
2. Go to SQL Editor → paste schema from Section 6 → Run
3. Go to Settings → API → copy Project URL and anon public key
4. Create `.env` file in project root:
```
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```
5. Add `.env` to `.gitignore` — never commit this file

### Place SMIB_PROJECT.md in project root
Copy this file into the `smib-app/` folder. Claude Code reads it automatically.

### Install Expo Go on your phone
Download **Expo Go** from the App Store or Google Play.
This lets you test the app on your real phone instantly.

---

## 8. DAILY WORKFLOW

```
1. Open VS Code in the smib-app folder
2. Tell Claude Code what you need
   Example: "Build the Student class that extends User"
3. Claude Code writes the code
4. Copy it into the correct file
5. Run the app: npx expo start
6. Scan the QR code with Expo Go on your phone
7. Check if it works
8. If there is an error, paste the full error message back to Claude Code
9. Once it works: git add . → git commit -m "message" → git push
10. Repeat
```

---

## 9. VERSION CONTROL RULES

```bash
# Save your work after every working feature
git add .
git commit -m "Add Student class with inheritance from User"
git push

# Branch naming for features
git checkout -b feature/user-classes
git checkout -b feature/project-screen
git checkout -b feature/supabase-auth

# Never commit broken code to main
# Never commit the .env file
```

---

## 10. DEPLOYMENT (Week 9–10 only)

Do not worry about this until Week 9. When ready:

1. **Supabase** — already cloud-hosted, nothing to deploy
2. **App preview** — share via Expo Go using `npx expo start` (no build needed for demo)
3. **APK build** — if needed: `npx eas build --platform android` (requires Expo account)

---

## 11. ASSIGNMENT RUBRIC

| Phase | Marks | What Gets Checked |
|---|---|---|
| Phase 1 — Problem Understanding & Object ID | 10% | Problem statement, target users, class hierarchy with justification |
| Phase 2 — System Design OOP Model | 10% | Full UML, attributes, methods, all OOP relationships shown |
| Phase 3 — Implementation | 10% | Working code showing inheritance, encapsulation, polymorphism |
| Phase 4 — Reflection & Design Evolution | 10% | What changed from original design and why |
| Progress Monitoring (10 weeks) | 10% | Weekly progress documented, actual vs planned |
| Group Presentation | 10% | Live demo, explain design decisions clearly |

**Total: 60% of final grade. Deadline: 25 May 2026, 5:00 PM**

---

## 12. WHAT TO SAY DURING PRESENTATION

You need to explain the design decisions, not just show the code. Key points:

- **Why these classes exist** — each class maps to a real person or real thing in the system
- **Why inheritance** — Student and Teacher share User attributes, inheritance avoids repeating them
- **Why JuniorLearner and SeniorLearner are separate** — they behave differently, this shows polymorphism
- **Why Step and Material are composition** — they cannot exist without a Project
- **Why Progress and Achievement are association** — Student and Project exist independently of them
- **Why Supabase** — all-in-one solution, database and API in one place, suitable for mobile apps

---

## 13. REFERENCE FILES

Upload these alongside SMIB_PROJECT.md when starting a Claude Code session:

- `smib-app.html` — Original S-MIB HTML prototype from Design Thinking assignment.
  Use as **visual reference only** for what screens should look like.
  Do NOT copy or reuse the code — it is a static mockup, not real implementation.
- `Milestone_Breakdown.docx` — Weekly progress tracker, Weeks 1–3 completed.

---

## 14. CURRENT PROJECT STATUS

| Week | Status | What Was Done |
|---|---|---|
| Week 1 | ✅ Complete | Team roles, project confirmed, PCDS alignment |
| Week 2 | ✅ Complete | Problem defined, target users, 8 system objects |
| Week 3 | ✅ Complete | Class hierarchy, inheritance tree, supporting classes |
| Week 4 | 🔲 Next | Full UML diagram with all attributes and methods |
| Week 5–10 | 🔲 Pending | Implementation, testing, report, presentation |

**First Claude Code task when ready:**
> "Set up the project folder structure exactly as shown in Section 4,
> then build all the OOP model class files in /src/models/ starting
> with User.js as the base class. Follow the class definitions in
> Section 5.3 exactly. Use JavaScript private class fields (#) for
> encapsulation and write clear comments explaining each part."

---

## 15. RECOMMENDED VS CODE EXTENSIONS

Install these in VS Code before starting. Each one makes development easier.
To install: open VS Code → click the Extensions icon on the left sidebar (looks like 4 squares) → search the name → click Install.

### Essential — install these first

| Extension | What it does | Why you need it |
|---|---|---|
| **Claude Code** | AI coding assistant | Writes all the code for you based on this file |
| **ESLint** | Checks your code for mistakes as you type | Catches errors before you even run the app |
| **Prettier** | Auto-formats your code to look clean | Keeps code readable without manual effort |
| **GitLens** | Shows Git history and changes inside VS Code | Helps you track what changed and when |

### Recommended — install these after

| Extension | What it does | Why you need it |
|---|---|---|
| **React Native Tools** | Helps VS Code understand React Native code | Better code suggestions for the app |
| **ES7+ React/Redux/React-Native snippets** | Shortcuts for writing React Native code | Type `rnc` and it writes a full component for you |
| **Expo Tools** | Suport for Expo-specific files | Makes Expo config files easier to read |
| **DotENV** | Highlights `.env` files | Makes your Supabase keys easier to read |
| **Thunder Client** | Test your Supabase API calls inside VS Code | No need to open Postman separately |
| **Auto Rename Tag** | Renames closing tag when you rename opening tag | Saves time when editing screen components |
| **Path Intellisense** | Autocompletes file paths when importing | No more typos in import statements |

### How to install all at once (faster)
Open VS Code Terminal (`Ctrl+` `` ` ``) and paste this:
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension eamodio.gitlens
code --install-extension msjsdiag.vscode-react-native
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension byCedric.vscode-expo
code --install-extension mikestead.dotenv
code --install-extension rangav.vscode-thunder-client
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
```
Press Enter and wait for them all to install. Done.

### After installing Prettier — one extra step
1. Press `Ctrl+Shift+P`
2. Type `Open User Settings JSON` and press Enter
3. Add these two lines inside the curly brackets `{}`:
```json
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode"
```
This makes VS Code auto-clean your code every time you save a file.

---

## 16. CUSTOM INSTRUCTIONS FOR CLAUDE CODE

After installing Claude Code, set this as your custom instruction so it always
talks to you in a beginner-friendly way.

**How to set it:**
1. Press `Ctrl+Shift+P`
2. Type `Claude: Open Settings` and press Enter
3. Find the **Custom Instructions** or **System Prompt** field
4. Paste exactly this:

```
I am a second-year Computer Science student working on my first real project.
I have no prior experience building a full app from scratch.

Always follow these rules when helping me:
- Explain what you are about to do in plain simple English BEFORE writing any code
- Break every task into small steps — never build multiple things at once
- After writing code, explain what each important part does in simple terms
- If there is an error, explain what caused it in simple language before fixing it
- Never assume I already know a command, tool, concept, or term
- If you introduce something new (a library, a concept, a pattern), explain what it
  is and why we are using it before using it
- Always tell me which file to put the code in and where inside that file
- Remind me to save and test after each step
- If something can go wrong, warn me before I do it
```

This works together with SMIB_PROJECT.md — the custom instruction controls HOW Claude Code
talks to you, and SMIB_PROJECT.md contains WHAT the project is about.
