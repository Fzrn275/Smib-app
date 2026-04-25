// ============================================================
// FILE: src/models/User.js
// PURPOSE: Base class for all user types in S-MIB.
//          Maps directly to the `users` table in Supabase.
//
// OOP CONCEPTS DEMONSTRATED:
//   - Encapsulation  : All attributes use # (private fields)
//   - Abstraction    : Base class — not used directly in screens
//
// DATABASE MAPPING: users table
//   id, name, email, role, avatar_url
// ============================================================

class User {

  // Private fields — only readable/writable through getters/setters below
  #id;
  #name;
  #email;
  #role;
  #avatarUrl;

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // Parameters mirror the `users` table columns.
  // Note: password is managed by Supabase Auth — never stored in this model.
  //
  // Example:
  //   const u = new User('uuid-001', 'Ahmad', 'ahmad@email.com', 'junior_learner', null);
  // ----------------------------------------------------------
  constructor(id, name, email, role, avatarUrl = null) {
    this.#id        = id;
    this.#name      = name;
    this.#email     = email;
    this.#role      = role;
    this.#avatarUrl = avatarUrl;
  }

  // ----------------------------------------------------------
  // GETTERS — controlled read access to private fields
  // ----------------------------------------------------------

  get id()        { return this.#id; }
  get name()      { return this.#name; }
  get email()     { return this.#email; }
  get role()      { return this.#role; }
  get avatarUrl() { return this.#avatarUrl; }

  // ----------------------------------------------------------
  // SETTERS — validated write access to mutable fields
  // ----------------------------------------------------------

  set name(newName) {
    if (newName && newName.trim().length > 0) {
      this.#name = newName.trim();
    }
  }

  set email(newEmail) {
    if (newEmail && newEmail.includes('@')) {
      this.#email = newEmail;
    }
  }

  set avatarUrl(url) {
    this.#avatarUrl = url;
  }

  // ----------------------------------------------------------
  // METHODS
  // ----------------------------------------------------------

  // Returns the role as a human-readable label for display
  getRoleLabel() {
    const labels = {
      junior_learner:   'Junior Learner',
      senior_learner:   'Senior Learner',
      creator:          'Creator',
      verified_creator: 'Verified Creator',
      content_mentor:   'Content Mentor',
      parent:           'Parent',
    };
    return labels[this.#role] || this.#role;
  }

  // Returns a summary object — useful for debugging and logging
  getDetails() {
    return {
      id:        this.#id,
      name:      this.#name,
      email:     this.#email,
      role:      this.#role,
      avatarUrl: this.#avatarUrl,
    };
  }
}

export default User;
