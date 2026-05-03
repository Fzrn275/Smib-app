// src/services/streakService.js
// DS8 — Streaks (DFD Section 4.3, P3.4)
//
// Reads and updates the daily streak record for a student.
// One call to updateStreak() per active day is sufficient.
// The caller is responsible for calling this after completeStep().

import { supabase } from './supabaseClient';

// ─── READS ───────────────────────────────────────────────────────────────────

/**
 * Returns the streak row for a student, or null if none exists yet.
 * DFD DS8 read — HomeScreen header, ProgressScreen, P6.2.
 */
export async function getStreak(studentId) {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not load streak.');
  }
}

// ─── WRITE ───────────────────────────────────────────────────────────────────

/**
 * Creates the first streak row for a brand-new student.
 * Called during or after registration when the student first opens the app.
 */
export async function initStreak(studentId) {
  try {
    const today = _today();
    const { data, error } = await supabase
      .from('streaks')
      .insert({
        student_id:       studentId,
        current_streak:   1,
        longest_streak:   1,
        last_active_date: today,
      })
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Could not initialise streak.');
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not initialise streak.');
  }
}

/**
 * Updates the student's streak for today's activity.
 *
 * Logic (DFD P3.4):
 *   - last_active_date === today  → already counted, return unchanged
 *   - last_active_date === yesterday → increment current_streak
 *   - otherwise                  → reset to 1 (streak broken)
 *
 * Also fires a streak_reminder notification when the streak is broken.
 *
 * @param {string} studentId
 * @returns {object} Updated streak row { current_streak, longest_streak, last_active_date }
 */
export async function updateStreak(studentId) {
  try {
    const today     = _today();
    const yesterday = _yesterday();

    const streak = await getStreak(studentId);
    if (!streak) return await initStreak(studentId);

    const lastActive = streak.last_active_date;

    // Already counted today — nothing to do
    if (lastActive === today) return streak;

    const wasContinuous = lastActive === yesterday;
    const newCurrent    = wasContinuous ? streak.current_streak + 1 : 1;
    const newLongest    = Math.max(newCurrent, streak.longest_streak);

    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_streak:   newCurrent,
        longest_streak:   newLongest,
        last_active_date: today,
        updated_at:       new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Could not update streak.');

    // Notify the student if their streak was broken
    if (!wasContinuous && streak.current_streak > 1) {
      try {
        await supabase.from('notifications').insert({
          user_id: studentId,
          type:    'streak_reminder',
          title:   'Streak Reset',
          body:    `Your ${streak.current_streak}-day streak ended. You just started a new one — keep going!`,
        });
      } catch {
        // Non-fatal
      }
    }

    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not update streak.');
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function _today() {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

function _yesterday() {
  return new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
}
