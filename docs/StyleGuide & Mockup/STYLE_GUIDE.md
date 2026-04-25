# Style Guide
# Sarawak Maker-In-A-Box (S-MIB)
# Version 1.0

---

## 1. Overview

This document is the single source of truth for all visual decisions in the
S-MIB app. Every screen, component, and element must follow these rules.
Claude Code reads this document before building any screen or component.

Visual reference: `/docs/SMIB_StyleGuide_Preview.html`

---

## 2. Fonts

Two fonts are used throughout the app. No other fonts are permitted.

| Font | Role | Weights Used |
|---|---|---|
| **Nunito** | Headings, UI labels, buttons, numbers | 800, 900 |
| **Inter** | Body text, captions, labels, metadata | 400, 600, 700 |

### Installation
```js
// In app entry point
import { useFonts, Nunito_800ExtraBold, Nunito_900Black } from '@expo-google-fonts/nunito';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
```

### Type Scale

| Scale | Font | Weight | Size | Colour | Usage |
|---|---|---|---|---|---|
| H1 Screen title | Nunito | 900 | 28px | rgba(255,255,255,0.95) | Screen headings |
| H2 Section title | Nunito | 800 | 20px | rgba(255,255,255,0.95) | Section headers |
| H3 Card title | Nunito | 800 | 16px | rgba(255,255,255,0.95) | Card titles |
| Stat number | Nunito | 900 | 26px | #67E8F9 | XP, counts, stats |
| Body | Inter | 400 | 14px | rgba(255,255,255,0.80) | Descriptions, instructions |
| Caption | Inter | 400 | 12px | rgba(255,255,255,0.55) | Metadata, subtitles |
| Label | Inter | 700 | 10px | rgba(255,255,255,0.45) | Uppercase section labels |

---

## 3. Colour Palette

### Brand Colours

| Name | Hex | Usage |
|---|---|---|
| Deep Navy | `#0C1A2E` | Headers, active nav pill, user chat bubbles |
| River Teal | `#0E7490` | Primary action buttons, progress bars, focus rings |
| Hornbill Gold | `#F59E0B` | XP bar, level badge, streak, active nav label, achievement buttons |
| Sarawak Red | `#EA580C` | XP bar end gradient, warm accents |
| Rainforest | `#166534` | Completion states, green progress fills |
| Forest | `#064E3B` | Background gradient start |
| Hornbill Brown | `#78350F` | Background gradient warm tone |

### Functional Colours

| Name | Hex | Usage |
|---|---|---|
| Success | `#22C55E` | Completed steps, online status dot |
| Error | `#EF4444` | Danger buttons, error states, validation messages |
| AI Cyan | `#67E8F9` | AI bubble highlights, stat numbers, focus tint |
| Teal Light | `#CFFAFE` | Teal-tinted card backgrounds |
| Gold Light | `#FEF3C7` | Gold-tinted card backgrounds |
| Glass Fill | `rgba(255,255,255,0.08)` | All glass card backgrounds |

### App Background

The main background is a fixed diagonal gradient that runs across the entire
screen — it does not scroll with content.

```js
background: 'linear-gradient(135deg, #064E3B 0%, #0E7490 30%, #0C4A6E 55%, #78350F 80%, #1A3A1A 100%)'
```

In React Native use a fixed `LinearGradient` component wrapping the root layout.

---

## 4. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 8px | Small buttons, input error radius |
| `radius-md` | 12px | Default buttons, inputs |
| `radius-lg` | 18px | Cards, badge cards, nav buttons |
| `radius-xl` | 24px | Project cards, certificate cards, chat screen |
| `radius-pill` | 999px | All pill shapes — nav bar, tags, level badge, streak |

---

## 5. Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Subtle card elevation |
| `shadow-md` | `0 4px 16px rgba(0,0,0,0.08)` | Floating elements |
| `shadow-lg` | `0 8px 32px rgba(0,0,0,0.10)` | Nav bar, cert cards |

---

## 6. Glassmorphism

Glassmorphism is used on stat cards, project cards, nav bar, badge cards,
AI bubbles, and inputs. The recipe is consistent across all elements.

### Standard Glass Recipe
```js
background: 'rgba(255,255,255,0.08)',
backdropFilter: 'blur(5px)',
// Asymmetric borders — bright top and left, subtle right and bottom
borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)',
borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)',
borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)',
borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
```

