// ============================================================
// FILE: src/theme.js
// PURPOSE: Central design system for S-MIB app.
//          Colours, spacing, radius, and typography live here.
//
// REFERENCE: docs/SMIB_Mockup.html (Version B — Student Friendly)
//            docs/smib_original_mockup.html (Sarawak palette)
//
// VIBE: Sarawak cultural identity + Web3-level interactiveness
//   - Light #f0f4f8 background with white cards
//   - Sarawak yellow for XP, badges, achievements
//   - Teal as the primary interactive colour
//   - Sarawak red + dark header on key sections
// ============================================================

// ----------------------------------------------------------
// COLOURS
// ----------------------------------------------------------
export const Colors = {
  // Screen background
  background:   '#f0f4f8',   // Light blue-grey (all screens)
  card:         '#ffffff',   // White card surface
  cardShadow:   'rgba(0, 0, 0, 0.08)',

  // Sarawak identity
  gold:         '#F4C430',   // Sarawak yellow — XP bars, badges, level pills
  red:          '#CC2529',   // Sarawak red — branding, secondary accents
  dark:         '#1a1a2e',   // Sarawak black — header gradient base, logo bg
  darkAlt:      '#16213e',   // Header gradient end colour

  // Primary interactive (teal)
  teal:         '#0ea5e9',
  tealLight:    '#e0f2fe',

  // Status colours
  success:      '#22c55e',
  successLight: '#dcfce7',
  warning:      '#f97316',
  warningLight: '#ffedd5',
  info:         '#8b5cf6',
  infoLight:    '#ede9fe',

  // Text
  textPrimary:  '#1e293b',
  textMuted:    '#64748b',

  // Borders / dividers
  border:       '#e2e8f0',
};

// ----------------------------------------------------------
// SHADOWS
// Consistent card elevation across all screens.
// ----------------------------------------------------------
export const Shadow = {
  card: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius:  12,
    elevation:     4,
  },
  strong: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius:  20,
    elevation:     8,
  },
};

// ----------------------------------------------------------
// TYPOGRAPHY
// ----------------------------------------------------------
export const Typography = {
  hero:    { fontSize: 28, fontWeight: '900', color: Colors.textPrimary },
  title:   { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  heading: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  subhead: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  body:    { fontSize: 13, fontWeight: '400', color: Colors.textMuted },
  caption: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  label:   { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
};

// ----------------------------------------------------------
// SPACING
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
