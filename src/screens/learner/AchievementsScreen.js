// src/screens/learner/AchievementsScreen.js
// s-achieve — Badge grid (earned + locked) and certificate section.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                       from '../../context/AuthContext';
import { SCREENS, TAB_BAR_TOTAL_HEIGHT } from '../../navigation/navConstants';
import { LinearGradient } from 'expo-linear-gradient';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, SPRING, BADGE_TIERS, GRADIENTS,
} from '../../theme';
import { getAchievements, getCertificates } from '../../services/achievementService';
import Achievement from '../../models/Achievement';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W   = (SCREEN_W - SPACING.lg * 2 - SPACING.md) / 2;

// ─── BADGE DEFINITIONS ───────────────────────────────────────────────────────
// All possible badges in the system. Earned ones are matched by trigger_type.

const ALL_BADGES = [
  { trigger: 'first_project',    emoji: '🚀', title: 'First Steps!',    tier: 'bronze', desc: 'Enrolled in first project' },
  { trigger: 'first_completion', emoji: '🏆', title: 'Project Complete', tier: 'silver', desc: 'Completed first project' },
  { trigger: 'streak_7',         emoji: '🔥', title: 'Week Warrior',     tier: 'silver', desc: '7-day learning streak' },
  { trigger: 'streak_30',        emoji: '💎', title: 'Monthly Maker',    tier: 'gold',   desc: '30-day streak' },
  { trigger: 'category_complete',emoji: '⭐', title: 'Category Master',  tier: 'gold',   desc: 'All projects in a category' },
  { trigger: 'level_5',          emoji: '🎯', title: 'Halfway There',    tier: 'silver', desc: 'Reached Level 5' },
  { trigger: 'level_10',         emoji: '👑', title: 'Sarawak Maker',    tier: 'legendary', desc: 'Reached Level 10' },
  { trigger: 'first_photo',      emoji: '📸', title: 'Proof Seeker',     tier: 'bronze', desc: 'First step proof photo' },
];

// ─── BADGE CARD ──────────────────────────────────────────────────────────────

