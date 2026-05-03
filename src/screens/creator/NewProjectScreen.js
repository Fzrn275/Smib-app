// src/screens/creator/NewProjectScreen.js
// Screen 22 — c-newproject — New Project Form

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                                from '../../context/AuthContext';
import { createProject, getCreatorRowByUserId }  from '../../services/projectService';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, BUTTONS, GRADIENTS, SPRING,
} from '../../theme';

const CATEGORIES  = ['Electronics', 'Agriculture', 'Renewable', 'Coding', 'Biology'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const TYPES        = ['Guided', 'Open'];

function InlinePicker({ label, options, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputWrap, error && styles.inputError]}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}
      >
        <Text style={[styles.pickerText, !value && { color: COLORS.textLabel }]}>
          {value || `Select ${label.replace(' *', '')}`}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textCaption} />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.dropdownItem, value === opt && styles.dropdownItemActive]}
              onPress={() => { onChange(opt); setOpen(false); }}
            >
              <Text style={[styles.dropdownText, value === opt && { color: COLORS.hornbillGold }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {!!error && <Text style={styles.fieldError}>⚠ {error}</Text>}
    </View>
  );
}

function Field({ label, error, children }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {!!error && <Text style={styles.fieldError}>⚠ {error}</Text>}
    </View>
  );
}

export default function NewProjectScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [title,       setTitle]       = useState('');
  const [category,    setCategory]    = useState('');
  const [difficulty,  setDifficulty]  = useState('');
  const [type,        setType]        = useState('');
  const [duration,    setDuration]    = useState('');
  const [description, setDescription] = useState('');
  const [tags,        setTags]        = useState('');
  const [youtubeUrl,  setYoutubeUrl]  = useState('');
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState({});

  const btnScale = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.96, ...SPRING.default, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    ...SPRING.default, useNativeDriver: true }).start();

  function validate() {
    const e = {};
    if (!title.trim())    e.title    = 'Project title is required.';
    if (!category)        e.category = 'Please select a category.';
    if (!difficulty)      e.difficulty = 'Please select a difficulty.';
    if (!type)            e.type     = 'Please select a project type.';
    return e;
  }

  async function handleSave() {
    if (loading) return;
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const creatorRow = await getCreatorRowByUserId(user.id);

      const project = await createProject(creatorRow.id, {
        title:              title.trim(),
        category:           category.toLowerCase(),
        difficulty:         difficulty.toLowerCase(),
        type:               type.toLowerCase(),
        estimated_duration: duration ? parseInt(duration, 10) : null,
        description:        description.trim() || null,
        tags:               tags.split(',').map(t => t.trim()).filter(Boolean),
        youtube_url:        youtubeUrl.trim() || null,
        status:             'draft',
      });
      navigation.navigate('EditProject', { projectId: project.id });
    } catch (err) {
      setErrors({ form: err.message || 'Could not create project. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient {...GRADIENTS.background} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + SPACING.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={TYPE.h2}>New Project</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={[styles.card, { gap: SPACING.md }]}>
            {!!errors.form && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning-outline" size={14} color={COLORS.error} />
                <Text style={styles.errorText}>{errors.form}</Text>
              </View>
            )}

            <Field label="Project Title *" error={errors.title}>
              <View style={[styles.inputWrap, errors.title && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={v => { setTitle(v); if (errors.title) setErrors(p => ({ ...p, title: '' })); }}
                  placeholder="Enter project title"
                  placeholderTextColor={COLORS.textLabel}
                />
              </View>
            </Field>

            <InlinePicker
              label="Category *"
              options={CATEGORIES}
              value={category}
              onChange={v => { setCategory(v); if (errors.category) setErrors(p => ({ ...p, category: '' })); }}
              error={errors.category}
            />

            <InlinePicker
              label="Difficulty *"
              options={DIFFICULTIES}
              value={difficulty}
              onChange={v => { setDifficulty(v); if (errors.difficulty) setErrors(p => ({ ...p, difficulty: '' })); }}
              error={errors.difficulty}
            />

            <InlinePicker
              label="Project Type *"
              options={TYPES}
              value={type}
              onChange={v => { setType(v); if (errors.type) setErrors(p => ({ ...p, type: '' })); }}
              error={errors.type}
            />

            <Field label="Estimated Duration (minutes)">
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="e.g. 60"
                  placeholderTextColor={COLORS.textLabel}
                  keyboardType="number-pad"
                />
              </View>
            </Field>

            <Field label="Description">
              <View style={[styles.inputWrap, { height: 100, alignItems: 'flex-start', paddingVertical: SPACING.sm }]}>
                <TextInput
                  style={[styles.input, { height: '100%' }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe what learners will build..."
                  placeholderTextColor={COLORS.textLabel}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </Field>

            <Field label="Tags (comma-separated)">
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={tags}
                  onChangeText={setTags}
                  placeholder="solar, renewable, DIY"
                  placeholderTextColor={COLORS.textLabel}
                />
              </View>
            </Field>

            <Field label="YouTube Tutorial URL (optional)">
              <View style={styles.inputWrap}>
                <Ionicons name="logo-youtube" size={16} color={COLORS.textCaption} style={{ marginRight: SPACING.sm }} />
                <TextInput
                  style={styles.input}
                  value={youtubeUrl}
                  onChangeText={setYoutubeUrl}
                  placeholder="https://youtube.com/watch?v=..."
                  placeholderTextColor={COLORS.textLabel}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </Field>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={14} color={COLORS.aiCyan} />
              <Text style={[TYPE.caption, { flex: 1, lineHeight: 18 }]}>
                Steps are added after saving the project metadata.
              </Text>
            </View>

            {/* Save button */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                onPress={handleSave}
                onPressIn={pressIn}
                onPressOut={pressOut}
                disabled={loading}
                activeOpacity={1}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.white} size="small" />
                  : <Text style={styles.primaryBtnText}>Save & Add Steps →</Text>
                }
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.xl },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)',
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.xl, padding: SPACING.xl,
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
  input: {
    flex: 1, fontFamily: FONTS.body400, fontSize: 14, color: COLORS.textPrimary,
  },
  pickerText: { flex: 1, fontFamily: FONTS.body400, fontSize: 14, color: COLORS.textPrimary },
  fieldError: { fontFamily: FONTS.body400, fontSize: 11, color: COLORS.errorLight },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.errorBg,
    borderWidth: 1, borderColor: COLORS.errorBorder,
    borderRadius: RADIUS.sm, padding: SPACING.sm,
  },
  errorText: { fontFamily: FONTS.body400, fontSize: 12, color: COLORS.errorLight, flex: 1 },
  dropdown: {
    backgroundColor: COLORS.cardDark, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    marginTop: 4, overflow: 'hidden', zIndex: 10,
  },
  dropdownItem: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  dropdownItemActive: { backgroundColor: COLORS.goldBg },
  dropdownText: { fontFamily: FONTS.body400, fontSize: 14, color: COLORS.textPrimary },
  infoBox: {
    flexDirection: 'row', gap: SPACING.xs, alignItems: 'flex-start',
    backgroundColor: COLORS.cyanBgSubtle,
    borderRadius: RADIUS.sm, padding: SPACING.sm,
  },
  primaryBtn: {
    backgroundColor: BUTTONS.variants.primary.backgroundColor,
    borderRadius: RADIUS.md, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { fontFamily: FONTS.heading800, fontSize: 15, color: COLORS.white },
});
