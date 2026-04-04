// ============================================================
// FILE: src/models/Material.js
// PURPOSE: Represents one material used in a STEM project.
//          e.g. "Plastic Bottle", "LED bulb", "Rubber band"
//
// RELATIONSHIP: Composition with Project
//   - A Material CANNOT exist without a Project.
//   - If a Project is deleted, all its Materials are deleted too.
//   - This is mirrored in the database with ON DELETE CASCADE
//     on the materials table (see /database/schema.sql).
//
// OOP CONCEPTS DEMONSTRATED:
//   - Encapsulation : All attributes use # (private fields)
//   - Composition   : Material is created and stored inside
//                     Project's #materialList array. It has no
//                     meaning outside of a Project context.
// ============================================================

class Material {

  // ----------------------------------------------------------
  // PRIVATE ATTRIBUTES (Encapsulation)
  // ----------------------------------------------------------
  #materialID;    // Unique identifier, e.g. 'mat-001'
  #name;          // Display name, e.g. 'Plastic Bottle'
  #description;   // What it is / how it is used in the project
  #isRecyclable;  // true or false — supports the app's sustainability theme

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Example of creating a Material:
  //   const m1 = new Material('mat-001', 'Plastic Bottle', 'Used as the torch casing.', true);
  //   const m2 = new Material('mat-002', 'LED Bulb', 'Provides the light source.', false);
  //
  // Materials are created and then passed into a Project using:
  //   project.addMaterial(m1);
  // ----------------------------------------------------------
  constructor(materialID, name, description, isRecyclable = false) {
    // isRecyclable = false means if not specified, it defaults to false
    this.#materialID   = materialID;
    this.#name         = name;
    this.#description  = description;
    this.#isRecyclable = isRecyclable;
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  getMaterialID() {
    return this.#materialID;
  }

  getName() {
    return this.#name;
  }

  getDescription() {
    return this.#description;
  }

  // Returns true if this material is recyclable, false if not.
  // Project's getRecyclableMaterials() calls this method to
  // filter the full materials list down to recyclable ones only.
  checkIsRecyclable() {
    return this.#isRecyclable;
  }

  // ----------------------------------------------------------
  // METHOD
  //
  // Returns all details about this material as a single object.
  // Useful for displaying the materials list on the project screen.
  // ----------------------------------------------------------
  getDetails() {
    return {
      materialID:   this.#materialID,
      name:         this.#name,
      description:  this.#description,
      isRecyclable: this.#isRecyclable,
    };
  }
}

// ----------------------------------------------------------
// EXPORT
// Project.js uses addMaterial() to store Material instances.
// ----------------------------------------------------------
export default Material;
