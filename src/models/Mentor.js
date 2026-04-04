// ============================================================
// FILE: src/models/Mentor.js
// PURPOSE: Represents a mentor who works one-on-one with
//          individual students in the S-MIB app.
//
// INHERITANCE CHAIN:
//   Mentor → extends → Teacher → extends → User
//   This is a Level 3 class — three levels deep.
//   Mentor automatically has everything from BOTH
//   Teacher AND User without rewriting any of it.
//
// HOW MENTOR DIFFERS FROM CLASSROOMTEACHER:
//   - ClassroomTeacher manages a WHOLE CLASS GROUP
//   - Mentor works with INDIVIDUAL STUDENTS one-on-one
//   - Mentor has a focusArea (a specific STEM subject they specialise in)
//   - Mentor can send personalised feedback to a student
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends Teacher (which already extends User)
//   - Encapsulation : #mentoredStudents and #focusArea are private fields
// ============================================================

import Teacher from './Teacher';

class Mentor extends Teacher {
  // Mentor inherits everything from Teacher AND User:
  //   assignStudent(), recommendProject(), viewStudentProgress(),
  //   viewClassSummary(), login(), logout(), getName(), etc.
  // None of those need to be rewritten here.

  // ----------------------------------------------------------
  // MENTOR-SPECIFIC PRIVATE ATTRIBUTES (Encapsulation)
  //
  // A Mentor keeps their own list of students they mentor directly
  // (separate from Teacher's general #assignedStudents list),
  // and they have a focus area — a specific STEM subject.
  // ----------------------------------------------------------
  #mentoredStudents; // Array: student IDs this mentor works with 1-on-1
  #focusArea;        // e.g. 'Electronics', 'Robotics', 'Recycled Materials'

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // We need everything Teacher needs (which includes everything
  // User needs), plus the mentor's specific focus area.
  //
  // The chain is:
  //   Mentor → super() → Teacher → super() → User
  //
  // Example of creating a Mentor:
  //   const m = new Mentor(
  //     't002', 'Kak Siti', 28,
  //     'siti@mentor.com', 'pass123',
  //     'mentor', 'Electronics'
  //   );
  // ----------------------------------------------------------
  constructor(userID, name, age, email, password, role, focusArea) {
    super(userID, name, age, email, password, role);
    // ^ Calls Teacher's constructor, which calls User's constructor.
    //   After this line, all User and Teacher fields are set up.

    this.#focusArea        = focusArea;
    this.#mentoredStudents = []; // starts empty — students added later
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  // Returns the mentor's area of expertise
  getFocusArea() {
    return this.#focusArea;
  }

  // Returns the list of student IDs this mentor works with directly
  getMentoredStudents() {
    return this.#mentoredStudents;
  }

  // ----------------------------------------------------------
  // METHODS (Mentor Behaviours)
  // ----------------------------------------------------------

  // Adds a student to this mentor's one-on-one list.
  // Different from Teacher's assignStudent() — this tracks
  // the closer, personal mentoring relationship specifically.
  addMentoredStudent(studentID) {
    if (!this.#mentoredStudents.includes(studentID)) {
      this.#mentoredStudents.push(studentID);
      return `${this.getName()} is now mentoring student: ${studentID}`;
    }
    return `${studentID} is already being mentored by ${this.getName()}.`;
  }

  // Removes a student from the mentoring list
  // (e.g. if the mentoring relationship ends)
  removeMentoredStudent(studentID) {
    const index = this.#mentoredStudents.indexOf(studentID);
    if (index !== -1) {
      this.#mentoredStudents.splice(index, 1);
      return `${studentID} has been removed from ${this.getName()}'s mentoring list.`;
    }
    return `${studentID} was not found in ${this.getName()}'s mentoring list.`;
  }

  // Sends personalised feedback to a specific student.
  // A mentor can only send feedback to students they are mentoring.
  // In a real app, this would save the feedback message to Supabase.
  // For now it returns the feedback as a structured object.
  sendFeedback(studentID, message) {
    if (!this.#mentoredStudents.includes(studentID)) {
      return `${this.getName()} can only send feedback to their mentored students. ${studentID} is not on their list.`;
    }
    return {
      from:      this.getName(),
      to:        studentID,
      focusArea: this.#focusArea,
      message:   message,
      sentAt:    new Date().toISOString(),
      // toISOString() returns the current date and time in a
      // standard format, e.g. "2026-04-04T10:30:00.000Z"
    };
  }

  // Returns a summary of this mentor's current mentoring work.
  getMentoringSummary() {
    if (this.#mentoredStudents.length === 0) {
      return `${this.getName()} (Focus: ${this.#focusArea}) has no mentored students yet.`;
    }
    return {
      mentor:           this.getName(),
      focusArea:        this.#focusArea,
      totalMentored:    this.#mentoredStudents.length,
      mentoredStudents: this.#mentoredStudents,
    };
  }

  // Returns full details — includes User + Teacher fields (via super)
  // plus Mentor-specific fields on top.
  getDetails() {
    return {
      ...super.getDetails(),
      focusArea:        this.#focusArea,
      mentoredStudents: this.#mentoredStudents,
    };
  }
}

// ----------------------------------------------------------
// EXPORT
// ----------------------------------------------------------
export default Mentor;
