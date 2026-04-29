// src/screens/learner/ProjectDetailScreen.js
// s-detail — Project detail with steps list, enrol/continue button, and AI Help.
// Route params: { projectId }

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                       from '../../context/AuthContext';
import { SCREENS, TAB_BAR_TOTAL_HEIGHT } from '../../navigation/navConstants';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, SPRING, GRADIENTS,
} from '../../theme';
import {
  getProjectById, getProjectSteps, enrolInProject, getEnrolmentStatus,
} from '../../services/projectService';
import { getCategoryMeta } from './HomeScreen';
import GuidedProject from '../../models/GuidedProject';
import OpenProject   from '../../models/OpenProject';
import Step          from '../../models/Step';

// ─── STEP ROW ────────────────────────────────────────────────────────────────

function StepRow({ step, status, onPress }) {
  // status: 'completed' | 'active' | 'locked'
  const isActive    = status === 'active';
  const isCompleted = status === 'completed';
  const isLocked    = status === 'locked';

  const iconName  = isCompleted ? 'checkmark-circle'
                  : isActive    ? 'play-circle-outline'
                  : 'lock-closed-outline';
  const iconColor = isCompleted ? COLORS.success
                  : isActive    ? COLORS.aiCyan
                  : COLORS.textLabel;

  return (
    <TouchableOpacity
      onPress={isActive ? onPress : undefined}
      activeOpacity={isActive ? 0.7 : 1}
      style={[
        styles.stepRow,
        isActive    && styles.stepRowActive,
        isCompleted && styles.stepRowDone,
      ]}
    >
      <View style={[styles.stepNum, isActive && styles.stepNumActive]}>
        <Text style={[styles.stepNumText, isActive && { color: COLORS.aiCyan }]}>
          {step.step_number}
        </Text>
      </View>
      <Text
        style={[
          styles.stepTitle,
          isCompleted && { color: COLORS.textCaption },
          isLocked    && { color: COLORS.textLabel },
        ]}
        numberOfLines={2}
      >
        {step.title}
      </Text>
      <Ionicons name={iconName} size={20} color={iconColor} />
    </TouchableOpacity>
  );
}

// ─── SCREEN ──────────────────────────────────────────────────────────────────

