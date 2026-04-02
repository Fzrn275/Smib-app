// ============================================================
// FILE: src/models/JuniorLearner.js
// PURPOSE: Represents a primary school student (Year 4–6)
//          in the S-MIB app.
//
// INHERITANCE CHAIN:
//   JuniorLearner → extends → Student → extends → User
//   This is a Level 3 class (three levels deep).
//   JuniorLearner automatically has everything from BOTH
//   Student AND User without rewriting any of it.
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends Student (which already extends User)
//   - Polymorphism  : overrides getRecommendedProjects() so that
//                     it returns ONLY beginner-level projects.
//                     SeniorLearner has the same method name but
//                     different behaviour — that is polymorphism.
//   - Encapsulation : #preferredDifficulty is a private field
// ============================================================

import Student from './Student';

class JuniorLearner extends Student {

  // ----------------------------------------------------------
  // PRIVATE ATTRIBUTE
  //
  // JuniorLearner has one extra field beyond Student.
  // Their preferred difficulty is always "beginner" because
  // they are primary school students (Year 4–6).
  // This is set automatically — it cannot be changed from outside.
  // ----------------------------------------------------------
  #preferredDifficulty;

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // JuniorLearner needs everything Student needs (which includes
  // everything User needs). We pass all those values up the chain
  // using super().
  //
  // Notice we call super() TWICE up the chain automatically:
  //   JuniorLearner → super() → Student → super() → User
  // JavaScript handles this chain for us.
  //
  // We do NOT pass preferredDifficulty as a parameter because
  // it is always "beginner" for every JuniorLearner — no choice.
  //
  // Example of creating a JuniorLearner:
  //   const jr = new JuniorLearner('s001', 'Ahmad', 11, 'ahmad@email.com', 'pass123', 'junior_learner', 'Year 5');
  // ----------------------------------------------------------
  constructor(userID, name, age, email, password, role, gradeLevel) {
    super(userID, name, age, email, password, role, gradeLevel);
    // ^ Calls Student's constructor, which itself calls User's constructor.
    //   After this line, all User and Student fields are set up.

    // JuniorLearner's difficulty is always beginner — hardcoded
    this.#preferredDifficulty = 'beginner';
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
  // This method has the SAME NAME as the one in SeniorLearner,
  // but it behaves DIFFERENTLY. This is polymorphism.
  //
  // JuniorLearner version: returns ONLY beginner GuidedProjects.
  // SeniorLearner version: returns all projects including OpenProjects.
  //
  // In a real app, this would filter projects from Supabase.
  // Here we return a description so the concept is clear.
  // ----------------------------------------------------------
  getRecommendedProjects() {
    return {
      studentName:  this.getName(),
      // getName() is inherited from User via Student — no rewrite needed
      gradeLevel:   this.getGradeLevel(),
      // getGradeLevel() is inherited from Student
      filter:       this.#preferredDifficulty,
      projectType:  'GuidedProject only',
      description:  `Showing BEGINNER GuidedProjects for ${this.getName()} (${this.getGradeLevel()}).
These are step-by-step guided projects suitable for primary school students.
Advanced and OpenProjects are hidden for JuniorLearners.`,
    };
  }

  // ----------------------------------------------------------
  // ADDITIONAL METHOD
  //
  // A friendly method that returns a welcome message
  // customised for younger learners.
  // ----------------------------------------------------------
  getWelcomeMessage() {
    return `Welcome, ${this.getName()}! Ready to build something cool today?
You are in ${this.getGradeLevel()}. Let's start with a beginner project!`;
  }

}

// ----------------------------------------------------------
// EXPORT
// ----------------------------------------------------------
export default JuniorLearner;
