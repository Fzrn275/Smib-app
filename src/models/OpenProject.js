// ============================================================
// FILE: src/models/OpenProject.js
// PURPOSE: A freestyle, open-ended STEM project.
//          Students are given a theme and suggested materials,
//          then design and build whatever they imagine.
//          Available to SeniorLearners only.
//
// INHERITANCE CHAIN: OpenProject → Project
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends Project, calls super() in constructor
//   - Encapsulation : creativityScore is private
//
// DATABASE MAPPING: projects table
//   type = 'open', creativity_score
// ============================================================

import Project from './Project';

class OpenProject extends Project {

  #creativityScore;  // 0–100, awarded after student submits creation

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Example:
  //   const op = new OpenProject(
  //     'uuid-011', 'Build Your Own Robot',
  //     'Use recycled materials to design and build a robot.',
  //     'intermediate', 'Robotics'
  //   );
  // ----------------------------------------------------------
  constructor(id, title, description, difficulty, category, creativityScore = 0) {
    super(id, title, description, difficulty, category);
    this.#creativityScore = creativityScore;
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  get creativityScore() { return this.#creativityScore; }
  get type()            { return 'open'; }

  // ----------------------------------------------------------
  // METHODS
  // ----------------------------------------------------------

  // Awards a score after a mentor reviews the student's submission
  awardCreativityScore(score) {
    if (typeof score !== 'number' || score < 0 || score > 100) {
      throw new Error('Creativity score must be a number between 0 and 100.');
    }
    this.#creativityScore = score;
    return `Creativity score of ${score}/100 awarded to "${this.title}".`;
  }

  // Packages a student submission for Supabase insertion via progressService
  submitCreation(studentId, submissionNote) {
    return {
      projectId:      this.id,
      projectTitle:   this.title,
      studentId,
      submissionNote,
      submittedAt:    new Date().toISOString(),
      status:         'submitted',
    };
  }

  getDetails() {
    return {
      ...super.getDetails(),
      type:            'open',
      creativityScore: this.#creativityScore,
    };
  }
}

export default OpenProject;
