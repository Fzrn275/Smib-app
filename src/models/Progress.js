// ============================================================
// FILE: src/models/Progress.js
// PURPOSE: Tracks how far a student has gotten through a project.
//          Records which steps are done and whether the project
//          is fully completed.
//
// RELATIONSHIP: Association with Student and Project
//   - A Progress record LINKS a Student to a Project.
//   - Unlike composition (Step, Material), both Student and Project
//     can exist WITHOUT a Progress record.
//   - If a Student is deleted, Progress is removed — but the
//     Project still exists. Vice versa.
//   - This is why the database uses a regular foreign key (not CASCADE)
//     for Progress (see /database/schema.sql).
//
// OOP CONCEPTS DEMONSTRATED:
//   - Encapsulation : All attributes use # (private fields)
//   - Association   : Stores studentID and projectID as references,
//                     linking two independent objects together
// ============================================================

class Progress {

  // ----------------------------------------------------------
  // PRIVATE ATTRIBUTES (Encapsulation)
  // ----------------------------------------------------------
  #progressID;     // Unique identifier for this progress record
  #studentID;      // ID of the student this progress belongs to
  #projectID;      // ID of the project being tracked
  #completedSteps; // Array of step numbers the student has finished
                   // e.g. [1, 2, 3] means steps 1, 2, and 3 are done
  #isCompleted;    // true when ALL steps are done, false otherwise
  #lastUpdated;    // Timestamp of the last time progress was recorded

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // When a student first starts a project, a Progress record is
  // created with an empty completedSteps list and isCompleted = false.
  //
  // Example of creating a Progress record:
  //   const prog = new Progress('prog-001', 's001', 'led-torch');
  // ----------------------------------------------------------
  constructor(progressID, studentID, projectID) {
    this.#progressID     = progressID;
    this.#studentID      = studentID;
    this.#projectID      = projectID;
    this.#completedSteps = []; // no steps done yet when first created
    this.#isCompleted    = false;
    this.#lastUpdated    = new Date().toISOString();
    // new Date().toISOString() gets the current date and time
    // in a standard format, e.g. "2026-04-05T10:00:00.000Z"
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  getProgressID() {
    return this.#progressID;
  }

  getStudentID() {
    return this.#studentID;
  }

  getProjectID() {
    return this.#projectID;
  }

  getCompletedSteps() {
    return this.#completedSteps;
  }

  getLastUpdated() {
    return this.#lastUpdated;
  }

  // ----------------------------------------------------------
  // METHODS (Progress Behaviours)
  // ----------------------------------------------------------

  // Marks a single step as complete for this student.
  // stepNumber is the number of the step they just finished (e.g. 1, 2, 3).
  // totalSteps is how many steps the project has in total —
  // used to check if the project is now fully complete.
  markStepComplete(stepNumber, totalSteps) {
    // Only add the step if it hasn't already been marked complete
    if (!this.#completedSteps.includes(stepNumber)) {
      this.#completedSteps.push(stepNumber);
      this.#lastUpdated = new Date().toISOString(); // update the timestamp

      // Check if all steps are now done
      if (this.#completedSteps.length >= totalSteps) {
        this.#isCompleted = true;
      }

      return `Step ${stepNumber} marked complete. (${this.#completedSteps.length}/${totalSteps} steps done)`;
    }
    return `Step ${stepNumber} was already marked complete.`;
  }

  // Returns the percentage of the project completed so far.
  // totalSteps is passed in because Progress does not hold
  // a direct reference to the Project object — it only stores
  // the projectID. The caller provides the total.
  //
  // Example: 3 steps done out of 5 = 60%
  getCompletionPercentage(totalSteps) {
    if (totalSteps === 0) return 0;
    const percentage = (this.#completedSteps.length / totalSteps) * 100;
    return Math.round(percentage);
    // Math.round() rounds to the nearest whole number
    // e.g. 66.666... becomes 67
  }

  // Returns true if all steps are done, false otherwise.
  isDone() {
    return this.#isCompleted;
  }

  // Resets progress back to zero — useful if a student wants
  // to restart a project from the beginning.
  reset() {
    this.#completedSteps = [];
    this.#isCompleted    = false;
    this.#lastUpdated    = new Date().toISOString();
    return `Progress reset for project ${this.#projectID}.`;
  }

  // Returns all details about this progress record.
  // Useful for displaying on the ProgressScreen in the app.
  getDetails() {
    return {
      progressID:      this.#progressID,
      studentID:       this.#studentID,
      projectID:       this.#projectID,
      completedSteps:  this.#completedSteps,
      isCompleted:     this.#isCompleted,
      lastUpdated:     this.#lastUpdated,
    };
  }
}

// ----------------------------------------------------------
// EXPORT
// Student.js uses addProgress() to store Progress instances.
// ----------------------------------------------------------
export default Progress;
