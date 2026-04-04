// ============================================================
// FILE: src/models/SeniorLearner.js
// PURPOSE: Represents a secondary school student (Form 1–5)
//          in the S-MIB app.
//
// INHERITANCE CHAIN:
//   SeniorLearner → extends → Student → extends → User
//   This is a Level 3 class — three levels deep.
//   SeniorLearner automatically has everything from BOTH
//   Student AND User without rewriting any of it.
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends Student (which already extends User)
//   - Polymorphism  : overrides getRecommendedProjects() so that
//                     it returns ALL project types, including OpenProject.
//                     JuniorLearner has the SAME method name but returns
//                     ONLY beginner GuidedProjects — that contrast is
//                     what makes this polymorphism.
//   - Encapsulation : #preferredDifficulty is a private field
// ============================================================

import Student from './Student';

class SeniorLearner extends Student {

  // ----------------------------------------------------------
  // PRIVATE ATTRIBUTE
  //
  // Like JuniorLearner, SeniorLearner has one extra field.
  // But their difficulty is "intermediate" because they are
  // secondary school students (Form 1–5) who can handle more
  // challenging projects, including open-ended ones.
  // ----------------------------------------------------------
  #preferredDifficulty;

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Same structure as JuniorLearner's constructor.
  // We pass all the required fields up the chain via super().
  // The chain looks like this:
  //   SeniorLearner → super() → Student → super() → User
  //
  // preferredDifficulty is NOT a parameter — it is always
  // "intermediate" for every SeniorLearner. No choice needed.
  //
  // Example of creating a SeniorLearner:
  //   const sr = new SeniorLearner('s002', 'Lina', 14, 'lina@email.com', 'pass123', 'senior_learner', 'Form 2');
  // ----------------------------------------------------------
  constructor(userID, name, age, email, password, role, gradeLevel) {
    super(userID, name, age, email, password, role, gradeLevel);
    // ^ Calls Student's constructor, which calls User's constructor.
    //   After this line, all User and Student private fields are set up.

    // SeniorLearner's difficulty is always intermediate — hardcoded
    this.#preferredDifficulty = 'intermediate';
  }

  // ----------------------------------------------------------
  // GETTER
  // ----------------------------------------------------------
  getPreferredDifficulty() {
    return this.#preferredDifficulty;
  }

  // ----------------------------------------------------------
  // POLYMORPHISM — METHOD OVERRIDE
  //
  // This is the KEY difference between SeniorLearner and JuniorLearner.
  //
  //   JuniorLearner.getRecommendedProjects()
  //     → returns ONLY beginner GuidedProjects (simple, step-by-step)
  //
  //   SeniorLearner.getRecommendedProjects()
  //     → returns ALL project types:
  //         beginner + intermediate GuidedProjects
  //         AND OpenProjects (freestyle/creative)
  //
  // Same method name. Different behaviour. That is POLYMORPHISM.
  //
  // In a real app, this would filter projects from Supabase.
  // Here we return a description so the concept is clearly visible.
  // ----------------------------------------------------------
  getRecommendedProjects() {
    return {
      studentName:  this.getName(),
      // getName() is inherited from User — no rewrite needed
      gradeLevel:   this.getGradeLevel(),
      // getGradeLevel() is inherited from Student
      filter:       this.#preferredDifficulty,
      projectType:  'GuidedProject + OpenProject',
      description:  `Showing BEGINNER + INTERMEDIATE GuidedProjects AND OpenProjects for ${this.getName()} (${this.getGradeLevel()}).
These include both step-by-step guided projects and open-ended creative projects.
SeniorLearners have access to the full project library.`,
    };
  }

  // ----------------------------------------------------------
  // ADDITIONAL METHOD
  //
  // A welcome message tailored for older learners.
  // Compare this with JuniorLearner's getWelcomeMessage() —
  // the tone is slightly different, suited to secondary students.
  // ----------------------------------------------------------
  getWelcomeMessage() {
    return `Welcome back, ${this.getName()}! You are in ${this.getGradeLevel()}.
Explore guided projects or try an open project and build something of your own design!`;
  }

}

// ----------------------------------------------------------
// EXPORT
// Makes SeniorLearner available for import in other files.
// ----------------------------------------------------------
export default SeniorLearner;
