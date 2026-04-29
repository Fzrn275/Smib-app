// src/screens/learner/LeaderboardScreen.js
// s-lb — Leaderboard with three scope tabs: My School | Sarawak | Global.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                       from '../../context/AuthContext';
import { TAB_BAR_TOTAL_HEIGHT }          from '../../navigation/navConstants';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, SPRING,
} from '../../theme';
import { supabase } from '../../services/supabaseClient';

// ─── SCOPE TABS ──────────────────────────────────────────────────────────────

const SCOPES = ['My School', 'Sarawak', 'Global'];

// ─── FETCH LEADERBOARD ───────────────────────────────────────────────────────

async function fetchLeaderboard(scope, schoolName, limit = 50) {
  let query = supabase
    .from('users')
    .select('id, name, school_name, xp, level, avatar_url, role')
    .in('role', ['junior_learner', 'senior_learner'])
    .order('xp', { ascending: false })
    .limit(limit);

  if (scope === 'My School' && schoolName) {
    query = query.eq('school_name', schoolName);
  }
  // Sarawak and Global both return all learners (no state/region filter available)

  const { data, error } = await query;
  if (error) throw new Error(error.message || 'Could not load leaderboard.');
  return data ?? [];
}

// ─── RANK MEDAL ──────────────────────────────────────────────────────────────

function rankMedal(rank) {
  if (rank === 1) return { emoji: '🥇', color: '#FCD34D' };
  if (rank === 2) return { emoji: '🥈', color: '#CBD5E1' };
  if (rank === 3) return { emoji: '🥉', color: '#D97706' };
  return null;
}

// ─── ROW ─────────────────────────────────────────────────────────────────────

function LeaderRow({ entry, rank, isMe }) {
  const medal    = rankMedal(rank);
  const initial  = (entry.name ?? '?')[0].toUpperCase();
  const slideA   = useRef(new Animated.Value(30)).current;
  const fadeA    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = Math.min(rank * 40, 400);
    Animated.parallel([
      Animated.spring(slideA, { toValue: 0, tension: 200, friction: 22, delay, useNativeDriver: true }),
      Animated.timing(fadeA,  { toValue: 1, duration: 250, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      rowStyles.row,
      isMe && rowStyles.rowMe,
      { opacity: fadeA, transform: [{ translateX: slideA }] },
    ]}>
      {/* Rank */}
      <View style={rowStyles.rankBox}>
        {medal
          ? <Text style={[rowStyles.medal, { color: medal.color }]}>{medal.emoji}</Text>
          : <Text style={rowStyles.rankNum}>{rank}</Text>
        }
      </View>

      {/* Avatar */}
      <View style={[rowStyles.avatar, medal && { borderColor: medal.color }]}>
        <Text style={rowStyles.avatarText}>{initial}</Text>
      </View>

      {/* Name + School */}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[rowStyles.name, isMe && { color: COLORS.aiCyan }]} numberOfLines={1}>
          {entry.name ?? 'Learner'}
          {isMe ? ' (You)' : ''}
        </Text>
        <Text style={TYPE.caption} numberOfLines={1}>{entry.school_name ?? '—'}</Text>
      </View>

      {/* XP */}
      <View style={rowStyles.xpBox}>
        <Text style={rowStyles.xpText}>{(entry.xp ?? 0).toLocaleString()}</Text>
        <Text style={rowStyles.xpLabel}>XP</Text>
      </View>
    </Animated.View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    ...GLASS.standard,
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   RADIUS.md,
    padding:        SPACING.md,
    marginBottom:   SPACING.sm,
    gap:            SPACING.md,
  },
  rowMe: {
    backgroundColor: COLORS.tealBgMid,
    borderTopColor:  COLORS.aiCyan,
    borderLeftColor: COLORS.cyanBorder,
  },
  rankBox: { width: 32, alignItems: 'center' },
  medal:   { fontSize: 22 },
  rankNum: { fontFamily: FONTS.heading800, fontSize: 16, color: COLORS.textCaption },
  avatar: {
    width:           38,
    height:          38,
    borderRadius:    RADIUS.pill,
    backgroundColor: COLORS.riverTeal,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     2,
    borderColor:     'transparent',
  },
  avatarText: { fontFamily: FONTS.heading800, fontSize: 15, color: COLORS.white },
  name:       { fontFamily: FONTS.body600, fontSize: 14, color: COLORS.textPrimary },
  xpBox:      { alignItems: 'flex-end' },
  xpText:     { fontFamily: FONTS.heading800, fontSize: 15, color: COLORS.hornbillGold },
  xpLabel:    { fontFamily: FONTS.body400,    fontSize: 10, color: COLORS.textLabel },
});

// ─── SCREEN ──────────────────────────────────────────────────────────────────

