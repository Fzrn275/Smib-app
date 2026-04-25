// src/services/aiService.js
// P5 — AI Help (DFD Section 4.5)
//
// Sends student questions to the Supabase Edge Function `ai-helper`.
// The Edge Function calls Google Gemini API server-side and returns the reply.
//
// SECURITY: This file contains ZERO direct calls to any external AI API.
// The Gemini API key lives only in the Supabase Edge Function environment.
// The client only ever calls supabase.functions.invoke().

import { supabase } from './supabaseClient';

/**
 * Sends a student question to the ai-helper Edge Function.
 *
 * DFD P5.2 Call Edge Function:
 *   Client → Supabase Edge Function (ai-helper) → Google Gemini API → response
 *
 * Context payload (DFD Section 4.5):
 * {
 *   project_id:   "uuid",
 *   step_id:      "uuid",          // optional — null if asking from ProjectDetailScreen
 *   step_title:   "Test voltage",  // optional
 *   learner_name: "Ahmad",
 *   grade_level:  "junior_learner" | "senior_learner",
 *   message:      "Why is my LED not lighting up?"
 * }
 *
 * The Edge Function uses this context to build a prompt that instructs
 * Gemini to respond at the appropriate reading level for the student's grade.
 *
 * @param {object} payload  - Context + message object (see above)
 * @returns {string}        - The AI's reply text
 * @throws {Error}          - On network failure or empty response
 */
export async function askAI(payload) {
  try {
    const { data, error } = await supabase.functions.invoke('ai-helper', {
      body: payload,
    });

    if (error) {
      throw new Error(error.message || 'AI Helper is unavailable right now.');
    }

    // The Edge Function should return { reply: "..." }
    // Accept common response field names as a fallback
    const reply = data?.reply ?? data?.response ?? data?.text ?? null;

    if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
      throw new Error('The AI returned an empty response. Please try again.');
    }

    return reply.trim();
  } catch (err) {
    // Re-throw with a user-friendly message so the screen can display it inline
    throw new Error(
      err.message || 'Could not reach the AI helper. Check your connection and try again.',
    );
  }
}

/**
 * Builds a context payload from the current screen's navigation params and auth state.
 * Call this in the AIHelpScreen component before calling askAI().
 *
 * @param {object} user       - User row from AuthContext
 * @param {object} project    - Current project object (id, title, category)
 * @param {object} step       - Current step (optional: id, title)
 * @param {string} message    - The student's typed question
 * @returns {object}          - Ready-to-send payload
 */
export function buildAIPayload(user, project, step, message) {
  return {
    project_id:   project?.id        ?? null,
    step_id:      step?.id           ?? null,
    step_title:   step?.title        ?? null,
    learner_name: user?.name         ?? 'Learner',
    grade_level:  user?.role         ?? 'junior_learner',
    message:      message.trim(),
  };
}