### Stat Cards Glass (overlapping dark header)
```js
background: 'rgba(255,255,255,0.12)',
backdropFilter: 'blur(5px)',
borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.9)',
borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.7)',
borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)',
borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)',
```

### Nav Bar Glass
```js
background: 'rgba(255,255,255,0.18)',
backdropFilter: 'blur(5px)',
borderTopWidth: 2, borderTopColor: 'rgba(255,255,255,0.95)',
borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.85)',
borderRightWidth: 1.5, borderRightColor: 'rgba(255,255,255,0.3)',
borderBottomWidth: 1.5, borderBottomColor: 'rgba(255,255,255,0.3)',
```

---

## 7. App Header

The header appears at the top of every learner screen.

### Structure (top to bottom)
1. Logo row (hornbill icon + S-MIB name) + notification bell + avatar
2. Greeting text ("Good morning,")
3. Student name in H1
4. Streak pill (fire emoji + count + best record)
5. Level badge + rank title on same row
6. XP info row (current/total left, next level right)
7. XP bar with glow dot at fill endpoint
8. Soft rounded bottom corners (border-radius: 36px bottom only)

### Header Background
```js
background: 'linear-gradient(160deg, #0C1A2E 0%, #0A2A20 60%, #0E4A3A 100%)'
```

### XP Bar
```js
// Track
background: 'rgba(255,255,255,0.10)', height: 7, borderRadius: 999

// Fill — gradient from amber to gold
background: 'linear-gradient(90deg, #B45309, #F59E0B, #FCD34D)'

// Glow dot at fill endpoint
width: 13, height: 13, borderRadius: 999,
background: '#FCD34D',
border: '2px solid #0C1A2E',
boxShadow: '0 0 8px rgba(245,158,11,0.9), 0 0 16px rgba(245,158,11,0.4)'
```

### Streak Pill
```js
background: 'rgba(245,158,11,0.12)',
borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
borderRadius: 999
// Contains: fire emoji + count (Nunito 900, #F59E0B) + divider + best record
```

### Rank Titles by Level
| Level | Rank Title |
|---|---|
| 1 | Curious Maker |
| 2 | Junior Builder |
| 3 | STEM Explorer |
| 4 | Maker Apprentice |
| 5 | Project Maker |
| 6 | Circuit Crafter |
| 7 | Innovation Scout |
| 8 | STEM Champion |
| 9 | Master Builder |
| 10 | Sarawak Maker |

### XP Thresholds
Each level requires 1000 XP. Level up at: 1000, 2000, 3000... (n × 1000).
Display as current XP within the level, not cumulative total.
Example: Level 4 means 3000–3999 total XP, displayed as 0–999 within level.

### Stat Cards
Three glass cards overlapping the header bottom using `marginTop: -50`.
Numbers use Nunito 900 in tier colours: teal for active, gold for done,
green for badges.

---

## 8. Project Cards

Featured image layout — full width card with image on top and glass
overlay at bottom. Displayed in a horizontal scroll row.

### Card Structure
```
┌─────────────────────┐
│   Image area        │  height: 130px, gradient background
│   [Category badge]  │  glass pill top-left
├─────────────────────┤
│   Title + Difficulty│  glass overlay
│   Progress bar + %  │
└─────────────────────┘
```

### Image Gradient by Category
```js
electronics: 'linear-gradient(135deg, #0C4A6E, #0E7490, #0891B2)'
agriculture:  'linear-gradient(135deg, #78350F, #B45309, #D97706)'
renewable:    'linear-gradient(135deg, #052E16, #166534, #15803D)'
// Add new categories following same pattern
```

### Card Dimensions
```js
width: 200, borderRadius: 24
```

### Card Animation
```js
// Hover / press in — scale only, no translateY
transform: [{ scale: 1.04 }]
// Press out
transform: [{ scale: 0.96 }]
```

---

## 9. Bottom Navigation

Floating glassmorphism pill bar. Always positioned at the bottom of the screen.

### Four tabs
| Tab | Icon | Label |
|---|---|---|
| Home | 🏠 | Home |
| Explore | 🔍 | Explore |
| Progress | 📊 | Progress |
| Profile | 👤 | Profile |

