// src/services/progressService.js
// P3 — Track Progress (DFD Section 4.3)
//
// Central service for recording step completions. One call to completeStep()
// does everything the DFD specifies:
//   1. INSERT into step_submissions
//   2. UPDATE progress (completed_steps, current_step, progress_pct)
//   3. Award 50 XP — UPDATE users.xp and users.level
//   4. INSERT xp_reward notification
//
// Offline queue: step completions are stored in AsyncStorage when the
// device is offline and replayed (synced) when connectivity returns.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

const XP_PER_STEP       = 50;
const OFFLINE_QUEUE_KEY = 'smib_offline_queue';

// ─── OFFLINE QUEUE HELPERS ───────────────────────────────────────────────────

async function readQueue() {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue) {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Adds a step completion payload to the offline queue.
 * Called when a network error is detected during completeStep().
 */
export async function queueStepCompletion(payload) {
  const queue = await readQueue();
  queue.push({ ...payload, queuedAt: Date.now() });
  await writeQueue(queue);
}

/**
 * Returns the number of pending offline step completions.
 * Displayed as an indicator in the app when the device reconnects.
 */
export async function getOfflineQueueLength() {
  const queue = await readQueue();
  return queue.length;
}

/**
 * Replays all queued step completions in order.
 * Call this when NetInfo reports the connection is restored.
 * Failed items remain in the queue for the next retry.
 */
export async function syncOfflineQueue() {
  const queue = await readQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  const remaining = [];
  let synced = 0;

  for (const item of queue) {
    try {
      await completeStep(item);
      synced++;
    } catch {
      remaining.push(item);
    }
  }

  await writeQueue(remaining);
  return { synced, failed: remaining.length };
}

// ─── PROGRESS READS ──────────────────────────────────────────────────────────

/**
 * Fetches the progress row for a specific student/project pair.
 * Returns null if the student has not enrolled.
 */
export async function getProgress(studentId, projectId) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('project_id', projectId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not load progress.');
  }
}

/**
 * Fetches all in-progress projects for a student.
 * Joined with project metadata for display on HomeScreen.
 */
export async function getActiveProjects(studentId) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select(`
        id, progress_pct, current_step, completed_steps, enrolled_at, last_updated,
        projects ( id, title, category, difficulty, type, cover_image_url, estimated_duration )
      `)
      .eq('student_id', studentId)
      .eq('is_completed', false)
      .order('last_updated', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load active projects.');
  }
}

/**
 * Fetches all completed projects for a student.
 * Used on ProgressScreen.
 */
export async function getCompletedProjects(studentId) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select(`
        id, progress_pct, enrolled_at, last_updated,
        projects ( id, title, category, difficulty, type, cover_image_url )
      `)
      .eq('student_id', studentId)
      .eq('is_completed', true)
      .order('last_updated', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load completed projects.');
  }
}

/**
 * Returns counts of active and completed projects for a student.
 * Used on HomeScreen stat cards.
 */
export async function getProgressSummary(studentId) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('is_completed')
      .eq('student_id', studentId);
    if (error) throw error;

    const rows      = data ?? [];
    const active    = rows.filter(r => !r.is_completed).length;
    const completed = rows.filter(r => r.is_completed).length;
    return { active, completed, total: rows.length };
  } catch (err) {
    throw new Error(err.message || 'Could not load progress summary.');
  }
}

// ─── STEP COMPLETION — CORE FUNCTION ─────────────────────────────────────────

/**
 * Records a completed step. This is the central write function for P3.
 *
 * DFD flow executed:
 *   P3.1 → INSERT step_submissions
 *   P3.2 → UPDATE progress
 *   P3.3 → UPDATE users (XP + level)
 *   P3.5 → INSERT xp_reward notification
 *
 * NOTE: Streak (P3.4) is handled by streakService.updateStreak() —
 * call it separately after completeStep() resolves to keep concerns separated.
 *
 * @param {object} params
 * @param {string} params.studentId        - UUID of the student
 * @param {string} params.stepId           - UUID of the step being completed
 * @param {string} params.projectId        - UUID of the project
 * @param {number} params.stepNumber       - Step number (1-based)
 * @param {number} params.totalSteps       - Total steps in the project
 * @param {string} params.photoUrl         - Optional Supabase Storage URL
 * @param {string} params.caption          - Optional student note
 * @param {Array}  params.currentCompleted - Existing completed_steps array from DB
 * @param {number} params.currentXp        - Current users.xp value
 *
 * @returns {{ progressPct, isComplete, newXp, newLevel, completedSteps }}
 */
