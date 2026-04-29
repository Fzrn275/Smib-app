// src/screens/learner/StepDetailScreen.js
// s-step — Step-by-step instructions with photo proof upload and XP overlay.
//
// Route params:
//   projectId        {string}   — UUID of the parent project
//   stepId           {string}   — UUID of the current step
//   stepNumber       {number}   — 1-based step number
//   totalSteps       {number}   — total steps in project
//   currentCompleted {number[]} — completed step numbers so far
//   project          {object}   — { id, title, category } for AI context

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator,
  Modal, Image, Alert,
} from 'react-native';
import { useSafeAreaInsets }  from 'react-native-safe-area-context';
import { LinearGradient }     from 'expo-linear-gradient';
import { Ionicons }           from '@expo/vector-icons';
import * as ImagePicker       from 'expo-image-picker';

import { useAuth }                       from '../../context/AuthContext';
import { SCREENS, TAB_BAR_TOTAL_HEIGHT } from '../../navigation/navConstants';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, SPRING,
} from '../../theme';
import { getStepById, getProjectMaterials } from '../../services/projectService';
import { completeStep, queueStepCompletion } from '../../services/progressService';
import Progress  from '../../models/Progress';
import Step      from '../../models/Step';
import Material  from '../../models/Material';
import { supabase } from '../../services/supabaseClient';

// ─── SEGMENT PROGRESS BAR ────────────────────────────────────────────────────

function SegmentBar({ totalSteps, completed, activeStep }) {
  return (
    <View style={segStyles.row}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const n         = i + 1;
        const isDone    = completed.includes(n);
        const isActive  = n === activeStep;
        return (
          <View
            key={n}
            style={[
              segStyles.seg,
              isDone   && segStyles.segDone,
              isActive && segStyles.segActive,
              { marginRight: i < totalSteps - 1 ? 3 : 0 },
            ]}
          />
        );
      })}
    </View>
  );
}

const segStyles = StyleSheet.create({
  row:       { flexDirection: 'row', height: 6, marginBottom: SPACING.md },
  seg:       { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3 },
  segDone:   { backgroundColor: COLORS.success },
  segActive: { backgroundColor: COLORS.aiCyan },
});

// ─── XP OVERLAY ──────────────────────────────────────────────────────────────

