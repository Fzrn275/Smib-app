// ============================================================
// FILE: src/models/Creator.js
// PURPOSE: Represents a content creator in S-MIB.
//          Creators build STEM projects that learners can enrol in.
//
// INHERITANCE CHAIN: Creator → User
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends User, calls super() in constructor
//   - Encapsulation : organisation, focusArea, bio are private fields
//
// DATABASE MAPPING: users table + creators table
//   creators.organisation, creators.focus_area, creators.bio
// ============================================================

import User from './User';

class Creator extends User {

  #organisation;  // e.g. "TEGAS", "SMK Kuching"
  #focusArea;     // e.g. "Electronics", "Agriculture"
  #bio;           // Short profile description

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Example:
  //   const c = new Creator('uuid-003', 'Dr. Lim', 'lim@tegas.com',
  //                         'creator', null, 'TEGAS', 'Electronics',
  //                         'STEM educator with 10 years experience.');
  // ----------------------------------------------------------
  constructor(id, name, email, role, avatarUrl, organisation, focusArea, bio) {
    super(id, name, email, role, avatarUrl);
    this.#organisation = organisation ?? '';
    this.#focusArea    = focusArea    ?? '';
    this.#bio          = bio          ?? '';
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  get organisation() { return this.#organisation; }
  get focusArea()    { return this.#focusArea; }
  get bio()          { return this.#bio; }

  // ----------------------------------------------------------
  // SETTERS
  // ----------------------------------------------------------

  set organisation(value) { this.#organisation = value; }
  set focusArea(value)    { this.#focusArea    = value; }
  set bio(value)          { this.#bio          = value; }

  // ----------------------------------------------------------
  // METHODS
  // ----------------------------------------------------------

  // Returns a public-facing creator profile summary
  getPublicProfile() {
    return {
      name:         this.name,
      organisation: this.#organisation,
      focusArea:    this.#focusArea,
      bio:          this.#bio,
      avatarUrl:    this.avatarUrl,
    };
  }

  getDetails() {
    return {
      ...super.getDetails(),
      organisation: this.#organisation,
      focusArea:    this.#focusArea,
      bio:          this.#bio,
    };
  }
}

export default Creator;
