// ============================================================
// FILE: src/models/VerifiedCreator.js
// PURPOSE: A creator who has been manually approved by an admin.
//          Verified creators display a badge on their profile and projects.
//
// INHERITANCE CHAIN: VerifiedCreator → Creator → User
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : Three-level chain — gets all Creator and User behaviour
//   - Encapsulation : isVerified and verifiedAt are private
//
// DATABASE MAPPING: creators table
//   is_verified = TRUE, verified_at (timestamp), verified_by (admin user ID)
// ============================================================

import Creator from './Creator';

class VerifiedCreator extends Creator {

  #isVerified;   // Always true for this class — set in constructor
  #verifiedAt;   // ISO timestamp of when the account was approved

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Example:
  //   const vc = new VerifiedCreator(
  //     'uuid-004', 'Dr. Lim', 'lim@tegas.com', 'verified_creator', null,
  //     'TEGAS', 'Electronics', 'STEM educator.', '2026-01-15T09:00:00.000Z'
  //   );
  // ----------------------------------------------------------
  constructor(id, name, email, role, avatarUrl, organisation, focusArea, bio, verifiedAt) {
    super(id, name, email, role, avatarUrl, organisation, focusArea, bio);
    this.#isVerified = true;
    this.#verifiedAt = verifiedAt ?? new Date().toISOString();
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  get isVerified() { return this.#isVerified; }
  get verifiedAt() { return this.#verifiedAt; }

  // ----------------------------------------------------------
  // METHODS
  // ----------------------------------------------------------

  // Returns the date of verification in a human-readable format
  getVerifiedDate() {
    return new Date(this.#verifiedAt).toLocaleDateString('en-MY', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  getDetails() {
    return {
      ...super.getDetails(),
      isVerified: this.#isVerified,
      verifiedAt: this.#verifiedAt,
    };
  }
}

export default VerifiedCreator;
