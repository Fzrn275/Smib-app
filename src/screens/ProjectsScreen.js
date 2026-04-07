// ============================================================
// FILE: src/screens/ProjectsScreen.js
// PURPOSE: Explore tab — browse all available projects.
//
// DESIGN DECISIONS (beyond the mockup):
//   - Search bar: essential for discoverability when there are many projects
//   - Category filter chips: lets students quickly narrow by interest area
//   - "Recommended" section: surfaces beginner projects at the top
//   - Enroll button with local toggle state (ready for Supabase later)
//   - Enrolled projects show a teal checkmark instead of enroll button
// ============================================================

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '../theme';

// ----------------------------------------------------------
// ALL AVAILABLE PROJECTS — hardcoded until Supabase
// ----------------------------------------------------------
const ALL_PROJECTS = [
  // Electronics
  {
    id: 'solar-charger',
    emoji: '⚡',
    emojiColor: Colors.tealLight,
    barColor: Colors.teal,
    title: 'Solar Phone Charger',
    category: 'Electronics',
    difficulty: 'Easy',
    diffStyle: 'easy',
    steps: 6,
    duration: '2 hours',
    enrolled: true,   // already enrolled from HomeScreen
  },
  {
    id: 'led-lamp',
    emoji: '💡',
    emojiColor: Colors.warningLight,
    barColor: Colors.warning,
    title: 'DIY LED Desk Lamp',
    category: 'Electronics',
    difficulty: 'Easy',
    diffStyle: 'easy',
    steps: 5,
    duration: '1.5 hours',
    enrolled: false,
  },
  {
    id: 'alarm-system',
    emoji: '🔔',
    emojiColor: Colors.infoLight,
    barColor: Colors.info,
    title: 'Simple Alarm System',
    category: 'Electronics',
    difficulty: 'Medium',
    diffStyle: 'medium',
    steps: 8,
    duration: '3 hours',
    enrolled: false,
  },

  // Agriculture
  {
    id: 'water-sensor',
    emoji: '🌱',
    emojiColor: Colors.successLight,
    barColor: Colors.success,
    title: 'Smart Water Sensor',
    category: 'Agriculture',
    difficulty: 'Medium',
    diffStyle: 'medium',
    steps: 10,
    duration: '3 hours',
    enrolled: true,
  },
  {
    id: 'compost-monitor',
    emoji: '🌿',
    emojiColor: Colors.successLight,
    barColor: Colors.success,
    title: 'Compost Temperature Monitor',
    category: 'Agriculture',
    difficulty: 'Easy',
    diffStyle: 'easy',
    steps: 6,
    duration: '2 hours',
    enrolled: false,
  },

  // Renewable Energy
  {
    id: 'wind-turbine',
    emoji: '♻️',
    emojiColor: Colors.warningLight,
    barColor: Colors.warning,
    title: 'Recycled Wind Turbine',
    category: 'Renewable Energy',
    difficulty: 'Easy',
    diffStyle: 'easy',
    steps: 6,
    duration: '4 hours',
    enrolled: true,
  },
  {
    id: 'rain-collector',
    emoji: '🌧️',
    emojiColor: Colors.tealLight,
    barColor: Colors.teal,
    title: 'Rainwater Collector',
    category: 'Renewable Energy',
    difficulty: 'Easy',
    diffStyle: 'easy',
    steps: 4,
    duration: '1 hour',
    enrolled: false,
  },

  // Craft & Design
  {
    id: 'batik-pattern',
    emoji: '🎨',
    emojiColor: Colors.infoLight,
    barColor: Colors.info,
    title: 'Digital Batik Pattern',
    category: 'Craft & Design',
    difficulty: 'Easy',
    diffStyle: 'easy',
    steps: 5,
    duration: '2 hours',
    enrolled: false,
  },
  {
    id: 'hornbill-sculpture',
    emoji: '🦅',
    emojiColor: Colors.warningLight,
    barColor: Colors.warning,
    title: 'Hornbill Clay Sculpture',
    category: 'Craft & Design',
    difficulty: 'Medium',
    diffStyle: 'medium',
    steps: 7,
    duration: '3 hours',
    enrolled: false,
  },
];

const CATEGORIES = ['All', 'Electronics', 'Agriculture', 'Renewable Energy', 'Craft & Design'];