export default function ProjectDetailScreen({ navigation, route }) {
  const { projectId } = route.params ?? {};
  const { user } = useAuth();
  const insets  = useSafeAreaInsets();

  const [project,      setProject]      = useState(null);
  const [projectModel, setProjectModel] = useState(null);
  const [steps,        setSteps]        = useState([]);
  const [progress,     setProgress]     = useState(null); // null = not enrolled
  const [loading,      setLoading]      = useState(true);
  const [enrolling,    setEnrolling]    = useState(false);
  const [error,        setError]        = useState(null);

  // Entrance fade
  const fadeA = useRef(new Animated.Value(0)).current;

  // ─── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!projectId || !user?.id) return;
    try {
      const [proj, stepList, enrolment] = await Promise.all([
        getProjectById(projectId),
        getProjectSteps(projectId),
        getEnrolmentStatus(user.id, projectId),
      ]);
      setProject(proj);
      setSteps(stepList);
      // Composition: build GuidedProject/OpenProject model and add Step objects into it
      const model = proj.type === 'guided'
        ? new GuidedProject(proj.id, proj.title, proj.description, proj.difficulty, proj.category, proj.instruction_level ?? 'simple', proj.estimated_duration ?? 0)
        : new OpenProject(proj.id, proj.title, proj.description, proj.difficulty, proj.category, proj.creativity_score ?? 0);
      stepList.forEach(s => model.addStep(new Step(s.id, s.step_number, s.title, s.instructions, s.image_ref ?? null)));
      setProjectModel(model);
      setProgress(enrolment);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load project.');
    } finally {
      setLoading(false);
      Animated.spring(fadeA, {
        toValue: 1, tension: SPRING.default.tension, friction: SPRING.default.friction, useNativeDriver: true,
      }).start();
    }
  }, [projectId, user?.id]);

  useEffect(() => { load(); }, [load]);

  // ─── Enrol ───────────────────────────────────────────────────────────────
  async function handleEnrol() {
    if (!user?.id || !projectId) return;
    setEnrolling(true);
    try {
      const newProgress = await enrolInProject(user.id, projectId);
      setProgress(newProgress);
    } catch (err) {
      setError(err.message || 'Could not enrol in project.');
    } finally {
      setEnrolling(false);
    }
  }

  // ─── Navigation helpers ──────────────────────────────────────────────────
  function goToStep(step) {
    navigation.navigate(SCREENS.STEP_DETAIL, {
      projectId,
      stepId:           step.id,
      stepNumber:       step.step_number,
      totalSteps:       steps.length,
      currentCompleted: progress?.completed_steps ?? [],
      project:          { id: project.id, title: project.title, category: project.category },
    });
  }

  function handleContinue() {
    const currentStep = progress?.current_step ?? 1;
    const step = steps.find(s => s.step_number === currentStep) ?? steps[0];
    if (step) goToStep(step);
  }

  function handleAIHelp() {
    navigation.navigate(SCREENS.AI_HELP, {
      project: project ? { id: project.id, title: project.title, category: project.category } : null,
      step:    null,
    });
  }

  // ─── Step status helper ──────────────────────────────────────────────────
  function getStepStatus(step) {
    if (!progress) return 'locked';
    const completed = progress.completed_steps ?? [];
    if (completed.includes(step.step_number)) return 'completed';
    if (step.step_number === (progress.current_step ?? 1)) return 'active';
    return 'locked';
  }

  // ─── Derived ─────────────────────────────────────────────────────────────
  const { emoji, grad } = getCategoryMeta(project?.category);
  const totalSteps      = steps.length;
  const completedCount  = (progress?.completed_steps ?? []).length;
  const progressPct     = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const isEnrolled      = progress !== null;
  const isCompleted     = progress?.is_completed === true;

  const creator     = project?.creators;
  const creatorUser = creator?.users;
  const creatorName = creatorUser?.name ?? 'S-MIB Creator';

  // ─── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.hornbillGold} />
      </View>
    );
  }

  if (error && !project) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={44} color={COLORS.error} />
        <Text style={[TYPE.body, { marginTop: SPACING.md, textAlign: 'center' }]}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeA }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_TOTAL_HEIGHT + SPACING.xxl }}
      >
        {/* ── HERO ──────────────────────────────────────────────── */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={grad}
            style={[styles.hero, { paddingTop: insets.top + SPACING.sm }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Nav row */}
            <View style={styles.navRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.navBtn}
              >
                <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAIHelp} style={styles.aiBtn}>
                <Text style={styles.aiBtnText}>🤖 AI Help</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom of hero */}
            <View style={styles.heroBottom}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>
                  {emoji} {project?.category}
                </Text>
              </View>
              <Text style={styles.heroTitle}>{project?.title}</Text>
              <Text style={[TYPE.caption, { color: 'rgba(255,255,255,0.8)', marginTop: 2 }]}>
                {project?.difficulty} · {projectModel?.getFormattedDuration() ?? project?.estimated_duration ?? 'Self-paced'}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── CREATOR + RATING ───────────────────────────────────── */}
        <View style={styles.creatorRow}>
          <View style={styles.creatorAvatar}>
            <Text style={styles.creatorAvatarText}>{creatorName[0]?.toUpperCase()}</Text>
          </View>
          <Text style={[TYPE.body, { flex: 1 }]}>by {creatorName}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>4.9★</Text>
            <Text style={[TYPE.caption, { marginLeft: 3 }]}>· 142</Text>
          </View>
        </View>

        {/* ── DESCRIPTION ─────────────────────────────────────────── */}
        {project?.description ? (
          <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
            <Text style={TYPE.body}>{project.description}</Text>
          </View>
        ) : null}

        {/* ── PROGRESS CARD ───────────────────────────────────────── */}
        <View style={[GLASS.standard, styles.progressCard]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {isCompleted ? '✅ Completed!' : `${completedCount} / ${totalSteps} steps done`}
            </Text>
            <Text style={[TYPE.caption, { color: COLORS.hornbillGold }]}>
              {Math.round(progressPct)}%
            </Text>
          </View>
          <View style={styles.progBarBg}>
            <View
              style={[
                styles.progBarFill,
                {
                  width: `${progressPct}%`,
                  backgroundColor: isCompleted ? COLORS.success : COLORS.hornbillGold,
                },
              ]}
            />
          </View>
        </View>

        {/* ── STEPS LIST ──────────────────────────────────────────── */}
        <View style={styles.stepsSection}>
          <Text style={styles.stepsHeading}>Steps</Text>
          {steps.map(step => (
            <StepRow
              key={step.id}
              step={step}
              status={getStepStatus(step)}
              onPress={() => goToStep(step)}
            />
          ))}
          {steps.length === 0 && (
            <Text style={[TYPE.caption, { textAlign: 'center', paddingVertical: SPACING.lg }]}>
              No steps added yet.
            </Text>
          )}
        </View>

        {/* ── ENROL / CONTINUE BUTTON ────────────────────────────── */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.lg, gap: SPACING.md }}>
          {!isEnrolled ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleEnrol}
              disabled={enrolling}
              activeOpacity={0.8}
            >
              {enrolling
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.primaryBtnText}>🚀 Start Project</Text>
              }
            </TouchableOpacity>
          ) : isCompleted ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
              <Text style={styles.completedText}>Project Completed!</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Continue Step {progress?.current_step ?? 1} →</Text>
            </TouchableOpacity>
          )}

          {/* AI shortcut link */}
          <TouchableOpacity style={styles.aiShortcut} onPress={handleAIHelp}>
            <Text style={styles.aiShortcutText}>🤖 Ask the AI Helper</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    gap:            SPACING.md,
    padding:        SPACING.xl,
  },
  retryBtn: {
    marginTop:         SPACING.md,
    paddingVertical:   10,
    paddingHorizontal: SPACING.xl,
    backgroundColor:   COLORS.riverTeal,
    borderRadius:      RADIUS.pill,
  },
  retryText: { fontFamily: FONTS.body600, fontSize: 14, color: COLORS.white },

  // Hero
  heroContainer: { overflow: 'hidden' },
  hero: {
    minHeight:      260,
    justifyContent: 'space-between',
    paddingBottom:  SPACING.xl,
  },
  navRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.sm,
  },
  navBtn: {
    backgroundColor: COLORS.overlay25,
    borderRadius:    RADIUS.pill,
    padding:         SPACING.sm,
  },
  aiBtn: {
    backgroundColor:   COLORS.overlay30,
    borderRadius:      RADIUS.pill,
    paddingVertical:   SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.25)',
  },
  aiBtnText: { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.white },
  heroBottom: { paddingHorizontal: SPACING.lg },
  categoryChip: {
    alignSelf:         'flex-start',
    backgroundColor:   COLORS.overlay30,
    borderRadius:      RADIUS.pill,
    paddingVertical:   4,
    paddingHorizontal: SPACING.md,
    marginBottom:      SPACING.sm,
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.2)',
  },
  categoryChipText: {
    fontFamily:    FONTS.body600,
    fontSize:      12,
    color:         COLORS.white,
    textTransform: 'capitalize',
  },
  heroTitle: {
    fontFamily: FONTS.heading900,
    fontSize:   26,
    color:      COLORS.white,
    lineHeight: 32,
  },

  // Creator row
  creatorRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
    gap:            SPACING.sm,
  },
  creatorAvatar: {
    width:           30,
    height:          30,
    borderRadius:    RADIUS.pill,
    backgroundColor: COLORS.riverTeal,
    justifyContent:  'center',
    alignItems:      'center',
  },
  creatorAvatarText: { fontFamily: FONTS.body700, fontSize: 12, color: COLORS.white },
  ratingBadge: { flexDirection: 'row', alignItems: 'center' },
  ratingText:  { fontFamily: FONTS.body700, fontSize: 13, color: COLORS.hornbillGold },

  // Progress card
  progressCard: {
    marginHorizontal: SPACING.lg,
    borderRadius:     RADIUS.lg,
    padding:          SPACING.lg,
    marginBottom:     SPACING.xl,
  },
  progressHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SPACING.md,
  },
  progressLabel: { fontFamily: FONTS.body600, fontSize: 14, color: COLORS.textPrimary },
  progBarBg: {
    height:          10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius:    RADIUS.pill,
    overflow:        'hidden',
  },
  progBarFill: { height: '100%', borderRadius: RADIUS.pill },

  // Steps
  stepsSection:  { paddingHorizontal: SPACING.lg },
  stepsHeading: {
    fontFamily:   FONTS.heading800,
    fontSize:     18,
    color:        COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  stepRow: {
    ...GLASS.standard,
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   RADIUS.md,
    padding:        SPACING.md,
    marginBottom:   SPACING.sm,
    gap:            SPACING.md,
  },
  stepRowActive: {
    borderTopColor:  COLORS.aiCyan,
    borderLeftColor: COLORS.inputBorderFocusLeft,
  },
  stepRowDone: {
    backgroundColor: 'rgba(34,197,94,0.06)',
  },
  stepNum: {
    width:           28,
    height:          28,
    borderRadius:    RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  stepNumActive: { backgroundColor: 'rgba(103,232,249,0.15)' },
  stepNumText: {
    fontFamily: FONTS.body700,
    fontSize:   12,
    color:      COLORS.textCaption,
  },
  stepTitle: {
    flex:       1,
    fontFamily: FONTS.body600,
    fontSize:   14,
    color:      COLORS.textPrimary,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: COLORS.riverTeal,
    borderRadius:    RADIUS.lg,
    paddingVertical: 15,
    alignItems:      'center',
  },
  primaryBtnText: {
    fontFamily: FONTS.heading800,
    fontSize:   16,
    color:      COLORS.white,
  },
  completedBadge: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.sm,
    paddingVertical: 14,
    backgroundColor: COLORS.successBgMid,
    borderRadius:   RADIUS.lg,
    borderWidth:    1,
    borderColor:    COLORS.successBorder,
  },
  completedText: { fontFamily: FONTS.heading800, fontSize: 16, color: COLORS.success },
  aiShortcut: {
    alignItems:  'center',
    paddingVertical: SPACING.sm,
  },
  aiShortcutText: { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.aiCyan },

  errorBanner: {
    marginHorizontal: SPACING.lg,
    marginTop:        SPACING.md,
    backgroundColor:  COLORS.errorBg,
    borderRadius:     RADIUS.md,
    padding:          SPACING.md,
    borderWidth:      1,
    borderColor:      COLORS.errorBorder,
  },
  errorText: { fontFamily: FONTS.body400, fontSize: 13, color: COLORS.error, textAlign: 'center' },
});
