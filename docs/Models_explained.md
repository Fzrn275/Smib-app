# S-MIB App — OOP Model Classes Explained
## CSS3133 Object Oriented Programming | Firestarter Group
### Developer: Fazrin Ezan Darwish Bin Hamzah (BCS25020024)

---

This document explains every class in `/src/models/`, what each part does,
and why it was written that way. Use this as a reference during your
presentation and when writing your report.

---

## Table of Contents

1. [User.js](#1-userjs) — Base Class
2. [Student.js](#2-studentjs) — Extends User
3. [JuniorLearner.js](#3-juniorlearnerjs) — Extends Student
4. [SeniorLearner.js](#4-seniorlearnerjs) — Extends Student
5. [Teacher.js](#5-teacherjs) — Extends User
6. [ClassroomTeacher.js](#6-classroomteacherjs) — Extends Teacher
7. [Mentor.js](#7-mentorjs) — Extends Teacher
8. [Project.js](#8-projectjs) — Base Class
9. [GuidedProject.js](#9-guidedprojectjs) — Extends Project
10. [OpenProject.js](#10-openprojectjs) — Extends Project
11. [Step.js](#11-stepjs) — Composition
12. [Material.js](#12-materialjs) — Composition
13. [Progress.js](#13-progressjs) — Association
14. [Achievement.js](#14-achievementjs) — Association

---

## 1. User.js

**What it is:** The base class for every person who uses the app.
Every student, teacher, and mentor is a User at their core.

**OOP principles shown:** Encapsulation, Abstraction

| Part | What it does |
|---|---|
| `#userID, #name, #age, #email, #password, #role` | Private fields (the `#` symbol makes them private — only code inside this class can access them directly) |
| `constructor(userID, name, ...)` | Runs automatically when a new User is created. Sets up all the starting values |
| `getName(), getEmail(), getRole(), ...` | Getters — the only way to READ private fields from outside the class |
| `setName(newName)` | Setter — validates the new value before saving it. Rejects empty strings |
| `setEmail(newEmail)` | Setter — checks for `@` symbol before saving |
| `setAge(newAge)` | Setter — checks it is a positive number before saving |
| `login()` | Returns a confirmation message. In a real app this would talk to Supabase Auth |
| `logout()` | Returns a logout confirmation message |
| `updateProfile(newName, newEmail)` | Calls `setName()` and `setEmail()` together in one step |
| `getDetails()` | Returns all user fields as one object — useful for displaying user info in the app |

**Why it is a base class (Abstraction):** User is never created directly. You always create a Student, JuniorLearner, Teacher, etc. User just holds the shared identity that all of them have in common.

---

## 2. Student.js

**What it is:** A Level 2 class that extends User. Represents any learner in the app. JuniorLearner and SeniorLearner both extend this.

**OOP principles shown:** Inheritance, Encapsulation

**Inheritance chain:** `Student → extends → User`

| Part | What it does |
|---|---|
| `extends User` | Student automatically gets all of User's methods (login, logout, getName, etc.) without rewriting them |
| `super(userID, name, ...)` | MUST be called first in the constructor. Runs the User constructor and sets up all the User private fields |
| `#gradeLevel` | Extra private field only a Student has. e.g. `'Year 5'`, `'Form 2'` |
| `#enrolledProjects` | Private array of project IDs this student has started |
| `#progressList` | Private array of Progress objects tracking step completion |
| `#achievementList` | Private array of Achievement objects earned by this student |
| `enrollProject(projectID)` | Adds a project ID to the enrolled list. Checks for duplicates first |
| `getEnrolledProjects()` | Returns the full list of enrolled project IDs |
| `addProgress(progressObject)` | Stores a Progress object into the student's progress list |
| `viewProgress()` | Returns all progress records, or a message if none exist yet |
| `addAchievement(achievementObject)` | Stores an Achievement object into the student's achievement list |
| `viewAchievements()` | Returns all achievements, or a message if none earned yet |
| `browseProjects()` | Describes browsing available projects (would fetch from Supabase in real app) |
| `getDetails()` | Uses `...super.getDetails()` to copy all User fields, then adds Student-specific fields on top |

**Key concept — the spread operator `...`:** `...super.getDetails()` copies everything from User's getDetails() result. We then add extra Student fields after it. This avoids rewriting the User fields manually.

---

## 3. JuniorLearner.js

**What it is:** A Level 3 class that extends Student. Represents primary school students (Year 4–6). The first half of the polymorphism pair.

**OOP principles shown:** Inheritance, Encapsulation, Polymorphism

**Inheritance chain:** `JuniorLearner → extends → Student → extends → User`

| Part | What it does |
|---|---|
| `extends Student` | JuniorLearner gets everything from Student AND User automatically |
| `super(userID, name, ..., gradeLevel)` | Calls Student's constructor, which itself calls User's constructor. The full chain runs automatically |
| `#preferredDifficulty` | Private field, always set to `'beginner'`. Cannot be changed from outside — hardcoded by design |
| `getPreferredDifficulty()` | Returns `'beginner'` |
| `getRecommendedProjects()` | **POLYMORPHISM** — returns ONLY beginner GuidedProjects. Primary school students should not see advanced or open-ended projects |
| `getWelcomeMessage()` | Returns a friendly, age-appropriate welcome message for younger students |

**Why polymorphism:** JuniorLearner and SeniorLearner both have a method called `getRecommendedProjects()`. The method name is identical, but the behaviour is completely different. JavaScript picks the right version based on which class the object belongs to. That is polymorphism.

---

## 4. SeniorLearner.js

**What it is:** A Level 3 class that extends Student. Represents secondary school students (Form 1–5). The second half of the polymorphism pair.

**OOP principles shown:** Inheritance, Encapsulation, Polymorphism

**Inheritance chain:** `SeniorLearner → extends → Student → extends → User`

| Part | What it does |
|---|---|
| `extends Student` | SeniorLearner gets everything from Student AND User automatically |
| `super(userID, name, ..., gradeLevel)` | Calls Student's constructor up the chain |
| `#preferredDifficulty` | Private field, always set to `'intermediate'`. Hardcoded by design |
| `getPreferredDifficulty()` | Returns `'intermediate'` |
| `getRecommendedProjects()` | **POLYMORPHISM** — returns ALL project types: beginner + intermediate GuidedProjects AND OpenProjects. Senior students get the full library |
| `getWelcomeMessage()` | Returns a welcome message with a slightly older, more independent tone |

**The polymorphism contrast — the key thing to say in your presentation:**

| Class | `getRecommendedProjects()` result |
|---|---|
| `JuniorLearner` | Beginner GuidedProjects only |
| `SeniorLearner` | All difficulties + OpenProjects |

Same method name. Completely different behaviour. That is polymorphism.

---

## 5. Teacher.js

**What it is:** A Level 2 class that extends User. Represents any teacher or mentor. ClassroomTeacher and Mentor both extend this.

**OOP principles shown:** Inheritance, Encapsulation, Abstraction

**Inheritance chain:** `Teacher → extends → User`

| Part | What it does |
|---|---|
| `extends User` | Teacher gets all of User's methods automatically |
| `super(userID, name, ...)` | Calls User's constructor — sets up all the shared identity fields |
| `#assignedStudents` | Private array of student IDs this teacher is responsible for |
| `#recommendedProjects` | Private array of project IDs this teacher has recommended |
| `assignStudent(studentID)` | Adds a student to the responsibility list. Checks for duplicates |
| `getAssignedStudents()` | Returns the full list of assigned student IDs |
| `recommendProject(projectID)` | Adds a project to the recommendations list. Checks for duplicates |
| `getRecommendedProjects()` | Returns all recommended project IDs |
| `viewStudentProgress(studentID)` | Checks the student is assigned before viewing — cannot view a student they don't manage |
| `viewClassSummary()` | Returns an overview of all assigned students and recommendations |
| `getDetails()` | Spreads `super.getDetails()` and adds Teacher-specific fields |

---

## 6. ClassroomTeacher.js

**What it is:** A Level 3 class that extends Teacher. Manages a whole named class group (e.g. "6 Bestari").

**OOP principles shown:** Inheritance, Encapsulation

**Inheritance chain:** `ClassroomTeacher → extends → Teacher → extends → User`

| Part | What it does |
|---|---|
| `extends Teacher` | Gets everything from Teacher AND User automatically |
| `super(userID, name, ..., role)` | Calls Teacher's constructor, which calls User's |
| `#className` | Private field — the name of this teacher's class, e.g. `'6 Bestari'` |
| `#studentGroup` | Private array — student IDs specifically in this classroom |
| `getClassName()` | Returns the class name |
| `getStudentGroup()` | Returns the list of students in this class |
| `addToGroup(studentID)` | Adds a student to the class group. Different from Teacher's `assignStudent()` — this tracks the classroom-specific grouping |
| `removeFromGroup(studentID)` | Removes a student (e.g. if they transfer out). Uses `splice()` to remove from the array |
| `viewGroupProgress()` | Returns a progress summary for the WHOLE class at once |
| `assignGroupProject(projectID)` | Assigns the same project to every student in the class in one action |
| `getDetails()` | Spreads `super.getDetails()` and adds className and studentGroup |

**Key difference from Mentor:** ClassroomTeacher manages a group. Mentor works one-on-one.

---

## 7. Mentor.js

**What it is:** A Level 3 class that extends Teacher. Works one-on-one with individual students in a specific STEM focus area.

**OOP principles shown:** Inheritance, Encapsulation

**Inheritance chain:** `Mentor → extends → Teacher → extends → User`

| Part | What it does |
|---|---|
| `extends Teacher` | Gets everything from Teacher AND User automatically |
| `super(userID, name, ..., role)` | Calls Teacher's constructor up the chain |
| `#focusArea` | Private field — the mentor's area of expertise, e.g. `'Electronics'` |
| `#mentoredStudents` | Private array — student IDs in this mentor's personal care |
| `getFocusArea()` | Returns the mentor's specialisation |
| `getMentoredStudents()` | Returns the list of directly mentored student IDs |
| `addMentoredStudent(studentID)` | Adds a student to the one-on-one mentoring list. Separate from Teacher's `assignStudent()` |
| `removeMentoredStudent(studentID)` | Removes a student from the mentoring list |
| `sendFeedback(studentID, message)` | Sends personalised feedback. First checks the student is actually on the mentor's list. Returns a structured feedback object with a timestamp using `new Date().toISOString()` |
| `getMentoringSummary()` | Returns an overview of all students currently being mentored |
| `getDetails()` | Spreads `super.getDetails()` and adds focusArea and mentoredStudents |

---

## 8. Project.js

**What it is:** The base class for every STEM project in the app. GuidedProject and OpenProject both extend this.

**OOP principles shown:** Encapsulation, Abstraction, Composition

| Part | What it does |
|---|---|
| `#projectID, #title, #difficulty, #category, #description` | Private fields describing every project |
| `#stepList` | Private array that OWNS Step objects (composition relationship) |
| `#materialList` | Private array that OWNS Material objects (composition relationship) |
| `getTitle(), getDifficulty(), getCategory(), ...` | Getters for all the project fields |
| `addStep(step)` | Adds a Step object into `#stepList`. The step is owned by this project |
| `getSteps()` | Returns all steps, sorted by step number using `.sort()` so they always appear in the correct order |
| `addMaterial(material)` | Adds a Material object into `#materialList` |
| `getMaterials()` | Returns the full materials list |
| `getRecyclableMaterials()` | Uses `.filter()` and `checkIsRecyclable()` to return only recyclable materials — supports the app's sustainability theme |
| `getDetails()` | Returns a project summary including total step and material counts |

**Why composition:** Steps and Materials are owned by the Project. If a Project is deleted, its Steps and Materials are deleted with it. This is reflected in the database with `ON DELETE CASCADE` on the steps and materials tables.

---

## 9. GuidedProject.js

**What it is:** A Level 2 class that extends Project. Represents a fully guided, step-by-step STEM project — the main type for JuniorLearners.

**OOP principles shown:** Inheritance, Encapsulation

**Inheritance chain:** `GuidedProject → extends → Project`

| Part | What it does |
|---|---|
| `extends Project` | Gets all Project methods: addStep, getSteps, addMaterial, getMaterials, etc. |
| `super(projectID, title, ...)` | Calls Project's constructor to set up the shared fields |
| `#instructionLevel` | How detailed the instructions are: `'simple'`, `'detailed'`, or `'expert'` |
| `#estimatedDuration` | How long the project takes, stored as a number of minutes |
| `getInstructionLevel()` | Returns the instruction level |
| `getEstimatedDuration()` | Returns the raw duration number |
| `getNextStep(completedCount)` | Takes the number of steps already done and returns the next Step object. Uses inherited `getSteps()`. If all steps are done, returns a completion message |
| `checkCompletion(completedCount)` | Returns `true` if the student has finished all steps, `false` otherwise. The Progress class uses this |
| `getFormattedDuration()` | Converts raw minutes to a readable string. e.g. `45` → `"About 45 minutes"`, `90` → `"About 1 hour 30 minutes"`. Uses `Math.floor()` and the `%` remainder operator |
| `getDetails()` | Spreads `super.getDetails()` and adds `type: 'guided'`, instructionLevel, estimatedDuration, and formattedDuration |

---

## 10. OpenProject.js

**What it is:** A Level 2 class that extends Project. A freestyle, creative STEM project with no fixed steps — available to SeniorLearners.

**OOP principles shown:** Inheritance, Encapsulation

**Inheritance chain:** `OpenProject → extends → Project`

| Part | What it does |
|---|---|
| `extends Project` | Gets all Project methods automatically |
| `super(projectID, title, ...)` | Calls Project's constructor |
| `#suggestedMaterials` | Private array of material name strings — suggestions only, not requirements. Stored as a copy using `[...suggestedMaterials]` so the original array cannot affect the class's data |
| `#creativityScore` | Starts at `0`. Awarded by a teacher after reviewing the student's submission |
| `getSuggestions()` | Returns the list of suggested material names |
| `getCreativityScore()` | Returns the current creativity score |
| `submitCreation(studentID, submissionNote)` | Records that a student has submitted their finished creation. Returns a structured object with a timestamp |
| `awardCreativityScore(score)` | Validates the score is between 0 and 100 before saving. Rejects anything outside that range |
| `addSuggestion(materialName)` | Lets a teacher add more material suggestions after the project is created |
| `getDetails()` | Spreads `super.getDetails()` and adds `type: 'open'`, suggestedMaterials, and creativityScore |

**Key difference from GuidedProject:**

| | GuidedProject | OpenProject |
|---|---|---|
| Steps | Fixed, must follow in order | None — student decides |
| Duration | Set estimate | Open-ended |
| Scoring | Completion percentage | Creativity score (0–100) |
| Who uses it | JuniorLearner + SeniorLearner | SeniorLearner only |

---

## 11. Step.js

**What it is:** A small composition class. Represents one single instruction step inside a project (e.g. "Step 1: Cut the bottle in half.").

**OOP principles shown:** Encapsulation, Composition

**Relationship:** Composition with Project — a Step cannot exist without a Project. Mirrored in the database with `ON DELETE CASCADE`.

| Part | What it does |
|---|---|
| `#stepNumber` | The order of this step (1, 2, 3...). Project's `getSteps()` sorts by this |
| `#description` | The instruction text shown to the student |
| `#imageRef` | Optional file path or URL to an image. Defaults to `null` if not provided |
| `getStepNumber()` | Returns the step number — used by Project's sorting logic |
| `getDescription()` | Returns the instruction text |
| `getImage()` | Returns the image reference, or `null` if there is none |
| `hasImage()` | Returns `true` or `false`. The app uses this to decide whether to show an image or a placeholder |
| `getDetails()` | Returns all step fields as one object, ready to display on the StepByStepScreen |

**How Step and Project work together:**
```js
const step1 = new Step(1, 'Cut the bottle in half.', 'step1.png');
project.addStep(step1);       // Step lives inside the Project
project.getSteps();           // Returns steps sorted by stepNumber
project.getNextStep(0);       // Returns step1 (the first uncompleted step)
```

---

## 12. Material.js

**What it is:** A small composition class. Represents one material needed for a project (e.g. "Plastic Bottle").

**OOP principles shown:** Encapsulation, Composition

**Relationship:** Composition with Project — a Material cannot exist without a Project. Mirrored in the database with `ON DELETE CASCADE`.

| Part | What it does |
|---|---|
| `#materialID` | Unique identifier, e.g. `'mat-001'` |
| `#name` | Display name, e.g. `'Plastic Bottle'` |
| `#description` | What it is or how it is used in the project |
| `#isRecyclable` | `true` or `false`. Supports the app's sustainability theme. Defaults to `false` if not specified |
| `getMaterialID()` | Returns the unique ID |
| `getName()` | Returns the display name |
| `getDescription()` | Returns the usage description |
| `checkIsRecyclable()` | Returns `true` or `false`. Project's `getRecyclableMaterials()` calls this to filter the materials list |
| `getDetails()` | Returns all material fields as one object |

**How Material and Project work together:**
```js
const m1 = new Material('mat-001', 'Plastic Bottle', 'Used as casing.', true);
const m2 = new Material('mat-002', 'LED Bulb', 'The light source.', false);
project.addMaterial(m1);
project.addMaterial(m2);
project.getRecyclableMaterials(); // Returns [m1] only — LED is not recyclable
```

---

## 13. Progress.js

**What it is:** An association class that links a Student to a Project. Tracks which steps the student has completed and whether the whole project is done.

**OOP principles shown:** Encapsulation, Association

**Relationship:** Association — both Student and Project can exist without a Progress record. The database uses a regular foreign key (not CASCADE).

| Part | What it does |
|---|---|
| `#progressID` | Unique identifier for this progress record |
| `#studentID` | ID of the student being tracked — references the Student, does not own it |
| `#projectID` | ID of the project being tracked — references the Project, does not own it |
| `#completedSteps` | Array of step numbers already finished, e.g. `[1, 2, 3]` |
| `#isCompleted` | Flips to `true` automatically when all steps are done |
| `#lastUpdated` | Timestamp — updates every time a step is marked complete |
| `markStepComplete(stepNumber, totalSteps)` | Adds the step number to `#completedSteps`. Updates the timestamp. Automatically sets `#isCompleted = true` when all steps are done |
| `getCompletionPercentage(totalSteps)` | Calculates e.g. 3 out of 5 steps = 60%. Uses `Math.round()` to give a whole number. `totalSteps` is passed in because Progress only stores the projectID, not the full Project object |
| `isDone()` | Returns `true` or `false` — used by the app to show a completion badge |
| `reset()` | Clears all completed steps and sets isCompleted back to false. For when a student restarts a project |
| `getDetails()` | Returns all progress fields as one object, ready to display on the ProgressScreen |

**Why `totalSteps` is a parameter and not stored inside Progress:** Progress is an association — it references a Project by ID but does not hold a copy of the Project object. The caller (e.g. a screen component) provides the total step count by looking it up from the Project separately.

---

## 14. Achievement.js

**What it is:** An association class linked to a Student. Awarded when a student reaches a milestone, such as completing their first project.

**OOP principles shown:** Encapsulation, Association

**Relationship:** Association — a Student can exist with no Achievements. Achievements reference a Student by ID but do not own the Student object.

| Part | What it does |
|---|---|
| `#achievementID` | Unique identifier, e.g. `'ach-001'` |
| `#studentID` | ID of the student who earned this — references the Student |
| `#title` | Short name, e.g. `'First Project Complete!'` |
| `#description` | What the student did to earn it |
| `#badgeImageRef` | File path or URL to the badge image. Defaults to `null` if not provided |
| `#dateAwarded` | Set automatically to the current timestamp when the Achievement is created — the moment of creation is the moment of awarding |
| `getTitle()` | Returns the achievement title |
| `getDescription()` | Returns the description |
| `getBadge()` | Returns the badge image reference, or `null` |
| `getDateAwarded()` | Returns the timestamp of when this was awarded |
| `hasBadge()` | Returns `true` or `false`. The app uses this to decide whether to show a badge image or a placeholder |
| `getDetails()` | Returns all achievement fields as one object, ready to display on the AchievementsScreen |

**How Achievement and Student work together:**
```js
const ach = new Achievement(
  'ach-001', 's001',
  'First Project Complete!',
  'Awarded for finishing your very first STEM project.',
  'badge_first.png'
);
student.addAchievement(ach);   // Stored in Student's #achievementList
student.viewAchievements();    // Returns [ach]
```

---

## OOP Principles Summary

| Principle | Where it is shown |
|---|---|
| **Encapsulation** | Every class — all attributes use `#` private fields with public getters/setters |
| **Inheritance** | Student, Teacher, JuniorLearner, SeniorLearner, ClassroomTeacher, Mentor, GuidedProject, OpenProject all use `extends` and `super()` |
| **Polymorphism** | `getRecommendedProjects()` — same method name in JuniorLearner and SeniorLearner, completely different behaviour |
| **Abstraction** | User and Project are base classes — they define the shared structure, child classes implement the specific behaviour |

---

*Generated for CSS3133 OOP Assignment — S-MIB App — Firestarter Group*
