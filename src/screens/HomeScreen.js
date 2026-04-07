// ============================================================
// FILE: src/screens/HomeScreen.js
// PURPOSE: Main landing screen of S-MIB.
//
// REFERENCE: docs/SMIB_Mockup.html — Version B (Student Friendly)
// LAYOUT:
//   - Dark gradient header with greeting, level badge, XP bar
//   - Stats grid (3 boxes) overlapping the header
//   - "My Projects" section with project cards
//   - Each card: coloured emoji box + title/subtitle/progress + difficulty pill
// ============================================================

import { useRef, useEffect, useState, useCallback } from 'react';
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
import { Colors, Spacing, Radius, Shadow } from '../theme';
import { USER, MY_PROJECTS as PROJECTS } from '../data';
import AnimatedNumber from '../components/AnimatedNumber';
import AppModal from '../components/AppModal';

// ----------------------------------------------------------
// Dynamic greeting based on time of day
// ----------------------------------------------------------
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}


// ----------------------------------------------------------
// COMPONENT: DIFFICULTY PILL
// ----------------------------------------------------------
function DiffPill({ style: diffStyle, label }) {
  const s = diffStyle === 'easy'
    ? { bg: Colors.successLight, text: Colors.success }
    : { bg: Colors.warningLight, text: Colors.warning };

  return (
    <View style={[styles.diffPill, { backgroundColor: s.bg }]}>
      <Text style={[styles.diffText, { color: s.text }]}>{label}</Text>
    </View>
  );
}

// ----------------------------------------------------------
// COMPONENT: PROJECT CARD
// ----------------------------------------------------------
function ProjectCard({ project, onPress, index = 0 }) {
  const scale        = useRef(new Animated.Value(1)).current;
  const staggerAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(staggerAnim, {
      toValue:         1,
      delay:           index * 80,
      useNativeDriver: true,
      tension:         80,
      friction:        9,
    }).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  const staggerStyle = {
    opacity:   staggerAnim,
    transform: [
      { scale },
      { translateY: staggerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
    ],
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.card, staggerStyle]}>

        {/* Emoji icon box */}
        <View style={[styles.emojiBox, { backgroundColor: project.emojiColor }]}>
          <Text style={styles.emojiText}>{project.emoji}</Text>
        </View>

        {/* Card body */}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{project.title}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>{project.subtitle}</Text>

          {/* Mini progress bar */}
          {project.progress > 0 && (
            <View style={styles.miniBar}>
              <View style={[
                styles.miniBarFill,
                { width: `${project.progress * 100}%`, backgroundColor: project.barColor }
              ]} />
            </View>
          )}
        </View>

        {/* Difficulty pill */}
        <DiffPill style={project.diffStyle} label={project.difficulty} />

      </Animated.View>
    </TouchableOpacity>
  );
}

