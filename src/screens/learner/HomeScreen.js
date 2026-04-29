// src/screens/learner/HomeScreen.js
// s-home — Learner Home Dashboard
// Displays XP/level, streak, stat cards, active projects, and explore suggestions.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets }    from 'react-native-safe-area-context';
import { LinearGradient }       from 'expo-linear-gradient';
import { Ionicons }             from '@expo/vector-icons';

import { useAuth }                       from '../../context/AuthContext';
import { SCREENS, TAB_BAR_TOTAL_HEIGHT } from '../../navigation/navConstants';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS,
  GRADIENTS, SPRING, XP_PER_LEVEL,
  calculateLevel, calculateXpInLevel, getRankTitle,
} from '../../theme';
import { getProgressSummary, getActiveProjects } from '../../services/progressService';
import { getPublishedProjects }                  from '../../services/projectService';
import { getAchievements }                       from '../../services/achievementService';
import { updateStreak }                          from '../../services/streakService';
import { getUnreadCount }                        from '../../services/notificationService';
import JuniorLearner from '../../models/JuniorLearner';
import SeniorLearner from '../../models/SeniorLearner';

// ─── SHARED PROJECT HELPERS (exported for reuse in other screens) ────────────

export const CATEGORY_META = {
  electronics: { emoji: '⚡', grad: ['#0C4A6E', '#0E7490', '#0891B2'] },
  agriculture:  { emoji: '🌱', grad: ['#78350F', '#B45309', '#D97706'] },
  renewable:    { emoji: '☀️', grad: ['#052E16', '#166534', '#15803D'] },
  coding:       { emoji: '💻', grad: ['#1E1B4B', '#3730A3', '#6366F1'] },
  biology:      { emoji: '🧬', grad: ['#134E4A', '#0F766E', '#14B8A6'] },
};

export const DIFF_COLOR = {
  beginner:     '#22C55E',
  intermediate: '#F59E0B',
  advanced:     '#EF4444',
};

export function getCategoryMeta(cat) {
  return CATEGORY_META[(cat || '').toLowerCase()] ?? { emoji: '🔬', grad: ['#0C1A2E', '#0E7490'] };
}

// ─── SHARED PROJECT CARD (used on HomeScreen, ExploreScreen, ProjectListScreen) ─

