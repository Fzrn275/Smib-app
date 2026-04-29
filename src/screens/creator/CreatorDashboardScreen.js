// src/screens/creator/CreatorDashboardScreen.js
// Screen 19 — c-dash — Creator Dashboard

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets }  from 'react-native-safe-area-context';
import { Ionicons }           from '@expo/vector-icons';

import { useAuth }                      from '../../context/AuthContext';
import { supabase }                     from '../../services/supabaseClient';
import { getCreatorProjects }           from '../../services/projectService';
import { getProgressSummary }           from '../../services/progressService';
import Creator         from '../../models/Creator';
import VerifiedCreator from '../../models/VerifiedCreator';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, BUTTONS,
} from '../../theme';

const STATUS_COLOR = {
  published:   COLORS.success,
  draft:       COLORS.hornbillGold,
  in_review:   COLORS.aiCyan,
};
const STATUS_LABEL = { published: 'Published', draft: 'Draft', in_review: 'In Review' };

function StatCard({ label, value, color }) {
  return (
    <View style={[styles.statCard, { flex: 1 }]}>
      <Text style={[styles.statValue, { color }]}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function CreatorDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user }  = useAuth();

  const [creatorId,   setCreatorId]   = useState(null);
  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState('');

  const [stats, setStats] = useState({ published: 0, draft: 0, students: 0, avgCompletion: 0 });

  const [creatorModel, setCreatorModel] = useState(null);

  async function fetchCreatorRow() {
    const { data, error: e } = await supabase
      .from('creators')
      .select('id, organisation, focus_area, bio, is_verified, verified_at')
      .eq('user_id', user.id)
      .maybeSingle();
    if (e) throw new Error('Could not load creator profile.');
    if (!data) throw new Error('Creator profile not found. Please sign out and back in.');
    // Build Creator or VerifiedCreator model (inheritance)
    const model = data.is_verified
      ? new VerifiedCreator(user.id, user.name, user.email, user.role, user.avatar_url, data.organisation ?? '', data.focus_area ?? '', data.bio ?? '', data.verified_at)
      : new Creator(user.id, user.name, user.email, user.role, user.avatar_url, data.organisation ?? '', data.focus_area ?? '', data.bio ?? '');
    setCreatorModel(model);
    return data.id;
  }

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setError('');
      const cId = creatorId ?? await fetchCreatorRow();
      if (!creatorId) setCreatorId(cId);

      const projs = await getCreatorProjects(cId);
      setProjects(projs);

      // Compute stats
      const published = projs.filter(p => p.status === 'published').length;
      const draft     = projs.filter(p => p.status === 'draft').length;

      // Count total enrolled students across published projects
      let totalEnrolled = 0;
      let completionSum = 0;
      let completionCount = 0;
      for (const proj of projs.filter(p => p.status === 'published')) {
        const { count } = await supabase
          .from('progress')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', proj.id);
        totalEnrolled += count ?? 0;

        const { data: pRows } = await supabase
          .from('progress')
          .select('progress_pct')
          .eq('project_id', proj.id);
        if (pRows?.length) {
          completionSum   += pRows.reduce((s, r) => s + (r.progress_pct ?? 0), 0);
          completionCount += pRows.length;
        }
      }

      setStats({
        published,
        draft,
        students: totalEnrolled,
        avgCompletion: completionCount ? Math.round(completionSum / completionCount) : 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, creatorId]);

  useEffect(() => { load(); }, [load]);

  function onRefresh() { setRefreshing(true); load(); }

  const recentProjects = projects.slice(0, 3);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.aiCyan} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.aiCyan} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={TYPE.caption}>Welcome back,</Text>
          <Text style={[TYPE.h1, { marginTop: 2 }]}>{user?.name ?? 'Creator'}</Text>
          {creatorModel instanceof VerifiedCreator && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.aiCyan} />
              <Text style={styles.verifiedText}>Verified Creator</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => {}}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load}><Text style={{ color: COLORS.aiCyan, fontFamily: FONTS.body600, fontSize: 13 }}>Retry</Text></TouchableOpacity>
        </View>
      ) : null}

      {/* Stat cards — 2×2 grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard label="Published"  value={stats.published}     color={COLORS.aiCyan}    />
          <StatCard label="Drafts"     value={stats.draft}         color={COLORS.hornbillGold} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Students Enrolled" value={stats.students}       color={COLORS.success}    />
          <StatCard label="Avg Completion"    value={`${stats.avgCompletion}%`} color={COLORS.riverTeal} />
        </View>
      </View>

      {/* Recent Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={TYPE.h3}>My Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyProjects')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {recentProjects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={TYPE.body}>No projects yet. Create your first one!</Text>
          </View>
        ) : (
          recentProjects.map(proj => (
            <TouchableOpacity
              key={proj.id}
              style={styles.projectRow}
              onPress={() => navigation.navigate('CreatorProjectDetail', { projectId: proj.id })}
              activeOpacity={0.8}
            >
              <View style={[styles.projectStatusBar, { backgroundColor: STATUS_COLOR[proj.status] ?? COLORS.textCaption }]} />
              <View style={{ flex: 1 }}>
                <Text style={[TYPE.h3, { fontSize: 14 }]} numberOfLines={1}>{proj.title}</Text>
                <Text style={TYPE.caption}>{proj.category} · {proj.difficulty}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[proj.status] ?? COLORS.textCaption}20` }]}>
                <Text style={[styles.statusText, { color: STATUS_COLOR[proj.status] ?? COLORS.textCaption }]}>
                  {STATUS_LABEL[proj.status] ?? proj.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: BUTTONS.variants.primary.backgroundColor }]}
          onPress={() => navigation.navigate('NewProject')}
        >
          <Ionicons name="add-circle-outline" size={18} color={COLORS.white} />
          <Text style={styles.actionBtnText}>New Project</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Ionicons name="bar-chart-outline" size={18} color={COLORS.aiCyan} />
          <Text style={[styles.actionBtnText, { color: COLORS.aiCyan }]}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.cyanBg,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontFamily: FONTS.body600,
    fontSize: 11,
    color: COLORS.aiCyan,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    backgroundColor: COLORS.errorBgSubtle,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  errorText: { fontFamily: FONTS.body400, fontSize: 13, color: COLORS.errorLight },
  statsGrid: { gap: SPACING.md, marginBottom: SPACING.xl },
  statsRow:  { flexDirection: 'row', gap: SPACING.md },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.9)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.7)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONTS.heading900,
    fontSize: 26,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: FONTS.body400,
    fontSize: 11,
    color: COLORS.textCaption,
    textAlign: 'center',
  },
  section: { marginBottom: SPACING.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  seeAll: {
    fontFamily: FONTS.body600,
    fontSize: 13,
    color: COLORS.aiCyan,
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  projectStatusBar: {
    width: 4,
    height: '100%',
    minHeight: 40,
    borderRadius: RADIUS.pill,
  },
  statusBadge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  statusText: {
    fontFamily: FONTS.body600,
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    height: 46,
    borderRadius: RADIUS.md,
  },
  actionBtnText: {
    fontFamily: FONTS.heading800,
    fontSize: 14,
    color: COLORS.white,
  },
});
