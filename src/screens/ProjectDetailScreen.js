// ============================================================
// FILE: src/screens/ProjectDetailScreen.js
// PURPOSE: Shows the full detail of a single project.
//          Navigated to when a project card is tapped on HomeScreen.
//
// REFERENCE: docs/SMIB_Mockup.html — Phone 2 "Project Detail"
// LAYOUT:
//   - Dark gradient header: back button, emoji, title, tags
//   - Progress box: "X / Y steps" + animated bar + motivational text
//   - Steps list: done (green ✓), current (teal 👈), upcoming (grey faded)
//   - CTA button: "Done with Step N!" at the bottom
// ============================================================

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../theme';

// ----------------------------------------------------------
// COMPONENT: STEP ROW
// Renders one step differently depending on its status:
//   'done'     → green circle ✓, faded, strikethrough text
//   'current'  → teal pill card, "👈 You are here!"
//   'upcoming' → grey numbered circle, very faded
// ----------------------------------------------------------
function StepRow({ step }) {
  if (step.status === 'done') {
    return (
      <View style={[styles.stepRow, { opacity: 0.6 }]}>
        <View style={[styles.stepCircle, styles.stepCircleDone]}>
          <Text style={styles.stepCircleText}>✓</Text>
        </View>
        <Text style={[styles.stepTitle, styles.stepTitleDone]}>{step.title}</Text>
      </View>
    );
  }

  if (step.status === 'current') {
    return (
      <View style={[styles.stepRow, styles.stepRowCurrent]}>
        <View style={[styles.stepCircle, styles.stepCircleCurrent]}>
          <Text style={styles.stepCircleText}>{step.id}</Text>
        </View>
        <View>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepHere}>👈 You are here!</Text>
        </View>
      </View>
    );
  }

  // upcoming
  return (
    <View style={[styles.stepRow, { opacity: 0.4 }]}>
      <View style={[styles.stepCircle, styles.stepCircleUpcoming]}>
        <Text style={[styles.stepCircleText, { color: Colors.textMuted }]}>{step.id}</Text>
      </View>
      <Text style={[styles.stepTitle, { color: Colors.textMuted }]}>{step.title}</Text>
    </View>
  );
}