### Active tab
```js
background: '#0C1A2E',
color: '#F59E0B',
boxShadow: '0 4px 16px rgba(12,26,46,0.6)'
```

### Inactive tab
```js
color: 'rgba(255,255,255,0.55)'
```

### Active icon size: 24px. Inactive icon size: 20px.

### Sliding pill indicator
Built using `onLayout` to measure button positions. Uses
`Animated.spring` with `useNativeDriver: true` to slide between tabs.
Do NOT use CSS `transform: translateX` — use React Native Animated API.

### Swipe gesture
Implemented using `react-native-gesture-handler` PanGestureHandler.
Swipe left → next tab. Swipe right → previous tab.
Minimum swipe distance: 40px.

---

## 10. Buttons

### Size Variants
| Size | Font Size | Padding |
|---|---|---|
| Large | 15px | 14px 28px |
| Medium | 14px | 11px 22px |
| Small | 12px | 7px 14px |

### Style Variants
| Variant | Background | Text | Shadow |
|---|---|---|---|
| Primary | `#0E7490` | white | `0 4px 14px rgba(14,116,144,0.5)` |
| Yellow / XP | `#F59E0B` | `#0C1A2E` | `0 4px 14px rgba(245,158,11,0.4)` |
| Outline | `rgba(255,255,255,0.08)` | `#67E8F9` | none |
| Ghost | `rgba(255,255,255,0.12)` | `rgba(255,255,255,0.9)` | none |
| Danger | `#EF4444` | white | `0 4px 14px rgba(239,68,68,0.4)` |

### Border Radius
Default: `radius-md` (12px). Add `radius-pill` (999px) for pill variant.

### Animations
```js
// Hover / press in
transform: [{ translateY: -2 }]
// Press out (active)
transform: [{ scale: 0.96 }]
```

### Disabled State
```js
opacity: 0.35,
cursor: 'not-allowed' // web only
// No transform animations when disabled
```

---

## 11. Achievement Badges

### Tiers
| Tier | Background | Border (top/left) | Label Colour | Glow |
|---|---|---|---|---|
| Bronze | `rgba(180,83,9,0.15)` | `rgba(245,158,11,0.4/0.3)` | `#F59E0B` | None |
| Silver | `rgba(148,163,184,0.15)` | `rgba(203,213,225,0.5/0.35)` | `#CBD5E1` | None |
| Gold | `rgba(245,158,11,0.18)` | `rgba(253,224,71,0.6/0.4)` | `#FDE047` | `0 0 20px rgba(245,158,11,0.15)` |
| Legendary | `rgba(168,85,247,0.18)` | `rgba(216,180,254,0.6/0.4)` | `#D8B4FE` | `0 0 20px rgba(168,85,247,0.2)` |

### Structure
Each card shows: tier label (8px Inter 700 uppercase) → emoji icon (30px)
→ badge name (10px Nunito 800)

### Locked State
```js
opacity: 0.3, filter: 'grayscale(1)'
// No hover or press animations
```

### Hover Animation (unlocked only)
```js
transform: [{ translateY: -4 }, { scale: 1.05 }]
```

---

## 12. Certificate Card

### Structure
```
┌─────────────────────────────────┐
│  🦅 S-MIB          [type tag]   │  Header row
├─────────────────────────────────┤
│  Awarded for completing         │  Small label
│  Project Title                  │  H2 Nunito 900
│  Student Name · Date            │  Caption
├─────────────────────────────────┤  divider
│  Verification ID    SMIB-XXXX  📋│  Footer row
└─────────────────────────────────┘
```

### Background
```js
background: 'linear-gradient(135deg, #0C1A2E 0%, #0A2A20 60%, #0E4A3A 100%)'
```

### Certificate Types
`project_completion` · `category_mastery` · `tvet_readiness` · `streak`

### Verification Code
Font: Inter 600, 11px, `rgba(255,255,255,0.6)`, letter-spacing: 1px.
Copy button beside it with hover opacity transition.

### Press Animation
```js
// Press in
transform: [{ scale: 0.98 }]
// Press out
transform: [{ scale: 1.0 }]
```

---

## 13. AI Help Screen