// ----------------------------------------------------------
// COMPONENT: CATEGORY CHIP
// ----------------------------------------------------------
function CategoryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ----------------------------------------------------------
// COMPONENT: DIFFICULTY PILL
// ----------------------------------------------------------
function DiffPill({ diffStyle, label }) {
  const colors = diffStyle === 'easy'
    ? { bg: Colors.successLight, text: Colors.success }
    : { bg: Colors.warningLight, text: Colors.warning };

  return (
    <View style={[styles.diffPill, { backgroundColor: colors.bg }]}>
      <Text style={[styles.diffText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

// ----------------------------------------------------------
// COMPONENT: PROJECT CARD
// ----------------------------------------------------------
function ExploreCard({ project, onEnroll }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={styles.cardInner}
      >

        {/* Left: emoji box */}
        <View style={[styles.emojiBox, { backgroundColor: project.emojiColor }]}>
          <Text style={styles.emojiText}>{project.emoji}</Text>
        </View>

        {/* Middle: info */}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{project.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>📋 {project.steps} steps</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>⏱ {project.duration}</Text>
          </View>

          <DiffPill diffStyle={project.diffStyle} label={project.difficulty} />
        </View>

        {/* Right: enroll / enrolled indicator */}
        {project.enrolled ? (
          <View style={styles.enrolledBadge}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.teal} />
          </View>
        ) : (
          <TouchableOpacity style={styles.enrollBtn} onPress={() => onEnroll(project.id)} activeOpacity={0.8}>
            <Text style={styles.enrollText}>+ Join</Text>
          </TouchableOpacity>
        )}

      </TouchableOpacity>
    </Animated.View>
  );
}

// ----------------------------------------------------------
// MAIN SCREEN
// ----------------------------------------------------------
export default function ProjectsScreen() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [projects, setProjects] = useState(ALL_PROJECTS);
  const entranceAnim  = useRef(new Animated.Value(0)).current;
  const listFadeAnim  = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      entranceAnim.setValue(0);
      Animated.timing(entranceAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, [])
  );

  // Fade the card list out then back in whenever filter or search changes
  useEffect(() => {
    listFadeAnim.setValue(0);
    Animated.timing(listFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [search, category]);

  // Enroll toggles the enrolled flag locally (Supabase will handle this for real)
  const handleEnroll = (id) => {
    setProjects(prev =>
      prev.map(p => p.id === id ? { ...p, enrolled: true } : p)
    );
  };

  // Filter by search text and selected category
  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesSearch   = p.title.toLowerCase().includes(search.toLowerCase()) ||
                              p.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [projects, search, category]);

  // Recommended = Easy projects you haven't enrolled in yet
  const recommended = filtered.filter(p => p.diffStyle === 'easy' && !p.enrolled);
  const allFiltered  = filtered;

  const entranceStyle = {
    opacity:   entranceAnim,
    transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.View style={[{ flex: 1 }, entranceStyle]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

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
          <Text style={styles.headerSub}>Semua Projek /</Text>
          <Text style={styles.headerTitle}>Explore Projects 🔍</Text>
        </View>

        {/* ── SEARCH BAR ───────────────────────────────────── */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── CATEGORY CHIPS ───────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORIES.map(cat => (
            <CategoryChip
              key={cat}
              label={cat}
              active={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </ScrollView>

        {/* ── RECOMMENDED SECTION (only shown when no search active) ── */}
        {search === '' && recommended.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Recommended for You ⭐</Text>
            </View>
            <View style={styles.cardList}>
              {recommended.map(p => (
                <ExploreCard key={p.id} project={p} onEnroll={handleEnroll} />
              ))}
            </View>
          </>
        )}

        {/* ── ALL PROJECTS SECTION ─────────────────────────── */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>
            {search ? `Results (${allFiltered.length})` : 'All Projects 📦'}
          </Text>
          <Text style={styles.countText}>{allFiltered.length} projects</Text>
        </View>

        <Animated.View style={{ opacity: listFadeAnim }}>
          {allFiltered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No projects found</Text>
              <Text style={styles.emptySub}>Try a different search or category</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {allFiltered.map(p => (
                <ExploreCard key={p.id} project={p} onEnroll={handleEnroll} />
              ))}
            </View>
          )}
        </Animated.View>

      </ScrollView>
      </Animated.View>
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
    backgroundColor:         '#1a1a2e',
    paddingHorizontal:       Spacing.md,
    paddingTop:              Spacing.md,
    paddingBottom:           Spacing.xl,
    borderBottomLeftRadius:  28,
    borderBottomRightRadius: 28,
    overflow:                'hidden',
    marginBottom:            Spacing.sm,
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

  headerTitle: {
    fontSize:   22,
    fontWeight: '800',
    color:      '#ffffff',
    zIndex:     1,
  },

  headerSub: {
    fontSize:    13,
    color:       'rgba(255,255,255,0.60)',
    marginBottom: 2,
    zIndex:      1,
  },

  // ── Search ─────────────────────────────────────────────
  searchWrap: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   Colors.card,
    marginHorizontal:  Spacing.md,
    marginVertical:    Spacing.sm,
    borderRadius:      Radius.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical:   10,
    ...Shadow.card,
  },

  searchIcon: {
    marginRight: Spacing.sm,
  },

  searchInput: {
    flex:      1,
    fontSize:  14,
    color:     Colors.textPrimary,
    padding:   0,   // remove default Android padding
  },

  // ── Category Chips ─────────────────────────────────────
  chipsRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom:     Spacing.sm,
    gap:               Spacing.sm,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical:    7,
    borderRadius:      Radius.full,
    backgroundColor:   Colors.card,
    borderWidth:       1,
    borderColor:       Colors.border,
  },

  chipActive: {
    backgroundColor: Colors.teal,
    borderColor:     Colors.teal,
  },

  chipText: {
    fontSize:   13,
    fontWeight: '700',
    color:      Colors.textMuted,
  },

  chipTextActive: {
    color: '#ffffff',
  },

  // ── Section Header ─────────────────────────────────────
  sectionHead: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: Spacing.md,
    paddingTop:        Spacing.md,
    paddingBottom:     Spacing.sm,
  },

  sectionTitle: {
    fontSize:   15,
    fontWeight: '800',
    color:      Colors.textPrimary,
  },

  countText: {
    fontSize:   12,
    color:      Colors.textMuted,
    fontWeight: '600',
  },

  // ── Cards ──────────────────────────────────────────────
  cardList: {
    paddingHorizontal: Spacing.md,
    gap:               Spacing.sm,
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    ...Shadow.card,
  },

  cardInner: {
    flexDirection: 'row',
    alignItems:    'center',
    padding:       Spacing.sm + 4,
    gap:           Spacing.sm,
  },

  emojiBox: {
    width:          50,
    height:         50,
    borderRadius:   14,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },

  emojiText: {
    fontSize: 26,
  },

  cardBody: {
    flex: 1,
    gap:  4,
  },

  cardTitle: {
    fontSize:   14,
    fontWeight: '800',
    color:      Colors.textPrimary,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },

  metaText: {
    fontSize: 11,
    color:    Colors.textMuted,
  },

  metaDot: {
    fontSize: 11,
    color:    Colors.textMuted,
  },

  diffPill: {
    alignSelf:         'flex-start',
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      Radius.full,
  },

  diffText: {
    fontSize:   10,
    fontWeight: '700',
  },

  // ── Enroll button / badge ───────────────────────────────
  enrollBtn: {
    backgroundColor:   Colors.teal,
    borderRadius:      Radius.md,
    paddingHorizontal: 12,
    paddingVertical:    7,
    flexShrink:        0,
  },

  enrollText: {
    fontSize:   12,
    fontWeight: '800',
    color:      '#ffffff',
  },

  enrolledBadge: {
    paddingHorizontal: 4,
    flexShrink:        0,
  },

  // ── Empty state ────────────────────────────────────────
  emptyState: {
    alignItems:   'center',
    paddingTop:   Spacing.xxl,
    paddingBottom: Spacing.lg,
  },

  emptyEmoji: {
    fontSize:     48,
    marginBottom: Spacing.sm,
  },

  emptyTitle: {
    fontSize:     16,
    fontWeight:   '700',
    color:        Colors.textPrimary,
    marginBottom: 4,
  },

  emptySub: {
    fontSize: 13,
    color:    Colors.textMuted,
  },
});
