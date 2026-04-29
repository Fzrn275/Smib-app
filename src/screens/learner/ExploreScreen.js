// src/screens/learner/ExploreScreen.js
// s-explore — Browse all published projects with search and category filters.
// Accessible via Explore tab. Navigates to ProjectDetailScreen on card tap.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, TextInput, FlatList, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import { SCREENS, TAB_BAR_TOTAL_HEIGHT } from '../../navigation/navConstants';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, SPRING,
} from '../../theme';
import { getPublishedProjects }              from '../../services/projectService';
import { getCategoryMeta, DIFF_COLOR }       from './HomeScreen';
import { useAuth }   from '../../context/AuthContext';
import JuniorLearner from '../../models/JuniorLearner';
import SeniorLearner from '../../models/SeniorLearner';

// ─── FILTER CHIPS ────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Electronics', 'Agriculture', 'Renewable', 'Coding', 'Biology'];

// ─── LIST PROJECT CARD (full-width row card) ──────────────────────────────────

function ListCard({ item, navigation }) {
  const scale = useRef(new Animated.Value(1)).current;
  const { emoji, grad } = getCategoryMeta(item.category);
  const diffColor = DIFF_COLOR[(item.difficulty || '').toLowerCase()] ?? COLORS.textCaption;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.97, tension: SPRING.card.tension, friction: SPRING.card.friction, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    tension: SPRING.card.tension, friction: SPRING.card.friction, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.listCardWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => navigation.navigate(SCREENS.PROJECT_DETAIL, { projectId: item.id })}
        style={styles.listCard}
      >
        <View style={[styles.listThumb, { backgroundColor: grad[1] }]}>
          <Text style={styles.listEmoji}>{emoji}</Text>
        </View>
        <View style={styles.listContent}>
          <View style={styles.listTopRow}>
            <Text style={styles.listCategory}>{item.category}</Text>
            <View style={[styles.diffChip, { borderColor: diffColor }]}>
              <Text style={[styles.diffChipText, { color: diffColor }]}>{item.difficulty}</Text>
            </View>
          </View>
          <Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.listMeta}>
            <Ionicons name="time-outline" size={12} color={COLORS.textCaption} />
            <Text style={[TYPE.caption, { marginLeft: 3 }]}>
              {item.estimated_duration ?? 'Self-paced'} · Not started
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── EXPLORE SCREEN ───────────────────────────────────────────────────────────