export default function LeaderboardScreen({ navigation }) {
  const { user } = useAuth();
  const insets   = useSafeAreaInsets();

  const [scope,     setScope]     = useState('My School');
  const [rows,      setRows]      = useState([]);
  const [loading,   setLoading]   = useState(true);

  const tabSlideA  = useRef(new Animated.Value(0)).current;
  const [tabWidths, setTabWidths] = useState([0, 0, 0]);
  const fadeA      = useRef(new Animated.Value(0)).current;

  // ─── Load ─────────────────────────────────────────────────────────────────
  const load = useCallback(async (s) => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard(s, user?.school_name);
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
      Animated.spring(fadeA, {
        toValue: 1, tension: SPRING.default.tension, friction: SPRING.default.friction, useNativeDriver: true,
      }).start();
    }
  }, [user?.school_name]);

  useEffect(() => { load(scope); }, [scope]);

  // ─── Animated tab pill ────────────────────────────────────────────────────
  function handleTabPress(tab, index) {
    setScope(tab);
    // Slide pill to selected tab
    const offset = tabWidths.slice(0, index).reduce((a, b) => a + b, 0);
    Animated.spring(tabSlideA, {
      toValue: offset, tension: SPRING.card.tension, friction: SPRING.card.friction, useNativeDriver: true,
    }).start();
  }

  // ─── My rank ──────────────────────────────────────────────────────────────
  const myRank = rows.findIndex(r => r.id === user?.id) + 1;

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Leaderboard</Text>
          {myRank > 0 && (
            <View style={styles.myRankBadge}>
              <Text style={styles.myRankText}>You #{myRank}</Text>
            </View>
          )}
        </View>

        {/* ── SCOPE TABS ─────────────────────────────────────────── */}
        <View style={styles.tabBar}>
          {SCOPES.map((tab, i) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, scope === tab && styles.tabActive]}
              onPress={() => handleTabPress(tab, i)}
              onLayout={(e) => {
                const w = [...tabWidths];
                w[i] = e.nativeEvent.layout.width;
                setTabWidths(w);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, scope === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── MY RANK CARD (if in top 10) ─────────────────────────── */}
        {myRank > 0 && myRank <= 10 && (
          <View style={[GLASS.stat, styles.myRankCard]}>
            <Ionicons name="trophy-outline" size={20} color={COLORS.hornbillGold} />
            <Text style={styles.myRankCardText}>
              You're ranked #{myRank} in {scope}!
            </Text>
          </View>
        )}

        {/* ── LIST ───────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: SPACING.lg }}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={COLORS.hornbillGold} />
            </View>
          ) : rows.length === 0 ? (
            <View style={[GLASS.standard, styles.emptyCard]}>
              <Text style={{ fontSize: 32 }}>🏫</Text>
              <Text style={[TYPE.body, { textAlign: 'center' }]}>
                {scope === 'My School'
                  ? 'No other learners from your school yet.'
                  : 'No learners found.'}
              </Text>
            </View>
          ) : (
            rows.map((entry, i) => (
              <LeaderRow
                key={entry.id}
                entry={entry}
                rank={i + 1}
                isMe={entry.id === user?.id}
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
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    marginBottom:      SPACING.lg,
    gap:               SPACING.md,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius:    RADIUS.pill,
    padding:         SPACING.sm,
  },
  title: { flex: 1, fontFamily: FONTS.heading900, fontSize: 24, color: COLORS.textPrimary },
  myRankBadge: {
    backgroundColor:   COLORS.goldBgStrong,
    borderRadius:      RADIUS.pill,
    paddingVertical:   5,
    paddingHorizontal: SPACING.md,
    borderWidth:       1,
    borderColor:       COLORS.goldBorder,
  },
  myRankText: { fontFamily: FONTS.body700, fontSize: 12, color: COLORS.hornbillGold },

  tabBar: {
    flexDirection:     'row',
    marginHorizontal:  SPACING.lg,
    marginBottom:      SPACING.lg,
    ...GLASS.standard,
    borderRadius:      RADIUS.lg,
    padding:           4,
    gap:               4,
  },
  tab: {
    flex:           1,
    paddingVertical: 9,
    alignItems:     'center',
    borderRadius:   RADIUS.md,
  },
  tabActive: { backgroundColor: COLORS.riverTeal },
  tabText:   { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.textCaption },
  tabTextActive: { color: COLORS.white },

  myRankCard: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               SPACING.sm,
    marginHorizontal:  SPACING.lg,
    borderRadius:      RADIUS.md,
    padding:           SPACING.md,
    marginBottom:      SPACING.lg,
  },
  myRankCardText: { fontFamily: FONTS.body600, fontSize: 14, color: COLORS.hornbillGold },

  center:    { paddingVertical: SPACING.xxl, alignItems: 'center' },
  emptyCard: {
    borderRadius: RADIUS.lg,
    padding:      SPACING.xxl,
    alignItems:   'center',
    gap:          SPACING.md,
  },
});
