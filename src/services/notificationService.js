// src/services/notificationService.js
// DS9 — Notifications (DFD Section 4.3 P3.5, Section 4.4 P4.4)
//
// Fetches and manages in-app notifications.
// Notifications are created by progressService (xp_reward) and
// achievementService (badge_unlock) — this service only handles reads and marks.
// Includes a Supabase Realtime subscription for live bell-icon badge count.

import { supabase } from './supabaseClient';

// ─── READS ───────────────────────────────────────────────────────────────────

/**
 * Fetches the latest notifications for a user.
 * DFD DS9 read — NotificationsScreen.
 *
 * @param {string} userId
 * @param {number} limit  - Max rows to return (default 50)
 */
export async function getNotifications(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load notifications.');
  }
}

/**
 * Returns the count of unread notifications for a user.
 * Used for the bell icon badge on the home header.
 */
export async function getUnreadCount(userId) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    return 0; // Non-fatal — return 0 rather than crashing the header
  }
}

// ─── WRITES ──────────────────────────────────────────────────────────────────

/**
 * Marks a single notification as read.
 * Called when the user taps a notification row.
 */
export async function markAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;
  } catch (err) {
    throw new Error(err.message || 'Could not mark notification as read.');
  }
}

/**
 * Marks all unread notifications for a user as read.
 * Called when the user opens the NotificationsScreen.
 */
export async function markAllAsRead(userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  } catch (err) {
    throw new Error(err.message || 'Could not mark notifications as read.');
  }
}

/**
 * Creates a notification directly from the client.
 * Prefer using progressService and achievementService which create notifications
 * as part of their flows — use this only for standalone notifications.
 */
export async function createNotification(userId, type, title, body = null) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, type, title, body })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not create notification.');
  }
}

// ─── REALTIME ────────────────────────────────────────────────────────────────

/**
 * Subscribes to new notifications for a user via Supabase Realtime.
 * Used to update the bell-icon badge count in real time without polling.
 *
 * DFD Architecture: Realtime Subscriptions — "Notification badge count updates
 * when a new notification is inserted."
 *
 * @param {string}   userId   - UUID of the current user
 * @param {Function} onNew    - Callback receives the new notification row
 * @returns {object} Supabase Realtime channel — call .unsubscribe() on unmount
 *
 * Usage in component:
 *   const channel = subscribeToNotifications(user.id, (notif) => {
 *     setBadgeCount(prev => prev + 1);
 *   });
 *   return () => channel.unsubscribe();
 */
export function subscribeToNotifications(userId, onNew) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onNew(payload.new),
    )
    .subscribe();
}
