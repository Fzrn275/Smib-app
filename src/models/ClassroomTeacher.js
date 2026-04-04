// ============================================================
// FILE: src/models/ClassroomTeacher.js
// PURPOSE: Represents a classroom teacher who manages a whole
//          class group in the S-MIB app.
//
// INHERITANCE CHAIN:
//   ClassroomTeacher → extends → Teacher → extends → User
//   This is a Level 3 class — three levels deep.
//   ClassroomTeacher automatically has everything from BOTH
//   Teacher AND User without rewriting any of it.
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends Teacher (which already extends User)
//   - Encapsulation : #className and #studentGroup are private fields
// ============================================================

import Teacher from './Teacher';

class ClassroomTeacher extends Teacher {
  // ClassroomTeacher inherits everything from Teacher AND User:
  //   assignStudent(), recommendProject(), viewStudentProgress(),
  //   viewClassSummary(), login(), logout(), getName(), etc.
  // None of those need to be rewritten here.

  // ----------------------------------------------------------
  // CLASSROOM-SPECIFIC PRIVATE ATTRIBUTES (Encapsulation)
  //
  // A ClassroomTeacher manages a named class (e.g. "6 Bestari")
  // and keeps a group list of student IDs in that class.
  // A regular Teacher or Mentor does not have these fields.
  // ----------------------------------------------------------
  #className;     // e.g. '6 Bestari', 'Form 2 Jaya'
  #studentGroup;  // Array: student IDs that belong to this class

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // We need everything Teacher needs (which includes everything
  // User needs), plus the class name for this teacher's group.
  //
  // The chain is:
  //   ClassroomTeacher → super() → Teacher → super() → User
  //
  // Example of creating a ClassroomTeacher:
  //   const ct = new ClassroomTeacher(
  //     't001', 'Cikgu Aiman', 35,
  //     'aiman@school.com', 'pass123',
  //     'classroom_teacher', '6 Bestari'
  //   );
  // ----------------------------------------------------------
  constructor(userID, name, age, email, password, role, className) {
    super(userID, name, age, email, password, role);
    // ^ Calls Teacher's constructor, which calls User's constructor.
    //   After this line, all User and Teacher fields are set up.

    this.#className    = className;
    this.#studentGroup = []; // starts empty — students are added later
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  // Returns the name of this teacher's class
  getClassName() {
    return this.#className;
  }

  // Returns the list of student IDs in this class group
  getStudentGroup() {
    return this.#studentGroup;
  }

  // ----------------------------------------------------------
  // METHODS (ClassroomTeacher Behaviours)
  // ----------------------------------------------------------

  // Adds a student to this teacher's class group.
  // This is DIFFERENT from the inherited assignStudent() in Teacher.
  //   - assignStudent() (from Teacher) tracks general responsibility
  //   - addToGroup() tracks students specifically in THIS classroom
  // We check for duplicates before adding.
  addToGroup(studentID) {
    if (!this.#studentGroup.includes(studentID)) {
      this.#studentGroup.push(studentID);
      return `${studentID} added to class ${this.#className} by ${this.getName()}.`;
    }
    return `${studentID} is already in class ${this.#className}.`;
  }

  // Removes a student from the class group (e.g. if they transfer out).
  removeFromGroup(studentID) {
    const index = this.#studentGroup.indexOf(studentID);
    if (index !== -1) {
      this.#studentGroup.splice(index, 1);
      return `${studentID} removed from class ${this.#className}.`;
    }
    return `${studentID} was not found in class ${this.#className}.`;
  }

  // Returns a progress summary for the whole class group.
  // In a real app, this would fetch Progress records from Supabase
  // for every student in #studentGroup. For now it describes what
  // it would do, showing the concept clearly.
  viewGroupProgress() {
    if (this.#studentGroup.length === 0) {
      return `Class ${this.#className} has no students yet.`;
    }
    return {
      teacher:      this.getName(),
      className:    this.#className,
      totalStudents: this.#studentGroup.length,
      studentIDs:   this.#studentGroup,
      summary:      `Showing progress for all ${this.#studentGroup.length} students in ${this.#className}.`,
    };
  }

  // Assigns the same project to every student in the class group at once.
  // In a real app, this would create a Progress record in Supabase
  // for each student. For now it returns a confirmation message.
  assignGroupProject(projectID) {
    if (this.#studentGroup.length === 0) {
      return `Cannot assign project — class ${this.#className} has no students yet.`;
    }
    return {
      teacher:    this.getName(),
      className:  this.#className,
      projectID:  projectID,
      assigned:   this.#studentGroup,
      message:    `Project ${projectID} assigned to all ${this.#studentGroup.length} students in ${this.#className}.`,
    };
  }

  // Returns full details — includes User + Teacher fields (via super)
  // plus ClassroomTeacher-specific fields on top.
  getDetails() {
    return {
      ...super.getDetails(),
      className:    this.#className,
      studentGroup: this.#studentGroup,
    };
  }
}

// ----------------------------------------------------------
// EXPORT
// ----------------------------------------------------------
export default ClassroomTeacher;
