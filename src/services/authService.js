// src/services/authService.js
// P1 — Authenticate User (DFD Section 4.1)
// Handles all Supabase Auth operations: login, register, logout, session.
// After auth, fetches the full profile row from the `users` table.

import { supabase } from './supabaseClient';

// ─── SIGN IN ─────────────────────────────────────────────────────────────────

/**
 * Signs in with email and password.
 * Returns { session, user } on success; throws on failure.
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data; // { session, user }
  } catch (err) {
    throw new Error(err.message || 'Sign in failed. Please check your email and password.');
  }
}

// ─── REGISTER ────────────────────────────────────────────────────────────────

/**
 * Registers a new user through two steps:
 *   1. Create Supabase Auth account → get UUID
 *   2. Insert public profile row into `users` table
 *   3. If creator role, also insert into `creators` table
 *
 * Registration data flows (DFD P1.1 → P1.2):
 *   { name, email, password, role, gradeLevel?, schoolName?, organisation?, focusArea? }
 */
export async function signUp({
  name,
  email,
  password,
  role,
  gradeLevel    = null,
  schoolName    = null,
  organisation  = null,
  focusArea     = null,
}) {
  try {
    // Step 1: Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;

    const userId = authData.user?.id;
    if (!userId) throw new Error('Registration failed — no user ID returned.');

    // Step 2: Insert into public users table (DS1)
    const { error: userError } = await supabase.from('users').insert({
      id:            userId,
      name:          name.trim(),
      email:         email.toLowerCase().trim(),
      password_hash: 'SUPABASE_MANAGED', // Auth password handled by Supabase Auth
      role,
      grade_level:   gradeLevel  ?? null,
      school_name:   schoolName  ?? null,
      xp:            0,
      level:         1,
    });
    if (userError) throw userError;

    // Step 3: If creator role, insert into creators table (DS11)
    if (['creator', 'verified_creator', 'content_mentor'].includes(role)) {
      const { error: creatorError } = await supabase.from('creators').insert({
        user_id:      userId,
        creator_type: role,
        organisation: organisation ?? null,
        focus_area:   focusArea    ?? null,
      });
      if (creatorError) throw creatorError;
    }

    return authData;
  } catch (err) {
    throw new Error(err.message || 'Registration failed. Please try again.');
  }
}

// ─── SIGN OUT ────────────────────────────────────────────────────────────────

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    throw new Error(err.message || 'Sign out failed.');
  }
}

// ─── SESSION ─────────────────────────────────────────────────────────────────

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (err) {
    throw new Error(err.message || 'Could not retrieve session.');
  }
}

// ─── PASSWORD RESET ───────────────────────────────────────────────────────────

/**
 * Sends a password reset email to the given address.
 * The reset link redirects back to the app via deep link.
 */
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
    );
    if (error) throw error;
  } catch (err) {
    throw new Error(err.message || 'Could not send reset email. Please try again.');
  }
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

/**
 * Fetches the full users table row for the given UUID.
 * Returns: { id, name, email, role, xp, level, school_name, grade_level, avatar_url, ... }
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('User profile not found.');
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not load user profile.');
  }
}

/**
 * Updates mutable profile fields (name, school_name, grade_level, avatar_url).
 * Returns the updated row.
 */
export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not update profile.');
  }
}

/**
 * Fetches the leaderboard — top students by XP.
 * scope: 'global' | 'sarawak' | 'school'
 * For 'school', pass schoolName to filter.
 */
export async function getLeaderboard(scope = 'global', schoolName = null, limit = 50) {
  try {
    let query = supabase
      .from('users')
      .select('id, name, xp, level, school_name, avatar_url')
      .in('role', ['junior_learner', 'senior_learner'])
      .order('xp', { ascending: false })
      .limit(limit);

    if (scope === 'school' && schoolName) {
      query = query.eq('school_name', schoolName);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not load leaderboard.');
  }
}
