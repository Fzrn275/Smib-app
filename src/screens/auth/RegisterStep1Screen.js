// src/screens/auth/RegisterStep1Screen.js
// Screen 04 — Register Step 1 — Role Selection

import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';

import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS,
  GRADIENTS, BUTTONS, SPRING,
} from '../../theme';

const ROLES = [
  { key: 'junior_learner', label: 'Learner',  emoji: '🎓', desc: 'Learn STEM at your own pace' },
  { key: 'creator',        label: 'Creator',  emoji: '✏️',  desc: 'Upload and manage projects' },
  { key: 'parent',         label: 'Parent',   emoji: '👨‍👩‍👧', desc: "Monitor your child's progress" },
  { key: 'content_mentor', label: 'Mentor',   emoji: '🤝',  desc: 'Guide and answer questions' },
];

function RoleCard({ role, selected, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.95, ...SPRING.card, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    ...SPRING.card, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.roleCard, selected && styles.roleCardSelected]}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
      >
        {selected && (
          <View style={styles.checkmark}>
            <Text style={{ fontSize: 10 }}>✓</Text>
          </View>
        )}
        <Text style={styles.roleEmoji}>{role.emoji}</Text>
        <Text style={styles.roleLabel}>{role.label}</Text>
        <Text style={styles.roleDesc}>{role.desc}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RegisterStep1Screen({ navigation }) {
  const insets      = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);

  const canContinue = !!selected;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient {...GRADIENTS.background} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + SPACING.xl, paddingBottom: insets.bottom + SPACING.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Text style={styles.logoEmoji}>🦅</Text>
        <Text style={[TYPE.h1, { marginTop: SPACING.sm, textAlign: 'center' }]}>Create Account</Text>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        <Text style={[TYPE.body, { textAlign: 'center', marginBottom: SPACING.xl }]}>
          Step 1 of 2 — Choose your role
        </Text>

        {/* Role grid */}
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            {ROLES.slice(0, 2).map(r => (
              <RoleCard
                key={r.key}
                role={r}
                selected={selected === r.key}
                onPress={() => setSelected(r.key)}
              />
            ))}
          </View>
          <View style={styles.gridRow}>
            {ROLES.slice(2, 4).map(r => (
              <RoleCard
                key={r.key}
                role={r}
                selected={selected === r.key}
                onPress={() => setSelected(r.key)}
              />
            ))}
          </View>
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          disabled={!canContinue}
          onPress={() => navigation.navigate('RegisterStep2', { role: selected })}
        >
          <Text style={[styles.continueBtnText, !canContinue && { color: COLORS.textLabel }]}>
            Continue →
          </Text>
        </TouchableOpacity>

        {/* Sign in link */}
        <View style={styles.footerRow}>
          <Text style={TYPE.caption}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkCyan}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  logoEmoji: { fontSize: 40 },
  dotsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.hornbillGold,
  },
  grid: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
    minHeight: 120,
    justifyContent: 'center',
  },
  roleCardSelected: {
    borderTopColor: COLORS.hornbillGold,
    borderLeftColor: COLORS.hornbillGold,
    borderRightColor: 'rgba(245,158,11,0.4)',
    borderBottomColor: 'rgba(245,158,11,0.4)',
    backgroundColor: COLORS.goldBg,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.hornbillGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleEmoji: { fontSize: 28 },
  roleLabel: {
    fontFamily: FONTS.heading800,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  roleDesc: {
    fontFamily: FONTS.body400,
    fontSize: 11,
    color: COLORS.textCaption,
    textAlign: 'center',
  },
  continueBtn: {
    width: '100%',
    backgroundColor: BUTTONS.variants.primary.backgroundColor,
    borderRadius: RADIUS.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  continueBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  continueBtnText: {
    fontFamily: FONTS.heading800,
    fontSize: 15,
    color: COLORS.white,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkCyan: {
    fontFamily: FONTS.body700,
    fontSize: 13,
    color: COLORS.aiCyan,
  },
});
