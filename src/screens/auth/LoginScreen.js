// src/screens/auth/LoginScreen.js
// Screen 01 — Login (Default + Error State)

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';
import { Ionicons }          from '@expo/vector-icons';

import * as authService from '../../services/authService';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS,
  GRADIENTS, BUTTONS, SPRING,
} from '../../theme';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus,  setPassFocus]  = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;

  function clearError() { if (error) setError(''); }

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.96, ...SPRING.default, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    ...SPRING.default, useNativeDriver: true }).start();

  async function handleSignIn() {
    if (loading) return;
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password)     { setError('Please enter your password.'); return; }
    setLoading(true);
    setError('');
    try {
      await authService.signIn(email.trim(), password);
      // AuthContext onAuthStateChange fires → RootNavigator routes automatically
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
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
            { paddingTop: insets.top + SPACING.xxl, paddingBottom: insets.bottom + SPACING.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🦅</Text>
            <Text style={styles.logoTitle}>S-MIB</Text>
            <Text style={styles.logoSub}>Sarawak Maker-In-A-Box</Text>
          </View>

          {/* Card */}
          <View style={[styles.card]}>
            <Text style={[TYPE.h2, { marginBottom: SPACING.xs }]}>Welcome back</Text>

            {/* Error banner */}
            {!!error && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning-outline" size={14} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <View style={{ gap: SPACING.xs }}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrap, emailFocus && styles.inputFocus]}>
                <Ionicons name="mail-outline" size={16} color={COLORS.textCaption} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={v => { setEmail(v); clearError(); }}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textLabel}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ gap: SPACING.xs }}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, passFocus && styles.inputFocus]}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.textCaption} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  value={password}
                  onChangeText={v => { setPassword(v); clearError(); }}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.textLabel}
                  secureTextEntry={!showPass}
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(p => !p)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textCaption} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ alignSelf: 'flex-end' }}
            >
              <Text style={styles.linkCyan}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                onPress={handleSignIn}
                onPressIn={pressIn}
                onPressOut={pressOut}
                disabled={loading}
                activeOpacity={1}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.white} size="small" />
                  : <Text style={styles.primaryBtnText}>Sign In</Text>
                }
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={[TYPE.caption, { marginHorizontal: SPACING.sm }]}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google SSO (UI only, disabled) */}
            <TouchableOpacity style={[styles.googleBtn]} disabled activeOpacity={1}>
              <Text style={styles.googleBtnText}>Continue with Google  (Coming soon)</Text>
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <View style={styles.footerRow}>
            <Text style={TYPE.caption}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RegisterStep1')}>
              <Text style={styles.linkCyan}>Register</Text>
            </TouchableOpacity>
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
    alignItems: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoEmoji: { fontSize: 56, marginBottom: SPACING.sm },
  logoTitle: {
    fontFamily: FONTS.heading900,
    fontSize: 32,
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  logoSub: {
    fontFamily: FONTS.body400,
    fontSize: 12,
    color: COLORS.textCaption,
    marginTop: 2,
  },
  card: {
    width: '100%',
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
    gap: SPACING.md,
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
    height: 48,
  },
  inputFocus: {
    borderTopColor: COLORS.inputBorderFocus,
    borderLeftColor: COLORS.inputBorderFocusLeft,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: {
    flex: 1,
    fontFamily: FONTS.body400,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  eyeBtn: {
    position: 'absolute',
    right: SPACING.md,
    padding: SPACING.xs,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  googleBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.45,
  },
  googleBtnText: {
    fontFamily: FONTS.body600,
    fontSize: 13,
    color: COLORS.textCaption,
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  linkCyan: {
    fontFamily: FONTS.body700,
    fontSize: 13,
    color: COLORS.aiCyan,
  },
});
