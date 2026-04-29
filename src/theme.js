// src/theme.js
// Single source of truth for all S-MIB design tokens.
// Every colour, font, spacing, radius, and animation value lives here.
// No screen file may use a hardcoded colour that is not exported from this file.

// ─── COLOURS ────────────────────────────────────────────────────────────────

export const COLORS = {
  // Brand
  deepNavy:      '#0C1A2E',
  riverTeal:     '#0E7490',
  hornbillGold:  '#F59E0B',
  sarawakRed:    '#EA580C',
  rainforest:    '#166534',
  forest:        '#064E3B',
  hornbillBrown: '#78350F',

  // Functional
  success:       '#22C55E',
  error:         '#EF4444',
  aiCyan:        '#67E8F9',
  tealLight:     '#CFFAFE',
  goldLight:     '#FEF3C7',
  glassFill:     'rgba(255,255,255,0.08)',

  // Text hierarchy
  textPrimary:   'rgba(255,255,255,0.95)',
  textBody:      'rgba(255,255,255,0.80)',
  textCaption:   'rgba(255,255,255,0.55)',
  textLabel:     'rgba(255,255,255,0.45)',

  // XP bar
  xpBarStart:    '#B45309',
  xpBarMid:      '#F59E0B',
  xpBarEnd:      '#FCD34D',

  // Nav
  navActiveBg:   '#0C1A2E',
  navActiveText: '#F59E0B',
  navInactive:   'rgba(255,255,255,0.55)',

  // AI bubbles
  userBubble:    '#0C1A2E',

  // Input states
  inputBorderDefault:    'rgba(255,255,255,0.3)',
  inputBorderFocus:      'rgba(103,232,249,0.7)',  // top border, focused
  inputBorderFocusLeft:  'rgba(103,232,249,0.5)',  // left border, focused
  inputBorderError:      'rgba(239,68,68,0.7)',    // top border, error
  inputBorderErrorLeft:  'rgba(239,68,68,0.5)',    // left border, error

  // ── Utility colours ─────────────────────────────────────────────────
  white:      '#fff',       // pure white — button text, icons on coloured bg
  errorLight: '#FCA5A5',    // soft rose for error message text
  cardDark:   '#0C2030',    // dark navy panel for modals / bottom sheets
  purple:     '#A78BFA',    // light violet accent (certificates)

  // ── Dark overlays ────────────────────────────────────────────────────
  overlay25: 'rgba(0,0,0,0.25)',
  overlay30: 'rgba(0,0,0,0.30)',
  overlay50: 'rgba(0,0,0,0.50)',
  overlay60: 'rgba(0,0,0,0.60)',
  overlay75: 'rgba(0,0,0,0.75)',

  // ── Error surface family ─────────────────────────────────────────────
  errorBgSubtle: 'rgba(239,68,68,0.10)',
  errorBg:       'rgba(239,68,68,0.12)',
  errorBorder:   'rgba(239,68,68,0.30)',

  // ── Gold / amber surface family ──────────────────────────────────────
  goldBg:       'rgba(245,158,11,0.08)',
  goldBgMid:    'rgba(245,158,11,0.12)',
  goldBgStrong: 'rgba(245,158,11,0.15)',
  goldBgDeep:   'rgba(245,158,11,0.20)',
  goldBorder:   'rgba(245,158,11,0.30)',

  // ── Cyan surface family ──────────────────────────────────────────────
  cyanBgSubtle:  'rgba(103,232,249,0.06)',
  cyanBg:        'rgba(103,232,249,0.10)',
  cyanBgMid:     'rgba(103,232,249,0.12)',
  cyanBorderLight: 'rgba(103,232,249,0.25)',
  cyanBorder:    'rgba(103,232,249,0.30)',

  // ── Teal surface family ──────────────────────────────────────────────
  tealBg:         'rgba(14,116,144,0.10)',
  tealBgMid:      'rgba(14,116,144,0.18)',
  tealBgStrong:   'rgba(14,116,144,0.25)',
  tealBgDisabled: 'rgba(14,116,144,0.40)',
  tealBorder:     'rgba(14,116,144,0.30)',
  tealBorderStrong: 'rgba(14,116,144,0.50)',

  // ── Success surface family ───────────────────────────────────────────
  successBg:       'rgba(34,197,94,0.10)',
  successBgMid:    'rgba(34,197,94,0.12)',
  successBgStrong: 'rgba(34,197,94,0.15)',
  successBgDeep:   'rgba(34,197,94,0.20)',
  successBorder:   'rgba(34,197,94,0.30)',
};

