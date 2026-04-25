// src/context/AuthContext.js
// Global auth state for the S-MIB app.
// Wraps the root navigator so every screen can access the current user
// without prop-drilling. Handles session restore on app start.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

// ─── CONTEXT ────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── PROVIDER ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [session,  setSession]  = useState(null);
  const [user,     setUser]     = useState(null);  // full row from `users` table
  const [role,     setRole]     = useState(null);  // shorthand for user.role
  const [loading,  setLoading]  = useState(true);  // true until first session check completes

  // ----------------------------------------------------------
  // On mount: restore existing session and subscribe to auth changes.
  // Supabase persists the JWT in AsyncStorage automatically.
  // ----------------------------------------------------------
  useEffect(() => {
    // Restore session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ----------------------------------------------------------
  // Fetches the full user profile row from the `users` table.
  // Called after every successful sign-in.
  // ----------------------------------------------------------
  async function fetchUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser(data);
      setRole(data.role);
    } catch (err) {
      console.error('AuthContext: failed to fetch user profile', err.message);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------
  // Called by screens after a successful profile update
  // so the global user object stays in sync without re-fetching.
  // ----------------------------------------------------------
  function updateUser(updatedFields) {
    setUser(prev => ({ ...prev, ...updatedFields }));
  }

  // ─── CONTEXT VALUE ──────────────────────────────────────────────────────

  const value = {
    session,      // Supabase session object (contains JWT)
    user,         // Full `users` table row
    role,         // Shorthand: user.role
    loading,      // True while session is being restored
    updateUser,   // Update local user state after profile edits
    fetchUserProfile, // Re-fetch from DB (e.g. after XP changes)

    // Convenience role checks used by RootNavigator and screens
    isLearner:  role === 'junior_learner' || role === 'senior_learner',
    isCreator:  role === 'creator' || role === 'verified_creator' || role === 'content_mentor',
    isParent:   role === 'parent',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── HOOK ───────────────────────────────────────────────────────────────────
// Usage: const { user, role, loading } = useAuth();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}

export default AuthContext;
