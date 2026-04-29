// src/screens/creator/EditProjectScreen.js
// Screen 23 — c-editproject — Edit Project + Add Steps

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import {
  getProjectById, getProjectSteps,
  updateProject, addStep,
} from '../../services/projectService';
import {
  COLORS, FONTS, TYPE, SPACING, RADIUS, BUTTONS,
} from '../../theme';

function Field({ label, children }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export default function EditProjectScreen({ navigation, route }) {
  const insets    = useSafeAreaInsets();
  const projectId = route?.params?.projectId;

  const [project,     setProject]     = useState(null);
  const [steps,       setSteps]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [publishing,  setPublishing]  = useState(false);
  const [error,       setError]       = useState('');
  const [toast,       setToast]       = useState('');

  // Add step modal
  const [stepModal,   setStepModal]   = useState(false);
  const [stepTitle,   setStepTitle]   = useState('');
  const [stepInstr,   setStepInstr]   = useState('');
  const [stepImg,     setStepImg]     = useState('');
  const [stepErrors,  setStepErrors]  = useState({});
  const [addingStep,  setAddingStep]  = useState(false);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      const [proj, stps] = await Promise.all([
        getProjectById(projectId),
        getProjectSteps(projectId),
      ]);
      setProject(proj);
      setSteps(stps);
    } catch (err) {
      setError(err.message || 'Could not load project.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      await updateProject(projectId, { status: 'published' });
      setProject(p => ({ ...p, status: 'published' }));
      showToast('🎉 Your project is now live!');
    } catch (err) {
      setError(err.message || 'Could not publish project.');
    } finally {
      setPublishing(false);
    }
  }

  async function handleAddStep() {
    const e = {};
    if (!stepTitle.trim())  e.title = 'Step title is required.';
    if (!stepInstr.trim())  e.instr = 'Instructions are required.';
    if (Object.keys(e).length > 0) { setStepErrors(e); return; }

    setAddingStep(true);
    try {
      const newStep = await addStep(projectId, {
        step_number:  steps.length + 1,
        title:        stepTitle.trim(),
        instructions: stepInstr.trim(),
        image_ref:    stepImg.trim() || null,
      });
      setSteps(prev => [...prev, newStep]);
      setStepModal(false);
      setStepTitle(''); setStepInstr(''); setStepImg('');
      showToast('Step added!');
    } catch (err) {
      setStepErrors({ form: err.message || 'Could not add step.' });
    } finally {
      setAddingStep(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.aiCyan} size="large" /></View>;

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
          <Text style={[TYPE.h2, { flex: 1, marginHorizontal: SPACING.sm }]}>Edit Project</Text>
          <TouchableOpacity
            style={[styles.publishBtn, publishing && { opacity: 0.6 }]}
            onPress={handlePublish}
            disabled={publishing || project?.status === 'published'}
          >
            {publishing
              ? <ActivityIndicator color={COLORS.white} size="small" />
              : <Text style={styles.publishBtnText}>
                  {project?.status === 'published' ? '✓ Live' : 'Publish'}
                </Text>
            }
          </TouchableOpacity>
        </View>

        {/* Toast */}
        {!!toast && (
          <View style={styles.toastBanner}>
            <Text style={{ fontFamily: FONTS.body600, fontSize: 13, color: COLORS.white }}>{toast}</Text>
          </View>
        )}

        {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}

        {/* Project summary card */}
        {project && (
          <View style={styles.summaryCard}>
            <View style={{ flex: 1 }}>
              <Text style={[TYPE.h3, { marginBottom: 2 }]} numberOfLines={1}>{project.title}</Text>
              <Text style={TYPE.caption}>{project.category} · {project.difficulty}</Text>
            </View>
            <View style={[styles.statusBadge, {
              backgroundColor: project.status === 'published' ? COLORS.successBgStrong : COLORS.goldBgMid,
            }]}>
              <Text style={{
                fontFamily: FONTS.body600, fontSize: 11,
                color: project.status === 'published' ? COLORS.success : COLORS.hornbillGold,
              }}>
                {project.status === 'published' ? 'Published' : 'Draft'}
              </Text>
            </View>
          </View>
        )}

        {project?.status === 'published' && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={14} color={COLORS.hornbillGold} />
            <Text style={[TYPE.caption, { flex: 1, lineHeight: 18 }]}>
              This project has enrolled students. Major changes may affect their progress.
            </Text>
          </View>
        )}

        {/* Steps section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={TYPE.h3}>Steps ({steps.length})</Text>
            <TouchableOpacity style={styles.addStepBtn} onPress={() => setStepModal(true)}>
              <Ionicons name="add" size={16} color={COLORS.white} />
              <Text style={styles.addStepText}>Add Step</Text>
            </TouchableOpacity>
          </View>

          {steps.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={TYPE.body}>No steps yet. Add your first step!</Text>
            </View>
          ) : (
            steps.map((step, idx) => (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>{step.step_number}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[TYPE.h3, { fontSize: 13 }]} numberOfLines={1}>{step.title}</Text>
                  <Text style={TYPE.caption} numberOfLines={1}>{step.instructions}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Save & View button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => navigation.navigate('CreatorProjectDetail', { projectId })}
        >
          <Text style={styles.saveBtnText}>Save & View Project</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Step Modal */}
      <Modal visible={stepModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { paddingBottom: insets.bottom + SPACING.xl }]}>
              <View style={styles.modalHeader}>
                <Text style={TYPE.h3}>Add Step {steps.length + 1}</Text>
                <TouchableOpacity
                  onPress={() => { setStepModal(false); setStepErrors({}); setStepTitle(''); setStepInstr(''); setStepImg(''); }}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={20} color={COLORS.textCaption} />
                </TouchableOpacity>
              </View>

              {!!stepErrors.form && (
                <View style={styles.errorCard}><Text style={styles.errorText}>{stepErrors.form}</Text></View>
              )}

              <View style={{ gap: SPACING.md }}>
                <Field label="Step Title *">
                  <View style={[styles.inputWrap, stepErrors.title && styles.inputError]}>
                    <TextInput
                      style={styles.input}
                      value={stepTitle}
                      onChangeText={v => { setStepTitle(v); if (stepErrors.title) setStepErrors(p => ({ ...p, title: '' })); }}
                      placeholder="e.g. Assemble the circuit"
                      placeholderTextColor={COLORS.textLabel}
                    />
                  </View>
                  {!!stepErrors.title && <Text style={styles.fieldError}>⚠ {stepErrors.title}</Text>}
                </Field>

                <Field label="Instructions *">
                  <View style={[styles.inputWrap, { height: 90, alignItems: 'flex-start', paddingVertical: SPACING.sm }, stepErrors.instr && styles.inputError]}>
                    <TextInput
                      style={[styles.input, { height: '100%' }]}
                      value={stepInstr}
                      onChangeText={v => { setStepInstr(v); if (stepErrors.instr) setStepErrors(p => ({ ...p, instr: '' })); }}
                      placeholder="Step-by-step instructions for the learner..."
                      placeholderTextColor={COLORS.textLabel}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                  {!!stepErrors.instr && <Text style={styles.fieldError}>⚠ {stepErrors.instr}</Text>}
                </Field>

                <Field label="Image Reference (optional)">
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      value={stepImg}
                      onChangeText={setStepImg}
                      placeholder="URL or file reference"
                      placeholderTextColor={COLORS.textLabel}
                      autoCapitalize="none"
                    />
                  </View>
                </Field>

                <TouchableOpacity
                  style={[styles.primaryBtn, addingStep && { opacity: 0.6 }]}
                  onPress={handleAddStep}
                  disabled={addingStep}
                >
                  {addingStep
                    ? <ActivityIndicator color={COLORS.white} size="small" />
                    : <Text style={styles.primaryBtnText}>Add Step</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll:  { paddingHorizontal: SPACING.xl },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:  { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  backBtn: {
    width: 36, height: 36, borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  publishBtn: {
    backgroundColor: BUTTONS.variants.primary.backgroundColor,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg,
    height: 36, alignItems: 'center', justifyContent: 'center',
  },
  publishBtnText: { fontFamily: FONTS.heading800, fontSize: 13, color: COLORS.white },
  toastBanner: {
    backgroundColor: COLORS.riverTeal, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md, alignItems: 'center',
  },
  errorCard: {
    backgroundColor: COLORS.errorBgSubtle, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  errorText: { fontFamily: FONTS.body400, fontSize: 13, color: COLORS.errorLight },
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md,
  },
  statusBadge: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 4 },
  warningBox: {
    flexDirection: 'row', gap: SPACING.xs, alignItems: 'flex-start',
    backgroundColor: COLORS.goldBg,
    borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.lg,
  },
  section:       { marginBottom: SPACING.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  addStepBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: BUTTONS.variants.primary.backgroundColor,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 32,
  },
  addStepText: { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.white },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.lg,
    padding: SPACING.xl, alignItems: 'center',
  },
  stepRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm,
  },
  stepNumCircle: {
    width: 32, height: 32, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.riverTeal,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontFamily: FONTS.heading800, fontSize: 13, color: COLORS.white },
  saveBtn: {
    backgroundColor: BUTTONS.variants.primary.backgroundColor,
    borderRadius: RADIUS.md, height: 50,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg,
  },
  saveBtnText: { fontFamily: FONTS.heading800, fontSize: 15, color: COLORS.white },
  modalBackdrop: {
    flex: 1, backgroundColor: COLORS.overlay50, justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.cardDark,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
    padding: SPACING.xl, gap: SPACING.md,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn: {
    width: 32, height: 32, borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontFamily: FONTS.body600, fontSize: 12, color: COLORS.textCaption },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)',
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 48,
  },
  inputError: {
    borderTopColor: COLORS.inputBorderError,
    borderLeftColor: COLORS.inputBorderErrorLeft,
  },
  input: { flex: 1, fontFamily: FONTS.body400, fontSize: 14, color: COLORS.textPrimary },
  fieldError: { fontFamily: FONTS.body400, fontSize: 11, color: COLORS.errorLight },
  primaryBtn: {
    backgroundColor: BUTTONS.variants.primary.backgroundColor,
    borderRadius: RADIUS.md, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { fontFamily: FONTS.heading800, fontSize: 15, color: COLORS.white },
});