export async function completeStep({
  studentId,
  stepId,
  projectId,
  stepNumber,
  totalSteps,
  photoUrl         = null,
  caption          = null,
  currentCompleted = [],
  currentXp        = 0,
}) {
  // Guard: don't double-award XP if step was already completed
  if (currentCompleted.includes(stepNumber)) {
    const progressPct = parseFloat(((currentCompleted.length / totalSteps) * 100).toFixed(2));
    return {
      progressPct,
      isComplete:     currentCompleted.length >= totalSteps,
      newXp:          currentXp,
      newLevel:       Math.min(Math.floor(currentXp / 1000) + 1, 10),
      completedSteps: currentCompleted,
      alreadyDone:    true,
    };
  }

  // ── P3.1: Insert step submission ──────────────────────────────────────────
  const { error: subError } = await supabase
    .from('step_submissions')
    .insert({
      student_id:  studentId,
      step_id:     stepId,
      project_id:  projectId,
      photo_url:   photoUrl,
      caption,
      xp_awarded:  XP_PER_STEP,
    });
  if (subError) throw new Error(subError.message || 'Could not record step submission.');

  // ── P3.2: Update progress row ────────────────────────────────────────────
  const completedSteps = [...currentCompleted, stepNumber];
  const progressPct    = parseFloat(((completedSteps.length / totalSteps) * 100).toFixed(2));
  const isComplete     = completedSteps.length >= totalSteps;

  const { error: progError } = await supabase
    .from('progress')
    .update({
      completed_steps: completedSteps,
      current_step:    stepNumber + 1,
      progress_pct:    progressPct,
      is_completed:    isComplete,
      last_updated:    new Date().toISOString(),
    })
    .eq('student_id', studentId)
    .eq('project_id', projectId);
  if (progError) throw new Error(progError.message || 'Could not update progress.');

  // ── P3.3: Award XP ───────────────────────────────────────────────────────
  const newXp    = currentXp + XP_PER_STEP;
  const newLevel = Math.min(Math.floor(newXp / 1000) + 1, 10);

  const { error: xpError } = await supabase
    .from('users')
    .update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
    .eq('id', studentId);
  if (xpError) throw new Error(xpError.message || 'Could not award XP.');

  // ── P3.5: Create XP notification ─────────────────────────────────────────
  // Non-fatal — notification failure should not block the step completion UX
  try {
    await supabase.from('notifications').insert({
      user_id: studentId,
      type:    'xp_reward',
      title:   `+${XP_PER_STEP} XP!`,
      body:    `You completed step ${stepNumber}. Keep going!`,
    });
  } catch {
    // Silently fail — XP was already awarded
  }

  return { progressPct, isComplete, newXp, newLevel, completedSteps };
}

// ─── PARENT / CREATOR READS ──────────────────────────────────────────────────

/**
 * Fetches progress rows for a given child student (used by ParentDashboard).
 * DFD P6.2 Fetch Child Data → DS4.
 */
export async function getChildProgress(studentId) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select(`
        id, progress_pct, is_completed, current_step, enrolled_at,
        projects ( id, title, category, difficulty )
      `)
      .eq('student_id', studentId)
      .order('last_updated', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load child progress.');
  }
}

/**
 * Returns recent step submissions for the parent activity feed.
 * DFD P6.5 Fetch Activity Feed → DS5.
 */
export async function getActivityFeed(studentId, limit = 30) {
  try {
    const { data, error } = await supabase
      .from('step_submissions')
      .select(`
        id, xp_awarded, completed_at, caption, photo_url,
        steps ( title, step_number ),
        projects ( title, category )
      `)
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load activity feed.');
  }
}

/**
 * Returns per-step completion stats for a project (creator analytics).
 * Shows how many students completed each step — useful for funnel analysis.
 */
export async function getStepCompletionStats(projectId) {
  try {
    const { data, error } = await supabase
      .from('step_submissions')
      .select('step_id, steps ( step_number, title )')
      .eq('project_id', projectId);
    if (error) throw error;

    // Count completions per step
    const counts = {};
    for (const row of data ?? []) {
      const key = row.step_id;
      counts[key] = (counts[key] || { count: 0, title: row.steps?.title, stepNumber: row.steps?.step_number });
      counts[key].count++;
    }
    return Object.values(counts).sort((a, b) => a.stepNumber - b.stepNumber);
  } catch (err) {
    throw new Error(err.message || 'Could not load step stats.');
  }
}
