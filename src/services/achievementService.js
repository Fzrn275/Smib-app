// src/services/achievementService.js
// P4 — Award Achievements (DFD Section 4.4)
//
// Checks trigger conditions and creates achievement + certificate rows.
// Called by progressService after a step completion if the project is done.
// Also used directly by AchievementsScreen and CertificateScreen for display.

import { supabase } from './supabaseClient';

// ─── READS ───────────────────────────────────────────────────────────────────

/**
 * Fetches all achievements (badges + certificates) for a student.
 * DFD DS6 read — AchievementsScreen.
 */
export async function getAchievements(studentId) {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('student_id', studentId)
      .order('date_awarded', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load achievements.');
  }
}

/**
 * Fetches all certificates for a student, joined with the parent achievement.
 * DFD DS7 read — AchievementsScreen certificate section + CertificateScreen.
 */
export async function getCertificates(studentId) {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        achievements ( title, description, date_awarded ),
        projects ( title, category )
      `)
      .eq('student_id', studentId)
      .order('issued_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load certificates.');
  }
}

/**
 * Fetches a single certificate by its verification code.
 * Used for external verification links and the CertificateScreen share/copy flow.
 */
export async function getCertificateByCode(verificationCode) {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        achievements ( title, description, date_awarded ),
        users ( name, school_name, grade_level ),
        projects ( title, category )
      `)
      .eq('verification_code', verificationCode)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Certificate not found.');
    return data;
  } catch (err) {
    throw new Error(err.message || 'Certificate not found.');
  }
}

/**
 * Combined fetch for the parent view — achievements + certificates together.
 * DFD P6.4 Fetch Full Child Progress → DS6 + DS7.
 */
export async function getChildAchievements(studentId) {
  const [achievements, certificates] = await Promise.all([
    getAchievements(studentId),
    getCertificates(studentId),
  ]);
  return { achievements, certificates };
}

// ─── TRIGGER CHECK AND AWARD ─────────────────────────────────────────────────

/**
 * Evaluates all trigger conditions and awards any matching achievements.
 * Called from progressService after a step completion.
 *
 * DFD P4.1 → P4.2 → P4.3 → P4.4
 *
 * @param {string} studentId
 * @param {string} projectId         - The project just updated
 * @param {object} context
 * @param {boolean} context.isComplete             - Did this step finish the project?
 * @param {number}  context.completedProjectCount  - Total projects completed so far (including this one)
 * @param {number}  context.streakCount            - Current streak after today's update
 * @param {string}  context.category               - Category of the completed project
 *
 * @returns {Array} Newly awarded achievement rows
 */
export async function checkAndAwardAchievements(studentId, projectId, context = {}) {
  const {
    isComplete            = false,
    completedProjectCount = 0,
    streakCount           = 0,
    category              = null,
  } = context;

  const awarded = [];

  // ── first_project — first enrolment ever ──────────────────────────────────
  // completedProjectCount is 0 at the moment of the very first enrolment
  // (checked in projectService.enrolInProject caller, passed in as context)
  if (context.isFirstEnrolment) {
    const ach = await _createAchievementIfNew(studentId, {
      title:       'First Steps!',
      description: 'You enrolled in your first STEM project.',
      type:        'badge',
      triggerType: 'first_project',
    });
    if (ach) awarded.push(ach);
  }

  // ── first_completion — first project fully finished ───────────────────────
  if (isComplete && completedProjectCount === 1) {
    const ach = await _createAchievementIfNew(studentId, {
      title:       'Project Complete!',
      description: 'You completed your very first STEM project.',
      type:        'certificate',
      triggerType: 'first_completion',
    });
    if (ach) {
      awarded.push(ach);
      await _createCertificate(studentId, ach.id, {
        certType:  'project_completion',
        projectId,
        issuedBy:  'S-MIB Platform',
      });
    }
  }

  // ── project_completion — any subsequent project completed ─────────────────
  if (isComplete && completedProjectCount > 1) {
    const ach = await _createAchievementUnique(studentId, projectId, {
      title:       'STEM Builder',
      description: 'You completed another STEM project — keep building!',
      type:        'certificate',
      triggerType: 'first_completion', // re-uses the same trigger bucket intentionally
    });
    if (ach) {
      awarded.push(ach);
      await _createCertificate(studentId, ach.id, {
        certType:  'project_completion',
        projectId,
        issuedBy:  'S-MIB Platform',
      });
    }
  }

  // ── streak_7 — 7-day streak ───────────────────────────────────────────────
  if (streakCount === 7) {
    const ach = await _createAchievementIfNew(studentId, {
      title:       'Week Warrior',
      description: 'You kept your learning streak alive for 7 days!',
      type:        'badge',
      triggerType: 'streak_7',
    });
    if (ach) awarded.push(ach);
  }

  // ── streak_30 — 30-day streak ─────────────────────────────────────────────
  if (streakCount === 30) {
    const ach = await _createAchievementIfNew(studentId, {
      title:       'Monthly Maker',
      description: '30 days of consecutive STEM learning — incredible!',
      type:        'certificate',
      triggerType: 'streak_30',
    });
    if (ach) {
      awarded.push(ach);
      await _createCertificate(studentId, ach.id, {
        certType: 'streak',
        issuedBy: 'S-MIB Platform',
      });
    }
  }

  // ── Notify for each award ─────────────────────────────────────────────────
  for (const ach of awarded) {
    try {
      await supabase.from('notifications').insert({
        user_id: studentId,
        type:    'badge_unlock',
        title:   `${ach.type === 'certificate' ? '🏆 Certificate' : '🎖️ Badge'} Unlocked: ${ach.title}`,
        body:    ach.description,
      });
    } catch {
      // Non-fatal
    }
  }

  return awarded;
}

// ─── INTERNAL HELPERS ────────────────────────────────────────────────────────

/**
 * Inserts an achievement only if no matching trigger_type exists for this student.
 * Prevents duplicate badges for the same trigger condition.
 */
async function _createAchievementIfNew(studentId, { title, description, type, triggerType }) {
  // Check for existing award of the same trigger
  const { data: existing } = await supabase
    .from('achievements')
    .select('id')
    .eq('student_id', studentId)
    .eq('trigger_type', triggerType)
    .maybeSingle();

  if (existing) return null; // Already awarded

  const { data, error } = await supabase
    .from('achievements')
    .insert({
      student_id:   studentId,
      title,
      description,
      type,
      trigger_type: triggerType,
    })
    .select()
    .single();

  if (error) throw new Error(error.message || 'Could not create achievement.');
  return data;
}

/**
 * Inserts an achievement that is unique per project (not per trigger type).
 * Used for project_completion which can fire multiple times (one per project).
 */
async function _createAchievementUnique(studentId, projectId, { title, description, type, triggerType }) {
  const { data, error } = await supabase
    .from('achievements')
    .insert({
      student_id:   studentId,
      title,
      description,
      type,
      trigger_type: triggerType,
    })
    .select()
    .single();

  if (error) throw new Error(error.message || 'Could not create achievement.');
  return data;
}

/**
 * Inserts a certificate linked to the given achievement.
 */
async function _createCertificate(studentId, achievementId, { certType, projectId = null, issuedBy }) {
  const { data, error } = await supabase
    .from('certificates')
    .insert({
      achievement_id: achievementId,
      student_id:     studentId,
      cert_type:      certType,
      project_id:     projectId,
      issued_by:      issuedBy,
      // verification_code auto-generated by DB default: gen_random_uuid()
    })
    .select()
    .single();

  if (error) throw new Error(error.message || 'Could not create certificate.');
  return data;
}