// ----------------------------------------------------------
// COMPONENT: STAT BOX
// ----------------------------------------------------------
function StatBox({ value, label, valueColor }) {
  return (
    <View style={styles.statBox}>
      <AnimatedNumber value={value} style={[styles.statNum, { color: valueColor }]} />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ----------------------------------------------------------
// MAIN SCREEN
// ----------------------------------------------------------
export default function HomeScreen({ navigation }) {
  const xpPercent    = USER.xp / USER.xpMax;
  const xpBarAnim    = useRef(new Animated.Value(0)).current;
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const [modal, setModal] = useState(null);

  useFocusEffect(
    useCallback(() => {
      xpBarAnim.setValue(0);
      entranceAnim.setValue(0);
      Animated.parallel([
        Animated.timing(xpBarAnim,    { toValue: xpPercent, duration: 900, useNativeDriver: false }),
        Animated.timing(entranceAnim, { toValue: 1,         duration: 400, useNativeDriver: true  }),
      ]).start();
    }, [])
  );

  const xpBarWidth = xpBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const entranceStyle = {
    opacity:   entranceAnim,
    transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
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

          {/* Decorative circles (depth effect like mockup) */}
          <View style={styles.decCircleTop} />
          <View style={styles.decCircleBottom} />

          {/* Logo row */}
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoEmoji}>🦅</Text>
              </View>
              <Text style={styles.logoName}>
                S-<Text style={styles.logoAccent}>MIB</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              activeOpacity={0.7}
              onPress={() => setModal({ emoji: '🔔', title: 'Notifications', message: 'No new notifications right now.\nCheck back after completing a project step!' })}
            >
              <Ionicons name="notifications-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <Text style={styles.greetingSub}>{getGreeting()}</Text>
          <Text style={styles.greetingName}>
            {USER.name} <Text>👋</Text>
          </Text>

          {/* Level badge + XP */}
          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LEVEL {USER.level}</Text>
            </View>
            <Text style={styles.xpText}>{USER.xp} / {USER.xpMax} XP</Text>
          </View>

          {/* XP progress bar — animates on mount */}
          <View style={styles.xpBarOuter}>
            <Animated.View style={[styles.xpBarInner, { width: xpBarWidth }]} />
          </View>

        </View>

        {/* ── STATS GRID (overlaps header) ─────────────────── */}
        <View style={styles.statsGrid}>
          <StatBox value={USER.active}  label="Active"  valueColor={Colors.teal}    />
          <StatBox value={USER.done}    label="Done"    valueColor={Colors.success}  />
          <StatBox value={USER.badges}  label="Badges"  valueColor={Colors.warning}  />
        </View>

        {/* ── PROJECTS SECTION ─────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>My Projects 📋</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardList}>
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onPress={() => navigation.navigate('ProjectDetail', { project })}
            />
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
    backgroundColor: Colors.dark,
    backgroundImage: undefined,
    paddingHorizontal: Spacing.md,
    paddingTop:        Spacing.md,
    paddingBottom:     Spacing.xxl,
    borderBottomLeftRadius:  28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    // Simulate the linear gradient from mockup (#1a1a2e → #16213e)
    // expo-linear-gradient would be ideal but keeping plain RN for now
    backgroundColor: '#1a1a2e',
  },

  // Decorative circles (depth effect)
  decCircleTop: {
    position:        'absolute',
    top:             -40,
    right:           -40,
    width:           160,
    height:          160,
    borderRadius:    80,
    backgroundColor: 'rgba(244, 196, 48, 0.10)',  // gold tint
  },
  decCircleBottom: {
    position:        'absolute',
    bottom:          -60,
    left:            -30,
    width:           140,
    height:          140,
    borderRadius:    70,
    backgroundColor: 'rgba(14, 165, 233, 0.08)',  // teal tint
  },

  headerTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.md,
    position:       'relative',
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

  logoEmoji: {
    fontSize: 20,
  },

  logoName: {
    fontSize:   18,
    fontWeight: '700',
    color:      '#ffffff',
  },

  logoAccent: {
    color: Colors.gold,
  },

  notifBtn: {
    width:           38,
    height:          38,
    borderRadius:    Radius.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  greetingSub: {
    fontSize:    13,
    color:       'rgba(255,255,255,0.60)',
    marginBottom: 2,
    position:    'relative',
    zIndex:      1,
  },

  greetingName: {
    fontSize:     22,
    fontWeight:   '800',
    color:        '#ffffff',
    marginBottom: Spacing.md,
    position:     'relative',
    zIndex:       1,
  },

  levelRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
    marginBottom:  Spacing.sm,
    position:      'relative',
    zIndex:        1,
  },

  levelBadge: {
    backgroundColor: Colors.gold,
    borderRadius:    Radius.full,
    paddingHorizontal: 10,
    paddingVertical:    4,
  },

  levelText: {
    fontSize:   11,
    fontWeight: '800',
    color:      '#1a1a2e',
    letterSpacing: 0.5,
  },

  xpText: {
    fontSize: 12,
    color:    'rgba(255,255,255,0.60)',
  },

  xpBarOuter: {
    height:          8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius:    Radius.full,
    overflow:        'hidden',
    position:        'relative',
    zIndex:          1,
  },

  xpBarInner: {
    height:          '100%',
    backgroundColor: Colors.gold,
    borderRadius:    Radius.full,
    // Gold → orange gradient feel (approximated without expo-linear-gradient)
  },

  // ── Stats Grid ─────────────────────────────────────────
  statsGrid: {
    flexDirection:  'row',
    marginHorizontal: Spacing.md,
    marginTop:      -22,       // Overlaps the header bottom
    gap:            Spacing.sm,
    marginBottom:   Spacing.md,
    zIndex:         2,
  },

  statBox: {
    flex:            1,
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    paddingVertical: 12,
    alignItems:      'center',
    ...Shadow.card,
  },

  statNum: {
    fontSize:   24,
    fontWeight: '900',
  },

  statLabel: {
    fontSize:   10,
    fontWeight: '600',
    color:      Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing:  0.5,
    marginTop:  2,
  },

  // ── Section header ─────────────────────────────────────
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

  seeAll: {
    fontSize:   13,
    fontWeight: '700',
    color:      Colors.teal,
  },

  // ── Card list ──────────────────────────────────────────
  cardList: {
    paddingHorizontal: Spacing.md,
    gap:               Spacing.sm,
  },

  // ── Project Card ───────────────────────────────────────
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.card,
    borderRadius:    18,
    padding:         14,
    gap:             Spacing.sm,
    ...Shadow.card,
  },

  emojiBox: {
    width:           50,
    height:          50,
    borderRadius:    14,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },

  emojiText: {
    fontSize: 26,
  },

  cardBody: {
    flex: 1,
  },

  cardTitle: {
    fontSize:     14,
    fontWeight:   '800',
    color:        Colors.textPrimary,
    marginBottom: 3,
  },

  cardSubtitle: {
    fontSize:     11,
    color:        Colors.textMuted,
    marginBottom: 6,
  },

  miniBar: {
    height:          5,
    backgroundColor: Colors.border,
    borderRadius:    Radius.full,
    overflow:        'hidden',
  },

  miniBarFill: {
    height:       '100%',
    borderRadius: Radius.full,
  },

  // ── Difficulty Pill ────────────────────────────────────
  diffPill: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      Radius.full,
    flexShrink:        0,
  },

  diffText: {
    fontSize:   10,
    fontWeight: '700',
  },
});
