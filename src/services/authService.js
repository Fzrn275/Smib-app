// src/services/authService.js
// P1 — Authenticate User (DFD Section 4.1)
// Handles all Supabase Auth operations: login, register, logout, session.
// After auth, fetches the full profile row from the `users` table.

import * as WebBrowser from 'expo-web-browser';
import * as Linking     from 'expo-linking';
import { supabase }     from './supabaseClient';

// Required for OAuth redirect to return control to the app on Android
WebBrowser.maybeCompleteAuthSession();

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
      options: { data: { name: name.trim(), role } },
    });
    if (authError) throw authError;

    // When email confirmation is ON, Supabase silently "succeeds" for an
    // existing email but returns user.identities = []. Surface this clearly.
    if (authData.user?.identities?.length === 0) {
      throw new Error('This email is already registered. Please sign in instead.');
    }

    const userId = authData.user?.id;
    if (!userId) throw new Error('Registration failed — no user ID returned.');

    // Steps 2 & 3 require a live session so auth.uid() is set for RLS checks.
    // authData.session is null when Supabase email confirmation is enabled.
    // In that case the DB trigger already created the basic users row — return early.
    if (!authData.session) return authData;

    // Step 2: Upsert into public users table (DS1).
    // Upsert because the DB trigger may have already created the basic row.
    const { error: userError } = await supabase.from('users').upsert({
      id:            userId,
      name:          name.trim(),
      email:         email.toLowerCase().trim(),
      password_hash: 'SUPABASE_MANAGED',
      role,
      grade_level:   gradeLevel  ?? null,
      school_name:   schoolName  ?? null,
      xp:            0,
      level:         1,
    }, { onConflict: 'id' });
    if (userError) throw userError;

    // Step 3: If creator role, insert into creators table (DS11)
    if (['creator', 'verified_creator'].includes(role)) {
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
      { emailRedirectTo: 'smib://auth/reset-password' },
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
 * Soft-deletes the current user's account by setting deleted_at,
 * then signs them out.
 */
export async function deleteAccount() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No active session.');
    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) throw error;
    await supabase.auth.signOut();
  } catch (err) {
    throw new Error(err.message || 'Could not delete account.');
  }
}

/**
 * Returns the full user rows for all children linked to a parent.
 * Used by ParentDashboardScreen and ActivityFeedScreen.
 * Returns an empty array when no links exist.
 */
export async function getLinkedChildren(parentId) {
  try {
    const { data: links, error: linksErr } = await supabase
      .from('parent_student_links')
      .select('student_id')
      .eq('parent_id', parentId);
    if (linksErr) throw new Error('Could not load children links.');

    if (!links || links.length === 0) return [];

    const ids = links.map(l => l.student_id);
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('*')
      .in('id', ids);
    if (usersErr) throw new Error('Could not load child profiles.');
    return users ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load linked children.');
  }
}

// ─── DEEP LINK / EMAIL CONFIRMATION ──────────────────────────────────────────

/**
 * Handles the smib:// deep link that Supabase redirects to after:
 *   - Email confirmation (signup)
 *   - Password reset
 *   - Google OAuth callback
 *
 * Supports both PKCE flow (URL has ?code=...) and implicit flow
 * (URL has #access_token=...&refresh_token=...).
 *
 * Call this from App.js Linking listeners, not from screens.
 */
export async function handleAuthURL(url) {
  if (!url) return;
  try {
    if (url.includes('code=')) {
      // PKCE flow — exchange code for session
      await supabase.auth.exchangeCodeForSession(url);
    } else {
      // Implicit flow — parse tokens from hash or query string
      const fragment = url.includes('#') ? url.split('#')[1] : '';
      const query    = url.includes('?') ? url.split('?')[1]?.split('#')[0] : '';
      const params   = new URLSearchParams(fragment || query);
      const access_token  = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
    }
  } catch {
    // Non-fatal — onAuthStateChange handles routing after session is set
  }
}

// ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────────

/**
 * Opens the Google sign-in flow using expo-web-browser.
 * On success, Supabase's onAuthStateChange fires and routes the user automatically.
 * Returns null if the user cancelled; throws on error.
 */
export async function signInWithGoogle() {
  try {
    const redirectUrl = Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:          redirectUrl,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (result.type === 'success') {
      const { data: session, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(result.url);
      if (sessionError) throw sessionError;
      return session;
    }
    return null; // user cancelled
  } catch (err) {
    throw new Error(err.message || 'Google sign-in failed. Please try again.');
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