export function ProjectCard({ item, navigation, showProgress = true }) {
  const scale   = useRef(new Animated.Value(1)).current;
  // item may be an enrolled-progress row ({ projects: {...}, progress_pct }) or a raw project
  const project = item.projects ?? item;
  const { emoji, grad } = getCategoryMeta(project.category);
  const progress  = item.progress_pct ?? 0;
  const diffColor = DIFF_COLOR[(project.difficulty || '').toLowerCase()] ?? COLORS.textCaption;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.95, tension: SPRING.card.tension, friction: SPRING.card.friction, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    tension: SPRING.card.tension, friction: SPRING.card.friction, useNativeDriver: true }).start();

  return (
    <Animated.View style={[pcStyles.wrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => navigation.navigate(SCREENS.PROJECT_DETAIL, { projectId: project.id })}
        style={pcStyles.card}
      >
        <LinearGradient colors={grad} style={pcStyles.thumb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={pcStyles.emoji}>{emoji}</Text>
        </LinearGradient>
        <View style={pcStyles.meta}>
          <Text style={pcStyles.title} numberOfLines={2}>{project.title}</Text>
          <Text style={[pcStyles.diff, { color: diffColor }]}>
            {(project.difficulty || '').charAt(0).toUpperCase() + (project.difficulty || '').slice(1)}
          </Text>
          {showProgress && (
            <>
              <View style={pcStyles.barBg}>
                <View style={[pcStyles.barFill, { width: `${Math.round(progress)}%` }]} />
              </View>
              <Text style={TYPE.caption}>{Math.round(progress)}%</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const pcStyles = StyleSheet.create({
  wrap:  { marginRight: SPACING.md },
  card:  { ...GLASS.standard, width: 162, borderRadius: RADIUS.lg, overflow: 'hidden' },
  thumb: { height: 92, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 38 },
  meta:  { padding: SPACING.sm },
  title: { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.textPrimary, marginBottom: 4 },
  diff:  { fontFamily: FONTS.body700, fontSize: 10, marginBottom: 6 },
  barBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: RADIUS.pill, backgroundColor: COLORS.hornbillGold },
});

// ─── EXPLORE CARD ────────────────────────────────────────────────────────────

function ExploreCard({ item, navigation }) {
  const scale = useRef(new Animated.Value(1)).current;
  const { emoji, grad } = getCategoryMeta(item.category);

  const pressIn  = () => Animated.spring(scale, { toValue: 0.95, tension: SPRING.card.tension, friction: SPRING.card.friction, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    tension: SPRING.card.tension, friction: SPRING.card.friction, useNativeDriver: true }).start();

  return (
    <Animated.View style={[ecStyles.wrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => navigation.navigate(SCREENS.PROJECT_DETAIL, { projectId: item.id })}
        style={ecStyles.card}
      >
        <LinearGradient colors={grad} style={ecStyles.thumb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={ecStyles.emoji}>{emoji}</Text>
        </LinearGradient>
        <View style={{ padding: SPACING.sm }}>
          <Text style={ecStyles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={TYPE.caption} numberOfLines={1}>
            {(item.category || '').charAt(0).toUpperCase() + (item.category || '').slice(1)}
            {' · '}
            {item.difficulty}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const ecStyles = StyleSheet.create({
  wrap:  { marginRight: SPACING.md },
  card:  { ...GLASS.standard, width: 142, borderRadius: RADIUS.lg, overflow: 'hidden' },
  thumb: { height: 80, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 30 },
  title: { fontFamily: FONTS.body600, fontSize: 12, color: COLORS.textPrimary, marginBottom: 3 },
});

// ─── STAT CARD ───────────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon }) {
  return (
    <View style={[GLASS.stat, styles.statCard]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value ?? 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────

const N = 6; // number of staggered sections

export default function HomeScreen({ navigation }) {
  const { user, fetchUserProfile } = useAuth();
  const insets = useSafeAreaInsets();

  const [summary,       setSummary]   = useState({ active: 0, completed: 0 });
  const [activeProjs,   setActive]    = useState([]);
  const [newProjs,      setNew]       = useState([]);
  const [badgeCount,    setBadges]    = useState(0);
  const [streak,        setStreak]    = useState(null);
  const [unread,        setUnread]    = useState(0);
  const [loading,       setLoading]   = useState(true);
  const [error,         setError]     = useState(null);
  const [refreshing,    setRefreshing]= useState(false);

  // Entrance stagger anims
  const fadeA  = useRef(Array.from({ length: N }, () => new Animated.Value(0))).current;
  const scaleA = useRef(Array.from({ length: N }, () => new Animated.Value(0.94))).current;
  // XP bar
  const xpAnim     = useRef(new Animated.Value(0)).current;
  const [barW, setBarW] = useState(0);
  const barFired   = useRef(false);

  // ─── Entrance animation ──────────────────────────────────────────────────
  function runEntrance() {
    Animated.stagger(65,
      fadeA.map((a, i) =>
        Animated.parallel([
          Animated.spring(a,       { toValue: 1, tension: SPRING.default.tension, friction: SPRING.default.friction, useNativeDriver: true }),
          Animated.spring(scaleA[i], { toValue: 1, tension: SPRING.default.tension, friction: SPRING.default.friction, useNativeDriver: true }),
        ]),
      ),
    ).start();
  }

  const s = (i) => ({ opacity: fadeA[i], transform: [{ scale: scaleA[i] }] });

  // ─── Data load ───────────────────────────────────────────────────────────
  async function load(uid) {
    try {
      const [r0, r1, r2, r3, r4, r5] = await Promise.allSettled([
        getProgressSummary(uid),
        getActiveProjects(uid),
        getPublishedProjects(),
        getAchievements(uid),
        updateStreak(uid),
        getUnreadCount(uid),
      ]);
      if (r0.status === 'fulfilled') setSummary(r0.value);
      if (r1.status === 'fulfilled') setActive(r1.value.slice(0, 8));
      if (r2.status === 'fulfilled') {
        const allProj = r2.value;
        // Polymorphism: JuniorLearner returns beginner guided only; SeniorLearner returns all types
        const LearnerClass = user?.role === 'junior_learner' ? JuniorLearner : SeniorLearner;
        const learnerModel = new LearnerClass(
          user.id, user.name, user.email, user.role, user.avatar_url,
          user.xp ?? 0, user.level ?? 1, user.school_name ?? '', user.grade_level ?? '',
        );
        const { projects: recProjects } = learnerModel.getRecommendedProjects(allProj);
        setNew((recProjects.length > 0 ? recProjects : allProj).slice(0, 12));
      }
      if (r3.status === 'fulfilled') setBadges((r3.value ?? []).filter(a => a.type === 'badge').length);
      if (r4.status === 'fulfilled') setStreak(r4.value);
      if (r5.status === 'fulfilled') setUnread(r5.value);
      setError(null);
    } catch {
      setError('Could not load dashboard. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.id) return;
    load(user.id).then(runEntrance);
  }, [user?.id]);

  // Animate XP bar once we have container width + user XP
  useEffect(() => {
    if (barW > 0 && user?.xp !== undefined && !barFired.current) {
      barFired.current = true;
      const pct = calculateXpInLevel(user.xp ?? 0) / XP_PER_LEVEL;
      Animated.timing(xpAnim, { toValue: pct * barW, duration: 1300, useNativeDriver: false }).start();
    }
  }, [barW, user?.xp]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    barFired.current = false;
    xpAnim.setValue(0);
    if (user?.id) {
      await fetchUserProfile(user.id);
      await load(user.id);
    }
    setRefreshing(false);
  }, [user?.id]);

  // ─── Derived ─────────────────────────────────────────────────────────────
  const level     = calculateLevel(user?.xp ?? 0);
  const xpInLevel = calculateXpInLevel(user?.xp ?? 0);
  const rankTitle = getRankTitle(level);
  const greeting  = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  })();

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={TYPE.body}>Loading your dashboard…</Text>
      </View>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_TOTAL_HEIGHT + SPACING.xl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.hornbillGold}
          />
        }
      >
        {/* ── HEADER ─────────────────────────────────────────────── */}
        <Animated.View style={[s(0), { paddingTop: insets.top + SPACING.md }]}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.logoText}>S-MIB</Text>
              <Text style={TYPE.caption}>Sarawak Maker-In-A-Box</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.bellBtn}
                onPress={() => navigation.navigate(SCREENS.NOTIFICATIONS)}
              >
                <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
                {unread > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{unread > 9 ? '9+' : unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user?.name ?? 'M')[0].toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── GREETING ───────────────────────────────────────────── */}
        <Animated.View style={[s(1), styles.greetSection]}>
          <Text style={TYPE.caption}>{greeting}, 👋</Text>
          <Text style={styles.userName}>{user?.name ?? 'Maker'}</Text>
          {streak?.current_streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak.current_streak} day streak</Text>
            </View>
          )}
        </Animated.View>

        {/* ── LEVEL + XP CARD ────────────────────────────────────── */}
        <Animated.View style={[s(2), { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg }]}>
          <View style={[GLASS.standard, styles.levelCard]}>
            <View style={styles.levelRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>Lv {level}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text style={styles.rankTitle}>{rankTitle}</Text>
                <Text style={TYPE.caption}>{xpInLevel} / {XP_PER_LEVEL} XP to next level</Text>
              </View>
            </View>
            <View
              style={styles.xpBarBg}
              onLayout={(e) => setBarW(Math.floor(e.nativeEvent.layout.width))}
            >
              <Animated.View style={{ height: '100%', width: xpAnim, borderRadius: RADIUS.pill, overflow: 'hidden' }}>
                <LinearGradient
                  colors={GRADIENTS.xpBar.colors}
                  start={GRADIENTS.xpBar.start}
                  end={GRADIENTS.xpBar.end}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* ── STAT CARDS ─────────────────────────────────────────── */}
        <Animated.View style={[s(3), styles.statRow]}>
          <StatCard label="Active" value={summary.active}    color={COLORS.aiCyan}      icon="play-circle"      />
          <StatCard label="Done"   value={summary.completed} color={COLORS.hornbillGold} icon="checkmark-circle" />
          <StatCard label="Badges" value={badgeCount}        color={COLORS.success}      icon="star"             />
        </Animated.View>

        {/* ── MY PROJECTS ────────────────────────────────────────── */}
        <Animated.View style={s(4)}>
          <View style={styles.sectionHdr}>
            <Text style={styles.sectionTitle}>My Projects</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExploreTab')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          {activeProjs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 40 }}>🚀</Text>
              <Text style={[TYPE.body, { textAlign: 'center', marginTop: SPACING.xs }]}>
                No active projects yet
              </Text>
              <Text style={[TYPE.caption, { textAlign: 'center' }]}>
                Explore projects below to get started!
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
            >
              {activeProjs.map(item => (
                <ProjectCard key={item.id} item={item} navigation={navigation} />
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* ── EXPLORE NEW ────────────────────────────────────────── */}
        <Animated.View style={s(5)}>
          <View style={styles.sectionHdr}>
            <Text style={styles.sectionTitle}>Explore New</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExploreTab')}>
              <Text style={styles.seeAll}>Browse →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
          >
            {newProjs.map(item => (
              <ExploreCard key={item.id} item={item} navigation={navigation} />
            ))}
          </ScrollView>
          {newProjs.length === 0 && (
            <View style={[styles.emptyCard, { marginHorizontal: SPACING.lg }]}>
              <Text style={TYPE.caption}>No projects available yet.</Text>
            </View>
          )}
        </Animated.View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.sm,
  },
  logoText: {
    fontFamily:    FONTS.heading900,
    fontSize:      22,
    color:         COLORS.hornbillGold,
    letterSpacing: 2,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  bellBtn:     { position: 'relative', padding: SPACING.xs },
  bellBadge: {
    position:          'absolute',
    top:               0,
    right:             0,
    backgroundColor:   COLORS.error,
    borderRadius:      RADIUS.pill,
    minWidth:          16,
    height:            16,
    justifyContent:    'center',
    alignItems:        'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: { fontFamily: FONTS.body700, fontSize: 9, color: COLORS.white },
  avatar: {
    width:           38,
    height:          38,
    borderRadius:    RADIUS.pill,
    backgroundColor: COLORS.riverTeal,
    justifyContent:  'center',
    alignItems:      'center',
  },
  avatarText: { fontFamily: FONTS.heading800, fontSize: 16, color: COLORS.white },

  greetSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.md,
    paddingBottom:     SPACING.xs,
  },
  userName: {
    fontFamily: FONTS.heading900,
    fontSize:   30,
    color:      COLORS.textPrimary,
    marginTop:  2,
  },
  streakBadge: {
    marginTop:         SPACING.sm,
    alignSelf:         'flex-start',
    backgroundColor:   COLORS.goldBgStrong,
    borderRadius:      RADIUS.pill,
    paddingVertical:   SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderWidth:       1,
    borderColor:       COLORS.goldBorder,
  },
  streakText: { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.hornbillGold },

  levelCard: { borderRadius: RADIUS.lg, padding: SPACING.lg },
  levelRow: {
    flexDirection:  'row',
    alignItems:     'center',
    marginBottom:   SPACING.md,
  },
  levelBadge: {
    backgroundColor:   COLORS.hornbillGold,
    borderRadius:      RADIUS.pill,
    paddingVertical:   6,
    paddingHorizontal: SPACING.md,
  },
  levelBadgeText: { fontFamily: FONTS.heading800, fontSize: 14, color: COLORS.deepNavy },
  rankTitle:      { fontFamily: FONTS.heading800, fontSize: 16, color: COLORS.textPrimary },
  xpBarBg: {
    height:          10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius:    RADIUS.pill,
    overflow:        'hidden',
  },

  statRow: {
    flexDirection:     'row',
    gap:               SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginTop:         SPACING.lg,
  },
  statCard: {
    flex:           1,
    borderRadius:   RADIUS.md,
    padding:        SPACING.md,
    alignItems:     'center',
    gap:            SPACING.xs,
  },
  statValue: { fontFamily: FONTS.heading900, fontSize: 22 },
  statLabel: {
    fontFamily:    FONTS.body600,
    fontSize:      10,
    color:         COLORS.textCaption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  sectionHdr: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    marginTop:         SPACING.xl,
    marginBottom:      SPACING.md,
  },
  sectionTitle: { fontFamily: FONTS.heading800, fontSize: 18, color: COLORS.textPrimary },
  seeAll:       { fontFamily: FONTS.body600,    fontSize: 13, color: COLORS.hornbillGold },

  emptyCard: {
    ...GLASS.standard,
    borderRadius: RADIUS.lg,
    padding:      SPACING.xl,
    alignItems:   'center',
    gap:          SPACING.xs,
  },

  errorBanner: {
    marginHorizontal: SPACING.lg,
    marginTop:        SPACING.lg,
    backgroundColor:  COLORS.errorBg,
    borderRadius:     RADIUS.md,
    padding:          SPACING.md,
    borderWidth:      1,
    borderColor:      COLORS.errorBorder,
  },
  errorText: { fontFamily: FONTS.body400, fontSize: 13, color: COLORS.error, textAlign: 'center' },
});