// ─── GRADIENTS ──────────────────────────────────────────────────────────────
// Pass spread (...GRADIENTS.background) to expo-linear-gradient props.

export const GRADIENTS = {
  // Fixed full-screen background behind root navigator
  background: {
    colors: ['#064E3B', '#0E7490', '#0C4A6E', '#78350F', '#1A3A1A'],
    start:  { x: 0.15, y: 0 },
    end:    { x: 0.85, y: 1 },
  },

  // Screen / learner header
  header: {
    colors: ['#0C1A2E', '#0A2A20', '#0E4A3A'],
    start:  { x: 0, y: 0 },
    end:    { x: 0.5, y: 1 },
  },

  // Certificate card background
  certificate: {
    colors: ['#0C1A2E', '#0A2A20', '#0E4A3A'],
    start:  { x: 0, y: 0 },
    end:    { x: 0.85, y: 1 },
  },

  // XP progress bar fill
  xpBar: {
    colors: ['#B45309', '#F59E0B', '#FCD34D'],
    start:  { x: 0, y: 0 },
    end:    { x: 1, y: 0 },
  },

  // Project card image areas by category
  categoryElectronics: {
    colors: ['#0C4A6E', '#0E7490', '#0891B2'],
    start:  { x: 0, y: 0 },
    end:    { x: 1, y: 1 },
  },
  categoryAgriculture: {
    colors: ['#78350F', '#B45309', '#D97706'],
    start:  { x: 0, y: 0 },
    end:    { x: 1, y: 1 },
  },
  categoryRenewable: {
    colors: ['#052E16', '#166534', '#15803D'],
    start:  { x: 0, y: 0 },
    end:    { x: 1, y: 1 },
  },
};

// ─── TYPOGRAPHY ─────────────────────────────────────────────────────────────

export const FONTS = {
  heading900: 'Nunito_900Black',
  heading800: 'Nunito_800ExtraBold',
  body400:    'Inter_400Regular',
  body600:    'Inter_600SemiBold',
  body700:    'Inter_700Bold',
};

// Pre-composed type styles — spread these into StyleSheet definitions
export const TYPE = {
  h1: {
    fontFamily: 'Nunito_900Black',
    fontSize:   28,
    color:      'rgba(255,255,255,0.95)',
  },
  h2: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize:   20,
    color:      'rgba(255,255,255,0.95)',
  },
  h3: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize:   16,
    color:      'rgba(255,255,255,0.95)',
  },
  stat: {
    fontFamily: 'Nunito_900Black',
    fontSize:   26,
    color:      '#67E8F9',
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize:   14,
    color:      'rgba(255,255,255,0.80)',
  },
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize:   12,
    color:      'rgba(255,255,255,0.55)',
  },
  label: {
    fontFamily:    'Inter_700Bold',
    fontSize:      10,
    color:         'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
};

// ─── SPACING ────────────────────────────────────────────────────────────────

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};

// ─── BORDER RADIUS ──────────────────────────────────────────────────────────

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   18,
  xl:   24,
  pill: 999,
};

// ─── SHADOWS ────────────────────────────────────────────────────────────────

export const SHADOWS = {
  sm: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius:  3,
    elevation:     2,
  },
  md: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius:  16,
    elevation:     4,
  },
  lg: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius:  32,
    elevation:     8,
  },
};

// ─── GLASSMORPHISM ──────────────────────────────────────────────────────────
// Three glass recipes: standard cards, stat cards (brighter), nav bar (heaviest)

