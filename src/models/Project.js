// ============================================================
// FILE: src/models/Project.js
// PURPOSE: Abstract base class for all STEM projects in S-MIB.
//          GuidedProject and OpenProject both extend this.
//
// OOP CONCEPTS DEMONSTRATED:
//   - Abstraction   : Cannot be instantiated directly — throws an error
//   - Encapsulation : All fields are private (#)
//   - Composition   : Project OWNS its Step and Material objects.
//                     Mirrored in the database with ON DELETE CASCADE.
//
// DATABASE MAPPING: projects table
//   id, title, description, difficulty, category, type
// ============================================================

class Project {

  #id;
  #title;
  #description;
  #difficulty;   // 'beginner' | 'intermediate' | 'advanced'
  #category;     // e.g. 'Electronics', 'Agriculture', 'Robotics'
  #steps;        // Array of Step objects (composition)
  #materials;    // Array of Material objects (composition)

  // ----------------------------------------------------------
  // CONSTRUCTOR — ABSTRACT GUARD
  //
  // new.target refers to the class that was actually called with `new`.
  // If someone writes `new Project(...)` directly, new.target === Project
  // and we throw an error. If they write `new GuidedProject(...)`,
  // new.target === GuidedProject — the check passes.
  //
  // This enforces the abstract class pattern in JavaScript.
  // ----------------------------------------------------------
  constructor(id, title, description, difficulty, category) {
    if (new.target === Project) {
      throw new Error('Project is an abstract class — instantiate GuidedProject or OpenProject instead.');
    }
    this.#id          = id;
    this.#title       = title;
    this.#description = description;
    this.#difficulty  = difficulty;
    this.#category    = category;
    this.#steps       = [];
    this.#materials   = [];
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  get id()          { return this.#id; }
  get title()       { return this.#title; }
  get description() { return this.#description; }
  get difficulty()  { return this.#difficulty; }
  get category()    { return this.#category; }

  // ----------------------------------------------------------
  // COMPOSITION — Steps
  //
  // Steps are OWNED by this Project.
  // Deleting the project removes all steps (mirrored by ON DELETE CASCADE).
  // ----------------------------------------------------------

  addStep(step) {
    this.#steps.push(step);
  }

  getSteps() {
    return [...this.#steps].sort((a, b) => a.stepNumber - b.stepNumber);
  }

  getStepCount() {
    return this.#steps.length;
  }

  // ----------------------------------------------------------
  // COMPOSITION — Materials
  // ----------------------------------------------------------

  addMaterial(material) {
    this.#materials.push(material);
  }

  getMaterials() {
    return [...this.#materials];
  }

  getRecyclableMaterials() {
    return this.#materials.filter(m => m.isRecyclable);
  }

  // ----------------------------------------------------------
  // METHODS
  // ----------------------------------------------------------

  getDetails() {
    return {
      id:          this.#id,
      title:       this.#title,
      description: this.#description,
      difficulty:  this.#difficulty,
      category:    this.#category,
      stepCount:   this.#steps.length,
      materialCount: this.#materials.length,
    };
  }
}

export default Project;
