// src/screens/auth/RegisterStep2Screen.js
// Screen 05 — Register Step 2 — User details form

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }      from '../../context/AuthContext';
import * as authService from '../../services/authService';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS,
  GRADIENTS, BUTTONS, SPRING,
} from '../../theme';

const GRADE_OPTIONS = [
  'Year 4', 'Year 5', 'Year 6',
  'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6',
  'Others',
];

const ROLE_LABELS = {
  junior_learner: 'Learner',
  creator:        'Creator',
  parent:         'Parent',
  content_mentor: 'Mentor',
};

function GradePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={styles.inputWrap}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}
      >
        <Ionicons name="school-outline" size={16} color={COLORS.textCaption} style={{ marginRight: SPACING.sm }} />
        <Text style={[styles.input, !value && { color: COLORS.textLabel }]}>
          {value || 'Select grade / form level'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textCaption} />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {GRADE_OPTIONS.map(opt => (
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
    </View>
  );
}

function Field({ label, error, children }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {!!error && (
        <Text style={styles.fieldError}>⚠ {error}</Text>
      )}
    </View>
  );
}

export default function RegisterStep2Screen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { setJustRegistered, fetchUserProfile } = useAuth();
  const role = route?.params?.role ?? 'junior_learner';

  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [grade,       setGrade]       = useState('');
  const [school,      setSchool]      = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [terms,       setTerms]       = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [showConf,    setShowConf]    = useState(false);
  const [loading,     setLoading]     = useState(false);

  const [errors, setErrors] = useState({});

  const btnScale = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.96, ...SPRING.default, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    ...SPRING.default, useNativeDriver: true }).start();

  function validate() {
    const e = {};
    if (!name.trim())            e.name     = 'Full name is required.';
    if (!email.trim())           e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address.';
    if (!password)               e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (password !== confirm)    e.confirm  = 'Passwords do not match.';
    return e;
  }

  async function handleCreate() {
    if (loading) return;
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (!terms) { setErrors({ terms: 'You must accept the Terms & Conditions.' }); return; }
    setErrors({});

    // Rule 7: setJustRegistered BEFORE signUp to prevent nav race
    setJustRegistered(true);
    setLoading(true);
    try {
      const result = await authService.signUp({
        name:       name.trim(),
        email:      email.trim(),
        password,
        role,
        gradeLevel: grade || null,
        schoolName: school.trim() || null,
      });
      // onAuthStateChange may fire before the users table row is inserted.
      // Re-fetch now that all DB writes are complete so user/role are set
      // before the success screen transitions to the app.
      if (result?.user?.id) {
        await fetchUserProfile(result.user.id);
      }
      navigation.navigate('RegisterSuccess', { name: name.trim(), role });
    } catch (err) {
      setJustRegistered(false);
      setErrors({ form: err.message || 'Registration failed. Please try again.' });
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
          {/* Back + title */}
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={TYPE.h2}>Create Account</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotDone]} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
          <Text style={[TYPE.caption, { textAlign: 'center', marginBottom: SPACING.lg }]}>
            Step 2 of 2 — Your details ({ROLE_LABELS[role] ?? role})
          </Text>

          {/* Form */}
          <View style={[styles.card, { gap: SPACING.md }]}>

            {!!errors.form && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning-outline" size={14} color={COLORS.error} />
                <Text style={styles.errorText}>{errors.form}</Text>
              </View>
            )}

            <Field label="Full Name *" error={errors.name}>
              <View style={[styles.inputWrap, errors.name && styles.inputError]}>
                <Ionicons name="person-outline" size={16} color={COLORS.textCaption} style={{ marginRight: SPACING.sm }} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={v => { setName(v); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
                  placeholder="Your full name"
                  placeholderTextColor={COLORS.textLabel}
                  autoCorrect={false}
                />
              </View>
            </Field>

            <Field label="Email *" error={errors.email}>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={16} color={COLORS.textCaption} style={{ marginRight: SPACING.sm }} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={v => { setEmail(v); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textLabel}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </Field>

            <Field label="Grade / Form Level">
              <GradePicker value={grade} onChange={setGrade} />
            </Field>

            <Field label="School Name">
              <View style={styles.inputWrap}>
                <Ionicons name="business-outline" size={16} color={COLORS.textCaption} style={{ marginRight: SPACING.sm }} />
                <TextInput
                  style={styles.input}
                  value={school}
                  onChangeText={setSchool}
                  placeholder="Your school name (optional)"
                  placeholderTextColor={COLORS.textLabel}
                />
              </View>
            </Field>

            <Field label="Password *" error={errors.password}>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.textCaption} style={{ marginRight: SPACING.sm }} />
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  value={password}
                  onChangeText={v => { setPassword(v); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={COLORS.textLabel}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(p => !p)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textCaption} />
                </TouchableOpacity>
              </View>
            </Field>

            <Field label="Confirm Password *" error={errors.confirm}>
              <View style={[styles.inputWrap, errors.confirm && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.textCaption} style={{ marginRight: SPACING.sm }} />
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  value={confirm}
                  onChangeText={v => { setConfirm(v); if (errors.confirm) setErrors(p => ({ ...p, confirm: '' })); }}
                  placeholder="Re-enter password"
                  placeholderTextColor={COLORS.textLabel}
                  secureTextEntry={!showConf}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConf(p => !p)}>
                  <Ionicons name={showConf ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textCaption} />
                </TouchableOpacity>
              </View>
            </Field>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => { setTerms(t => !t); if (errors.terms) setErrors(p => ({ ...p, terms: '' })); }}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, terms && styles.checkboxChecked]}>
                {terms && <Ionicons name="checkmark" size={12} color={COLORS.deepNavy} />}
              </View>
              <Text style={[TYPE.caption, { flex: 1, lineHeight: 18 }]}>
                I agree to the Terms & Conditions and Privacy Policy
              </Text>
            </TouchableOpacity>
            {!!errors.terms && <Text style={styles.fieldError}>⚠ {errors.terms}</Text>}

            {/* Create Account button */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={[styles.primaryBtn, (loading || !terms) && { opacity: 0.6 }]}
                onPress={handleCreate}
                onPressIn={pressIn}
                onPressOut={pressOut}
                disabled={loading || !terms}
                activeOpacity={1}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.white} size="small" />
                  : <Text style={styles.primaryBtnText}>Create Account</Text>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: { width: 24, backgroundColor: COLORS.hornbillGold },
  dotDone:   { backgroundColor: COLORS.riverTeal },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  label: {
    fontFamily: FONTS.body600,
    fontSize: 12,
    color: COLORS.textCaption,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  inputError: {
    borderTopColor: COLORS.inputBorderError,
    borderLeftColor: COLORS.inputBorderErrorLeft,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.body400,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  eyeBtn: {
    position: 'absolute',
    right: SPACING.md,
    padding: SPACING.xs,
  },
  fieldError: {
    fontFamily: FONTS.body400,
    fontSize: 11,
    color: COLORS.errorLight,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  errorText: {
    fontFamily: FONTS.body400,
    fontSize: 12,
    color: COLORS.errorLight,
    flex: 1,
  },
  dropdown: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginTop: 4,
    overflow: 'hidden',
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  dropdownItemActive: { backgroundColor: COLORS.goldBg },
  dropdownText: {
    fontFamily: FONTS.body400,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: COLORS.hornbillGold,
    borderColor: COLORS.hornbillGold,
  },
  primaryBtn: {
    backgroundColor: BUTTONS.variants.primary.backgroundColor,
    borderRadius: RADIUS.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: FONTS.heading800,
    fontSize: 15,
    color: COLORS.white,
  },
});