### Layout
Full screen with three zones:
1. **Top bar** — hornbill avatar + "S-MIB AI Helper" + green online dot
2. **Chat area** — scrollable conversation bubbles
3. **Input bar** — text input + teal send button (↑ icon)

### User Bubble
```js
alignSelf: 'flex-end',
background: '#0C1A2E',
borderRadius: 18, borderBottomRightRadius: 4
```

### AI Bubble
```js
alignSelf: 'flex-start',
// Standard glass recipe
borderRadius: 18, borderBottomLeftRadius: 4
// Highlighted keywords: color '#67E8F9', fontWeight: '700'
```

### Send Button
```js
background: '#0E7490',
width: 36, height: 36, borderRadius: 999,
boxShadow: '0 4px 12px rgba(14,116,144,0.4)'
```

---

## 14. Input Fields

### States
| State | Border (top/left) | Shadow |
|---|---|---|
| Default | `rgba(255,255,255,0.3/0.2)` | None |
| Focus | `rgba(103,232,249,0.7/0.5)` | `0 0 0 3px rgba(14,116,144,0.2)` |
| Error | `rgba(239,68,68,0.7/0.5)` | `0 0 0 3px rgba(239,68,68,0.15)` |

### Error Message
Font: Inter 11px, colour: `#FCA5A5`, with ⚠ warning symbol prefix.

### Icon Input
Left padding: 42px. Icon position: absolute left 14px, vertically centred.

### Label
Inter 600 12px, `rgba(255,255,255,0.55)`, sits 6px above input.

---

## 15. Animations

All animations use spring physics. No linear easing except for
colour transitions.

### Spring Config (default)
```js
{ tension: 200, friction: 22 }  // Snappy, no bounce
```

### Spring Config (card hover)
```js
{ tension: 180, friction: 18 }  // Slightly more bounce
```

### Badge hover
```js
// translateY(-4) + scale(1.05) on hover
// scale(0.95) on press
```

### Button press
```js
// scale(0.96) on press in
// translateY(-2) on hover (web only)
```

### Screen entry
New screens slide in from the right using React Navigation stack
default animation. Tab switches use fade.

### Counter animation
XP numbers and stat counts animate from 0 to their value on screen
entry using `Animated.timing` over 500ms.

---

## 16. Spacing

| Token | Value | Usage |
|---|---|---|
| xs | 4px | Tight gaps between inline elements |
| sm | 8px | Icon to label gap, small padding |
| md | 12px | Default component gap |
| lg | 16px | Section padding, card padding |
| xl | 24px | Screen horizontal padding |
| xxl | 32px | Section vertical spacing |

---

## 17. Notes for Claude Code

- Always import Nunito and Inter before using them
- Use the exact hex values from this document — do not approximate
- Glass effects require `backdropFilter` — test on a real device as
  simulators sometimes do not render it correctly
- The Sarawak background gradient must be `position: fixed` equivalent
  in React Native — use a full-screen absolute `LinearGradient` behind
  the root navigator
- All animations use React Native `Animated` API or `react-native-reanimated`
- Never use hardcoded colours not listed in this document
- The sliding pill in the bottom nav must use `onLayout` measurements
  not hardcoded positions
- Refer to `/docs/SMIB_StyleGuide_Preview.html` for the visual reference
  of any component

---

## 18. Creator Dashboard

The Creator Dashboard follows the same glassmorphism design language as
the learner screens. Full layout specification will be defined in
`/docs/WIREFRAMES.md`. Key style rules:

- Same Sarawak gradient background
- Same header style but greeting reads "Welcome back, [Creator Name]"
- Stats row shows: Projects Published, Total Students, Total Completions
- Project list cards use the same featured image layout as learner screens
- No XP bar or streak — replaced with a simple "Creator since [date]" line

---

## 19. Parent View

The Parent View is a read-only simplified version of the learner home screen.
Full layout specification will be defined in `/docs/WIREFRAMES.md`. Key rules:

- Same background and header style
- Header greeting reads "Viewing [Child Name]'s progress"
- Shows child's level, XP, streak, completed projects, and certificates
- No interactive elements — all buttons are display only
- Certificate cards are tappable to view verification code

---

*Document version 1.0*
*Part of the S-MIB documentation suite: PRD · ERD · Architecture · Style Guide · Wireframes · SRS · DFD*
