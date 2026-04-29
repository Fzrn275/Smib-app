// src/screens/learner/ProgressScreen.js
// s-progress — Level journey map, streak badge, completed projects list.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                       from '../../context/AuthContext';
import { SCREENS, TAB_BAR_TOTAL_HEIGHT } from '../../navigation/navConstants';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, SPRING,
  GRADIENTS, calculateXpInLevel, getRankTitle,
  RANK_TITLES, XP_PER_LEVEL,
} from '../../theme';
import { getStreak }            from '../../services/streakService';
import { getCompletedProjects } from '../../services/progressService';
import { getCategoryMeta }      from './HomeScreen';

// ─── LEVEL JOURNEY MAP ───────────────────────────────────────────────────────

function LevelJourneyMap({ currentLevel }) {
  return (
    <View style={mapStyles.container}>
      {RANK_TITLES.map((title, i) => {
        const lvl       = i + 1;
        const isDone    = lvl < currentLevel;
        const isCurrent = lvl === currentLevel;
        const isFuture  = lvl > currentLevel;

        return (
          <View key={lvl} style={mapStyles.nodeRow}>
            {lvl > 1 && (
              <View style={[mapStyles.line, isDone && mapStyles.lineDone]} />
            )}
            <View style={[
              mapStyles.node,
              isDone    && mapStyles.nodeDone,
              isCurrent && mapStyles.nodeCurrent,
              isFuture  && mapStyles.nodeFuture,
            ]}>
              {isDone
                ? <Ionicons name="checkmark" size={14} color={COLORS.success} />
                : isCurrent
                  ? <Text style={mapStyles.nodeNumActive}>{lvl}</Text>
                  : <Text style={mapStyles.nodeNumFuture}>{lvl}</Text>
              }
            </View>
            <View style={mapStyles.labelBox}>
              <Text style={[
                mapStyles.rankTitle,
                isFuture  && { color: COLORS.textLabel },
                isCurrent && { color: COLORS.hornbillGold },
              ]}>
                {isCurrent ? '★ ' : ''}Level {lvl} — {title}
                {isCurrent ? ' ← You' : ''}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const mapStyles = StyleSheet.create({
  container: { paddingLeft: SPACING.lg, paddingVertical: SPACING.sm },
  nodeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.md,
    position:      'relative',
  },
  line: {
    position:        'absolute',
    left:            10,
    top:             -18,
    width:           2,
    height:          20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  lineDone: { backgroundColor: COLORS.success },
  node: {
    width:           24,
    height:          24,
    borderRadius:    RADIUS.pill,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.2)',
    marginVertical:  10,
    flexShrink:      0,
  },
  nodeDone:    { backgroundColor: COLORS.successBgDeep,  borderColor: COLORS.success },
  nodeCurrent: {
    backgroundColor: COLORS.goldBgDeep,
    borderColor:     COLORS.hornbillGold,
    width:           30,
    height:          30,
  },
  nodeFuture:     { opacity: 0.35 },
  nodeNumActive:  { fontFamily: FONTS.body700, fontSize: 11, color: COLORS.hornbillGold },
  nodeNumFuture:  { fontFamily: FONTS.body700, fontSize: 11, color: COLORS.textLabel },
  labelBox:       { flex: 1, paddingVertical: 10 },
  rankTitle:      { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.textBody },
});

// ─── COMPLETED PROJECT CARD ──────────────────────────────────────────────────

function CompletedCard({ item, onPress }) {
  const proj   = item.projects;
  if (!proj) return null;
  const { emoji, grad } = getCategoryMeta(proj.category);
  const scaleA = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.spring(scaleA, { toValue: 0.96, tension: 300, friction: 20, useNativeDriver: true }),
      Animated.spring(scaleA, { toValue: 1,    tension: 200, friction: 18, useNativeDriver: true }),
    ]).start(() => onPress?.());
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleA }] }}>
      <TouchableOpacity onPress={handlePress} style={cStyles.card} activeOpacity={0.9}>
        <LinearGradient colors={grad} style={cStyles.thumb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </LinearGradient>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={cStyles.title} numberOfLines={1}>{proj.title}</Text>
          <Text style={TYPE.caption}>{proj.category} · {proj.difficulty}</Text>
        </View>
        <View style={cStyles.doneBadge}>
          <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
          <Text style={cStyles.doneLabel}>Done</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cStyles = StyleSheet.create({
  card: {
    ...GLASS.standard,
    borderRadius:  RADIUS.md,
    flexDirection: 'row',
    alignItems:    'center',
    padding:       SPACING.md,
    marginBottom:  SPACING.sm,
    gap:           SPACING.md,
  },
  thumb: {
    width:          48,
    height:         48,
    borderRadius:   RADIUS.md,
    justifyContent: 'center',
    alignItems:     'center',
  },
  title:    { fontFamily: FONTS.body600, fontSize: 14, color: COLORS.textPrimary },
  doneBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               3,
    backgroundColor:   COLORS.successBgMid,
    borderRadius:      RADIUS.pill,
    paddingVertical:   4,
    paddingHorizontal: 8,
  },
  doneLabel: { fontFamily: FONTS.body700, fontSize: 11, color: COLORS.success },
});

// ─── SCREEN ──────────────────────────────────────────────────────────────────

