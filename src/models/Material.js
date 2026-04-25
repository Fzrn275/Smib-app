// ============================================================
// FILE: src/models/Material.js
// PURPOSE: One physical material required by a STEM project.
//          e.g. "Plastic Bottle", "LED Bulb", "Rubber Band"
//
// RELATIONSHIP: Composition with Project
//   A Material cannot exist without a Project.
//   Deleting the project removes all its materials (ON DELETE CASCADE).
//
// OOP CONCEPTS DEMONSTRATED:
//   - Encapsulation : All attributes are private (#)
//   - Composition   : Material is stored in Project's materials array
//
// DATABASE MAPPING: materials table
//   id, project_id, name, description, is_recyclable
// ============================================================

class Material {

  #id;
  #name;
  #description;
  #isRecyclable;

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Example:
  //   const m1 = new Material('uuid-mat-001', 'Plastic Bottle',
  //                           'Used as the torch casing.', true);
  // ----------------------------------------------------------
  constructor(id, name, description, isRecyclable = false) {
    this.#id          = id;
    this.#name        = name;
    this.#description = description;
    this.#isRecyclable = isRecyclable;
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  get id()           { return this.#id; }
  get name()         { return this.#name; }
  get description()  { return this.#description; }
  get isRecyclable() { return this.#isRecyclable; }

  // ----------------------------------------------------------
  // METHOD
  // ----------------------------------------------------------

  getDetails() {
    return {
      id:          this.#id,
      name:        this.#name,
      description: this.#description,
      isRecyclable: this.#isRecyclable,
    };
  }
}

export default Material;