export const GLASS = {
  standard: {
    backgroundColor:   'rgba(255,255,255,0.08)',
    borderTopWidth:    1,
    borderTopColor:    'rgba(255,255,255,0.3)',
    borderLeftWidth:   1,
    borderLeftColor:   'rgba(255,255,255,0.2)',
    borderRightWidth:  1,
    borderRightColor:  'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  stat: {
    backgroundColor:   'rgba(255,255,255,0.12)',
    borderTopWidth:    1,
    borderTopColor:    'rgba(255,255,255,0.9)',
    borderLeftWidth:   1,
    borderLeftColor:   'rgba(255,255,255,0.7)',
    borderRightWidth:  1,
    borderRightColor:  'rgba(255,255,255,0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  nav: {
    backgroundColor:   'rgba(255,255,255,0.18)',
    borderTopWidth:    2,
    borderTopColor:    'rgba(255,255,255,0.95)',
    borderLeftWidth:   2,
    borderLeftColor:   'rgba(255,255,255,0.85)',
    borderRightWidth:  1.5,
    borderRightColor:  'rgba(255,255,255,0.3)',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
};

// ─── BUTTONS ────────────────────────────────────────────────────────────────

export const BUTTONS = {
  variants: {
    primary: { backgroundColor: '#0E7490', textColor: '#FFFFFF' },
    yellow:  { backgroundColor: '#F59E0B', textColor: '#0C1A2E' },
    outline: { backgroundColor: 'rgba(255,255,255,0.08)', textColor: '#67E8F9' },
    ghost:   { backgroundColor: 'rgba(255,255,255,0.12)', textColor: 'rgba(255,255,255,0.9)' },
    danger:  { backgroundColor: '#EF4444', textColor: '#FFFFFF' },
  },
  sizes: {
    lg: { fontSize: 15, paddingVertical: 14, paddingHorizontal: 28 },
    md: { fontSize: 14, paddingVertical: 11, paddingHorizontal: 22 },
    sm: { fontSize: 12, paddingVertical:  7, paddingHorizontal: 14 },
  },
};

// ─── ACHIEVEMENT BADGE TIERS ────────────────────────────────────────────────

export const BADGE_TIERS = {
  bronze: {
    backgroundColor:   'rgba(180,83,9,0.15)',
    borderTopColor:    'rgba(245,158,11,0.4)',
    borderLeftColor:   'rgba(245,158,11,0.3)',
    labelColor:        '#F59E0B',
  },
  silver: {
    backgroundColor:   'rgba(148,163,184,0.15)',
    borderTopColor:    'rgba(203,213,225,0.5)',
    borderLeftColor:   'rgba(203,213,225,0.35)',
    labelColor:        '#CBD5E1',
  },
  gold: {
    backgroundColor:   'rgba(245,158,11,0.18)',
    borderTopColor:    'rgba(253,224,71,0.6)',
    borderLeftColor:   'rgba(253,224,71,0.4)',
    labelColor:        '#FDE047',
    glowShadow:        '0 0 20px rgba(245,158,11,0.15)',
  },
  legendary: {
    backgroundColor:   'rgba(168,85,247,0.18)',
    borderTopColor:    'rgba(216,180,254,0.6)',
    borderLeftColor:   'rgba(216,180,254,0.4)',
    labelColor:        '#D8B4FE',
    glowShadow:        '0 0 20px rgba(168,85,247,0.2)',
  },
};

// ─── ANIMATIONS ─────────────────────────────────────────────────────────────

export const SPRING = {
  default: { tension: 200, friction: 22 },
  card:    { tension: 180, friction: 18 },
};

// ─── XP & GAMIFICATION ──────────────────────────────────────────────────────

export const XP_PER_STEP  = 50;
export const XP_PER_LEVEL = 1000;
export const MAX_LEVEL    = 10;

export const RANK_TITLES = [
  'Curious Maker',    // Level 1
  'Junior Builder',   // Level 2
  'STEM Explorer',    // Level 3
  'Maker Apprentice', // Level 4
  'Project Maker',    // Level 5
  'Circuit Crafter',  // Level 6
  'Innovation Scout', // Level 7
  'STEM Champion',    // Level 8
  'Master Builder',   // Level 9
  'Sarawak Maker',    // Level 10
];

export const calculateLevel      = (totalXp) => Math.min(Math.floor(totalXp / XP_PER_LEVEL) + 1, MAX_LEVEL);
export const calculateXpInLevel  = (totalXp) => totalXp % XP_PER_LEVEL;
export const getRankTitle        = (level)   => RANK_TITLES[Math.max(0, level - 1)];
