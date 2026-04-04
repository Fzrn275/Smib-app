// ============================================================
// FILE: src/models/Achievement.js
// PURPOSE: Represents a badge or award earned by a student
//          when they reach a milestone in the S-MIB app.
//          e.g. "First Project Complete!", "5 Projects Done!"
//
// RELATIONSHIP: Association with Student
//   - An Achievement is LINKED to a Student, not owned by one.
//   - The Student can exist without any Achievements.
//   - The Achievement record references a studentID, but the
//     Student object itself does not need to be present.
//   - This is why the database uses a regular foreign key
//     (not CASCADE) for achievements (see /database/schema.sql).
//
// OOP CONCEPTS DEMONSTRATED:
//   - Encapsulation : All attributes use # (private fields)
//   - Association   : Stores studentID as a reference, linking
//                     this achievement to a specific student
// ============================================================

class Achievement {

  // ----------------------------------------------------------
  // PRIVATE ATTRIBUTES (Encapsulation)
  // ----------------------------------------------------------
  #achievementID;  // Unique identifier, e.g. 'ach-001'
  #studentID;      // ID of the student who earned this achievement
  #title;          // Short name, e.g. "First Project Complete!"
  #description;    // What the student did to earn it
  #badgeImageRef;  // File path or URL to the badge image
                   // Can be null if no image is set
  #dateAwarded;    // Timestamp of when this was awarded

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // An Achievement is created and awarded at the same moment,
  // so #dateAwarded is set automatically to right now.
  //
  // Example of creating an Achievement:
  //   const ach = new Achievement(
  //     'ach-001',
  //     's001',
  //     'First Project Complete!',
  //     'Awarded for completing your very first STEM project.',
  //     'badge_first_project.png'
  //   );
  //
  // Then store it on the student:
  //   student.addAchievement(ach);
  // ----------------------------------------------------------
  constructor(achievementID, studentID, title, description, badgeImageRef = null) {
    // badgeImageRef defaults to null if no image is provided
    this.#achievementID = achievementID;
    this.#studentID     = studentID;
    this.#title         = title;
    this.#description   = description;
    this.#badgeImageRef = badgeImageRef;
    this.#dateAwarded   = new Date().toISOString();
    // new Date().toISOString() captures the exact moment this
    // achievement was created, e.g. "2026-04-05T10:30:00.000Z"
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  getAchievementID() {
    return this.#achievementID;
  }

  getStudentID() {
    return this.#studentID;
  }

  getTitle() {
    return this.#title;
  }

  getDescription() {
    return this.#description;
  }

  // Returns the badge image reference (file path or URL), or null
  getBadge() {
    return this.#badgeImageRef;
  }

  // Returns the date and time this achievement was awarded
  getDateAwarded() {
    return this.#dateAwarded;
  }

  // Returns true if this achievement has a badge image, false if not
  hasBadge() {
    return this.#badgeImageRef !== null;
  }

  // ----------------------------------------------------------
  // METHOD
  //
  // Returns all details about this achievement as a single object.
  // Useful for displaying on the AchievementsScreen in the app.
  // ----------------------------------------------------------
  getDetails() {
    return {
      achievementID: this.#achievementID,
      studentID:     this.#studentID,
      title:         this.#title,
      description:   this.#description,
      badgeImageRef: this.#badgeImageRef,
      dateAwarded:   this.#dateAwarded,
      hasBadge:      this.hasBadge(),
    };
  }
}

// ----------------------------------------------------------
// EXPORT
// Student.js uses addAchievement() to store Achievement instances.
// ----------------------------------------------------------
export default Achievement;
