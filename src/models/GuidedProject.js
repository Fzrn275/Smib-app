// ============================================================
// FILE: src/models/GuidedProject.js
// PURPOSE: Represents a fully guided, step-by-step STEM project.
//          This is the main project type for JuniorLearners.
//          Every step is laid out clearly with instructions and images.
//
// INHERITANCE CHAIN:
//   GuidedProject → extends → Project
//   This is a Level 2 class.
//   GuidedProject automatically has everything from Project:
//   addStep(), getSteps(), addMaterial(), getMaterials(),
//   getDetails(), getDifficulty(), getTitle(), etc.
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends Project, calls super() in constructor
//   - Encapsulation : #instructionLevel and #estimatedDuration are private
// ============================================================

import Project from './Project';

class GuidedProject extends Project {

  // ----------------------------------------------------------
  // GUIDED-PROJECT-SPECIFIC PRIVATE ATTRIBUTES (Encapsulation)
  //
  // These two fields are what make a GuidedProject different
  // from an OpenProject. An OpenProject does not have a fixed
  // set of instructions or a time estimate — a GuidedProject does.
  // ----------------------------------------------------------
  #instructionLevel;   // How detailed the instructions are:
                       // 'simple', 'detailed', or 'expert'
  #estimatedDuration;  // Estimated time to complete, in minutes
                       // e.g. 45 means "about 45 minutes"

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // We need everything Project needs, plus the two new fields.
  //
  // Example of creating a GuidedProject:
  //   const gp = new GuidedProject(
  //     'led-torch',
  //     'Build an LED Torch',
  //     'beginner',
  //     'Electronics',
  //     'Build a simple torch using an LED, battery, and recycled bottle.',
  //     'simple',
  //     45
  //   );
  // ----------------------------------------------------------
  constructor(
    projectID, title, difficulty, category, description,
    instructionLevel, estimatedDuration
  ) {
    super(projectID, title, difficulty, category, description);
    // ^ Calls the Project constructor. After this line, all
    //   Project private fields are set up (title, difficulty, etc.)

    this.#instructionLevel  = instructionLevel;
    this.#estimatedDuration = estimatedDuration;
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  getInstructionLevel() {
    return this.#instructionLevel;
  }

  getEstimatedDuration() {
    return this.#estimatedDuration;
  }

  // ----------------------------------------------------------
  // METHODS (GuidedProject Behaviours)
  // ----------------------------------------------------------

  // Returns the next step a student should do based on how many
  // steps they have already completed.
  //
  // completedCount is a number — how many steps are done so far.
  // e.g. if completedCount is 2, this returns Step 3 (index 2).
  //
  // getSteps() is inherited from Project and returns steps
  // sorted in order by step number.
  getNextStep(completedCount) {
    const steps = this.getSteps();
    // getSteps() is inherited from Project

    if (steps.length === 0) {
      return `No steps have been added to "${this.getTitle()}" yet.`;
    }
    if (completedCount >= steps.length) {
      return `All steps complete! "${this.getTitle()}" is finished.`;
    }
    // Return the step at position completedCount
    // (arrays start at 0, so completedCount of 2 gives index 2 = Step 3)
    return steps[completedCount];
  }

  // Checks whether a student has completed all steps in this project.
  // completedCount is how many steps the student has finished.
  // Returns true if done, false if there are still steps remaining.
  checkCompletion(completedCount) {
    const totalSteps = this.getSteps().length;
    if (totalSteps === 0) return false;
    return completedCount >= totalSteps;
  }

  // Returns a human-readable time estimate string.
  // Converts the raw number (minutes) into a friendly label.
  // e.g. 45 → "About 45 minutes"  |  90 → "About 1 hour 30 minutes"
  getFormattedDuration() {
    const mins = this.#estimatedDuration;
    if (mins < 60) {
      return `About ${mins} minutes`;
    }
    const hours   = Math.floor(mins / 60);
    const remaining = mins % 60;
    // Math.floor() rounds down to the nearest whole number
    // % is the remainder operator — 90 % 60 = 30
    if (remaining === 0) {
      return `About ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `About ${hours} hour${hours > 1 ? 's' : ''} ${remaining} minutes`;
  }

  // Returns full details — includes all Project fields (via super)
  // plus GuidedProject-specific fields on top.
  getDetails() {
    return {
      ...super.getDetails(),
      // '...' copies all fields from Project's getDetails(),
      // then we add the GuidedProject-specific ones:
      type:              'guided',
      instructionLevel:  this.#instructionLevel,
      estimatedDuration: this.#estimatedDuration,
      formattedDuration: this.getFormattedDuration(),
    };
  }
}

// ----------------------------------------------------------
// EXPORT
// ----------------------------------------------------------
export default GuidedProject;
