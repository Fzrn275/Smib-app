// src/screens/learner/ProjectListScreen.js
// s-list — All Projects list. Has a back button, search, and category filters.
// Accessed from HomeScreen "See All →". Navigates to ProjectDetailScreen.

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
import { getPublishedProjects }        from '../../services/projectService';
import { getCategoryMeta, DIFF_COLOR } from './HomeScreen';

const FILTERS = ['All', 'Electronics', 'Agriculture', 'Renewable', 'Coding', 'Biology'];

// ─── LIST CARD ───────────────────────────────────────────────────────────────

function ListCard({ item, navigation }) {
  const scale = useRef(new Animated.Value(1)).current;
  const { emoji, grad } = getCategoryMeta(item.category);
  const diffColor = DIFF_COLOR[(item.difficulty || '').toLowerCase()] ?? COLORS.textCaption;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.97, tension: SPRING.card.tension, friction: SPRING.card.friction, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    tension: SPRING.card.tension, friction: SPRING.card.friction, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => navigation.navigate(SCREENS.PROJECT_DETAIL, { projectId: item.id })}
        style={styles.card}
      >
        <View style={[styles.thumb, { backgroundColor: grad[1] }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.category}>{item.category}</Text>
            <View style={[styles.diffChip, { borderColor: diffColor }]}>
              <Text style={[styles.diffChipText, { color: diffColor }]}>{item.difficulty}</Text>
            </View>
          </View>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={12} color={COLORS.textCaption} />
            <Text style={[TYPE.caption, { marginLeft: 3 }]}>
              {item.estimated_duration ?? 'Self-paced'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── SCREEN ──────────────────────────────────────────────────────────────────

export default function ProjectListScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [allProjects,  setAll]        = useState([]);
  const [displayed,    setDisplayed]  = useState([]);
  const [search,       setSearch]     = useState('');
  const [activeFilter, setFilter]     = useState('All');
  const [loading,      setLoading]    = useState(true);
  const [error,        setError]      = useState(null);
  const [refreshing,   setRefreshing] = useState(false);

  const listOpacity = useRef(new Animated.Value(0)).current;

  async function load() {
    try {
      const data = await getPublishedProjects();
      setAll(data);
      setDisplayed(data);
      setError(null);
    } catch {
      setError('Could not load projects.');
    } finally {
      setLoading(false);
      Animated.spring(listOpacity, {
        toValue: 1,
        tension: SPRING.default.tension,
        friction: SPRING.default.friction,
        useNativeDriver: true,
      }).start();
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = allProjects;
    if (activeFilter !== 'All') {
      list = list.filter(p => (p.category || '').toLowerCase() === activeFilter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q),
      );
    }
    setDisplayed(list);
  }, [search, activeFilter, allProjects]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + SPACING.sm }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.heading}>All Projects</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Search */}
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
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!loading && (
          <Text style={styles.resultCount}>
            {displayed.length} project{displayed.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}><Text style={TYPE.body}>Loading…</Text></View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={COLORS.textCaption} />
          <Text style={[TYPE.body, { marginTop: SPACING.md, textAlign: 'center' }]}>{error}</Text>
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

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    marginBottom:      SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  heading: {
    flex:       1,
    textAlign:  'center',
    fontFamily: FONTS.heading800,
    fontSize:   20,
    color:      COLORS.textPrimary,
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
  chipActive:     { backgroundColor: COLORS.hornbillGold, borderColor: COLORS.hornbillGold },
  chipText:       { fontFamily: FONTS.body600, fontSize: 13, color: COLORS.textBody },
  chipTextActive: { color: COLORS.deepNavy },

  resultCount: {
    fontFamily:        FONTS.body400,
    fontSize:          12,
    color:             COLORS.textCaption,
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.sm,
  },

  cardWrap: { marginBottom: SPACING.md },
  card: {
    ...GLASS.standard,
    borderRadius:  RADIUS.lg,
    flexDirection: 'row',
    overflow:      'hidden',
    minHeight:     84,
  },
  thumb: {
    width:          80,
    justifyContent: 'center',
    alignItems:     'center',
  },
  emoji:   { fontSize: 30 },
  content: { flex: 1, padding: SPACING.md, gap: 4 },
  topRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  category: {
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
  title: {
    fontFamily: FONTS.body600,
    fontSize:   14,
    color:      COLORS.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    alignItems:    'center',
  },
});