export default function ExploreScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const { user } = useAuth();

  const [allProjects,      setAll]             = useState([]);
  const [displayed,        setDisplayed]       = useState([]);
  const [search,           setSearch]          = useState('');
  const [activeFilter,     setFilter]          = useState('All');
  const [loading,          setLoading]         = useState(true);
  const [error,            setError]           = useState(null);
  const [refreshing,       setRefreshing]      = useState(false);
  const [recommendedCount, setRecommendedCount] = useState(0);

  const listOpacity = useRef(new Animated.Value(0)).current;

  function runEntrance() {
    Animated.spring(listOpacity, {
      toValue: 1,
      tension: SPRING.default.tension,
      friction: SPRING.default.friction,
      useNativeDriver: true,
    }).start();
  }

  // ─── Load ──────────────────────────────────────────────────────────────
  async function load() {
    try {
      const data = await getPublishedProjects();
      setAll(data);
      setDisplayed(data);
      setError(null);
    } catch {
      setError('Could not load projects. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().then(runEntrance);
  }, []);

  // ─── Filter / search logic ─────────────────────────────────────────────
  useEffect(() => {
    let list = allProjects;
    if (activeFilter !== 'All') {
      list = list.filter(p => (p.category || '').toLowerCase() === activeFilter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q),
      );
    }
    setDisplayed(list);

    // Polymorphism: compute recommended count for this learner's role
    if (user && ['junior_learner', 'senior_learner'].includes(user.role)) {
      const LearnerClass = user.role === 'junior_learner' ? JuniorLearner : SeniorLearner;
      const learnerModel = new LearnerClass(
        user.id, user.name, user.email, user.role, user.avatar_url,
        user.xp ?? 0, user.level ?? 1, user.school_name ?? '', user.grade_level ?? '',
      );
      const { projects: recList } = learnerModel.getRecommendedProjects(list);
      setRecommendedCount(recList.length);
    }
  }, [search, activeFilter, allProjects, user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* Sticky header */}
      <View style={{ paddingTop: insets.top + SPACING.sm }}>
        <Text style={styles.screenTitle}>Explore Projects</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textCaption} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects…"
            placeholderTextColor={COLORS.textCaption}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textCaption} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!loading && (
          <Text style={styles.resultCount}>
            {displayed.length} project{displayed.length !== 1 ? 's' : ''} found
            {recommendedCount > 0 ? ` · ${recommendedCount} for your level` : ''}
          </Text>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <Text style={TYPE.body}>Loading projects…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={COLORS.textCaption} />
          <Text style={[TYPE.body, { marginTop: SPACING.md, textAlign: 'center', paddingHorizontal: SPACING.xl }]}>
            {error}
          </Text>
        </View>
      ) : displayed.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 44 }}>🔍</Text>
          <Text style={[TYPE.body, { marginTop: SPACING.md }]}>No projects found</Text>
          <Text style={TYPE.caption}>Try a different search or filter</Text>
        </View>
      ) : (
        <Animated.FlatList
          data={displayed}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ListCard item={item} navigation={navigation} />}
          contentContainerStyle={{
            paddingHorizontal: SPACING.lg,
            paddingTop:        SPACING.sm,
            paddingBottom:     TAB_BAR_TOTAL_HEIGHT + SPACING.xl,
          }}
          showsVerticalScrollIndicator={false}
          style={{ opacity: listOpacity }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.hornbillGold}
            />
          }
        />
      )}
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    gap:            SPACING.sm,
    paddingBottom:  TAB_BAR_TOTAL_HEIGHT,
  },

  screenTitle: {
    fontFamily:        FONTS.heading900,
    fontSize:          24,
    color:             COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom:      SPACING.md,
  },

  searchBar: {
    ...GLASS.standard,
    flexDirection:     'row',
    alignItems:        'center',
    marginHorizontal:  SPACING.lg,
    borderRadius:      RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical:   10,
    gap:               SPACING.sm,
    marginBottom:      SPACING.md,
  },
  searchInput: {
    flex:       1,
    fontFamily: FONTS.body400,
    fontSize:   14,
    color:      COLORS.textPrimary,
  },

  filterRow: {
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.sm,
    paddingBottom:     SPACING.sm,
  },
  chip: {
    paddingVertical:   7,
    paddingHorizontal: SPACING.md,
    borderRadius:      RADIUS.pill,
    backgroundColor:   'rgba(255,255,255,0.08)',
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.15)',
  },
  chipActive: {
    backgroundColor: COLORS.hornbillGold,
    borderColor:     COLORS.hornbillGold,
  },
  chipText:       { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.textBody },
  chipTextActive: { color: COLORS.deepNavy },

  resultCount: {
    fontFamily:        FONTS.body400,
    fontSize:          12,
    color:             COLORS.textCaption,
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.sm,
  },

  // List card
  listCardWrap: { marginBottom: SPACING.md },
  listCard: {
    ...GLASS.standard,
    borderRadius:  RADIUS.lg,
    flexDirection: 'row',
    overflow:      'hidden',
    minHeight:     84,
  },
  listThumb: {
    width:          80,
    justifyContent: 'center',
    alignItems:     'center',
  },
  listEmoji: { fontSize: 30 },
  listContent: {
    flex:    1,
    padding: SPACING.md,
    gap:     4,
  },
  listTopRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  listCategory: {
    fontFamily:    FONTS.body700,
    fontSize:      10,
    color:         COLORS.textCaption,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  diffChip: {
    borderWidth:       1,
    borderRadius:      RADIUS.pill,
    paddingVertical:   2,
    paddingHorizontal: SPACING.sm,
  },
  diffChipText: {
    fontFamily:    FONTS.body700,
    fontSize:      10,
    textTransform: 'capitalize',
  },
  listTitle: {
    fontFamily: FONTS.body600,
    fontSize:   14,
    color:      COLORS.textPrimary,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems:    'center',
  },
});
