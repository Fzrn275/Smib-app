// ============================================================
// FILE: src/models/Step.js
// PURPOSE: One instruction step inside a guided project.
//          e.g. Step 1: "Cut the plastic bottle in half."
//
// RELATIONSHIP: Composition with Project (GuidedProject)
//   A Step cannot exist without a Project.
//   Deleting the project removes all its steps (ON DELETE CASCADE).
//
// OOP CONCEPTS DEMONSTRATED:
//   - Encapsulation : All attributes are private (#)
//   - Composition   : Step is stored in Project's steps array
//
// DATABASE MAPPING: steps table
//   id, project_id, step_number, title, instructions, image_ref
// ============================================================

class Step {

  #id;           // UUID from Supabase
  #stepNumber;   // Display order (1, 2, 3…)
  #title;        // Short name shown in the step list header
  #instructions; // Full instruction text shown on StepDetailScreen
  #imageRef;     // Optional URL to a step image

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Example:
  //   const s1 = new Step('uuid-step-001', 1, 'Cut the bottle',
  //                       'Cut the plastic bottle in half using scissors.', 'step1.png');
  // ----------------------------------------------------------
  constructor(id, stepNumber, title, instructions, imageRef = null) {
    this.#id           = id;
    this.#stepNumber   = stepNumber;
    this.#title        = title;
    this.#instructions = instructions;
    this.#imageRef     = imageRef;
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  get id()           { return this.#id; }
  get stepNumber()   { return this.#stepNumber; }
  get title()        { return this.#title; }
  get instructions() { return this.#instructions; }
  get imageRef()     { return this.#imageRef; }
  get hasImage()     { return this.#imageRef !== null; }

  // ----------------------------------------------------------
  // METHOD
  // ----------------------------------------------------------

  getDetails() {
    return {
      id:           this.#id,
      stepNumber:   this.#stepNumber,
      title:        this.#title,
      instructions: this.#instructions,
      imageRef:     this.#imageRef,
      hasImage:     this.hasImage,
    };
  }
}

export default Step;