function BadgeCard({ badge, earned }) {
  const tier    = BADGE_TIERS[badge.tier] ?? BADGE_TIERS.bronze;
  const scaleA  = useRef(new Animated.Value(1)).current;

  function handlePress() {
    if (!earned) return;
    Animated.sequence([
      Animated.spring(scaleA, { toValue: 1.08, tension: 300, friction: 14, useNativeDriver: true }),
      Animated.spring(scaleA, { toValue: 1,    tension: 200, friction: 18, useNativeDriver: true }),
    ]).start();
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleA }] }, { opacity: earned ? 1 : 0.3 }]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={earned ? 0.8 : 1}
        style={[
          bStyles.card,
          {
            backgroundColor: tier.backgroundColor,
            borderTopColor:  tier.borderTopColor,
            borderLeftColor: tier.borderLeftColor,
          },
        ]}
      >
        <Text style={bStyles.emoji}>{earned ? badge.emoji : '🔒'}</Text>
        <Text style={[bStyles.title, { color: earned ? tier.labelColor : COLORS.textLabel }]}
          numberOfLines={2}
        >
          {badge.title}
        </Text>
        <Text style={bStyles.desc} numberOfLines={2}>{badge.desc}</Text>
        {earned && (
          <View style={[bStyles.earnedDot, { backgroundColor: tier.labelColor }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const bStyles = StyleSheet.create({
  card: {
    width:             CARD_W,
    borderRadius:      RADIUS.lg,
    borderTopWidth:    1,
    borderLeftWidth:   1,
    borderRightWidth:  1,
    borderRightColor:  'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    padding:           SPACING.md,
    alignItems:        'center',
    gap:               SPACING.xs,
    marginBottom:      SPACING.md,
    position:          'relative',
  },
  emoji:    { fontSize: 32, marginBottom: SPACING.xs },
  title:    { fontFamily: FONTS.body700, fontSize: 12, textAlign: 'center' },
  desc:     { fontFamily: FONTS.body400, fontSize: 10, color: COLORS.textCaption, textAlign: 'center' },
  earnedDot: {
    position:     'absolute',
    top:          SPACING.sm,
    right:        SPACING.sm,
    width:        8,
    height:       8,
    borderRadius: RADIUS.pill,
  },
});

// ─── CERTIFICATE CARD ────────────────────────────────────────────────────────

function CertCard({ cert, onPress }) {
  const isMastery = cert.cert_type === 'category_mastery';
  const proj      = cert.projects;
  const title     = proj?.title ?? cert.achievements?.title ?? 'Achievement Certificate';
  const category  = proj?.category ?? '';
  const date      = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <TouchableOpacity onPress={() => onPress(cert)} style={certStyles.card} activeOpacity={0.85}>
      <View style={[certStyles.tag, isMastery ? certStyles.tagCyan : certStyles.tagAmber]}>
        <Text style={[certStyles.tagText, { color: isMastery ? COLORS.aiCyan : COLORS.hornbillGold }]}>
          {isMastery ? '🎓 Category Mastery' : '🏆 Project Completion'}
        </Text>
      </View>
      <Text style={certStyles.title} numberOfLines={2}>{title}</Text>
      {category ? <Text style={TYPE.caption}>{category}</Text> : null}
      <View style={certStyles.footer}>
        <Text style={TYPE.caption}>{date}</Text>
        <View style={certStyles.viewBtn}>
          <Text style={certStyles.viewBtnText}>View →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const certStyles = StyleSheet.create({
  card: {
    ...GLASS.standard,
    borderRadius:  RADIUS.lg,
    padding:       SPACING.lg,
    marginBottom:  SPACING.md,
    gap:           SPACING.sm,
  },
  tag: {
    alignSelf:         'flex-start',
    borderRadius:      RADIUS.pill,
    paddingVertical:   3,
    paddingHorizontal: SPACING.sm,
    borderWidth:       1,
  },
  tagAmber: { backgroundColor: COLORS.goldBg, borderColor: COLORS.goldBorder },
  tagCyan:  { backgroundColor: COLORS.cyanBg, borderColor: COLORS.cyanBorder },
  tagText:  { fontFamily: FONTS.body700, fontSize: 11 },
  title:    { fontFamily: FONTS.heading800, fontSize: 15, color: COLORS.textPrimary },
  footer:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xs },
  viewBtn:  {
    backgroundColor:   COLORS.riverTeal,
    borderRadius:      RADIUS.pill,
    paddingVertical:   4,
    paddingHorizontal: SPACING.md,
  },
  viewBtnText: { fontFamily: FONTS.body700, fontSize: 12, color: COLORS.white },
});

// ─── SCREEN ──────────────────────────────────────────────────────────────────

export default function AchievementsScreen({ navigation }) {
  const { user } = useAuth();
  const insets   = useSafeAreaInsets();

  const [badges,  setBadges]  = useState([]);
  const [certs,   setCerts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fadeA = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [ach, cs] = await Promise.all([
        getAchievements(user.id),
        getCertificates(user.id),
      ]);
      // Map raw rows to Achievement model instances — encapsulation via private fields + getters
      const achievementModels = ach.map(a =>
        new Achievement(a.id, a.student_id, a.title, a.type, a.trigger_type)
      );
      setBadges(achievementModels.filter(a => a.type === 'badge'));
      setCerts(cs);
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

  // Use Achievement model getter (triggerType) instead of raw DB field name
  const earnedTriggers = new Set(badges.map(b => b.triggerType));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.hornbillGold} />
      </View>
    );
  }

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeA }]}>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <LinearGradient
        {...GRADIENTS.header}
        style={{
          paddingTop:              insets.top + SPACING.sm,
          borderBottomLeftRadius:  36,
          borderBottomRightRadius: 36,
          paddingBottom:           SPACING.lg,
          marginBottom:            SPACING.md,
        }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Achievements</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{badges.length} earned</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom:     TAB_BAR_TOTAL_HEIGHT + SPACING.xxl,
          paddingHorizontal: SPACING.lg,
        }}
      >
        {/* ── BADGES ─────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Badges</Text>
        <View style={styles.badgeGrid}>
          {ALL_BADGES.map(badge => (
            <BadgeCard
              key={badge.trigger}
              badge={badge}
              earned={earnedTriggers.has(badge.trigger)}
            />
          ))}
        </View>

        {/* ── CERTIFICATES ───────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: SPACING.sm }]}>Certificates</Text>

        {certs.length === 0 ? (
          <View style={[GLASS.standard, styles.emptyCard]}>
            <Text style={{ fontSize: 32 }}>📜</Text>
            <Text style={[TYPE.body, { textAlign: 'center' }]}>
              Complete a project to earn your first certificate!
            </Text>
          </View>
        ) : (
          certs.map((cert, i) => (
            <CertCard
              key={cert.id ?? i}
              cert={cert}
              onPress={(c) =>
                navigation.navigate(SCREENS.CERTIFICATE, { certId: c.id })
              }
            />
          ))
        )}
      </ScrollView>
    </Animated.View>
  );
}


// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.md,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius:    RADIUS.pill,
    padding:         SPACING.sm,
  },
  title: {
    flex:       1,
    fontFamily: FONTS.heading900,
    fontSize:   24,
    color:      COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor:   COLORS.goldBgStrong,
    borderRadius:      RADIUS.pill,
    paddingVertical:   5,
    paddingHorizontal: SPACING.md,
    borderWidth:       1,
    borderColor:       COLORS.goldBorder,
  },
  countText: { fontFamily: FONTS.body700, fontSize: 12, color: COLORS.hornbillGold },

  sectionLabel: {
    fontFamily:   FONTS.heading800,
    fontSize:     17,
    color:        COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  badgeGrid: {
    flexDirection:     'row',
    flexWrap:          'wrap',
    gap:               SPACING.md,
    marginBottom:      SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  emptyCard: {
    borderRadius: RADIUS.lg,
    padding:      SPACING.xxl,
    alignItems:   'center',
    gap:          SPACING.md,
  },
});
