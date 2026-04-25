// ============================================================
// FILE: src/models/Certificate.js
// PURPOSE: A verifiable certificate that extends Achievement.
//          Issued when a student completes a full project or
//          reaches a major milestone.
//
// INHERITANCE CHAIN: Certificate → Achievement
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : extends Achievement — gets all Achievement behaviour
//   - Encapsulation : certType, verificationCode, issuedBy are private
//
// DATABASE MAPPING: certificates table
//   id, achievement_id, student_id, cert_type, verification_code, issued_by
// ============================================================

import Achievement from './Achievement';

class Certificate extends Achievement {

  #certType;          // 'project_completion' | 'category_mastery' | 'tvet_readiness' | 'streak'
  #verificationCode;  // Unique UUID used for external verification
  #issuedBy;          // e.g. 'S-MIB Platform' or a partner organisation

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // super() must be called first — sets up Achievement's private fields.
  // type is always 'certificate' for this class.
  //
  // Example:
  //   const cert = new Certificate(
  //     'uuid-cert-001', 'uuid-ach-001', 'uuid-student-001',
  //     'First Project Complete!', 'first_project',
  //     'project_completion', 'SMIB-2026-A3F9', 'S-MIB Platform'
  //   );
  // ----------------------------------------------------------
  constructor(id, achievementId, studentId, title, triggerType, certType, verificationCode, issuedBy) {
    super(id, studentId, title, 'certificate', triggerType);
    // ^ 'certificate' is passed as the `type` — always the same for certificates
    this.#certType         = certType         ?? 'project_completion';
    this.#verificationCode = verificationCode ?? '';
    this.#issuedBy         = issuedBy         ?? 'S-MIB Platform';
    this._achievementId    = achievementId;   // non-private so service layer can read it
  }

  // ----------------------------------------------------------
  // GETTERS
  // ----------------------------------------------------------

  get certType()          { return this.#certType; }
  get verificationCode()  { return this.#verificationCode; }
  get issuedBy()          { return this.#issuedBy; }

  // ----------------------------------------------------------
  // METHODS
  // ----------------------------------------------------------

  // Returns the cert type as a human-readable label for the UI tag
  getCertTypeLabel() {
    const labels = {
      project_completion: 'Project Completion',
      category_mastery:   'Category Mastery',
      tvet_readiness:     'TVET Readiness',
      streak:             'Streak Award',
    };
    return labels[this.#certType] || this.#certType;
  }

  getDetails() {
    return {
      ...super.getDetails(),
      certType:         this.#certType,
      certTypeLabel:    this.getCertTypeLabel(),
      verificationCode: this.#verificationCode,
      issuedBy:         this.#issuedBy,
    };
  }
}

export default Certificate;
