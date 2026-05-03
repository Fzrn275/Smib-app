// src/screens/parent/ParentDashboardScreen.js
// Screen 26 — p-dash — Parent Dashboard

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                        from '../../context/AuthContext';
import { SCREENS, TAB_BAR_TOTAL_HEIGHT } from '../../navigation/navConstants';
import { getLinkedChildren }              from '../../services/authService';
import { getChildProgress }              from '../../services/progressService';
import { getAchievements }               from '../../services/achievementService';
import {
  COLORS, FONTS, TYPE, SPACING, RADIUS,
  calculateLevel, getRankTitle,
} from '../../theme';

function ChildCard({ child, progress, achievements, navigation }) {
  const activeCount    = progress.filter(p => !p.is_completed).length;
  const completedCount = progress.filter(p => p.is_completed).length;
  const badgeCount     = achievements.length;
  const level          = calculateLevel(child.xp ?? 0);
  const rankTitle      = getRankTitle(level);
  const initial        = (child.name ?? 'S').charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.childCard}
      onPress={() => navigation.navigate(SCREENS.CHILD_PROGRESS, { childId: child.id, childName: child.name })}
      activeOpacity={0.8}
    >
      <View style={styles.childCardTop}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={TYPE.h3}>{child.name}</Text>
          <Text style={TYPE.caption}>
            {child.grade_level ?? 'Unknown grade'} · {child.school_name ?? 'Unknown school'}
          </Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv {level} · {rankTitle}</Text>
          </View>
        </View>
        <View style={styles.statusDot} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: COLORS.aiCyan }]}>{activeCount}</Text>
          <Text style={styles.miniStatLabel}>Active</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: COLORS.hornbillGold }]}>{completedCount}</Text>
          <Text style={styles.miniStatLabel}>Done</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: COLORS.success }]}>{badgeCount}</Text>
          <Text style={styles.miniStatLabel}>Badges</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ParentDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [children,   setChildren]   = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [achMap,      setAchMap]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');
  const [toast,      setToast]      = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setError('');
      const childProfiles = await getLinkedChildren(user.id);

      if (!childProfiles || childProfiles.length === 0) {
        setChildren([]);
        return;
      }

      const childIds = childProfiles.map(c => c.id);

      // Fetch each child's progress + achievements in parallel
      const progResults = await Promise.all(childIds.map(id => getChildProgress(id)));
      const achResults  = await Promise.all(childIds.map(id => getAchievements(id)));

      setChildren(childProfiles);
      const pm = {};
      const am = {};
      childIds.forEach((id, i) => {
        pm[id] = progResults[i] ?? [];
        am[id] = achResults[i]  ?? [];
      });
      setProgressMap(pm);
      setAchMap(am);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  function onRefresh() { setRefreshing(true); load(); }

  function handleLinkChild() {
    setToast('Coming soon — linking a child will be available in a future update.');
    setTimeout(() => setToast(''), 3000);
  }

  // Summary totals across all children
  const allProgress   = Object.values(progressMap).flat();
  const totalActive   = allProgress.filter(p => !p.is_completed).length;
  const totalCompleted = allProgress.filter(p => p.is_completed).length;
  const totalBadges   = Object.values(achMap).reduce((s, a) => s + a.length, 0);

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.aiCyan} size="large" /></View>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.lg, paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.aiCyan} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={TYPE.caption}>Welcome back,</Text>
            <Text style={[TYPE.h1, { marginTop: 2 }]}>{user?.name ?? 'Parent'}</Text>
            <View style={styles.childrenBadge}>
              <Ionicons name="people-outline" size={12} color={COLORS.success} />
              <Text style={styles.childrenBadgeText}>{children.length} {children.length === 1 ? 'Child' : 'Children'} Linked</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Toast */}
        {!!toast && (
          <View style={styles.toastBanner}><Text style={{ fontFamily: FONTS.body600, fontSize: 13, color: COLORS.white }}>{toast}</Text></View>
        )}

        {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}

        {/* Summary stats */}
        {children.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={[styles.sumCard, { flex: 1 }]}>
              <Text style={[styles.sumValue, { color: COLORS.success }]}>{totalActive}</Text>
              <Text style={styles.sumLabel}>Active</Text>
            </View>
            <View style={[styles.sumCard, { flex: 1 }]}>
              <Text style={[styles.sumValue, { color: COLORS.hornbillGold }]}>{totalCompleted}</Text>
              <Text style={styles.sumLabel}>Completed</Text>
            </View>
            <View style={[styles.sumCard, { flex: 1 }]}>
              <Text style={[styles.sumValue, { color: COLORS.aiCyan }]}>{totalBadges}</Text>
              <Text style={styles.sumLabel}>Badges</Text>
            </View>
          </View>
        )}

        {/* Section title */}
        <Text style={[TYPE.h2, { marginBottom: SPACING.md }]}>My Children</Text>

        {children.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 40, marginBottom: SPACING.md }}>👨‍👩‍👧</Text>
            <Text style={[TYPE.h3, { textAlign: 'center', marginBottom: SPACING.sm }]}>No children linked yet</Text>
            <Text style={[TYPE.caption, { textAlign: 'center' }]}>
              Link a child account to monitor their STEM learning progress.
            </Text>
          </View>
        ) : (
          children.map(child => (
            <ChildCard
              key={child.id}
              child={child}
              progress={progressMap[child.id] ?? []}
              achievements={achMap[child.id] ?? []}
              navigation={navigation}
            />
          ))
        )}

        {/* Link child button */}
        <TouchableOpacity style={styles.linkBtn} onPress={handleLinkChild}>
          <Ionicons name="add-circle-outline" size={18} color={COLORS.riverTeal} />
          <Text style={styles.linkBtnText}>+ Link Another Child</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll:  { paddingHorizontal: SPACING.xl },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.xl },
  childrenBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.xs,
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  childrenBadgeText: { fontFamily: FONTS.body600, fontSize: 11, color: COLORS.success },
  bellBtn: {
    width: 40, height: 40, borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  toastBanner: {
    backgroundColor: COLORS.riverTeal, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md, alignItems: 'center',
  },
  errorCard: {
    backgroundColor: COLORS.errorBgSubtle, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  errorText: { fontFamily: FONTS.body400, fontSize: 13, color: COLORS.errorLight },
  summaryRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  sumCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.9)',
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.7)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center',
  },
  sumValue: { fontFamily: FONTS.heading900, fontSize: 22 },
  sumLabel: { fontFamily: FONTS.body400, fontSize: 11, color: COLORS.textCaption },
  childCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.15)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  childCardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 48, height: 48, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.success,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.heading900, fontSize: 20, color: COLORS.white },
  levelBadge: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  levelText: { fontFamily: FONTS.body600, fontSize: 10, color: COLORS.success },
  statusDot: {
    width: 10, height: 10, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.success, marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.md, padding: SPACING.md,
  },
  miniStat:      { flex: 1, alignItems: 'center' },
  miniStatValue: { fontFamily: FONTS.heading800, fontSize: 16 },
  miniStatLabel: { fontFamily: FONTS.body400, fontSize: 10, color: COLORS.textCaption },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.xl,
    padding: SPACING.xxl, alignItems: 'center', marginBottom: SPACING.xl,
  },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, height: 48, borderRadius: RADIUS.md,
    backgroundColor: COLORS.tealBg,
    borderWidth: 1, borderColor: COLORS.tealBorder,
    marginBottom: SPACING.lg,
  },
  linkBtnText: { fontFamily: FONTS.body700, fontSize: 14, color: COLORS.riverTeal },
});
