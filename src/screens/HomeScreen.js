// ============================================================
// FILE: src/screens/HomeScreen.js
// PURPOSE: Main landing screen of S-MIB.
//          Shows a welcome banner, project cards with a
//          Web3 / dark glassmorphism aesthetic.
//
// STYLE: Dark base + Sarawak gold glow + glass cards
// ============================================================

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';

// ----------------------------------------------------------
// STATIC DATA — projects shown on home screen
// (Will be replaced with Supabase data later)
// ----------------------------------------------------------
const PROJECTS = [
  {
    id:         'led-torch',
    emoji:      '💡',
    title:      'Lampu Suluh LED',
    subtitle:   'LED Torch from Old Batteries',
    difficulty: 'Beginner',
    diffColor:  Colors.success,
    time:       '30 min',
    points:     100,
    category:   'Electronics',
  },
  {
    id:         'motor-generator',
    emoji:      '⚙️',
    title:      'Penjana Motor DC',
    subtitle:   'DC Motor Generator',
    difficulty: 'Intermediate',
    diffColor:  Colors.warning,
    time:       '2 jam',
    points:     200,
    category:   'Mechanics',
  },
  {
    id:         'solar-panel',
    emoji:      '☀️',
    title:      'Panel Solar DIY',
    subtitle:   'DIY Solar Panel from Old CDs',
    difficulty: 'Advanced',
    diffColor:  Colors.red,
    time:       '4 jam',
    points:     350,
    category:   'Solar',
  },
  {
    id:         'mini-fan',
    emoji:      '🌀',
    title:      'Kipas Mini DIY',
    subtitle:   'DIY Mini Fan from Old Motor',
    difficulty: 'Intermediate',
    diffColor:  Colors.warning,
    time:       '1 jam',
    points:     150,
    category:   'Mechanics',
  },
];

// ----------------------------------------------------------
// FILTER TABS
// ----------------------------------------------------------
const FILTERS = ['Semua', 'Electronics', 'Mechanics', 'Solar'];

