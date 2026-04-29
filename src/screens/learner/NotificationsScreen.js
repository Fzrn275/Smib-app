// src/screens/learner/NotificationsScreen.js
// s-notif — In-app notifications grouped by date (Today / Yesterday / Earlier).
// Marks all as read on mount. Tapping a row marks it individually as read.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }              from '../../context/AuthContext';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, SPRING,
} from '../../theme';
import {
  getNotifications, markAsRead, markAllAsRead,
} from '../../services/notificationService';

// ─── NOTIFICATION TYPE CONFIG ─────────────────────────────────────────────────

const NOTIF_CONFIG = {
  xp_reward:         { icon: 'flash',              color: COLORS.hornbillGold,   bg: COLORS.goldBgStrong },
  badge_unlock:      { icon: 'trophy',             color: '#FCD34D',             bg: 'rgba(253,224,71,0.12)' },
  leaderboard_change:{ icon: 'podium',             color: COLORS.aiCyan,         bg: COLORS.cyanBgMid },
  streak_reminder:   { icon: 'flame',              color: COLORS.sarawakRed,     bg: 'rgba(234,88,12,0.12)' },
  project_completed: { icon: 'checkmark-circle',   color: COLORS.success,        bg: COLORS.successBgMid },
  default:           { icon: 'notifications',      color: COLORS.textCaption,    bg: 'rgba(255,255,255,0.08)' },
};

function notifStyle(type) {
  return NOTIF_CONFIG[type] ?? NOTIF_CONFIG.default;
}

// ─── DATE GROUPING ────────────────────────────────────────────────────────────

function dateGroupLabel(dateStr) {
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const d = new Date(dateStr);
  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'long' });
}

function groupByDate(notifications) {
  const groups = [];
  let currentLabel = null;
  let currentItems = [];

  for (const n of notifications) {
    const label = dateGroupLabel(n.created_at);
    if (label !== currentLabel) {
      if (currentItems.length > 0) groups.push({ label: currentLabel, items: currentItems });
      currentLabel = label;
      currentItems = [n];
    } else {
      currentItems.push(n);
    }
  }
  if (currentItems.length > 0) groups.push({ label: currentLabel, items: currentItems });
  return groups;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-MY', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// ─── NOTIFICATION ROW ─────────────────────────────────────────────────────────

function NotifRow({ notif, onRead }) {
  const [read, setRead] = useState(notif.is_read);
  const cfg   = notifStyle(notif.type);
  const fadeA = useRef(new Animated.Value(0)).current;
  const slideA = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideA, { toValue: 0, tension: 200, friction: 22, useNativeDriver: true }),
      Animated.timing(fadeA,  { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handlePress() {
    if (!read) {
      setRead(true);
      try { await markAsRead(notif.id); } catch { /* Non-fatal */ }
      onRead?.(notif.id);
    }
  }

  return (
    <Animated.View style={[{ opacity: fadeA, transform: [{ translateY: slideA }] }]}>
      <TouchableOpacity onPress={handlePress} style={rowStyles.row} activeOpacity={0.85}>
        {/* Icon */}
        <View style={[rowStyles.iconBox, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={20} color={cfg.color} />
        </View>

        {/* Content */}
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={rowStyles.title} numberOfLines={2}>{notif.title ?? 'Notification'}</Text>
          {notif.body ? (
            <Text style={rowStyles.body} numberOfLines={2}>{notif.body}</Text>
          ) : null}
          <Text style={rowStyles.time}>{formatTime(notif.created_at)}</Text>
        </View>

        {/* Unread dot */}
        {!read && <View style={rowStyles.unreadDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    ...GLASS.standard,
    flexDirection: 'row',
    alignItems:    'flex-start',
    borderRadius:  RADIUS.md,
    padding:       SPACING.md,
    marginBottom:  SPACING.sm,
    gap:           SPACING.md,
  },
  iconBox: {
    width:          42,
    height:         42,
    borderRadius:   RADIUS.md,
    justifyContent: 'center',
    alignItems:     'center',
    flexShrink:     0,
  },
  title:    { fontFamily: FONTS.body600, fontSize: 14, color: COLORS.textPrimary },
  body:     { fontFamily: FONTS.body400, fontSize: 12, color: COLORS.textCaption },
  time:     { fontFamily: FONTS.body400, fontSize: 11, color: COLORS.textLabel },
  unreadDot: {
    width:           9,
    height:          9,
    borderRadius:    RADIUS.pill,
    backgroundColor: COLORS.hornbillGold,
    marginTop:       4,
    flexShrink:      0,
  },
});

// ─── SCREEN ──────────────────────────────────────────────────────────────────

export default function NotificationsScreen({ navigation }) {
  const { user } = useAuth();
  const insets   = useSafeAreaInsets();

  const [groups,  setGroups]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread,  setUnread]  = useState(0);

  const fadeA = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      // Mark all read server-side as soon as screen opens (FR-LRN-15)
      await markAllAsRead(user.id);
      const notifs = await getNotifications(user.id);
      const u = notifs.filter(n => !n.is_read).length; // pre-markAllAsRead, should be 0
      setUnread(u);
      setGroups(groupByDate(notifs));
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
      Animated.spring(fadeA, {
        toValue: 1, tension: SPRING.default.tension, friction: SPRING.default.friction, useNativeDriver: true,
      }).start();
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  function handleRead(notifId) {
    setUnread(prev => Math.max(0, prev - 1));
  }

  const totalCount = groups.reduce((acc, g) => acc + g.items.length, 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.hornbillGold} />
      </View>
    );
  }

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeA }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom:     SPACING.xxl,
          paddingTop:        insets.top + SPACING.sm,
          paddingHorizontal: SPACING.lg,
          flexGrow:          1,
        }}
      >
        {/* ── HEADER ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          {totalCount > 0 && (
            <Text style={[TYPE.caption, { marginLeft: 'auto' }]}>{totalCount} total</Text>
          )}
        </View>

        {/* ── GROUPED LIST ───────────────────────────────────────── */}
        {totalCount === 0 ? (
          <View style={[GLASS.standard, styles.emptyCard]}>
            <Text style={{ fontSize: 40 }}>🔔</Text>
            <Text style={[TYPE.body, { textAlign: 'center' }]}>
              No notifications yet.{'\n'}Complete steps to earn XP and badges!
            </Text>
          </View>
        ) : (
          groups.map(group => (
            <View key={group.label}>
              <Text style={styles.dateLabel}>{group.label}</Text>
              {group.items.map(notif => (
                <NotifRow key={notif.id} notif={notif} onRead={handleRead} />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </Animated.View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.md,
    marginBottom:  SPACING.xl,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius:    RADIUS.pill,
    padding:         SPACING.sm,
  },
  title: { fontFamily: FONTS.heading900, fontSize: 24, color: COLORS.textPrimary },

  dateLabel: {
    fontFamily:   FONTS.body700,
    fontSize:     11,
    color:        COLORS.textLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom:  SPACING.sm,
    marginTop:     SPACING.md,
  },
  emptyCard: {
    borderRadius: RADIUS.xl,
    padding:      SPACING.xxl,
    alignItems:   'center',
    gap:          SPACING.lg,
    marginTop:    SPACING.xxl,
  },
});
