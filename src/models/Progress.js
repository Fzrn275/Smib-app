// ============================================================
// FILE: src/models/Progress.js
// PURPOSE: Tracks how far a student has gone through a project.
//          Stores completed step numbers and current progress %.
//
// RELATIONSHIP: Association with Student and Project
//   Both Student and Project can exist without a Progress record.
//   Mirrored by a regular foreign key (not CASCADE) in the database.
//
// OOP CONCEPTS DEMONSTRATED:
//   - Encapsulation : All attributes are private (#)
//   - Association   : Links studentId and projectId without owning them
//
// DATABASE MAPPING: progress table
//   id, student_id, project_id, completed_steps[], progress_pct, is_completed
// ============================================================

class Progress {

  #studentId;       // UUID of the student
  #projectId;       // UUID of the project
  #completedSteps;  // Array of step numbers completed e.g. [1, 2, 3]
  #progressPct;     // Percentage complete (0.00–100.00)
  #isCompleted;     // true when ALL steps are done

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // When a student first enrols, completedSteps is empty and progressPct is 0.
  //
  // Example:
  //   const prog = new Progress('uuid-001', 'uuid-proj-001');
  // ----------------------------------------------------------
  constructor(studentId, projectId, completedSteps = [], totalSteps = 0) {
    this.#studentId      = studentId;
    this.#projectId      = projectId;
    this.#completedSteps = [...completedSteps];
    this.#progressPct    = totalSteps > 0
      ? parseFloat(((completedSteps.length / totalSteps) * 100).toFixed(2))
      : 0;
    this.#isCompleted    = totalSteps > 0 && completedSteps.length >= totalSteps;
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  get studentId()      { return this.#studentId; }
  get projectId()      { return this.#projectId; }
  get completedSteps() { return [...this.#completedSteps]; }
  get progressPct()    { return this.#progressPct; }
  get isCompleted()    { return this.#isCompleted; }

  // ----------------------------------------------------------
  // METHODS — specified in CLAUDE.md
  // ----------------------------------------------------------

  // Marks stepNumber as complete and recalculates progressPct.
  // totalSteps is required to compute the percentage.
  // Called when a student taps "Mark Step Done" on StepDetailScreen.
  // This action also creates a step_submissions row via progressService.
  completeStep(stepNumber, totalSteps) {
    if (this.#completedSteps.includes(stepNumber)) {
      return `Step ${stepNumber} was already completed.`;
    }
    this.#completedSteps.push(stepNumber);
    this.#progressPct  = parseFloat(((this.#completedSteps.length / totalSteps) * 100).toFixed(2));
    this.#isCompleted  = this.#completedSteps.length >= totalSteps;
    return `Step ${stepNumber} completed. Progress: ${this.#progressPct}%`;
  }

  // Returns the current progress percentage (0.00–100.00)
  getProgressPercentage() {
    return this.#progressPct;
  }

  getDetails() {
    return {
      studentId:      this.#studentId,
      projectId:      this.#projectId,
      completedSteps: this.#completedSteps,
      progressPct:    this.#progressPct,
      isCompleted:    this.#isCompleted,
    };
  }
}

export default Progress;