// ----------------------------------------------------------
// MAIN SCREEN
// ----------------------------------------------------------
export default function ProjectDetailScreen({ route, navigation }) {
  const { project } = route.params;

  // Local state for steps — lets the button actually work this session
  // (will be replaced by real Supabase data later)
  const [steps, setSteps] = useState(project.steps);

  // Derived values recalculate automatically whenever steps changes
  const doneCount   = steps.filter(s => s.status === 'done').length;
  const totalCount  = steps.length;
  const progressPct = totalCount > 0 ? doneCount / totalCount : 0;
  const currentStep = steps.find(s => s.status === 'current');

  // useRef keeps the Animated.Value stable across re-renders.
  // Starting at the initial progress so the bar is correct on open.
  const barAnim = useRef(new Animated.Value(progressPct)).current;

  // Every time progressPct changes (step marked done), animate the bar
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue:         progressPct,
      duration:        500,
      useNativeDriver: false,
    }).start();
  }, [progressPct]);

  // Mark the current step done and promote the next upcoming step
  const markStepDone = () => {
    setSteps(prev => {
      const idx = prev.findIndex(s => s.status === 'current');
      if (idx === -1) return prev;

      const updated = [...prev];
      updated[idx] = { ...updated[idx], status: 'done' };

      // Promote the next step to current if one exists
      if (idx + 1 < updated.length) {
        updated[idx + 1] = { ...updated[idx + 1], status: 'current' };
      }

      return updated;
    });
  };

  const getMotivation = () => {
    if (progressPct === 0)   return "Let's get started! 🚀";
    if (progressPct < 0.5)   return 'Good progress! Keep it going 💪';
    if (progressPct === 0.5) return "You're halfway there! Keep going 💪";
    if (progressPct < 1)     return "Almost there! You're so close 🔥";
    return 'Project complete! Amazing work! 🎉';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── DARK HEADER ──────────────────────────────────── */}
        <View style={styles.header}>

          {/* Decorative circles (matches HomeScreen header style) */}
          <View style={styles.decCircleTop} />
          <View style={styles.decCircleBottom} />

          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Project emoji box */}
          <View style={[styles.projectEmoji, { backgroundColor: project.emojiColor }]}>
            <Text style={styles.projectEmojiText}>{project.emoji}</Text>
          </View>

          {/* Project title + subtitle */}
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectMeta}>
            {project.category} · {totalCount} Steps · {project.duration}
          </Text>

          {/* Tag pills */}
          <View style={styles.tagRow}>
            {project.tags.map((tag, i) => (
              <View key={i} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

        </View>

        <View style={styles.body}>

          {/* ── PROGRESS BOX ───────────────────────────────── */}
          <View style={styles.progressCard}>
            <View style={styles.progressCardTop}>
              <Text style={styles.progressLabel}>Your Progress</Text>
              <Text style={styles.progressCount}>
                {doneCount} / {totalCount} steps
              </Text>
            </View>

            {/* Animated progress bar */}
            <View style={styles.progressBarOuter}>
              <Animated.View
                style={[
                  styles.progressBarInner,
                  {
                    width: barAnim.interpolate({
                      inputRange:  [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>

            <Text style={styles.progressMotivation}>{getMotivation()}</Text>
          </View>

          {/* ── STEPS LIST ─────────────────────────────────── */}
          <Text style={styles.stepsHeading}>Steps 📝</Text>

          <View style={styles.stepsList}>
            {project.steps.map(step => (
              <StepRow key={step.id} step={step} />
            ))}
          </View>

          {/* ── CTA BUTTON ─────────────────────────────────── */}
          {currentStep && (
            <TouchableOpacity style={styles.ctaBtn} onPress={markStepDone} activeOpacity={0.85}>
              <Text style={styles.ctaText}>
                ✅ Done with Step {currentStep.id}!
              </Text>
            </TouchableOpacity>
          )}

          {/* Show a completion message if all steps are done */}
          {!currentStep && progressPct === 1 && (
            <View style={styles.completeBanner}>
              <Text style={styles.completeText}>🎉 Project Complete!</Text>
            </View>
          )}

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

  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  // ── Header ─────────────────────────────────────────────
  header: {
    backgroundColor:         '#1a1a2e',
    paddingHorizontal:        Spacing.md,
    paddingTop:               Spacing.md,
    paddingBottom:            Spacing.xl,
    borderBottomLeftRadius:   28,
    borderBottomRightRadius:  28,
    overflow:                 'hidden',
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

  backBtn: {
    marginBottom: Spacing.md,
    alignSelf:    'flex-start',
    position:     'relative',
    zIndex:       1,
  },

  backText: {
    fontSize:  13,
    color:     'rgba(255,255,255,0.60)',
  },

  projectEmoji: {
    width:          64,
    height:         64,
    borderRadius:   18,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   Spacing.sm,
    position:       'relative',
    zIndex:         1,
  },

  projectEmojiText: {
    fontSize: 34,
  },

  projectTitle: {
    fontSize:     20,
    fontWeight:   '800',
    color:        '#ffffff',
    marginBottom: 4,
    position:     'relative',
    zIndex:       1,
  },

  projectMeta: {
    fontSize:     12,
    color:        'rgba(255,255,255,0.50)',
    marginBottom: Spacing.sm,
    position:     'relative',
    zIndex:       1,
  },

  tagRow: {
    flexDirection: 'row',
    gap:           Spacing.sm,
    position:      'relative',
    zIndex:        1,
  },

  tagPill: {
    backgroundColor:  Colors.tealLight,
    borderRadius:     Radius.full,
    paddingHorizontal: 12,
    paddingVertical:  4,
  },

  tagText: {
    fontSize:   11,
    fontWeight: '700',
    color:      Colors.teal,
  },

  // ── Body ───────────────────────────────────────────────
  body: {
    padding: Spacing.md,
  },

  // ── Progress Card ──────────────────────────────────────
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    marginBottom:    Spacing.md,
    ...Shadow.card,
  },

  progressCardTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.sm,
  },

  progressLabel: {
    fontSize:   13,
    fontWeight: '700',
    color:      Colors.textPrimary,
  },

  progressCount: {
    fontSize:   13,
    fontWeight: '800',
    color:      Colors.teal,
  },

  progressBarOuter: {
    height:          10,
    backgroundColor: Colors.border,
    borderRadius:    Radius.full,
    overflow:        'hidden',
    marginBottom:    6,
  },

  progressBarInner: {
    height:          '100%',
    backgroundColor: Colors.teal,
    borderRadius:    Radius.full,
    // Teal → green gradient feel
    // (expo-linear-gradient would make this a real gradient)
  },

  progressMotivation: {
    fontSize: 11,
    color:    Colors.textMuted,
    marginTop: 2,
  },

  // ── Steps ──────────────────────────────────────────────
  stepsHeading: {
    fontSize:     14,
    fontWeight:   '800',
    color:        Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  stepsList: {
    gap:          10,
    marginBottom: Spacing.lg,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },

  // Current step gets a teal-light card background
  stepRowCurrent: {
    backgroundColor: Colors.tealLight,
    borderRadius:    Radius.md,
    borderWidth:     2,
    borderColor:     Colors.teal,
    padding:         12,
  },

  stepCircle: {
    width:          30,
    height:         30,
    borderRadius:   15,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },

  stepCircleDone: {
    backgroundColor: Colors.success,
  },

  stepCircleCurrent: {
    backgroundColor: Colors.teal,
  },

  stepCircleUpcoming: {
    backgroundColor: Colors.border,
  },

  stepCircleText: {
    fontSize:   13,
    fontWeight: '700',
    color:      '#ffffff',
  },

  stepTitle: {
    fontSize:   13,
    color:      Colors.textPrimary,
    flex:       1,
  },

  stepTitleDone: {
    textDecorationLine: 'line-through',
    color:              Colors.textMuted,
  },

  stepHere: {
    fontSize:   11,
    fontWeight: '700',
    color:      Colors.teal,
    marginTop:  2,
  },

  // ── CTA Button ─────────────────────────────────────────
  ctaBtn: {
    backgroundColor: Colors.teal,
    borderRadius:    Radius.lg,
    paddingVertical: 16,
    alignItems:      'center',
    ...Shadow.strong,
  },

  ctaText: {
    fontSize:   15,
    fontWeight: '800',
    color:      '#ffffff',
  },

  // ── Completion Banner ───────────────────────────────────
  completeBanner: {
    backgroundColor: Colors.successLight,
    borderRadius:    Radius.lg,
    paddingVertical: 16,
    alignItems:      'center',
  },

  completeText: {
    fontSize:   15,
    fontWeight: '800',
    color:      Colors.success,
  },
});
