// ============================================================
// FILE: src/models/OpenProject.js
// PURPOSE: Represents a freestyle, open-ended STEM project.
//          Unlike GuidedProject, there are no fixed steps to follow.
//          Students are given suggested materials and a theme,
//          then they design and build whatever they imagine.
//          This type is available to SeniorLearners only.
//
// INHERITANCE CHAIN:
//   OpenProject → extends → Project
//   This is a Level 2 class.
//   OpenProject automatically has everything from Project:
//   addMaterial(), getMaterials(), getDetails(), getTitle(), etc.
//
// HOW OPENPROJECT DIFFERS FROM GUIDEDPROJECT:
//   - GuidedProject : fixed steps, fixed duration, follow instructions
//   - OpenProject   : no fixed steps, student submits their own creation,
//                     rated with a creativity score
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends Project, calls super() in constructor
//   - Encapsulation : #suggestedMaterials and #creativityScore are private
// ============================================================

import Project from './Project';

class OpenProject extends Project {

  // ----------------------------------------------------------
  // OPEN-PROJECT-SPECIFIC PRIVATE ATTRIBUTES (Encapsulation)
  // ----------------------------------------------------------
  #suggestedMaterials; // Array of material name strings (just suggestions,
                       // not strict requirements like in GuidedProject)
  #creativityScore;    // Number 0–100, awarded after the student submits
                       // their creation. Starts at 0 until scored.

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // We need everything Project needs, plus the suggested materials.
  // creativityScore always starts at 0 — it is awarded later.
  //
  // Example of creating an OpenProject:
  //   const op = new OpenProject(
  //     'recycle-bot',
  //     'Build Your Own Robot',
  //     'intermediate',
  //     'Robotics',
  //     'Use any recycled materials to design and build your own robot.',
  //     ['plastic bottles', 'cardboard', 'rubber bands', 'wire']
  //   );
  // ----------------------------------------------------------
  constructor(
    projectID, title, difficulty, category, description,
    suggestedMaterials
  ) {
    super(projectID, title, difficulty, category, description);
    // ^ Calls the Project constructor. After this line, all
    //   Project private fields are set up.

    // suggestedMaterials is an array of strings passed in as a parameter
    // We store a copy using [...] so the original array cannot affect ours
    this.#suggestedMaterials = suggestedMaterials ? [...suggestedMaterials] : [];
    this.#creativityScore    = 0; // always starts at 0, scored after submission
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  // Returns the list of suggested material names
  getSuggestions() {
    return this.#suggestedMaterials;
  }

  // Returns the current creativity score (0–100)
  getCreativityScore() {
    return this.#creativityScore;
  }

  // ----------------------------------------------------------
  // METHODS (OpenProject Behaviours)
  // ----------------------------------------------------------

  // Records that a student has submitted their creation.
  // studentID is who submitted it.
  // submissionNote is a short description of what they built.
  // In a real app, this would save a record to Supabase.
  // Returns a confirmation object.
  submitCreation(studentID, submissionNote) {
    return {
      projectID:      this.getProjectID(),
      projectTitle:   this.getTitle(),
      studentID:      studentID,
      submissionNote: submissionNote,
      submittedAt:    new Date().toISOString(),
      status:         'submitted — awaiting creativity score',
    };
  }

  // Awards a creativity score to this project after a teacher
  // or mentor has reviewed the student's submission.
  // Score must be a number between 0 and 100.
  awardCreativityScore(score) {
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return `Invalid score. Please provide a number between 0 and 100.`;
    }
    this.#creativityScore = score;
    return `Creativity score of ${score}/100 awarded to "${this.getTitle()}".`;
  }

  // Adds a new material suggestion to the list.
  // This lets teachers add extra suggestions after the project is created.
  addSuggestion(materialName) {
    if (!this.#suggestedMaterials.includes(materialName)) {
      this.#suggestedMaterials.push(materialName);
      return `"${materialName}" added to suggestions for "${this.getTitle()}".`;
    }
    return `"${materialName}" is already in the suggestions list.`;
  }

  // Returns full details — includes all Project fields (via super)
  // plus OpenProject-specific fields on top.
  getDetails() {
    return {
      ...super.getDetails(),
      // '...' copies all fields from Project's getDetails(),
      // then we add the OpenProject-specific ones:
      type:               'open',
      suggestedMaterials: this.#suggestedMaterials,
      creativityScore:    this.#creativityScore,
    };
  }
}

// ----------------------------------------------------------
// EXPORT
// ----------------------------------------------------------
export default OpenProject;
