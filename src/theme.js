// ============================================================
// FILE: src/theme.js
// PURPOSE: Central design system for S-MIB app.
//          All colours, shadows, glass card styles, and
//          typography live here. Every screen imports from
//          this file so the whole app stays consistent.
//
// VIBE: Web3 / Decentralized Web aesthetic
//       - Dark base backgrounds
//       - Sarawak gold (#FFD700) as the glow accent
//       - Glassmorphism cards (semi-transparent + gold border)
//       - Glow shadows on interactive elements
// ============================================================

// ----------------------------------------------------------
// COLOURS
// ----------------------------------------------------------
export const Colors = {
  // Base backgrounds
  background:   '#0D0D0D',   // Main screen background (deep dark)
  surface:      '#1A1A1A',   // Card / bottom nav background
  surfaceLight: '#242424',   // Slightly lighter surface (input bg, etc.)

  // Sarawak identity
  gold:         '#FFD700',   // Primary accent — Sarawak gold
  goldDim:      'rgba(255, 215, 0, 0.12)',  // Subtle gold tint (active tab bg)
  goldGlow:     'rgba(255, 215, 0, 0.35)',  // Gold glow for shadows
  goldBorder:   'rgba(255, 215, 0, 0.25)',  // Gold border on glass cards
  red:          '#D4411F',   // Secondary accent — Sarawak red

  // Text
  textPrimary:   '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted:     '#555555',

  // Status colours
  success: '#43A047',
  warning: '#FF6F00',
  info:    '#2196F3',

  // Difficulty colours (match mockup)
  beginner:     '#43A047',
  intermediate: '#FF6F00',
  advanced:     '#D4411F',

  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// ----------------------------------------------------------
// GLOW SHADOWS
// Used on buttons, active cards, highlighted elements.
// Creates the Web3 "neon glow" effect with Sarawak gold.
// ----------------------------------------------------------
export const Glow = {
  gold: {
    shadowColor:   '#FFD700',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius:  14,
    elevation:     10,          // Android fallback
  },
  red: {
    shadowColor:   '#D4411F',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius:  10,
    elevation:     8,
  },
  subtle: {
    shadowColor:   '#FFD700',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius:  6,
    elevation:     4,
  },
};

// ----------------------------------------------------------
// GLASSMORPHISM CARD STYLE
// Semi-transparent dark surface + gold border.
// This is the main card style used across all screens.
// ----------------------------------------------------------
export const Glass = {
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth:     1,
    borderColor:     'rgba(255, 215, 0, 0.2)',
    borderRadius:    16,
    padding:         16,
  },
  cardActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.07)',
    borderWidth:     1,
    borderColor:     'rgba(255, 215, 0, 0.5)',
    borderRadius:    16,
    padding:         16,
  },
};

// ----------------------------------------------------------
// GRADIENT CONFIGS
// Used with expo-linear-gradient (or as reference for colours).
// ----------------------------------------------------------
export const Gradients = {
  goldToRed:   ['#FFD700', '#D4411F'],
  darkToGold:  ['#0D0D0D', '#1A1200'],
  splash:      ['#0D0D0D', '#1A0D00', '#2A1500'],
};

// ----------------------------------------------------------
// TYPOGRAPHY
// Consistent font sizes and weights across all screens.
// ----------------------------------------------------------
export const Typography = {
  hero:    { fontSize: 32, fontWeight: '900', color: Colors.textPrimary },
  title:   { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  heading: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  subhead: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  body:    { fontSize: 14, fontWeight: '400', color: Colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  label:   { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1 },
};

// ----------------------------------------------------------
// SPACING
// Consistent spacing scale used for padding/margin.
// ----------------------------------------------------------
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ----------------------------------------------------------
// BORDER RADIUS
// ----------------------------------------------------------
export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};
