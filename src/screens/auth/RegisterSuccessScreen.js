// src/screens/auth/RegisterSuccessScreen.js
// Screen 06 — Registration Success

import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';

import { useAuth } from '../../context/AuthContext';
import {
  COLORS, FONTS, TYPE, SPACING, RADIUS, GRADIENTS, BUTTONS, SPRING,
} from '../../theme';

const ROLE_LABELS = {
  junior_learner: 'Learner',
  senior_learner: 'Learner',
  creator:        'Creator',
  verified_creator: 'Verified Creator',
  content_mentor: 'Mentor',
  parent:         'Parent',
};

export default function RegisterSuccessScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { setJustRegistered } = useAuth();
  const name = route?.params?.name ?? 'Maker';
  const role = route?.params?.role ?? 'junior_learner';

  const logoScale  = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, tension: 180, friction: 16, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  function handleStart() {
    setJustRegistered(false);
    // RootNavigator auto-routes based on the now-active session + role
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient {...GRADIENTS.background} style={StyleSheet.absoluteFill} />
      <View style={[styles.container, { paddingTop: insets.top + SPACING.xxl, paddingBottom: insets.bottom + SPACING.xl }]}>
        {/* Animated logo */}
        <Animated.View style={{ transform: [{ scale: logoScale }], alignItems: 'center', marginBottom: SPACING.xl }}>
          <Text style={styles.logoEmoji}>🦅</Text>
        </Animated.View>

        {/* Content fades in after logo */}
        <Animated.View style={[styles.contentWrap, { opacity: contentAnim }]}>
          <Text style={[TYPE.h1, { textAlign: 'center' }]}>Welcome to S-MIB!</Text>
          <Text style={[TYPE.body, { textAlign: 'center', marginTop: SPACING.sm }]}>{name}</Text>

          {/* Role badge */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{ROLE_LABELS[role] ?? role}</Text>
          </View>

          <Text style={[TYPE.body, { textAlign: 'center', marginTop: SPACING.lg, lineHeight: 22 }]}>
            Your account is ready. Start exploring STEM projects and begin your maker journey!
          </Text>

          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>Start Exploring →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 80 },
  contentWrap: {
    alignItems: 'center',
    width: '100%',
  },
  roleBadge: {
    backgroundColor: 'rgba(14,116,144,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(14,116,144,0.5)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    marginTop: SPACING.md,
  },
  roleBadgeText: {
    fontFamily: FONTS.body600,
    fontSize: 13,
    color: COLORS.aiCyan,
  },
  startBtn: {
    marginTop: SPACING.xl,
    backgroundColor: BUTTONS.variants.primary.backgroundColor,
    borderRadius: RADIUS.md,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    fontFamily: FONTS.heading800,
    fontSize: 16,
    color: COLORS.white,
  },
});
