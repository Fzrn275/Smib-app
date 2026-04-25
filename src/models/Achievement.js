// ============================================================
// FILE: src/models/Achievement.js
// PURPOSE: A badge or award earned when a student hits a milestone.
//          e.g. "First Project Complete!", "7-Day Streak!"
//
// RELATIONSHIP: Association with Student
//   Achievement is linked to a student but both can exist independently.
//
// OOP CONCEPTS DEMONSTRATED:
//   - Encapsulation : All attributes are private (#)
//   - Association   : Links to a student via studentId (not owned)
//
// DATABASE MAPPING: achievements table
//   id, student_id, title, type, trigger_type, date_awarded
// ============================================================

class Achievement {

  #id;
  #studentId;
  #title;        // Short name e.g. "First Project Complete!"
  #type;         // 'badge' or 'certificate'
  #triggerType;  // e.g. 'first_project', 'streak_7', 'category_complete'
  #dateAwarded;  // ISO timestamp of when this was awarded

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Example:
  //   const ach = new Achievement(
  //     'uuid-ach-001', 'uuid-student-001',
  //     'First Project Complete!', 'badge', 'first_project'
  //   );
  // ----------------------------------------------------------
  constructor(id, studentId, title, type, triggerType) {
    this.#id          = id;
    this.#studentId   = studentId;
    this.#title       = title;
    this.#type        = type        ?? 'badge';
    this.#triggerType = triggerType ?? '';
    this.#dateAwarded = new Date().toISOString();
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  get id()          { return this.#id; }
  get studentId()   { return this.#studentId; }
  get title()       { return this.#title; }
  get type()        { return this.#type; }
  get triggerType() { return this.#triggerType; }
  get dateAwarded() { return this.#dateAwarded; }

  // ----------------------------------------------------------
  // METHOD
  // ----------------------------------------------------------

  getDetails() {
    return {
      id:          this.#id,
      studentId:   this.#studentId,
      title:       this.#title,
      type:        this.#type,
      triggerType: this.#triggerType,
      dateAwarded: this.#dateAwarded,
    };
  }
}

export default Achievement;
