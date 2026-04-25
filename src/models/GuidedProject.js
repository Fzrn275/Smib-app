// ============================================================
// FILE: src/models/GuidedProject.js
// PURPOSE: A step-by-step guided STEM project.
//          The main project type for JuniorLearners.
//
// INHERITANCE CHAIN: GuidedProject → Project
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends Project, calls super() in constructor
//   - Encapsulation : instructionLevel and estimatedDuration are private
//
// DATABASE MAPPING: projects table
//   type = 'guided', instruction_level, estimated_duration
// ============================================================

import Project from './Project';

class GuidedProject extends Project {

  #instructionLevel;   // 'simple' | 'detailed' | 'expert'
  #estimatedDuration;  // Minutes to complete (e.g. 45)

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Example:
  //   const gp = new GuidedProject(
  //     'uuid-010', 'Build an LED Torch', 'Make a torch from a plastic bottle.',
  //     'beginner', 'Electronics', 'simple', 45
  //   );
  // ----------------------------------------------------------
  constructor(id, title, description, difficulty, category, instructionLevel, estimatedDuration) {
    super(id, title, description, difficulty, category);
    this.#instructionLevel  = instructionLevel  ?? 'simple';
    this.#estimatedDuration = estimatedDuration ?? 0;
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  get instructionLevel()  { return this.#instructionLevel; }
  get estimatedDuration() { return this.#estimatedDuration; }
  get type()              { return 'guided'; }

  // ----------------------------------------------------------
  // METHODS
  // ----------------------------------------------------------

  // Returns the step at the given index (0-based: 0 = Step 1)
  getNextStep(completedCount) {
    const steps = this.getSteps();
    if (steps.length === 0) return null;
    if (completedCount >= steps.length) return null;
    return steps[completedCount];
  }

  checkCompletion(completedCount) {
    const total = this.getStepCount();
    return total > 0 && completedCount >= total;
  }

  // Converts raw minutes to a friendly string — e.g. 90 → "About 1 hour 30 minutes"
  getFormattedDuration() {
    const mins = this.#estimatedDuration;
    if (mins < 60) return `About ${mins} minutes`;
    const hours     = Math.floor(mins / 60);
    const remainder = mins % 60;
    const hourLabel = `About ${hours} hour${hours > 1 ? 's' : ''}`;
    return remainder === 0 ? hourLabel : `${hourLabel} ${remainder} minutes`;
  }

  getDetails() {
    return {
      ...super.getDetails(),
      type:              'guided',
      instructionLevel:  this.#instructionLevel,
      estimatedDuration: this.#estimatedDuration,
      formattedDuration: this.getFormattedDuration(),
    };
  }
}

export default GuidedProject;
