// ============================================================
// FILE: src/models/Student.js
// PURPOSE: Represents a learner in the S-MIB app.
//          A Student IS a User — they inherit everything from
//          the User base class, then add student-specific
//          behaviour on top.
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends User, calls super() in constructor
//   - Encapsulation : Student's own attributes also use # (private)
// ============================================================

// ----------------------------------------------------------
// IMPORT
//
// Before we can extend User, we must import it from its file.
// The './' means "look in the same folder as this file".
// ----------------------------------------------------------
import User from './User';

class Student extends User {
  // This line means: "Student inherits everything from User".
  // Student automatically gets all of User's methods:
  //   getName(), getEmail(), login(), logout(), etc.
  // We do NOT need to rewrite any of those here.

  // ----------------------------------------------------------
  // STUDENT-SPECIFIC PRIVATE ATTRIBUTES (Encapsulation)
  //
  // These are extra fields that only a Student has.
  // A regular User or Teacher does not have these.
  // ----------------------------------------------------------
  #gradeLevel;         // e.g. 'Year 4', 'Year 5', 'Form 1'
  #enrolledProjects;   // Array: list of project IDs this student has started
  #progressList;       // Array: list of Progress objects (tracks step completion)
  #achievementList;    // Array: list of Achievement objects earned

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // When we create a new Student, we need two things:
  //   1. All the User fields (userID, name, age, email, password, role)
  //   2. The student-specific gradeLevel
  //
  // IMPORTANT: super() MUST be called first.
  // super() runs the User constructor and sets up the shared
  // private fields (#name, #email, etc.) in the parent class.
  // Without super(), 'this' cannot be used and an error occurs.
  //
  // Example of creating a Student:
  //   const s = new Student('s001', 'Siti', 11, 'siti@email.com', 'pass123', 'junior_learner', 'Year 5');
  // ----------------------------------------------------------
  constructor(userID, name, age, email, password, role, gradeLevel) {
    super(userID, name, age, email, password, role);
    // ^ super() calls the User constructor with the shared fields.
    //   After this line, all User private fields are set up.

    // Now we set up the Student-specific fields:
    this.#gradeLevel = gradeLevel;
    this.#enrolledProjects = [];  // starts as an empty array
    this.#progressList = [];      // no progress yet
    this.#achievementList = [];   // no achievements yet
  }

  // ----------------------------------------------------------
  // GETTER for gradeLevel
  // ----------------------------------------------------------
  getGradeLevel() {
    return this.#gradeLevel;
  }

  // ----------------------------------------------------------
  // METHODS (Student Behaviours)
  // ----------------------------------------------------------

  // Adds a project to this student's enrolled list.
  // projectID is the unique identifier of the project (e.g. 'led-torch').
  // We check it is not already enrolled to avoid duplicates.
  enrollProject(projectID) {
    if (!this.#enrolledProjects.includes(projectID)) {
      this.#enrolledProjects.push(projectID);
      return `${this.getName()} enrolled in project: ${projectID}`;
    }
    return `${this.getName()} is already enrolled in: ${projectID}`;
  }

  // Returns the full list of project IDs this student is enrolled in.
  getEnrolledProjects() {
    return this.#enrolledProjects;
  }

  // Adds a Progress object to this student's progress list.
  // Called when a student starts or updates a project's progress.
  addProgress(progressObject) {
    this.#progressList.push(progressObject);
    return `Progress recorded for ${this.getName()}.`;
  }

  // Returns the full list of Progress objects for this student.
  viewProgress() {
    if (this.#progressList.length === 0) {
      return `${this.getName()} has no progress recorded yet.`;
    }
    return this.#progressList;
  }

  // Adds an Achievement object to this student's achievement list.
  // Called when a student completes a project or reaches a milestone.
  addAchievement(achievementObject) {
    this.#achievementList.push(achievementObject);
    return `Achievement added for ${this.getName()}.`;
  }

  // Returns all achievements this student has earned.
  viewAchievements() {
    if (this.#achievementList.length === 0) {
      return `${this.getName()} has not earned any achievements yet.`;
    }
    return this.#achievementList;
  }

  // Returns a list of available projects the student can browse.
  // In a real app, this would fetch from Supabase.
  // For now, it returns a message describing what it would do.
  browseProjects() {
    return `${this.getName()} is browsing available STEM projects (Grade: ${this.#gradeLevel}).`;
  }

  // Returns all details about this student, including the
  // inherited User details (via super) plus Student-specific data.
  getDetails() {
    return {
      ...super.getDetails(),
      // The '...' spread operator copies all fields from
      // the parent getDetails() result, then we add more:
      gradeLevel:       this.#gradeLevel,
      enrolledProjects: this.#enrolledProjects,
      achievementCount: this.#achievementList.length,
    };
  }
}

// ----------------------------------------------------------
// EXPORT
// Makes Student available for import in other files.
// JuniorLearner.js and SeniorLearner.js will import from here.
// ----------------------------------------------------------
export default Student;
