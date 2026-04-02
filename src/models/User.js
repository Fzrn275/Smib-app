// ============================================================
// FILE: src/models/User.js
// PURPOSE: Base class for all user types in the S-MIB app.
//          Every person who uses the app — student, teacher,
//          or parent — is a User at their core.
//
// OOP CONCEPTS DEMONSTRATED:
//   - Encapsulation  : All attributes use # (private fields)
//   - Abstraction    : This is a base class, never used directly
// ============================================================

class User {

  // ----------------------------------------------------------
  // PRIVATE ATTRIBUTES (Encapsulation)
  //
  // The # symbol makes these fields PRIVATE.
  // That means ONLY code inside this class can read or change
  // them directly. Outside code must use the getter/setter
  // methods below. This protects the data from being changed
  // accidentally.
  // ----------------------------------------------------------
  #userID;
  #name;
  #age;
  #email;
  #password;
  #role;

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // The constructor is a special method that runs automatically
  // when you create a new User object. It sets up the starting
  // values for all the private fields.
  //
  // Example of creating a User:
  //   const u = new User('u001', 'Ahmad', 12, 'ahmad@email.com', 'pass123', 'junior_learner');
  // ----------------------------------------------------------
  constructor(userID, name, age, email, password, role) {
    this.#userID = userID;
    this.#name = name;
    this.#age = age;
    this.#email = email;
    this.#password = password;
    this.#role = role;
  }

  // ----------------------------------------------------------
  // GETTERS
  //
  // Getters are methods that let outside code READ the private
  // fields in a controlled way. They start with "get" by
  // convention. Since the fields are private (#), this is the
  // ONLY way to access them from outside the class.
  // ----------------------------------------------------------

  // Returns the user's unique ID
  getUserID() {
    return this.#userID;
  }

  // Returns the user's display name
  getName() {
    return this.#name;
  }

  // Returns the user's age
  getAge() {
    return this.#age;
  }

  // Returns the user's email address
  getEmail() {
    return this.#email;
  }

  // Returns the user's role (e.g. 'junior_learner', 'classroom_teacher')
  getRole() {
    return this.#role;
  }

  // ----------------------------------------------------------
  // SETTERS
  //
  // Setters are methods that let outside code UPDATE the
  // private fields in a controlled way. We can add validation
  // rules here to make sure only valid data gets saved.
  // ----------------------------------------------------------

  // Updates the user's name — rejects empty strings
  setName(newName) {
    if (newName && newName.trim().length > 0) {
      this.#name = newName.trim();
    } else {
      console.warn('User.setName: Name cannot be empty.');
    }
  }

  // Updates the user's email — basic format check
  setEmail(newEmail) {
    if (newEmail && newEmail.includes('@')) {
      this.#email = newEmail;
    } else {
      console.warn('User.setEmail: Invalid email format.');
    }
  }

  // Updates the user's age — must be a positive number
  setAge(newAge) {
    if (typeof newAge === 'number' && newAge > 0) {
      this.#age = newAge;
    } else {
      console.warn('User.setAge: Age must be a positive number.');
    }
  }

  // ----------------------------------------------------------
  // METHODS (Behaviours)
  //
  // These are the actions a User can perform. In a real app,
  // login() and logout() would talk to Supabase Auth. For now
  // they return simple messages to show the concept works.
  // ----------------------------------------------------------

  // Simulates logging in — returns a confirmation message
  login() {
    return `${this.#name} has logged in as ${this.#role}.`;
  }

  // Simulates logging out — returns a confirmation message
  logout() {
    return `${this.#name} has logged out.`;
  }

  // Updates the user's profile with a new name and/or email
  updateProfile(newName, newEmail) {
    if (newName) this.setName(newName);
    if (newEmail) this.setEmail(newEmail);
    return `Profile updated for ${this.#name}.`;
  }

  // Returns a summary of this user — useful for debugging
  // and for displaying user information in the app
  getDetails() {
    return {
      userID: this.#userID,
      name:   this.#name,
      age:    this.#age,
      email:  this.#email,
      role:   this.#role,
    };
  }
}

// ----------------------------------------------------------
// EXPORT
//
// This line makes the User class available to other files.
// Any file that wants to use User (or extend it) must first
// import it using:
//   import User from './User';
// ----------------------------------------------------------
export default User;
