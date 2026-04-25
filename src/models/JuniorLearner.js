// ============================================================
// FILE: src/models/JuniorLearner.js
// PURPOSE: Represents a primary school student (Year 4–6).
//
// INHERITANCE CHAIN: JuniorLearner → Student → User
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : Three-level chain — gets everything from Student AND User
//   - Polymorphism  : getRecommendedProjects() returns beginner GuidedProjects only.
//                     SeniorLearner has the SAME method name but different behaviour.
//   - Encapsulation : #preferredDifficulty is private and auto-set to 'beginner'
// ============================================================

import Student from './Student';

class JuniorLearner extends Student {

  // Always 'beginner' — primary students follow guided projects at beginner difficulty
  #preferredDifficulty;

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // preferredDifficulty is NOT a parameter — it is always 'beginner'.
  //
  // Example:
  //   const jr = new JuniorLearner('uuid-001', 'Ahmad', 'ahmad@email.com',
  //                                'junior_learner', null, 50, 1, 'SK Kuching', 'Year 5');
  // ----------------------------------------------------------
  constructor(id, name, email, role, avatarUrl, xp, level, school, gradeLevel) {
    super(id, name, email, role, avatarUrl, xp, level, school, gradeLevel);
    this.#preferredDifficulty = 'beginner';
  }

  // ----------------------------------------------------------
  // GETTER
  // ----------------------------------------------------------

  get preferredDifficulty() { return this.#preferredDifficulty; }

  // ----------------------------------------------------------
  // POLYMORPHISM — overrides the method in SeniorLearner
  //
  // JuniorLearner → ONLY beginner GuidedProjects
  // SeniorLearner → beginner + intermediate GuidedProjects + OpenProjects
  //
  // In the app, projectService.getRecommendedProjects(learner) calls this
  // method and receives the correct filter for each learner type without
  // needing to check the type explicitly. That is polymorphism.
  // ----------------------------------------------------------
  getRecommendedProjects(allProjects = []) {
    const filtered = allProjects.filter(
      p => p.difficulty === 'beginner' && p.type === 'guided'
    );
    return {
      studentName: this.name,
      gradeLevel:  this.gradeLevel,
      filter:      this.#preferredDifficulty,
      projectType: 'GuidedProject only',
      projects:    filtered,
    };
  }

  getWelcomeMessage() {
    return `Welcome, ${this.name}! Ready to build something cool? Let's start with a beginner project!`;
  }

  getDetails() {
    return {
      ...super.getDetails(),
      preferredDifficulty: this.#preferredDifficulty,
    };
  }
}

export default JuniorLearner;
