// ============================================================
// FILE: src/models/SeniorLearner.js
// PURPOSE: Represents a secondary school student (Form 1–5).
//
// INHERITANCE CHAIN: SeniorLearner → Student → User
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : Three-level chain — gets everything from Student AND User
//   - Polymorphism  : getRecommendedProjects() returns ALL project types.
//                     JuniorLearner has the SAME method name but returns
//                     beginner GuidedProjects only. That is polymorphism.
//   - Encapsulation : #preferredDifficulty is private and auto-set to 'intermediate'
// ============================================================

import Student from './Student';

class SeniorLearner extends Student {

  // Always 'intermediate' — secondary students can handle more challenging projects
  #preferredDifficulty;

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Example:
  //   const sr = new SeniorLearner('uuid-002', 'Lina', 'lina@email.com',
  //                                'senior_learner', null, 200, 1, 'SMK Kuching', 'Form 2');
  // ----------------------------------------------------------
  constructor(id, name, email, role, avatarUrl, xp, level, school, gradeLevel) {
    super(id, name, email, role, avatarUrl, xp, level, school, gradeLevel);
    this.#preferredDifficulty = 'intermediate';
  }

  // ----------------------------------------------------------
  // GETTER
  // ----------------------------------------------------------

  get preferredDifficulty() { return this.#preferredDifficulty; }

  // ----------------------------------------------------------
  // POLYMORPHISM — KEY DIFFERENCE from JuniorLearner
  //
  // Same method name, entirely different filter logic:
  //   JuniorLearner → beginner GuidedProjects only
  //   SeniorLearner → beginner + intermediate GuidedProjects + ALL OpenProjects
  // ----------------------------------------------------------
  getRecommendedProjects(allProjects = []) {
    const filtered = allProjects.filter(
      p => p.type === 'open' ||
           (p.type === 'guided' && ['beginner', 'intermediate'].includes(p.difficulty))
    );
    return {
      studentName: this.name,
      gradeLevel:  this.gradeLevel,
      filter:      this.#preferredDifficulty,
      projectType: 'GuidedProject + OpenProject',
      projects:    filtered,
    };
  }

  getWelcomeMessage() {
    return `Welcome back, ${this.name}! Explore guided projects or try an open project and build something of your own design!`;
  }

  getDetails() {
    return {
      ...super.getDetails(),
      preferredDifficulty: this.#preferredDifficulty,
    };
  }
}

export default SeniorLearner;
