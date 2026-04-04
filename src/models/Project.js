// ============================================================
// FILE: src/models/Project.js
// PURPOSE: Base class for all project types in the S-MIB app.
//          Every STEM project — whether guided or open-ended —
//          is a Project at its core.
//
// OOP CONCEPTS DEMONSTRATED:
//   - Encapsulation : All attributes use # (private fields)
//   - Abstraction   : This is a base class. GuidedProject and
//                     OpenProject extend it with specific behaviour.
//                     Project is rarely used directly.
//   - Composition   : Project OWNS its Step and Material objects.
//                     If a Project is deleted, its Steps and
//                     Materials are deleted with it.
//                     (Mirrored in the database with ON DELETE CASCADE)
// ============================================================

class Project {

  // ----------------------------------------------------------
  // PRIVATE ATTRIBUTES (Encapsulation)
  //
  // These fields describe every project regardless of type.
  // They are private (#) so they can only be read or changed
  // through the methods below — never directly from outside.
  // ----------------------------------------------------------
  #projectID;    // Unique identifier, e.g. 'led-torch'
  #title;        // Display name, e.g. 'Build an LED Torch'
  #difficulty;   // 'beginner', 'intermediate', or 'advanced'
  #category;     // e.g. 'Electronics', 'Recycling', 'Robotics'
  #description;  // A short summary of what the project is about
  #stepList;     // Array: Step objects (composition relationship)
  #materialList; // Array: Material objects (composition relationship)

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Sets up a new Project with its core details.
  // stepList and materialList start empty — Steps and Materials
  // are added separately using addStep() and addMaterial().
  //
  // Example of creating a Project:
  //   const p = new Project(
  //     'led-torch',
  //     'Build an LED Torch',
  //     'beginner',
  //     'Electronics',
  //     'Build a simple torch using an LED, battery, and recycled bottle.'
  //   );
  // ----------------------------------------------------------
  constructor(projectID, title, difficulty, category, description) {
    this.#projectID   = projectID;
    this.#title       = title;
    this.#difficulty  = difficulty;
    this.#category    = category;
    this.#description = description;
    this.#stepList     = []; // Steps are added later via addStep()
    this.#materialList = []; // Materials are added later via addMaterial()
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  getProjectID() {
    return this.#projectID;
  }

  getTitle() {
    return this.#title;
  }

  getDifficulty() {
    return this.#difficulty;
  }

  getCategory() {
    return this.#category;
  }

  getDescription() {
    return this.#description;
  }

  // ----------------------------------------------------------
  // COMPOSITION METHODS — Steps
  //
  // Steps are OWNED by this Project (composition).
  // A Step object is passed in and stored inside #stepList.
  // In a real app, Steps would be loaded from Supabase
  // and passed in as Step objects.
  // ----------------------------------------------------------

  // Adds a Step object to this project's step list.
  // The step parameter should be an instance of the Step class.
  addStep(step) {
    this.#stepList.push(step);
    return `Step added to project: ${this.#title}`;
  }

  // Returns the full list of Step objects for this project,
  // sorted by step number so they appear in the correct order.
  getSteps() {
    return this.#stepList.sort(
      (a, b) => a.getStepNumber() - b.getStepNumber()
      // This sorts by comparing step numbers.
      // getStepNumber() is a method defined in the Step class.
    );
  }

  // ----------------------------------------------------------
  // COMPOSITION METHODS — Materials
  //
  // Materials are also OWNED by this Project (composition).
  // ----------------------------------------------------------

  // Adds a Material object to this project's material list.
  addMaterial(material) {
    this.#materialList.push(material);
    return `Material added to project: ${this.#title}`;
  }

  // Returns the full list of Material objects for this project.
  getMaterials() {
    return this.#materialList;
  }

  // Returns only the recyclable materials from the list.
  // Uses the checkIsRecyclable() method defined in the Material class.
  getRecyclableMaterials() {
    return this.#materialList.filter(m => m.checkIsRecyclable());
  }

  // ----------------------------------------------------------
  // METHODS (Project Behaviours)
  // ----------------------------------------------------------

  // Returns a summary of this project — useful for displaying
  // project cards in the app's project list screen.
  getDetails() {
    return {
      projectID:     this.#projectID,
      title:         this.#title,
      difficulty:    this.#difficulty,
      category:      this.#category,
      description:   this.#description,
      totalSteps:    this.#stepList.length,
      totalMaterials: this.#materialList.length,
    };
  }
}

// ----------------------------------------------------------
// EXPORT
// Makes Project available for import in other files.
// GuidedProject.js and OpenProject.js will import from here.
// ----------------------------------------------------------
export default Project;
