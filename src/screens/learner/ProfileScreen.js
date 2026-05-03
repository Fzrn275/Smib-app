// src/screens/learner/ProfileScreen.js
// s-profile — Learner profile with stats, settings list, and sign out.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                       from '../../context/AuthContext';
import { useLang }                       from '../../context/LanguageContext';
import { t }                             from '../../i18n/strings';
import { SCREENS, TAB_BAR_TOTAL_HEIGHT } from '../../navigation/navConstants';
import * as authService                  from '../../services/authService';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, SPRING,
  getRankTitle, calculateXpInLevel, XP_PER_LEVEL,
} from '../../theme';
import { getProgressSummary }   from '../../services/progressService';
import JuniorLearner from '../../models/JuniorLearner';
import SeniorLearner from '../../models/SeniorLearner';
import { getAchievements, getCertificates } from '../../services/achievementService';
import { getUnreadCount }       from '../../services/notificationService';

// ─── SETTINGS ROW ────────────────────────────────────────────────────────────

function SettingsRow({ icon, label, onPress, danger, badge }) {
  const scaleA = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.spring(scaleA, { toValue: 0.97, tension: 300, friction: 20, useNativeDriver: true }),
      Animated.spring(scaleA, { toValue: 1,    tension: 200, friction: 18, useNativeDriver: true }),
    ]).start(() => onPress?.());
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleA }] }}>
      <TouchableOpacity onPress={handlePress} style={sStyles.row} activeOpacity={0.85}>
        <View style={[sStyles.iconBox, danger && sStyles.iconBoxDanger]}>
          <Ionicons name={icon} size={18} color={danger ? COLORS.error : COLORS.aiCyan} />
        </View>
        <Text style={[sStyles.label, danger && { color: COLORS.error }]}>{label}</Text>
        {badge > 0 && (
          <View style={sStyles.badge}>
            <Text style={sStyles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
        {!danger && <Ionicons name="chevron-forward" size={16} color={COLORS.textLabel} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const sStyles = StyleSheet.create({
  row: {
    ...GLASS.standard,
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   RADIUS.md,
    padding:        SPACING.md,
    marginBottom:   SPACING.sm,
    gap:            SPACING.md,
  },
  iconBox: {
    width:           36,
    height:          36,
    borderRadius:    RADIUS.md,
    backgroundColor: COLORS.cyanBg,
    justifyContent:  'center',
    alignItems:      'center',
  },
  iconBoxDanger: { backgroundColor: COLORS.errorBgSubtle },
  label: { flex: 1, fontFamily: FONTS.body600, fontSize: 15, color: COLORS.textPrimary },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius:    RADIUS.pill,
    minWidth:        20,
    height:          20,
    justifyContent:  'center',
    alignItems:      'center',
    paddingHorizontal: 5,
  },
  badgeText: { fontFamily: FONTS.body700, fontSize: 11, color: COLORS.white },
});

// ─── SCREEN ──────────────────────────────────────────────────────────────────

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const { lang, toggleLanguage } = useLang();
  const insets = useSafeAreaInsets();

  const [summary,      setSummary]      = useState({ active: 0, completed: 0 });
  const [badgeCount,   setBadgeCount]   = useState(0);
  const [certCount,    setCertCount]    = useState(0);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [signingOut,   setSigningOut]   = useState(false);

  const fadeA = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [sum, ach, certs, unread] = await Promise.all([
        getProgressSummary(user.id),
        getAchievements(user.id),
        getCertificates(user.id),
        getUnreadCount(user.id),
      ]);
      setSummary(sum);
      setBadgeCount(ach.filter(a => a.type === 'badge').length);
      setCertCount(certs.length);
      setUnreadCount(unread);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
      Animated.spring(fadeA, {
        toValue: 1, tension: SPRING.default.tension, friction: SPRING.default.friction, useNativeDriver: true,
      }).start();
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.deleteAccount();
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  }

  async function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try { await signOut(); } catch { setSigningOut(false); }
          },
        },
      ]
    );
  }

  // Build learner model — use getRankTitle() instance method instead of standalone function
  const LearnerClass = user?.role === 'junior_learner' ? JuniorLearner : SeniorLearner;
  const learnerModel = user
    ? new LearnerClass(user.id, user.name, user.email, user.role, user.avatar_url,
        user.xp ?? 0, user.level ?? 1, user.school_name ?? '', user.grade_level ?? '')
    : null;
  const currentLevel = user?.level ?? 1;
  const rankTitle    = learnerModel ? learnerModel.getRankTitle() : getRankTitle(currentLevel);
  const initial      = (user?.name ?? 'L')[0].toUpperCase();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.hornbillGold} />
      </View>
    );
  }

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeA }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_TOTAL_HEIGHT + SPACING.xxl,
          paddingTop:    insets.top + SPACING.sm,
        }}
      >
        {/* ── PROFILE HEADER ─────────────────────────────────────── */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <LinearGradient
            colors={['#0E7490', '#0C4A6E']}
            style={styles.avatarRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </LinearGradient>

          {/* Name + role + level */}
          <Text style={styles.name}>{user?.name ?? 'Learner'}</Text>
          <Text style={TYPE.caption}>
            {user?.school_name ?? 'Student'} · Level {currentLevel}
          </Text>

          {/* Level badge */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>⭐ {rankTitle}</Text>
          </View>
        </View>

        {/* ── STATS ROW ──────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={[GLASS.stat, styles.statCard]}>
            <Text style={[styles.statNum, { color: COLORS.aiCyan }]}>
              {summary.completed}
            </Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={[GLASS.stat, styles.statCard]}>
            <Text style={[styles.statNum, { color: COLORS.hornbillGold }]}>
              {badgeCount}
            </Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={[GLASS.stat, styles.statCard]}>
            <Text style={[styles.statNum, { color: COLORS.success }]}>
              {certCount}
            </Text>
            <Text style={styles.statLabel}>Certs</Text>
          </View>
        </View>

        {/* ── XP BAR ─────────────────────────────────────────────── */}
        <View style={[GLASS.standard, styles.xpCard]}>
          <View style={styles.xpLabelRow}>
            <Text style={styles.xpLabel}>
              {(user?.xp ?? 0).toLocaleString()} XP total
            </Text>
            <Text style={[TYPE.caption, { color: COLORS.hornbillGold }]}>
              Level {currentLevel}
            </Text>
          </View>
          <View style={styles.xpBg}>
            <View style={[styles.xpFill, {
              width: `${Math.max((calculateXpInLevel(user?.xp ?? 0) / XP_PER_LEVEL) * 100, 2)}%`,
            }]} />
          </View>
        </View>

        {/* ── SETTINGS LIST ──────────────────────────────────────── */}
        <View style={{ paddingHorizontal: SPACING.lg }}>
          <Text style={styles.sectionLabel}>Account</Text>

          <SettingsRow
            icon="trophy-outline"
            label="Achievements"
            onPress={() => navigation.navigate(SCREENS.ACHIEVEMENTS)}
          />
          <SettingsRow
            icon="podium-outline"
            label="Leaderboard"
            onPress={() => navigation.navigate(SCREENS.LEADERBOARD)}
          />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            badge={unreadCount}
            onPress={() => navigation.navigate(SCREENS.NOTIFICATIONS)}
          />

          <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>Preferences</Text>
          <SettingsRow
            icon="language-outline"
            label={`${t(lang, 'language')} — ${lang === 'en' ? 'English' : 'Bahasa Malaysia'}`}
            onPress={toggleLanguage}
          />
          <SettingsRow
            icon="shield-outline"
            label={t(lang, 'privacySecurity')}
            onPress={() => navigation.navigate(SCREENS.PRIVACY_SECURITY)}
          />

          <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>Session</Text>
          <SettingsRow
            icon="log-out-outline"
            label={signingOut ? 'Signing out…' : t(lang, 'signOut')}
            danger
            onPress={handleSignOut}
          />
          <SettingsRow
            icon="trash-outline"
            label={t(lang, 'deleteAccount')}
            danger
            onPress={handleDeleteAccount}
          />
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  profileHeader: {
    alignItems:     'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom:  SPACING.xl,
    gap:            SPACING.sm,
  },
  avatarRing: {
    width:          88,
    height:         88,
    borderRadius:   RADIUS.pill,
    padding:        3,
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   SPACING.sm,
  },
  avatar: {
    width:           82,
    height:          82,
    borderRadius:    RADIUS.pill,
    backgroundColor: '#0C1A2E',
    justifyContent:  'center',
    alignItems:      'center',
  },
  avatarText: { fontFamily: FONTS.heading900, fontSize: 34, color: COLORS.white },
  name:       { fontFamily: FONTS.heading900, fontSize: 24, color: COLORS.textPrimary },
  levelBadge: {
    backgroundColor:   COLORS.goldBgStrong,
    borderRadius:      RADIUS.pill,
    paddingVertical:   5,
    paddingHorizontal: SPACING.md,
    borderWidth:       1,
    borderColor:       COLORS.goldBorder,
    marginTop:         SPACING.xs,
  },
  levelText: { fontFamily: FONTS.body700, fontSize: 13, color: COLORS.hornbillGold },

  statsRow: {
    flexDirection:     'row',
    paddingHorizontal: SPACING.lg,
    marginBottom:      SPACING.lg,
    gap:               SPACING.md,
  },
  statCard: {
    flex:           1,
    borderRadius:   RADIUS.lg,
    padding:        SPACING.md,
    alignItems:     'center',
    gap:            4,
  },
  statNum:   { fontFamily: FONTS.heading900, fontSize: 22 },
  statLabel: { fontFamily: FONTS.body600,    fontSize: 11, color: COLORS.textCaption },

  xpCard: {
    marginHorizontal: SPACING.lg,
    borderRadius:     RADIUS.lg,
    padding:          SPACING.md,
    marginBottom:     SPACING.xl,
    gap:              SPACING.sm,
  },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  xpLabel:    { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.textBody },
  xpBg: {
    height:          8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius:    RADIUS.pill,
    overflow:        'hidden',
  },
  xpFill: {
    height:          '100%',
    backgroundColor: COLORS.hornbillGold,
    borderRadius:    RADIUS.pill,
    minWidth:        4,
  },

  sectionLabel: {
    fontFamily:   FONTS.body700,
    fontSize:     11,
    color:        COLORS.textLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom:  SPACING.sm,
  },
});