export default function ProgressScreen({ navigation }) {
  const { user } = useAuth();
  const insets   = useSafeAreaInsets();

  const [streak,    setStreak]    = useState(null);
  const [completed, setCompleted] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAll,   setShowAll]   = useState(false);

  const fadeA = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [str, done] = await Promise.all([
        getStreak(user.id),
        getCompletedProjects(user.id),
      ]);
      setStreak(str);
      setCompleted(done);
    } catch {
      // Non-fatal — render with empty data
    } finally {
      setLoading(false);
      Animated.spring(fadeA, {
        toValue: 1, tension: SPRING.default.tension, friction: SPRING.default.friction, useNativeDriver: true,
      }).start();
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const totalXp      = user?.xp   ?? 0;
  const currentLevel = user?.level ?? 1;
  const xpInLevel    = calculateXpInLevel(totalXp);
  const rankTitle    = getRankTitle(currentLevel);
  const streakDays   = streak?.current_streak ?? 0;
  const displayList  = showAll ? completed : completed.slice(0, 3);

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
        {/* ── HEADER ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Progress</Text>
            <Text style={TYPE.caption}>Level {currentLevel} · {rankTitle}</Text>
          </View>
          {streakDays > 0 && (
            <View style={styles.streakBadge}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
              <Text style={styles.streakText}>{streakDays} day streak</Text>
            </View>
          )}
        </View>

        {/* ── XP BAR ─────────────────────────────────────────────── */}
        <View style={[GLASS.standard, styles.xpCard]}>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>Level {currentLevel}</Text>
            <Text style={styles.xpNumbers}>{xpInLevel.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP</Text>
          </View>
          <View style={styles.xpBg}>
            <LinearGradient
              {...GRADIENTS.xpBar}
              style={[styles.xpFill, { width: `${Math.max((xpInLevel / XP_PER_LEVEL) * 100, 2)}%` }]}
            />
          </View>
          <Text style={[TYPE.caption, { marginTop: SPACING.sm }]}>
            {(XP_PER_LEVEL - xpInLevel).toLocaleString()} XP to Level {Math.min(currentLevel + 1, 10)}
          </Text>
        </View>

        {/* ── LEVEL JOURNEY ───────────────────────────────────────── */}
        <View style={[GLASS.standard, styles.journeyCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Level Journey</Text>
            {streakDays > 0 && (
              <View style={styles.streakInline}>
                <Text style={{ fontSize: 13 }}>🔥</Text>
                <Text style={styles.streakInlineText}>{streakDays}d streak</Text>
              </View>
            )}
          </View>
          <LevelJourneyMap currentLevel={currentLevel} />
        </View>

        {/* ── COMPLETED PROJECTS ──────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Completed Projects
              {completed.length > 0
                ? <Text style={[TYPE.caption, { fontSize: 13 }]}> ({completed.length})</Text>
                : null
              }
            </Text>
            {completed.length > 3 && (
              <TouchableOpacity onPress={() => setShowAll(v => !v)}>
                <Text style={styles.seeAll}>{showAll ? 'Show less' : 'See All →'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {completed.length === 0 ? (
            <View style={[GLASS.standard, styles.emptyCard]}>
              <Text style={{ fontSize: 32, textAlign: 'center' }}>🎯</Text>
              <Text style={[TYPE.body, { textAlign: 'center' }]}>
                No completed projects yet.{'\n'}Keep working — you're almost there!
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('ExploreTab')}
              >
                <Text style={styles.exploreBtnText}>Browse Projects →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            displayList.map((item, i) => (
              <CompletedCard
                key={item.id ?? i}
                item={item}
                onPress={() =>
                  navigation.navigate(SCREENS.PROJECT_DETAIL, {
                    projectId: item.projects?.id,
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    marginBottom:      SPACING.lg,
  },
  headerTitle: { fontFamily: FONTS.heading900, fontSize: 26, color: COLORS.textPrimary },
  streakBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               SPACING.xs,
    backgroundColor:   COLORS.goldBgStrong,
    borderRadius:      RADIUS.pill,
    paddingVertical:   6,
    paddingHorizontal: SPACING.md,
    borderWidth:       1,
    borderColor:       COLORS.goldBorder,
  },
  streakText: { fontFamily: FONTS.body700, fontSize: 13, color: COLORS.hornbillGold },

  xpCard: {
    marginHorizontal: SPACING.lg,
    borderRadius:     RADIUS.lg,
    padding:          SPACING.lg,
    marginBottom:     SPACING.lg,
  },
  xpRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   SPACING.md,
  },
  xpLabel:   { fontFamily: FONTS.heading800, fontSize: 16, color: COLORS.textPrimary },
  xpNumbers: { fontFamily: FONTS.body600,    fontSize: 14, color: COLORS.hornbillGold },
  xpBg: {
    height:          12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius:    RADIUS.pill,
    overflow:        'hidden',
  },
  xpFill: { height: '100%', borderRadius: RADIUS.pill, minWidth: 4 },

  journeyCard: {
    marginHorizontal: SPACING.lg,
    borderRadius:     RADIUS.lg,
    padding:          SPACING.lg,
    marginBottom:     SPACING.lg,
  },
  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SPACING.sm,
  },
  sectionTitle: { fontFamily: FONTS.heading800, fontSize: 17, color: COLORS.textPrimary },
  streakInline: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    backgroundColor:   COLORS.goldBgMid,
    borderRadius:      RADIUS.pill,
    paddingVertical:   3,
    paddingHorizontal: 8,
  },
  streakInlineText: { fontFamily: FONTS.body700, fontSize: 11, color: COLORS.hornbillGold },

  section:  { paddingHorizontal: SPACING.lg },
  seeAll:   { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.aiCyan },
  emptyCard: {
    borderRadius: RADIUS.lg,
    padding:      SPACING.xxl,
    alignItems:   'center',
    gap:          SPACING.md,
  },
  exploreBtn: {
    marginTop:         SPACING.sm,
    backgroundColor:   COLORS.riverTeal,
    borderRadius:      RADIUS.pill,
    paddingVertical:   10,
    paddingHorizontal: SPACING.xl,
  },
  exploreBtnText: { fontFamily: FONTS.body700, fontSize: 13, color: COLORS.white },
});
