// ============================================================
// FILE: src/models/Teacher.js
// PURPOSE: Represents a teacher or mentor in the S-MIB app.
//          A Teacher IS a User — they share the same base identity
//          (name, email, login, etc.) but have different
//          responsibilities from a Student.
//
// INHERITANCE CHAIN:
//   Teacher → extends → User
//   This is a Level 2 class (same level as Student).
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends User, calls super() in constructor
//   - Encapsulation : Teacher's own attributes use # (private fields)
//   - Abstraction   : Teacher is a base class for ClassroomTeacher
//                     and Mentor — it is rarely used directly
// ============================================================

import User from './User';

class Teacher extends User {
  // This line means: "Teacher inherits everything from User".
  // Teacher automatically gets: getName(), getEmail(), login(),
  // logout(), updateProfile(), getDetails(), and all setters.
  // We do NOT need to rewrite any of those here.

  // ----------------------------------------------------------
  // TEACHER-SPECIFIC PRIVATE ATTRIBUTES (Encapsulation)
  //
  // These are extra fields that only a Teacher has.
  // A Student does not have these.
  // ----------------------------------------------------------
  #assignedStudents;    // Array: student IDs this teacher is responsible for
  #recommendedProjects; // Array: project IDs this teacher has recommended

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // When we create a new Teacher, we need:
  //   1. All the User fields (passed up via super())
  //   2. No extra parameters — assignedStudents and
  //      recommendedProjects start as empty arrays
  //
  // Example of creating a Teacher:
  //   const t = new Teacher('t001', 'Cikgu Aiman', 35, 'aiman@school.com', 'pass123', 'classroom_teacher');
  // ----------------------------------------------------------
  constructor(userID, name, age, email, password, role) {
    super(userID, name, age, email, password, role);
    // ^ Calls the User constructor. After this line, all User
    //   private fields (#name, #email, etc.) are fully set up.

    // Teacher starts with no students and no recommended projects yet
    this.#assignedStudents    = [];
    this.#recommendedProjects = [];
  }

  // ----------------------------------------------------------
  // METHODS (Teacher Behaviours)
  // ----------------------------------------------------------

  // Assigns a student to this teacher's responsibility list.
  // studentID is the unique ID of the student (e.g. 's001').
  // We check for duplicates so the same student is not added twice.
  assignStudent(studentID) {
    if (!this.#assignedStudents.includes(studentID)) {
      this.#assignedStudents.push(studentID);
      return `${this.getName()} has been assigned student: ${studentID}`;
    }
    return `Student ${studentID} is already assigned to ${this.getName()}.`;
  }

  // Returns the full list of student IDs assigned to this teacher.
  getAssignedStudents() {
    return this.#assignedStudents;
  }

  // Adds a project to this teacher's recommended projects list.
  // projectID is the unique ID of the project (e.g. 'led-torch').
  recommendProject(projectID) {
    if (!this.#recommendedProjects.includes(projectID)) {
      this.#recommendedProjects.push(projectID);
      return `${this.getName()} recommended project: ${projectID}`;
    }
    return `Project ${projectID} is already in ${this.getName()}'s recommendations.`;
  }

  // Returns all projects this teacher has recommended.
  getRecommendedProjects() {
    return this.#recommendedProjects;
  }

  // Returns a summary of a single student's progress.
  // In a real app, this would fetch Progress records from Supabase
  // using the studentID. For now it describes what it would do.
  viewStudentProgress(studentID) {
    if (!this.#assignedStudents.includes(studentID)) {
      return `${this.getName()} does not have student ${studentID} assigned.`;
    }
    return `${this.getName()} is viewing progress for student: ${studentID}`;
  }

  // Returns a summary across all assigned students.
  // In a real app, this would aggregate progress data from Supabase.
  viewClassSummary() {
    if (this.#assignedStudents.length === 0) {
      return `${this.getName()} has no students assigned yet.`;
    }
    return {
      teacher:        this.getName(),
      role:           this.getRole(),
      totalStudents:  this.#assignedStudents.length,
      studentIDs:     this.#assignedStudents,
      projectsRecommended: this.#recommendedProjects.length,
    };
  }

  // Returns all details about this teacher — includes the
  // inherited User fields (via super) plus Teacher-specific data.
  getDetails() {
    return {
      ...super.getDetails(),
      // The '...' spread operator copies all fields from
      // the parent getDetails() result, then we add more:
      assignedStudents:     this.#assignedStudents,
      recommendedProjects:  this.#recommendedProjects,
    };
  }
}

// ----------------------------------------------------------
// EXPORT
// Makes Teacher available for import in other files.
// ClassroomTeacher.js and Mentor.js will import from here.
// ----------------------------------------------------------
export default Teacher;
