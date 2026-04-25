// ============================================================
// FILE: src/models/ContentMentor.js
// PURPOSE: A creator who can also answer learner questions via AI Help.
//          Content Mentors have the answerQuestion() capability on top
//          of all normal Creator functionality.
//
// INHERITANCE CHAIN: ContentMentor → Creator → User
//
// OOP CONCEPTS DEMONSTRATED:
//   - Inheritance   : Three-level chain
//   - Encapsulation : No extra private fields — the distinction is behavioural
//
// DATABASE MAPPING: creators table
//   creator_type = 'content_mentor'
// ============================================================

import Creator from './Creator';

class ContentMentor extends Creator {

  // ----------------------------------------------------------
  // CONSTRUCTOR
  //
  // ContentMentor has no extra fields beyond Creator.
  // The difference is the answerQuestion() method below.
  //
  // Example:
  //   const cm = new ContentMentor(
  //     'uuid-005', 'Cikgu Azlan', 'azlan@school.edu', 'content_mentor', null,
  //     'SMK Miri', 'Robotics', 'Robotics teacher and STEM mentor.'
  //   );
  // ----------------------------------------------------------
  constructor(id, name, email, role, avatarUrl, organisation, focusArea, bio) {
    super(id, name, email, role, avatarUrl, organisation, focusArea, bio);
  }

  // ----------------------------------------------------------
  // METHOD: answerQuestion
  //
  // ContentMentors are the only Creator subtype that can contribute
  // context to the AI Help system. In the app, this method packages
  // the mentor's profile so the Edge Function can personalise the
  // AI response ("Your mentor Cikgu Azlan from SMK Miri suggests...").
  //
  // In a full implementation, this would call aiService.js which
  // routes through the Supabase Edge Function to Gemini.
  // ----------------------------------------------------------
  answerQuestion(projectContext, studentMessage) {
    return {
      mentorName:    this.name,
      organisation:  this.organisation,
      focusArea:     this.focusArea,
      projectId:     projectContext.projectId,
      stepId:        projectContext.stepId,
      studentMessage,
      timestamp:     new Date().toISOString(),
    };
  }

  getDetails() {
    return {
      ...super.getDetails(),
      canAnswerQuestions: true,
    };
  }
}

export default ContentMentor;
