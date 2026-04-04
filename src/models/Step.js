// ============================================================
// FILE: src/models/Step.js
// PURPOSE: Represents one single instruction step inside a project.
//          e.g. "Step 1: Cut the plastic bottle in half."
//
// RELATIONSHIP: Composition with Project
//   - A Step CANNOT exist without a Project.
//   - If a Project is deleted, all its Steps are deleted too.
//   - This is mirrored in the database schema with ON DELETE CASCADE
//     on the steps table (see /database/schema.sql).
//
// OOP CONCEPTS DEMONSTRATED:
//   - Encapsulation : All attributes use # (private fields)
//   - Composition   : Step is created inside Project and stored
//                     in Project's #stepList array. It has no
//                     meaning outside of a Project context.
// ============================================================

class Step {

  // ----------------------------------------------------------
  // PRIVATE ATTRIBUTES (Encapsulation)
  // ----------------------------------------------------------
  #stepNumber;   // The order of this step, e.g. 1, 2, 3
  #description;  // The instruction text, e.g. "Cut the bottle in half"
  #imageRef;     // Optional: file path or URL to an image for this step
                 // Can be null if no image is provided

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Example of creating a Step:
  //   const s1 = new Step(1, 'Cut the plastic bottle in half.', 'step1.png');
  //   const s2 = new Step(2, 'Insert the LED through the bottle cap.', null);
  //
  // Steps are created and then passed into a Project using:
  //   project.addStep(s1);
  // ----------------------------------------------------------
  constructor(stepNumber, description, imageRef = null) {
    // imageRef = null means if no image is provided, it defaults to null
    // The '= null' is a default parameter — you don't have to pass it in
    this.#stepNumber  = stepNumber;
    this.#description = description;
    this.#imageRef    = imageRef;
  }

  // ----------------------------------------------------------
  // GETTERS
  //
  // These are the only way to read the private fields from outside.
  // Project's getSteps() and getNextStep() both call getStepNumber()
  // to sort and retrieve steps correctly.
  // ----------------------------------------------------------

  // Returns the step number (used for sorting in Project.getSteps())
  getStepNumber() {
    return this.#stepNumber;
  }

  // Returns the instruction text for this step
  getDescription() {
    return this.#description;
  }

  // Returns the image reference (file path or URL), or null if none
  getImage() {
    return this.#imageRef;
  }

  // Returns whether this step has an image attached
  hasImage() {
    return this.#imageRef !== null;
  }

  // ----------------------------------------------------------
  // METHOD
  //
  // Returns all details about this step as a single object.
  // Useful for displaying the step on the StepByStepScreen in the app.
  // ----------------------------------------------------------
  getDetails() {
    return {
      stepNumber:  this.#stepNumber,
      description: this.#description,
      imageRef:    this.#imageRef,
      hasImage:    this.hasImage(),
    };
  }
}

// ----------------------------------------------------------
// EXPORT
// Project.js uses addStep() to store Step instances.
// ----------------------------------------------------------
export default Step;
