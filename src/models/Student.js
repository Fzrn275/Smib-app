// ============================================================
// FILE: src/models/Student.js
// PURPOSE: Represents a learner (junior or senior) in S-MIB.
//          Extends User with gamification data: XP, level, school.
//
// INHERITANCE CHAIN: Student → User
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends User, calls super() in constructor
//   - Encapsulation : Student's own fields also use # (private)
//
// DATABASE MAPPING: users table
//   xp, level, school_name, grade_level (plus inherited user fields)
// ============================================================

import User from './User';

class Student extends User {

  // Student-specific private fields
  #xp;           // Total XP earned (drives level calculation)
  #level;        // Current level 1–10
  #school;       // School name (e.g. "SMK Kuching")
  #gradeLevel;   // e.g. "Year 5", "Form 2"

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // super() must be called first — it sets up User's private fields.
  //
  // Example:
  //   const s = new Student('uuid-001', 'Siti', 'siti@email.com',
  //                         'junior_learner', null, 150, 1, 'SMK Kuching', 'Year 5');
  // ----------------------------------------------------------
  constructor(id, name, email, role, avatarUrl, xp, level, school, gradeLevel) {
    super(id, name, email, role, avatarUrl);
    this.#xp         = xp         ?? 0;
    this.#level      = level      ?? 1;
    this.#school     = school     ?? '';
    this.#gradeLevel = gradeLevel ?? '';
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  get xp()         { return this.#xp; }
  get level()      { return this.#level; }
  get school()     { return this.#school; }
  get gradeLevel() { return this.#gradeLevel; }

  // ----------------------------------------------------------
  // SETTERS
  // ----------------------------------------------------------

  set xp(value) {
    if (typeof value === 'number' && value >= 0) {
      this.#xp = value;
      // Recalculate level whenever XP changes
      this.#level = Math.min(Math.floor(value / 1000) + 1, 10);
    }
  }

  // ----------------------------------------------------------
  // METHODS
  // ----------------------------------------------------------

  // XP within the current level (0–999) — used for the XP bar display
  getXpInLevel() {
    return this.#xp % 1000;
  }

  // How much XP is needed to reach the next level
  getXpToNextLevel() {
    return 1000 - this.getXpInLevel();
  }

  // Human-readable rank title for the current level
  getRankTitle() {
    const titles = [
      'Curious Maker', 'Junior Builder', 'STEM Explorer', 'Maker Apprentice',
      'Project Maker', 'Circuit Crafter', 'Innovation Scout', 'STEM Champion',
      'Master Builder', 'Sarawak Maker',
    ];
    return titles[Math.max(0, this.#level - 1)];
  }

  getDetails() {
    return {
      ...super.getDetails(),
      xp:         this.#xp,
      level:      this.#level,
      rankTitle:  this.getRankTitle(),
      school:     this.#school,
      gradeLevel: this.#gradeLevel,
    };
  }
}

export default Student;
