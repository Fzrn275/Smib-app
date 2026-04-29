// src/screens/parent/ChildProgressScreen.js
// Screen 27 — p-child — Child Progress View (read-only)

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';
import { Ionicons }          from '@expo/vector-icons';

import { getUserProfile }         from '../../services/authService';
import { getChildProgress }       from '../../services/progressService';
import { getChildAchievements }   from '../../services/achievementService';
import Achievement from '../../models/Achievement';
import {
  COLORS, FONTS, TYPE, SPACING, RADIUS, GRADIENTS,
  calculateLevel, calculateXpInLevel, getRankTitle, XP_PER_LEVEL,
} from '../../theme';

export default function ChildProgressScreen({ navigation, route }) {
  const insets   = useSafeAreaInsets();
  const childId  = route?.params?.childId;
  const childName = route?.params?.childName ?? 'Child';

  const [child,       setChild]       = useState(null);
  const [progress,    setProgress]    = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  useEffect(() => {
    async function load() {
      if (!childId) return;
      try {
        const [profile, prog, { achievements: achs, certificates: certs }] = await Promise.all([
          getUserProfile(childId),
          getChildProgress(childId),
          getChildAchievements(childId),
        ]);
        setChild(profile);
        setProgress(prog);
        setAchievements(achs.map(a => new Achievement(a.id, a.student_id, a.title, a.type, a.trigger_type)));
        setCertificates(certs);
      } catch (err) {
        setError(err.message || 'Could not load child progress.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [childId]);

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.aiCyan} size="large" /></View>;
  if (error || !child) return (
    <View style={styles.center}>
      <Text style={TYPE.body}>{error || 'Child not found.'}</Text>
    </View>
  );

  const level       = calculateLevel(child.xp ?? 0);
  const xpInLevel   = calculateXpInLevel(child.xp ?? 0);
  const rankTitle   = getRankTitle(level);
  const xpPct       = xpInLevel / XP_PER_LEVEL;
  const initial     = (child.name ?? 'S').charAt(0).toUpperCase();

  const activeProjs    = progress.filter(p => !p.is_completed);
  const completedProjs = progress.filter(p => p.is_completed);
  const badges         = achievements.filter(a => a.type === 'badge');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={[TYPE.h2, { flex: 1, textAlign: 'center' }]}>{child.name}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Level card */}
        <View style={styles.levelCard}>
          <View style={styles.levelCardTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={TYPE.h2}>{child.name}</Text>
              <Text style={TYPE.caption}>{child.school_name ?? '—'} · {child.grade_level ?? '—'}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>Level {level} · {rankTitle}</Text>
              </View>
            </View>
          </View>

          {/* XP bar */}
          <View style={{ marginTop: SPACING.md }}>
            <View style={styles.xpBarRow}>
              <Text style={styles.xpText}>{xpInLevel} / {XP_PER_LEVEL} XP</Text>
              <Text style={styles.xpText}>Next level →</Text>
            </View>
            <View style={styles.xpBarBg}>
              <LinearGradient
                colors={['#B45309', '#F59E0B', '#FCD34D']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.xpBarFill, { width: `${Math.round(xpPct * 100)}%` }]}
              />
            </View>
          </View>
        </View>

        {/* Stat cards */}
        <View style={styles.statsRow}>
          {[
            { label: 'Active',     value: activeProjs.length,    color: COLORS.aiCyan },
            { label: 'Done',       value: completedProjs.length,  color: COLORS.hornbillGold },
            { label: 'Badges',     value: badges.length,          color: COLORS.success },
            { label: 'Certs',      value: certificates.length,    color: COLORS.purple },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { flex: 1 }]}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Current Goal — static placeholder */}
        <View style={styles.goalCard}>
          <Text style={[TYPE.h3, { marginBottom: SPACING.xs }]}>🎯 Current Goal</Text>
          <Text style={TYPE.body}>
            Keep completing projects to earn your next certificate!
          </Text>
        </View>

        {/* Active Projects (read-only) */}
        <View style={styles.section}>
          <Text style={[TYPE.h3, { marginBottom: SPACING.md }]}>Active Projects</Text>
          {activeProjs.length === 0 ? (
            <Text style={TYPE.caption}>No active projects.</Text>
          ) : (
            activeProjs.map(p => (
              <View key={p.id} style={styles.projRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[TYPE.h3, { fontSize: 13 }]} numberOfLines={1}>
                    {p.projects?.title ?? 'Untitled Project'}
                  </Text>
                  <Text style={TYPE.caption}>{p.projects?.category}</Text>
                </View>
                <View style={styles.progWrap}>
                  <View style={styles.progBg}>
                    <View style={[styles.progFill, { width: `${Math.round(p.progress_pct ?? 0)}%` }]} />
                  </View>
                  <Text style={styles.progPct}>{Math.round(p.progress_pct ?? 0)}%</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recently Completed */}
        {completedProjs.length > 0 && (
          <View style={styles.section}>
            <Text style={[TYPE.h3, { marginBottom: SPACING.md }]}>Recently Completed</Text>
            {completedProjs.slice(0, 5).map(p => (
              <View key={p.id} style={styles.completedRow}>
                <View style={styles.doneCheck}><Ionicons name="checkmark" size={12} color={COLORS.white} /></View>
                <Text style={[TYPE.body, { flex: 1, fontSize: 13 }]} numberOfLines={1}>
                  {p.projects?.title ?? 'Project'}
                </Text>
                <Text style={[TYPE.caption, { color: COLORS.success }]}>Done</Text>
              </View>
            ))}
          </View>
        )}

        {/* Earned Badges */}
        {badges.length > 0 && (
          <View style={styles.section}>
            <Text style={[TYPE.h3, { marginBottom: SPACING.md }]}>Earned Badges</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.xl }}>
              <View style={{ flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.xl }}>
                {badges.slice(0, 10).map(b => (
                  <View key={b.id} style={styles.badgeChip}>
                    <Text style={{ fontSize: 24 }}>🏅</Text>
                    <Text style={styles.badgeName} numberOfLines={1}>{b.title}</Text>
                  </View>
                ))}
                {badges.length > 10 && (
                  <View style={[styles.badgeChip, { justifyContent: 'center' }]}>
                    <Text style={TYPE.caption}>+{badges.length - 10} more</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Read-only notice */}
        <View style={styles.readonlyNote}>
          <Ionicons name="lock-closed-outline" size={12} color={COLORS.textCaption} />
          <Text style={[TYPE.caption, { flex: 1 }]}>Read-only view. Data updates automatically as your child learns.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll:  { paddingHorizontal: SPACING.xl },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:  { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  backBtn: {
    width: 36, height: 36, borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  levelCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.15)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.xl,
  },
  levelCardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 52, height: 52, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.success,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.heading900, fontSize: 22, color: COLORS.white },
  levelBadge: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  levelBadgeText: { fontFamily: FONTS.body600, fontSize: 10, color: COLORS.success },
  xpBarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  xpText: { fontFamily: FONTS.body400, fontSize: 11, color: COLORS.textCaption },
  xpBarBg: {
    height: 7, borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
  },
  xpBarFill: { height: '100%', borderRadius: RADIUS.pill },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.5)',
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.4)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center',
  },
  statValue: { fontFamily: FONTS.heading900, fontSize: 18 },
  statLabel: { fontFamily: FONTS.body400, fontSize: 9, color: COLORS.textCaption },
  goalCard: {
    backgroundColor: COLORS.tealBg,
    borderTopWidth: 1, borderTopColor: COLORS.tealBorder,
    borderLeftWidth: 1, borderLeftColor: 'rgba(14,116,144,0.2)',
    borderRightWidth: 1, borderRightColor: 'rgba(14,116,144,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(14,116,144,0.05)',
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.xl,
  },
  section: { marginBottom: SPACING.xl },
  projRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm,
  },
  progWrap:  { alignItems: 'flex-end', gap: 4 },
  progBg: {
    width: 70, height: 6, borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
  },
  progFill: {
    height: '100%', borderRadius: RADIUS.pill,
    backgroundColor: COLORS.success,
  },
  progPct: { fontFamily: FONTS.body600, fontSize: 11, color: COLORS.success },
  completedRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  doneCheck: {
    width: 20, height: 20, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.success,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeChip: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: RADIUS.md, padding: SPACING.md,
    alignItems: 'center', gap: 4, minWidth: 70,
  },
  badgeName: {
    fontFamily: FONTS.body600, fontSize: 9,
    color: COLORS.textCaption, textAlign: 'center',
  },
  readonlyNote: {
    flexDirection: 'row', gap: SPACING.xs, alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.lg,
  },
});
