// src/screens/creator/CreatorProjectDetailScreen.js
// Screen 21 — c-projdetail — Creator Project Detail

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                                   from '../../context/AuthContext';
import { supabase }                                  from '../../services/supabaseClient';
import { getProjectById, getProjectSteps }           from '../../services/projectService';
import { getStepCompletionStats, getProgress }       from '../../services/progressService';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, BUTTONS,
} from '../../theme';

export default function CreatorProjectDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const projectId = route?.params?.projectId;

  const [project,    setProject]    = useState(null);
  const [steps,      setSteps]      = useState([]);
  const [stats,      setStats]      = useState([]);
  const [enrolled,   setEnrolled]   = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [delModal,   setDelModal]   = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setError('');
      const [proj, stps] = await Promise.all([
        getProjectById(projectId),
        getProjectSteps(projectId),
      ]);
      setProject(proj);
      setSteps(stps);

      const stepStats = await getStepCompletionStats(projectId);
      setStats(stepStats);

      const { count } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);
      setEnrolled(count ?? 0);
    } catch (err) {
      setError(err.message || 'Failed to load project.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!project) return;
    setDeleting(true);
    try {
      // Get creatorId
      const { data: creatorRow } = await supabase
        .from('creators').select('id').eq('user_id', user.id).maybeSingle();
      if (!creatorRow) throw new Error('Creator profile not found.');
      await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('creator_id', creatorRow.id);
      setDelModal(false);
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Could not delete project.');
      setDelModal(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.aiCyan} size="large" /></View>;
  if (!project) return (
    <View style={styles.center}>
      <Text style={TYPE.body}>{error || 'Project not found.'}</Text>
    </View>
  );

  const maxStepCount = stats.reduce((m, s) => Math.max(m, s.count), 1) || 1;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={[TYPE.h2, { flex: 1, marginHorizontal: SPACING.sm }]} numberOfLines={1}>
            {project.title}
          </Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('EditProject', { projectId })}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.aiCyan} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setDelModal(true)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}

        {/* Meta */}
        <Text style={[TYPE.caption, { marginBottom: SPACING.lg }]}>
          {project.category} · {project.difficulty} · {project.type}
        </Text>

        {/* Stat cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={[styles.statValue, { color: COLORS.aiCyan }]}>{enrolled}</Text>
            <Text style={styles.statLabel}>Enrolled</Text>
          </View>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>—</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={[styles.statValue, { color: COLORS.hornbillGold }]}>—★</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Step Completion Funnel */}
        <View style={styles.section}>
          <Text style={[TYPE.h3, { marginBottom: SPACING.md }]}>Step Completion Funnel</Text>
          {steps.length === 0 ? (
            <Text style={TYPE.caption}>No steps added yet.</Text>
          ) : (
            steps.map((step, idx) => {
              const statRow = stats.find(s => s.stepNumber === step.step_number);
              const count   = statRow?.count ?? 0;
              const pct     = enrolled > 0 ? Math.round((count / enrolled) * 100) : 0;
              return (
                <View key={step.id} style={styles.funnelRow}>
                  <Text style={[TYPE.caption, { width: 60 }]}>Step {step.step_number}</Text>
                  <View style={styles.funnelBarBg}>
                    <View style={[styles.funnelBarFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={[TYPE.caption, { width: 36, textAlign: 'right' }]}>{pct}%</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Delete modal */}
      <Modal visible={delModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={TYPE.h2}>Delete Project?</Text>
            <Text style={[TYPE.body, { marginTop: SPACING.sm }]}>
              "{project.title}"
            </Text>
            <View style={styles.modalWarning}>
              <Ionicons name="warning-outline" size={14} color={COLORS.hornbillGold} />
              <Text style={[TYPE.caption, { flex: 1, lineHeight: 18 }]}>
                All enrolled student progress will be lost. This cannot be undone.
              </Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                onPress={() => setDelModal(false)}
              >
                <Text style={[TYPE.body, { fontFamily: FONTS.body600 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.error }]}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? <ActivityIndicator color={COLORS.white} size="small" />
                  : <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: COLORS.white }}>Yes, Delete</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll:  { paddingHorizontal: SPACING.xl },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:  { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  backBtn: {
    width: 36, height: 36, borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  errorCard: {
    backgroundColor: COLORS.errorBgSubtle, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  errorText: { fontFamily: FONTS.body400, fontSize: 13, color: COLORS.errorLight },
  statsRow:  { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.9)',
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.7)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center',
  },
  statValue: { fontFamily: FONTS.heading900, fontSize: 22, marginBottom: 2 },
  statLabel: { fontFamily: FONTS.body400, fontSize: 11, color: COLORS.textCaption },
  section:   { marginBottom: SPACING.xl },
  funnelRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  funnelBarBg: {
    flex: 1, height: 8, borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  funnelBarFill: {
    height: '100%', borderRadius: RADIUS.pill,
    backgroundColor: COLORS.riverTeal,
  },
  modalBackdrop: {
    flex: 1, backgroundColor: COLORS.overlay60,
    alignItems: 'center', justifyContent: 'center', padding: SPACING.xl,
  },
  modalCard: {
    width: '100%', backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.xl, padding: SPACING.xl,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
    gap: SPACING.md,
  },
  modalWarning: {
    flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start',
    backgroundColor: COLORS.goldBg,
    borderRadius: RADIUS.sm, padding: SPACING.sm,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  modalBtn: {
    flex: 1, height: 46, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
});