function XPOverlay({ visible, xp, onBack }) {
  const scaleA = useRef(new Animated.Value(0.4)).current;
  const fadeA  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scaleA.setValue(0.4);
    fadeA.setValue(0);
    Animated.parallel([
      Animated.spring(scaleA, {
        toValue: 1, tension: 200, friction: 14, useNativeDriver: true,
      }),
      Animated.timing(fadeA, {
        toValue: 1, duration: 220, useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[xpStyles.overlay, { opacity: fadeA }]}>
      <Animated.View style={[xpStyles.card, { transform: [{ scale: scaleA }] }]}>
        <Text style={xpStyles.burst}>⚡</Text>
        <Text style={xpStyles.plus}>+{xp} XP</Text>
        <Text style={xpStyles.label}>Step Complete!</Text>
        <Text style={xpStyles.sub}>Great work — keep building!</Text>
        <TouchableOpacity style={xpStyles.btn} onPress={onBack} activeOpacity={0.8}>
          <Text style={xpStyles.btnText}>Back to Project →</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const xpStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay75,
    justifyContent:  'center',
    alignItems:      'center',
    zIndex:          50,
  },
  card: {
    ...GLASS.stat,
    borderRadius:   RADIUS.xl,
    padding:        SPACING.xxl,
    width:          '78%',
    alignItems:     'center',
    gap:            SPACING.sm,
  },
  burst: { fontSize: 52 },
  plus:  { fontFamily: FONTS.heading900, fontSize: 44, color: COLORS.hornbillGold },
  label: { fontFamily: FONTS.heading800, fontSize: 22, color: COLORS.textPrimary },
  sub:   { fontFamily: FONTS.body400,    fontSize: 14, color: COLORS.textBody, marginBottom: SPACING.md },
  btn: {
    backgroundColor:   COLORS.riverTeal,
    borderRadius:      RADIUS.pill,
    paddingVertical:   12,
    paddingHorizontal: SPACING.xxl,
    marginTop:         SPACING.sm,
  },
  btnText: { fontFamily: FONTS.heading800, fontSize: 15, color: COLORS.white },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function StepDetailScreen({ navigation, route }) {
  const {
    projectId,
    stepId,
    stepNumber,
    totalSteps,
    currentCompleted = [],
    project,
  } = route.params ?? {};

  const { user, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [step,           setStep]           = useState(null);
  const [stepModel,      setStepModel]      = useState(null);
  const [materials,      setMaterials]      = useState([]);
  const [materialModels, setMaterialModels] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photoUri,   setPhotoUri]   = useState(null);
  const [xpVisible,  setXpVisible]  = useState(false);
  const [awardedXp,  setAwardedXp]  = useState(50);
  const [error,      setError]      = useState(null);
  const [completed,  setCompleted]  = useState(currentCompleted);

  const fadeA = useRef(new Animated.Value(0)).current;

  // ─── Load step ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!stepId) return;
    try {
      const [s, mats] = await Promise.all([
        getStepById(stepId),
        getProjectMaterials(projectId),
      ]);
      setStep(s);
      setMaterials(mats);
      // Encapsulation: wrap raw DB rows in model instances with private fields + getters
      setStepModel(new Step(s.id, s.step_number, s.title, s.instructions, s.image_ref ?? null));
      setMaterialModels(mats.map(m => new Material(m.id, m.name, m.description, m.is_recyclable ?? false)));
    } catch (err) {
      setError(err.message || 'Could not load step.');
    } finally {
      setLoading(false);
      Animated.spring(fadeA, {
        toValue: 1, tension: SPRING.default.tension, friction: SPRING.default.friction,
        useNativeDriver: true,
      }).start();
    }
  }, [stepId, projectId]);

  useEffect(() => { load(); }, [load]);

  // ─── Photo picker ───────────────────────────────────────────────────────────
  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to attach proof.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality:    0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take proof photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  // ─── Upload photo to Supabase Storage ──────────────────────────────────────
  async function uploadPhoto(uri) {
    try {
      const ext      = uri.split('.').pop() ?? 'jpg';
      const filename = `${user.id}_${stepId}_${Date.now()}.${ext}`;
      const response = await fetch(uri);
      const blob     = await response.blob();

      const { error: upErr } = await supabase.storage
        .from('proof-photos')
        .upload(filename, blob, { contentType: `image/${ext}` });

      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from('proof-photos')
        .getPublicUrl(filename);

      return urlData?.publicUrl ?? null;
    } catch {
      return null; // Photo upload is non-blocking — step still completes
    }
  }

  // ─── Mark step done ─────────────────────────────────────────────────────────
  async function handleMarkDone() {
    if (!user?.id || !stepId || !projectId) return;
    setSubmitting(true);
    setError(null);

    try {
      // OOP: Progress.completeStep() validates locally (prevents double-award) before DB write
      const progressModel = new Progress(user.id, projectId, completed, totalSteps);
      progressModel.completeStep(stepNumber, totalSteps);

      let photoUrl = null;
      if (photoUri) {
        photoUrl = await uploadPhoto(photoUri);
      }

      const result = await completeStep({
        studentId:        user.id,
        stepId,
        projectId,
        stepNumber,
        totalSteps,
        photoUrl,
        currentCompleted: completed,
        currentXp:        user.xp ?? 0,
      });

      setCompleted(result.completedSteps);
      setAwardedXp(50);
      setXpVisible(true);

      // Refresh auth context so XP/level reflect immediately on other screens
      if (refreshUser) await refreshUser();
    } catch (err) {
      // Offline fallback
      try {
        await queueStepCompletion({
          studentId:        user.id,
          stepId,
          projectId,
          stepNumber,
          totalSteps,
          currentCompleted: completed,
          currentXp:        user.xp ?? 0,
        });
        setAwardedXp(50);
        setXpVisible(true);
      } catch {
        setError('Could not record step. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Back from XP overlay — clear step from nav stack ──────────────────────
  function handleBackToProject() {
    setXpVisible(false);
    // Pop back to ProjectDetail; React Navigation handles the stack cleanly
    navigation.goBack();
  }

  const alreadyDone = completed.includes(stepNumber);

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.hornbillGold} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[{ flex: 1 }, { opacity: fadeA }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: TAB_BAR_TOTAL_HEIGHT + SPACING.xxl,
            paddingTop:    insets.top + SPACING.sm,
          }}
        >
          {/* ── NAV ROW ───────────────────────────────────────────── */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.navBtn}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(SCREENS.AI_HELP, {
                  project,
                  step: step ? { id: step.id, title: step.title } : null,
                })
              }
              style={styles.aiBtn}
            >
              <Text style={styles.aiBtnText}>🤖 Ask AI</Text>
            </TouchableOpacity>
          </View>

          {/* ── SEGMENT PROGRESS ────────────────────────────────────── */}
          <View style={{ paddingHorizontal: SPACING.lg }}>
            <SegmentBar
              totalSteps={totalSteps}
              completed={completed}
              activeStep={stepNumber}
            />
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                Step {stepNumber} of {totalSteps} · {project?.title ?? 'Project'}
              </Text>
            </View>
          </View>

          {/* ── STEP HEADER ─────────────────────────────────────────── */}
          <View style={[GLASS.standard, styles.stepCard]}>
            <View style={styles.stepNumRow}>
              <View style={[styles.stepCircle, alreadyDone && styles.stepCircleDone]}>
                {alreadyDone
                  ? <Ionicons name="checkmark" size={18} color={COLORS.success} />
                  : <Text style={styles.stepCircleText}>{stepNumber}</Text>
                }
              </View>
              <Text style={styles.stepTitle}>{step?.title ?? `Step ${stepNumber}`}</Text>
            </View>
          </View>

          {/* ── INSTRUCTIONS ────────────────────────────────────────── */}
          <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
            <Text style={[TYPE.h3, { marginBottom: SPACING.md }]}>Instructions</Text>
            <Text style={TYPE.body}>{step?.instructions ?? 'No instructions provided.'}</Text>
          </View>

          {/* ── TIP CARD ────────────────────────────────────────────── */}
          {step?.tip ? (
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💡</Text>
              <Text style={styles.tipText}>{step.tip}</Text>
            </View>
          ) : (
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💡</Text>
              <Text style={styles.tipText}>
                Stuck? Tap "Ask AI" above to get a hint tailored to your question.
              </Text>
            </View>
          )}

          {/* ── STEP IMAGE ──────────────────────────────────────────── */}
          {step?.image_ref ? (
            <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
              <Image
                source={{ uri: step.image_ref }}
                style={styles.stepImage}
                resizeMode="cover"
              />
            </View>
          ) : null}

          {/* ── MATERIALS ───────────────────────────────────────────── */}
          {materials.length > 0 && (
            <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl }}>
              <Text style={[TYPE.h3, { marginBottom: SPACING.md }]}>Materials</Text>
              {materials.map((mat, i) => (
                <View key={mat.id ?? i} style={styles.materialRow}>
                  <Ionicons
                    name={mat.is_recyclable ? 'leaf-outline' : 'cube-outline'}
                    size={16}
                    color={mat.is_recyclable ? COLORS.success : COLORS.textCaption}
                  />
                  <Text style={[TYPE.body, { flex: 1 }]}>{mat.name}</Text>
                  {mat.is_recyclable && (
                    <Text style={styles.recycleTag}>♻ Recyclable</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* ── PROOF PHOTO ─────────────────────────────────────────── */}
          <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl }}>
            <Text style={[TYPE.h3, { marginBottom: SPACING.md }]}>
              Proof Photo <Text style={[TYPE.caption, { fontSize: 12 }]}>(optional)</Text>
            </Text>

            {photoUri ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.photoImg} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.removePhoto}
                  onPress={() => setPhotoUri(null)}
                >
                  <Ionicons name="close-circle" size={26} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoZone}>
                <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                  <Ionicons name="camera-outline" size={22} color={COLORS.aiCyan} />
                  <Text style={styles.photoBtnText}>Camera</Text>
                </TouchableOpacity>
                <View style={styles.photoDivider} />
                <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
                  <Ionicons name="image-outline" size={22} color={COLORS.aiCyan} />
                  <Text style={styles.photoBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── ERROR ───────────────────────────────────────────────── */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ── MARK DONE BUTTON ────────────────────────────────────── */}
          <View style={{ paddingHorizontal: SPACING.lg }}>
            {alreadyDone ? (
              <View style={styles.doneBadge}>
                <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                <Text style={styles.doneText}>Step Completed</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.markDoneBtn, submitting && { opacity: 0.7 }]}
                onPress={handleMarkDone}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting
                  ? <ActivityIndicator color={COLORS.white} />
                  : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.white} />
                      <Text style={styles.markDoneText}>Mark Step Done</Text>
                    </>
                  )
                }
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* ── XP OVERLAY — absolute, floats above everything ──────────── */}
      <XPOverlay
        visible={xpVisible}
        xp={awardedXp}
        onBack={handleBackToProject}
      />
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
  },

  // Nav
  navRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    marginBottom:      SPACING.md,
  },
  navBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius:    RADIUS.pill,
    padding:         SPACING.sm,
  },
  aiBtn: {
    backgroundColor:   COLORS.riverTeal,
    borderRadius:      RADIUS.pill,
    paddingVertical:   SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  aiBtnText: { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.white },

  // Step badge
  stepBadge: {
    alignSelf:         'flex-start',
    backgroundColor:   COLORS.cyanBgMid,
    borderRadius:      RADIUS.pill,
    paddingVertical:   4,
    paddingHorizontal: SPACING.md,
    marginBottom:      SPACING.md,
    borderWidth:       1,
    borderColor:       COLORS.cyanBorderLight,
  },
  stepBadgeText: { fontFamily: FONTS.body600, fontSize: 12, color: COLORS.aiCyan },

  // Step card
  stepCard: {
    marginHorizontal: SPACING.lg,
    borderRadius:     RADIUS.lg,
    padding:          SPACING.lg,
    marginBottom:     SPACING.lg,
  },
  stepNumRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  stepCircle: {
    width:           36,
    height:          36,
    borderRadius:    RADIUS.pill,
    backgroundColor: 'rgba(103,232,249,0.15)',
    borderWidth:     1,
    borderColor:     COLORS.aiCyan,
    justifyContent:  'center',
    alignItems:      'center',
  },
  stepCircleDone: { backgroundColor: COLORS.successBgStrong, borderColor: COLORS.success },
  stepCircleText: { fontFamily: FONTS.heading800, fontSize: 16, color: COLORS.aiCyan },
  stepTitle:      { flex: 1, fontFamily: FONTS.heading800, fontSize: 18, color: COLORS.textPrimary },

  // Tip
  tipCard: {
    flexDirection:     'row',
    alignItems:        'flex-start',
    backgroundColor:   COLORS.goldBg,
    borderRadius:      RADIUS.md,
    padding:           SPACING.md,
    marginHorizontal:  SPACING.lg,
    marginBottom:      SPACING.lg,
    borderWidth:       1,
    borderColor:       COLORS.goldBorder,
    gap:               SPACING.sm,
  },
  tipEmoji: { fontSize: 18 },
  tipText:  { flex: 1, fontFamily: FONTS.body400, fontSize: 13, color: COLORS.hornbillGold, lineHeight: 20 },

  // Step image
  stepImage: {
    width:        '100%',
    height:       200,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // Materials
  materialRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: SPACING.sm,
    gap:            SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  recycleTag: {
    fontFamily:      FONTS.body600,
    fontSize:        10,
    color:           COLORS.success,
    backgroundColor: COLORS.successBgMid,
    borderRadius:    RADIUS.pill,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },

  // Photo zone
  photoZone: {
    ...GLASS.standard,
    borderRadius:   RADIUS.lg,
    flexDirection:  'row',
    height:         90,
    overflow:       'hidden',
  },
  photoBtn: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    gap:            4,
  },
  photoBtnText: { fontFamily: FONTS.body600, fontSize: 12, color: COLORS.aiCyan },
  photoDivider: { width: 1, height: '60%', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  photoPreview: { position: 'relative', borderRadius: RADIUS.lg, overflow: 'hidden' },
  photoImg:     { width: '100%', height: 180, borderRadius: RADIUS.lg },
  removePhoto: {
    position:        'absolute',
    top:             SPACING.sm,
    right:           SPACING.sm,
    backgroundColor: COLORS.overlay50,
    borderRadius:    RADIUS.pill,
  },

  // Mark done
  markDoneBtn: {
    backgroundColor: COLORS.riverTeal,
    borderRadius:    RADIUS.lg,
    paddingVertical: 15,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             SPACING.sm,
  },
  markDoneText: { fontFamily: FONTS.heading800, fontSize: 16, color: COLORS.white },
  doneBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             SPACING.sm,
    paddingVertical: 14,
    backgroundColor: COLORS.successBg,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.successBorder,
  },
  doneText: { fontFamily: FONTS.heading800, fontSize: 16, color: COLORS.success },

  // Error
  errorBanner: {
    marginHorizontal:  SPACING.lg,
    marginBottom:      SPACING.md,
    backgroundColor:   COLORS.errorBg,
    borderRadius:      RADIUS.md,
    padding:           SPACING.md,
    borderWidth:       1,
    borderColor:       COLORS.errorBorder,
  },
  errorText: { fontFamily: FONTS.body400, fontSize: 13, color: COLORS.error, textAlign: 'center' },
});
