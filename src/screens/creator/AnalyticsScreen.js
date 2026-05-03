// src/screens/creator/AnalyticsScreen.js
// Screen 24 — c-analytics — Analytics Dashboard

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                    from '../../context/AuthContext';
import { TAB_BAR_TOTAL_HEIGHT }      from '../../navigation/navConstants';
import {
  getCreatorProjects, getCreatorRowByUserId,
  getProjectEnrolmentCount, getProjectProgressPcts,
} from '../../services/projectService';
import { getActivityFeed } from '../../services/progressService';
import {
  COLORS, FONTS, TYPE, SPACING, RADIUS,
} from '../../theme';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AnalyticsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [creatorId,  setCreatorId]  = useState(null);
  const [projects,   setProjects]   = useState([]);
  const [activity,   setActivity]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');
  const [stats,      setStats]      = useState({ students: 0, avgCompletion: 0, topProject: null });

  // Simple mock bar data — 7 bars representing Mon-Today
  const barData = [2, 5, 3, 8, 4, 6, 10];
  const maxBar  = Math.max(...barData);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setError('');
      let cId = creatorId;
      if (!cId) {
        const creatorRow = await getCreatorRowByUserId(user.id);
        if (!creatorRow) {
          setError('Creator profile not found. Please sign out and sign back in.');
          setLoading(false);
          return;
        }
        cId = creatorRow.id;
        setCreatorId(cId);
      }

      const projs = await getCreatorProjects(cId);
      setProjects(projs.filter(p => p.status === 'published'));

      // Aggregate student + completion stats
      let totalStudents = 0;
      let completionSum = 0;
      let completionCount = 0;
      let topProject = null;
      let topCount = 0;

      for (const proj of projs.filter(p => p.status === 'published')) {
        const c = await getProjectEnrolmentCount(proj.id);
        totalStudents += c;
        if (c > topCount) { topCount = c; topProject = proj; }

        const pRows = await getProjectProgressPcts(proj.id);
        if (pRows?.length) {
          completionSum   += pRows.reduce((s, r) => s + (r.progress_pct ?? 0), 0);
          completionCount += pRows.length;
        }
      }

      setStats({
        students: totalStudents,
        avgCompletion: completionCount ? Math.round(completionSum / completionCount) : 0,
        topProject,
      });

      // Activity feed from first published project (if any)
      if (projs.length > 0) {
        const feed = await getActivityFeed(user.id, 15);
        setActivity(feed);
      }
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, creatorId]);

  useEffect(() => { load(); }, [load]);
  function onRefresh() { setRefreshing(true); load(); }

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.aiCyan} size="large" /></View>;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.lg, paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.aiCyan} />}
    >
      <Text style={[TYPE.h1, { marginBottom: SPACING.xl }]}>Analytics</Text>

      {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}

      {/* Summary stat cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { flex: 1 }]}>
          <Text style={[styles.statValue, { color: COLORS.aiCyan }]}>{stats.students}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={[styles.statCard, { flex: 1 }]}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.avgCompletion}%</Text>
          <Text style={styles.statLabel}>Avg Completion</Text>
        </View>
        <View style={[styles.statCard, { flex: 1 }]}>
          <Text style={[styles.statValue, { color: COLORS.hornbillGold }]}>—★</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Weekly enrolment bar chart */}
      <View style={styles.section}>
        <Text style={[TYPE.h3, { marginBottom: SPACING.md }]}>Weekly Enrolments</Text>
        <View style={styles.chartContainer}>
          {barData.map((val, idx) => {
            const isToday = idx === barData.length - 1;
            const height  = maxBar > 0 ? Math.max(4, Math.round((val / maxBar) * 80)) : 4;
            return (
              <View key={idx} style={styles.barColumn}>
                <Text style={styles.barValue}>{val}</Text>
                <View style={[
                  styles.bar,
                  { height, backgroundColor: isToday ? COLORS.aiCyan : COLORS.riverTeal, opacity: isToday ? 1 : 0.6 },
                ]} />
                <Text style={[styles.barLabel, isToday && { color: COLORS.aiCyan }]}>{DAY_LABELS[idx]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Top performing projects */}
      <View style={styles.section}>
        <Text style={[TYPE.h3, { marginBottom: SPACING.md }]}>Top Performing Projects</Text>
        {projects.length === 0 ? (
          <Text style={TYPE.caption}>No published projects yet.</Text>
        ) : (
          projects.slice(0, 3).map((proj, idx) => (
            <View key={proj.id} style={styles.topProjRow}>
              <Text style={[styles.rankNum, { color: idx === 0 ? COLORS.hornbillGold : COLORS.textCaption }]}>
                #{idx + 1}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[TYPE.h3, { fontSize: 13 }]} numberOfLines={1}>{proj.title}</Text>
                <View style={styles.miniBar}>
                  <View style={[styles.miniBarFill, { width: `${Math.max(5, 80 - idx * 20)}%` }]} />
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Recent activity */}
      <View style={styles.section}>
        <Text style={[TYPE.h3, { marginBottom: SPACING.md }]}>Recent Activity</Text>
        {activity.length === 0 ? (
          <View style={styles.emptyCard}><Text style={TYPE.caption}>No activity yet.</Text></View>
        ) : (
          activity.slice(0, 8).map((item, idx) => (
            <View key={idx} style={styles.activityRow}>
              <Text style={{ fontSize: 16 }}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={[TYPE.body, { fontSize: 13 }]} numberOfLines={1}>
                  Completed: {item.steps?.title ?? 'Step'}
                </Text>
                <Text style={TYPE.caption} numberOfLines={1}>
                  {item.projects?.title ?? 'Project'}
                </Text>
              </View>
              <Text style={TYPE.caption}>
                {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : ''}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:  { paddingHorizontal: SPACING.xl },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorCard: {
    backgroundColor: COLORS.errorBgSubtle, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  errorText: { fontFamily: FONTS.body400, fontSize: 13, color: COLORS.errorLight },
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.9)',
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.7)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center',
  },
  statValue: { fontFamily: FONTS.heading900, fontSize: 22, marginBottom: 2 },
  statLabel: { fontFamily: FONTS.body400, fontSize: 10, color: COLORS.textCaption, textAlign: 'center' },
  section: { marginBottom: SPACING.xl },
  chartContainer: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.lg, padding: SPACING.md, height: 130,
  },
  barColumn: { alignItems: 'center', flex: 1, gap: 4, justifyContent: 'flex-end' },
  bar:       { width: 20, borderRadius: 4 },
  barValue:  { fontFamily: FONTS.body600, fontSize: 10, color: COLORS.textCaption },
  barLabel:  { fontFamily: FONTS.body400, fontSize: 10, color: COLORS.textCaption },
  topProjRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rankNum: { fontFamily: FONTS.heading900, fontSize: 14, width: 24 },
  miniBar: {
    height: 6, borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginTop: 4,
  },
  miniBarFill: {
    height: '100%', borderRadius: RADIUS.pill,
    backgroundColor: COLORS.riverTeal,
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.sm, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.md,
    padding: SPACING.lg, alignItems: 'center',
  },
});