// ----------------------------------------------------------
// COMPONENT: DIFFICULTY BADGE
// ----------------------------------------------------------
function DiffBadge({ label, color }) {
  return (
    <View style={[styles.diffBadge, { backgroundColor: color + '22', borderColor: color + '66' }]}>
      <Text style={[styles.diffText, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

// ----------------------------------------------------------
// COMPONENT: PROJECT CARD (glass style)
// ----------------------------------------------------------
function ProjectCard({ project, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Gold left accent bar */}
      <View style={styles.cardAccent} />

      {/* Emoji hero */}
      <View style={styles.cardEmoji}>
        <Text style={styles.emojiText}>{project.emoji}</Text>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{project.title}</Text>
          <DiffBadge label={project.difficulty} color={project.diffColor} />
        </View>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{project.subtitle}</Text>

        {/* Meta row */}
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{project.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star-outline" size={13} color={Colors.gold} />
            <Text style={[styles.metaText, { color: Colors.gold }]}>{project.points} XP</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{project.category}</Text>
          </View>
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color={Colors.gold} style={styles.chevron} />
    </TouchableOpacity>
  );
}

// ----------------------------------------------------------
// MAIN SCREEN
// ----------------------------------------------------------
export default function HomeScreen() {
  // Active filter state
  const [activeFilter, setActiveFilter] = useState('Semua');

  // Filtered project list
  const filtered = activeFilter === 'Semua'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === activeFilter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── HEADER ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>SARAWAK MAKER-IN-A-BOX</Text>
            <Text style={styles.headerTitle}>S-MIB</Text>
          </View>
          {/* Gold glow dot — online indicator */}
          <View style={styles.onlineDot} />
        </View>

        {/* ── WELCOME BANNER ─────────────────────────────── */}
        <View style={styles.banner}>
          {/* Glow blobs for Web3 depth effect */}
          <View style={styles.bannerGlowGold} />
          <View style={styles.bannerGlowRed} />

          <Text style={styles.bannerGreeting}>Selamat Datang 👋</Text>
          <Text style={styles.bannerTitle}>Bina sesuatu{'\n'}yang hebat hari ini.</Text>
          <Text style={styles.bannerSub}>Belajar  •  Bina  •  Berjaya</Text>

          {/* Stat pills */}
          <View style={styles.bannerStats}>
            <View style={styles.statPill}>
              <Ionicons name="cube-outline" size={14} color={Colors.gold} />
              <Text style={styles.statText}>4 Projek</Text>
            </View>
            <View style={styles.statPill}>
              <Ionicons name="wifi-outline" size={14} color={Colors.success} />
              <Text style={[styles.statText, { color: Colors.success }]}>Offline Ready</Text>
            </View>
          </View>
        </View>

        {/* ── SECTION TITLE ──────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Semua Projek</Text>
          <Text style={styles.sectionCount}>{filtered.length} projek</Text>
        </View>

        {/* ── FILTER TABS ────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterLabel, activeFilter === f && styles.filterLabelActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── PROJECT CARDS ──────────────────────────────── */}
        <View style={styles.cardList}>
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() => {}}   // Will navigate to ProjectDetail later
            />
          ))}
        </View>

      </ScrollView>
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

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  // ── Header ────────────────────────────────────────────
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop:     Spacing.md,
    paddingBottom:  Spacing.sm,
  },

  headerLabel: {
    fontSize:      10,
    fontWeight:    '700',
    color:         Colors.gold,
    letterSpacing: 2,
  },

  headerTitle: {
    fontSize:   28,
    fontWeight: '900',
    color:      Colors.textPrimary,
  },

  // Gold pulsing dot (online indicator)
  onlineDot: {
    width:           10,
    height:          10,
    borderRadius:    5,
    backgroundColor: Colors.gold,
    shadowColor:     Colors.gold,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.9,
    shadowRadius:    6,
    elevation:       6,
  },

  // ── Welcome Banner ────────────────────────────────────
  banner: {
    margin:          Spacing.md,
    borderRadius:    Radius.lg,
    padding:         Spacing.lg,
    backgroundColor: '#111111',
    borderWidth:     1,
    borderColor:     'rgba(255,215,0,0.2)',
    overflow:        'hidden',
  },

  // Glow blob — gold (top left)
  bannerGlowGold: {
    position:        'absolute',
    top:             -40,
    left:            -40,
    width:           160,
    height:          160,
    borderRadius:    80,
    backgroundColor: 'rgba(255,215,0,0.12)',
  },

  // Glow blob — red (bottom right)
  bannerGlowRed: {
    position:        'absolute',
    bottom:          -50,
    right:           -30,
    width:           140,
    height:          140,
    borderRadius:    70,
    backgroundColor: 'rgba(212,65,31,0.12)',
  },

  bannerGreeting: {
    fontSize:   13,
    fontWeight: '600',
    color:      Colors.textSecondary,
    marginBottom: 6,
  },

  bannerTitle: {
    fontSize:     26,
    fontWeight:   '900',
    color:        Colors.textPrimary,
    lineHeight:   32,
    marginBottom: Spacing.sm,
  },

  bannerSub: {
    fontSize:     12,
    fontWeight:   '600',
    color:        Colors.gold,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },

  bannerStats: {
    flexDirection: 'row',
    gap:           Spacing.sm,
  },

  statPill: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.1)',
    borderRadius:    Radius.full,
    paddingHorizontal: 12,
    paddingVertical:   6,
  },

  statText: {
    fontSize:   12,
    fontWeight: '600',
    color:      Colors.textSecondary,
  },

  // ── Section header ────────────────────────────────────
  sectionRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom:   Spacing.sm,
  },

  sectionTitle: {
    fontSize:   16,
    fontWeight: '800',
    color:      Colors.textPrimary,
  },

  sectionCount: {
    fontSize:   12,
    fontWeight: '600',
    color:      Colors.textMuted,
  },

  // ── Filter tabs ───────────────────────────────────────
  filterScroll: {
    marginBottom: Spacing.md,
  },

  filterContent: {
    paddingHorizontal: Spacing.md,
    gap:               Spacing.sm,
  },

  filterTab: {
    paddingHorizontal: 16,
    paddingVertical:   8,
    borderRadius:      Radius.full,
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.1)',
    backgroundColor:   'rgba(255,255,255,0.04)',
  },

  filterTabActive: {
    backgroundColor: Colors.goldDim,
    borderColor:     Colors.gold,
    shadowColor:     Colors.gold,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.4,
    shadowRadius:    8,
    elevation:       4,
  },

  filterLabel: {
    fontSize:   13,
    fontWeight: '600',
    color:      Colors.textMuted,
  },

  filterLabelActive: {
    color: Colors.gold,
  },

  // ── Card list ─────────────────────────────────────────
  cardList: {
    paddingHorizontal: Spacing.md,
    gap:               Spacing.sm,
  },

  // ── Project Card ──────────────────────────────────────
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth:     1,
    borderColor:     'rgba(255,215,0,0.15)',
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    marginBottom:    2,
  },

  // Vertical gold bar on left edge
  cardAccent: {
    width:           3,
    height:          '100%',
    backgroundColor: Colors.gold,
    borderRadius:    2,
    marginRight:     Spacing.md,
    position:        'absolute',
    left:            0,
    top:             0,
    bottom:          0,
    borderTopLeftRadius:    Radius.lg,
    borderBottomLeftRadius: Radius.lg,
  },

  cardEmoji: {
    width:           52,
    height:          52,
    borderRadius:    Radius.md,
    backgroundColor: 'rgba(255,215,0,0.08)',
    alignItems:      'center',
    justifyContent:  'center',
    marginLeft:      Spacing.sm,
    marginRight:     Spacing.md,
    borderWidth:     1,
    borderColor:     'rgba(255,215,0,0.15)',
  },

  emojiText: {
    fontSize: 26,
  },

  cardContent: {
    flex: 1,
  },

  cardTop: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   3,
    gap:            Spacing.sm,
  },

  cardTitle: {
    fontSize:   15,
    fontWeight: '700',
    color:      Colors.textPrimary,
    flex:       1,
  },

  cardSubtitle: {
    fontSize:     12,
    color:        Colors.textMuted,
    marginBottom: 8,
  },

  cardMeta: {
    flexDirection: 'row',
    gap:           Spacing.md,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
  },

  metaText: {
    fontSize:   11,
    fontWeight: '600',
    color:      Colors.textMuted,
  },

  // ── Difficulty Badge ──────────────────────────────────
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      Radius.full,
    borderWidth:       1,
  },

  diffText: {
    fontSize:      9,
    fontWeight:    '800',
    letterSpacing: 0.5,
  },

  // ── Chevron ───────────────────────────────────────────
  chevron: {
    marginLeft: Spacing.sm,
    opacity:    0.7,
  },
});
