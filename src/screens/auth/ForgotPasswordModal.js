// src/screens/auth/ForgotPasswordModal.js
// Screen 03 — Forgot Password (bottom-sheet modal)

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import * as authService from '../../services/authService';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, BUTTONS, SPRING,
} from '../../theme';

export default function ForgotPasswordModal({ navigation }) {
  const insets = useSafeAreaInsets();

  const [email,    setEmail]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);
  const [focused,  setFocused]  = useState(false);

  const slideY   = useRef(new Animated.Value(400)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(slideY, { toValue: 0, tension: 200, friction: 22, useNativeDriver: true }).start();
  }, []);

  function dismiss() {
    Animated.spring(slideY, { toValue: 400, tension: 200, friction: 22, useNativeDriver: true }).start(() => navigation.goBack());
  }

  async function handleSend() {
    if (loading) return;
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.96, ...SPRING.default, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    ...SPRING.default, useNativeDriver: true }).start();

  return (
    <View style={styles.backdrop}>
      {/* Tap outside to dismiss */}
      <TouchableWithoutFeedback onPress={dismiss}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kavWrap}
      >
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + SPACING.xl },
            { transform: [{ translateY: slideY }] },
          ]}
        >
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={TYPE.h2}>Reset Password</Text>
            <TouchableOpacity onPress={dismiss} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textCaption} />
            </TouchableOpacity>
          </View>

          {success ? (
            <View style={styles.successWrap}>
              <Text style={styles.successEmoji}>📬</Text>
              <Text style={[TYPE.h3, { textAlign: 'center', marginTop: SPACING.md }]}>Check your email</Text>
              <Text style={[TYPE.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
                A password reset link has been sent to {email}
              </Text>
              <TouchableOpacity style={[styles.primaryBtn, { marginTop: SPACING.xl }]} onPress={dismiss}>
                <Text style={styles.primaryBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: SPACING.md }}>
              <Text style={TYPE.body}>Enter your email address and we'll send you a reset link.</Text>

              {!!error && (
                <View style={styles.errorBanner}>
                  <Ionicons name="warning-outline" size={14} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={{ gap: SPACING.xs }}>
                <Text style={styles.label}>Email address</Text>
                <View style={[styles.inputWrap, focused && styles.inputFocus]}>
                  <Ionicons name="mail-outline" size={16} color={COLORS.textCaption} style={{ marginRight: SPACING.sm }} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={v => { setEmail(v); if (error) setError(''); }}
                    placeholder="your@email.com"
                    placeholderTextColor={COLORS.textLabel}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                  />
                </View>
              </View>

              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                  style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                  onPress={handleSend}
                  onPressIn={pressIn}
                  onPressOut={pressOut}
                  disabled={loading}
                  activeOpacity={1}
                >
                  {loading
                    ? <ActivityIndicator color={COLORS.white} size="small" />
                    : <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                  }
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay50,
    justifyContent: 'flex-end',
  },
  kavWrap: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.cardDark,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  closeBtn: {
    padding: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.pill,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  input: {
    flex: 1,
    fontFamily: FONTS.body400,
    fontSize: 14,
    color: COLORS.textPrimary,
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
  successWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  successEmoji: { fontSize: 48 },
});
