// ============================================================
// FILE: src/screens/HelpScreen.js
// PURPOSE: Progress tab — shows the student's XP level, streak,
//          earned badges, and a skill breakdown by category.
//
// LAYOUT:
//   - Dark header (matches HomeScreen style) with screen title
//   - Stats row overlapping the header (streak, done, badges) — glass cards
//   - Level hero card — current level, rank title, XP bar
//   - Badges grid — earned (coloured) + locked (grey)
//   - Category skill bars — progress per subject area
// ============================================================

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, Radius, Shadow } from '../theme';
import { USER } from '../data';
import AnimatedNumber from '../components/AnimatedNumber';
import AppModal from '../components/AppModal';

const BADGES = [
  { id: 1,  emoji: '🎯', name: 'First Step',      desc: 'Started your first project',  color: Colors.tealLight,    earned: true  },
  { id: 2,  emoji: '⚡', name: 'Quick Learner',   desc: 'Finished 3 projects',          color: Colors.infoLight,    earned: true  },
  { id: 3,  emoji: '🌱', name: 'Green Thumb',     desc: 'Completed an Agri project',    color: Colors.successLight, earned: true  },
  { id: 4,  emoji: '☀️', name: 'Solar Pioneer',   desc: 'Built a solar project',        color: '#fff9e6',           earned: true  },
  { id: 5,  emoji: '🔥', name: '7-Day Streak',    desc: 'Logged in 7 days in a row',    color: Colors.warningLight, earned: true  },
  { id: 6,  emoji: '🔧', name: 'Fixer',           desc: 'Completed all steps in order', color: Colors.infoLight,    earned: true  },
  { id: 7,  emoji: '🏆', name: 'Project Master',  desc: 'Complete 10 projects',         color: '#fff9e6',           earned: false },
  { id: 8,  emoji: '🚀', name: 'Innovator',       desc: 'Create a custom project',      color: Colors.infoLight,    earned: false },
  { id: 9,  emoji: '🤝', name: 'Team Player',     desc: 'Help a classmate',             color: Colors.successLight, earned: false },
  { id: 10, emoji: '🌊', name: 'Water Wizard',    desc: 'Complete all Water projects',  color: Colors.tealLight,    earned: false },
];

const CATEGORIES = [
  { name: 'Agriculture',      emoji: '🌱', progress: 0.80, color: Colors.success  },
  { name: 'Electronics',      emoji: '⚡', progress: 0.50, color: Colors.teal     },
  { name: 'Renewable Energy', emoji: '♻️', progress: 0.30, color: Colors.warning  },
  { name: 'Water Systems',    emoji: '🌊', progress: 0.20, color: '#0ea5e9'       },
  { name: 'Coding & Tech',    emoji: '💻', progress: 0.10, color: Colors.info     },
];

// ----------------------------------------------------------
// COMPONENT: STAT BOX — glassmorphism frosted dark card
// ----------------------------------------------------------
function StatBox({ icon, value, label, valueColor, trigger }) {
  return (
    <View style={styles.statBox}>
      <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
      <Text style={styles.statIcon}>{icon}</Text>
      <AnimatedNumber value={value} style={[styles.statNum, { color: valueColor }]} trigger={trigger} />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ----------------------------------------------------------
// COMPONENT: LEVEL HERO CARD
// focusTrigger replays the XP bar animation on every tab visit
// ----------------------------------------------------------
function LevelCard({ user, focusTrigger }) {
  const xpAnim    = useRef(new Animated.Value(0)).current;
  const xpPercent = user.xp / user.xpMax;

  useEffect(() => {
    xpAnim.setValue(0);
    Animated.timing(xpAnim, {
      toValue:         xpPercent,
      duration:        900,
      useNativeDriver: false,
    }).start();
  }, [focusTrigger]);

  const barWidth = xpAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.levelCard}>
      <View style={styles.levelDecCircle} />

      <View style={styles.levelTop}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeNum}>{user.level}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>Level {user.level}</Text>
          <Text style={styles.levelRank}>{user.rank}</Text>
        </View>
        <View style={styles.levelNext}>
          <Ionicons name="trophy" size={20} color={Colors.gold} />
        </View>
      </View>

      <View style={styles.xpLabelRow}>
        <Text style={styles.xpLabel}>XP Progress</Text>
        <Text style={styles.xpValue}>{user.xp} / {user.xpMax}</Text>
      </View>
      <View style={styles.xpBarOuter}>
        <Animated.View style={[styles.xpBarInner, { width: barWidth }]} />
      </View>
      <Text style={styles.xpNextText}>🎯 {user.xpNext} XP to reach Level {user.level + 1}</Text>
    </View>
  );
}

// ----------------------------------------------------------
// COMPONENT: BADGE TILE — staggered entrance + spring press + tappable
// focusTrigger replays the entrance animation on every tab visit
// ----------------------------------------------------------
function BadgeTile({ badge, index, onBadgePress, focusTrigger }) {
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const pressScale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    entranceAnim.setValue(0);
    Animated.spring(entranceAnim, {
      toValue:         1,
      delay:           index * 60,
      useNativeDriver: true,
      tension:         80,
      friction:        8,
    }).start();
  }, [focusTrigger]);

  const onPressIn  = () => Animated.spring(pressScale, { toValue: 0.93, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <TouchableOpacity
      onPress={() => onBadgePress(badge)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      style={styles.badgeTileWrap}
    >
      <Animated.View style={[
        styles.badgeTile,
        { backgroundColor: badge.earned ? badge.color : Colors.border },
        {
          opacity:   entranceAnim,
          transform: [
            { scale: pressScale },
            { scale: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
          ],
        },
      ]}>
        <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
        <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
        <Text style={styles.badgeDesc} numberOfLines={2}>{badge.desc}</Text>
        {!badge.earned && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ----------------------------------------------------------
// COMPONENT: CATEGORY BAR ROW
// focusTrigger replays the bar fill animation on every tab visit
// ----------------------------------------------------------
function CategoryBar({ cat, index, focusTrigger }) {
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    barAnim.setValue(0);
    Animated.timing(barAnim, {
      toValue:         cat.progress,
      duration:        800,
      delay:           200 + index * 100,
      useNativeDriver: false,
    }).start();
  }, [focusTrigger]);

  const barWidth = barAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.catRow}>
      <Text style={styles.catEmoji}>{cat.emoji}</Text>
      <View style={styles.catBody}>
        <View style={styles.catLabelRow}>
          <Text style={styles.catName}>{cat.name}</Text>
          <Text style={[styles.catPct, { color: cat.color }]}>
            {Math.round(cat.progress * 100)}%
          </Text>
        </View>
        <View style={styles.catBarOuter}>
          <Animated.View style={[
            styles.catBarInner,
            { width: barWidth, backgroundColor: cat.color }
          ]} />
        </View>
      </View>
    </View>
  );
}

// ----------------------------------------------------------
// MAIN SCREEN
// ----------------------------------------------------------
export default function HelpScreen() {
  const earnedCount  = BADGES.filter(b => b.earned).length;
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const [modal, setModal]               = useState(null);
  const [focusTrigger, setFocusTrigger] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFocusTrigger(t => t + 1);
      entranceAnim.setValue(0);
      Animated.timing(entranceAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, [])
  );

  const entranceStyle = {
    opacity:   entranceAnim,
    transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };

  const handleBadgePress = (badge) => {
    if (badge.earned) {
      setModal({ emoji: badge.emoji, title: badge.name, message: `${badge.desc}\n\nYou've earned this badge! 🎉` });
    } else {
      setModal({ emoji: '🔒', title: badge.name, message: `${badge.desc}\n\nComplete the requirement to unlock this badge.` });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.View style={[{ flex: 1 }, entranceStyle]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── DARK HEADER ──────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.decCircleTop} />
          <View style={styles.decCircleBottom} />

          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoEmoji}>🦅</Text>
              </View>
              <Text style={styles.logoName}>
                S-<Text style={styles.logoAccent}>MIB</Text>
              </Text>
            </View>
          </View>

          <Text style={styles.headerSub}>Keep going,</Text>
          <Text style={styles.headerTitle}>My Progress 📈</Text>
        </View>

        {/* ── STATS ROW (glass cards overlapping header) ────── */}
        <View style={styles.statsGrid}>
          <StatBox icon="🔥" value={USER.streak}  label="Day Streak" valueColor={Colors.warning} trigger={focusTrigger} />
          <StatBox icon="✅" value={USER.done}    label="Done"       valueColor={Colors.success} trigger={focusTrigger} />
          <StatBox icon="🏅" value={earnedCount}  label="Badges"     valueColor={Colors.gold}    trigger={focusTrigger} />
        </View>

        {/* ── LEVEL HERO CARD ───────────────────────────────── */}
        <View style={styles.section}>
          <LevelCard user={USER} focusTrigger={focusTrigger} />
        </View>

        {/* ── BADGES ────────────────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Badges 🏅</Text>
          <Text style={styles.sectionSub}>{earnedCount}/{BADGES.length} earned</Text>
        </View>

        <View style={styles.badgeGrid}>
          {BADGES.map((badge, i) => (
            <BadgeTile
              key={badge.id}
              badge={badge}
              index={i}
              focusTrigger={focusTrigger}
              onBadgePress={handleBadgePress}
            />
          ))}
        </View>

        {/* ── SKILLS BREAKDOWN ──────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Skills Breakdown 📊</Text>
        </View>

        <View style={styles.catCard}>
          {CATEGORIES.map((cat, i) => (
            <React.Fragment key={cat.name}>
              <CategoryBar cat={cat} index={i} focusTrigger={focusTrigger} />
              {i < CATEGORIES.length - 1 && <View style={styles.catDivider} />}
            </React.Fragment>
          ))}
        </View>

      </ScrollView>
      </Animated.View>

      <AppModal
        visible={!!modal}
        onClose={() => setModal(null)}
        {...(modal ?? {})}
      />
    </SafeAreaView>
  );
}

// ----------------------------------------------------------
// STYLES
// ----------------------------------------------------------
const styles = StyleSheet.create({

  safe: {
    flex:            1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  // ── Header ─────────────────────────────────────────────
  header: {
    backgroundColor:          '#1a1a2e',
    paddingHorizontal:        Spacing.md,
    paddingTop:               Spacing.md,
    paddingBottom:            Spacing.xxl,
    borderBottomLeftRadius:   28,
    borderBottomRightRadius:  28,
    overflow:                 'hidden',
  },

  decCircleTop: {
    position:        'absolute',
    top:             -40,
    right:           -40,
    width:           160,
    height:          160,
    borderRadius:    80,
    backgroundColor: 'rgba(244, 196, 48, 0.10)',
  },
  decCircleBottom: {
    position:        'absolute',
    bottom:          -60,
    left:            -30,
    width:           140,
    height:          140,
    borderRadius:    70,
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
  },

  headerTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.md,
    zIndex:         1,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },

  logoIcon: {
    width:           38,
    height:          38,
    borderRadius:    Radius.md,
    backgroundColor: Colors.gold,
    alignItems:      'center',
    justifyContent:  'center',
  },

  logoEmoji: { fontSize: 20 },

  logoName: {
    fontSize:   18,
    fontWeight: '700',
    color:      '#ffffff',
  },

  logoAccent: { color: Colors.gold },

  headerSub: {
    fontSize:    13,
    color:       'rgba(255,255,255,0.60)',
    marginBottom: 2,
    zIndex:      1,
  },

  headerTitle: {
    fontSize:   22,
    fontWeight: '800',
    color:      '#ffffff',
    zIndex:     1,
  },

  // ── Stats Grid — glass cards ────────────────────────────
  statsGrid: {
    flexDirection:     'row',
    marginHorizontal:  Spacing.md,
    marginTop:         -22,
    gap:               Spacing.sm,
    marginBottom:      Spacing.md,
    zIndex:            2,
  },

  statBox: {
    flex:            1,
    borderRadius:    Radius.lg,
    paddingVertical: 12,
    alignItems:      'center',
    overflow:        'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.16)',
  },

  statIcon: {
    fontSize:     16,
    marginBottom: 2,
  },

  statNum: {
    fontSize:   22,
    fontWeight: '900',
  },

  statLabel: {
    fontSize:      10,
    fontWeight:    '600',
    color:         'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop:     2,
  },

  // ── Level Card ─────────────────────────────────────────
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom:      Spacing.md,
  },

  levelCard: {
    backgroundColor: Colors.dark,
    borderRadius:    Radius.xl,
    padding:         Spacing.md,
    overflow:        'hidden',
    ...Shadow.strong,
  },

  levelDecCircle: {
    position:        'absolute',
    top:             -30,
    right:           -30,
    width:           120,
    height:          120,
    borderRadius:    60,
    backgroundColor: 'rgba(244, 196, 48, 0.12)',
  },

  levelTop: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.md,
    marginBottom:   Spacing.md,
  },

  levelBadge: {
    width:           52,
    height:          52,
    borderRadius:    Radius.full,
    backgroundColor: Colors.gold,
    alignItems:      'center',
    justifyContent:  'center',
  },

  levelBadgeNum: {
    fontSize:   24,
    fontWeight: '900',
    color:      '#1a1a2e',
  },

  levelInfo: {
    flex: 1,
  },

  levelTitle: {
    fontSize:   16,
    fontWeight: '800',
    color:      '#ffffff',
  },

  levelRank: {
    fontSize:  12,
    color:     'rgba(255,255,255,0.60)',
    marginTop: 2,
  },

  levelNext: {
    width:           38,
    height:          38,
    borderRadius:    Radius.md,
    backgroundColor: 'rgba(244, 196, 48, 0.15)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  xpLabelRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   Spacing.xs,
  },

  xpLabel: {
    fontSize: 12,
    color:    'rgba(255,255,255,0.60)',
  },

  xpValue: {
    fontSize:   12,
    fontWeight: '700',
    color:      Colors.gold,
  },

  xpBarOuter: {
    height:          10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius:    Radius.full,
    overflow:        'hidden',
    marginBottom:    Spacing.sm,
  },

  xpBarInner: {
    height:          '100%',
    backgroundColor: Colors.gold,
    borderRadius:    Radius.full,
  },

  xpNextText: {
    fontSize: 12,
    color:    'rgba(255,255,255,0.55)',
  },

  // ── Section headers ─────────────────────────────────────
  sectionHead: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: Spacing.md,
    marginBottom:      Spacing.sm,
  },

  sectionTitle: {
    fontSize:   16,
    fontWeight: '800',
    color:      Colors.textPrimary,
  },

  sectionSub: {
    fontSize:   12,
    fontWeight: '600',
    color:      Colors.textMuted,
  },

  // ── Badge Grid ─────────────────────────────────────────
  badgeGrid: {
    flexDirection:     'row',
    flexWrap:          'wrap',
    paddingHorizontal: Spacing.md,
    gap:               Spacing.sm,
    marginBottom:      Spacing.lg,
  },

  badgeTileWrap: {
    width: '47%',
  },

  badgeTile: {
    borderRadius: Radius.lg,
    padding:      Spacing.md,
    position:     'relative',
    ...Shadow.card,
  },

  badgeEmoji: {
    fontSize:     28,
    marginBottom: Spacing.xs,
  },

  badgeName: {
    fontSize:     13,
    fontWeight:   '800',
    color:        Colors.textPrimary,
    marginBottom: 2,
  },

  badgeDesc: {
    fontSize:   11,
    color:      Colors.textMuted,
    lineHeight: 15,
  },

  lockOverlay: {
    position: 'absolute',
    top:      Spacing.sm,
    right:    Spacing.sm,
  },

  // ── Category Bars ──────────────────────────────────────
  catCard: {
    backgroundColor:  Colors.card,
    borderRadius:     Radius.xl,
    marginHorizontal: Spacing.md,
    padding:          Spacing.md,
    marginBottom:     Spacing.lg,
    ...Shadow.card,
  },

  catRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },

  catEmoji: {
    fontSize:  20,
    width:     28,
    textAlign: 'center',
  },

  catBody: {
    flex: 1,
  },

  catLabelRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   4,
  },

  catName: {
    fontSize:   13,
    fontWeight: '700',
    color:      Colors.textPrimary,
  },

  catPct: {
    fontSize:   12,
    fontWeight: '800',
  },

  catBarOuter: {
    height:          8,
    backgroundColor: Colors.border,
    borderRadius:    Radius.full,
    overflow:        'hidden',
  },

  catBarInner: {
    height:       '100%',
    borderRadius: Radius.full,
  },

  catDivider: {
    height:          1,
    backgroundColor: Colors.border,
    marginVertical:  Spacing.sm,
    marginLeft:      36,
  },
});
