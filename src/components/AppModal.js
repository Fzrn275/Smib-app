// ============================================================
// FILE: src/components/AppModal.js
// PURPOSE: Reusable in-app bottom-sheet modal.
//          Replaces all plain Alert.alert() calls app-wide.
//
// DESIGN: Web3-style slide-up sheet with spring entrance,
//         animated backdrop, and glassmorphism frosted sheet.
//
// USAGE:
//   const [modal, setModal] = useState(null);
//
//   // trigger it:
//   setModal({
//     emoji:   '🔔',
//     title:   'Notifications',
//     message: 'Nothing new yet.',
//     action:  { label: 'Sign Out', destructive: true, onPress: () => {} }, // optional
//   });
//
//   // render it:
//   <AppModal visible={!!modal} onClose={() => setModal(null)} {...(modal ?? {})} />
// ============================================================

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, Radius, Shadow } from '../theme';

export default function AppModal({ visible, onClose, emoji, title, message, action }) {
  // Keep the sheet rendered during the close animation
  const [showing, setShowing] = useState(false);
  const slideAnim    = useRef(new Animated.Value(500)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowing(true);
      slideAnim.setValue(500);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1, duration: 250, useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0, tension: 70, friction: 11, useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0, duration: 180, useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 500, duration: 200, useNativeDriver: true,
        }),
      ]).start(() => setShowing(false));
    }
  }, [visible]);

  if (!showing) return null;

  return (
    <Modal
      transparent
      animationType="none"
      visible={showing}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* ── BACKDROP (tap to dismiss) ── */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      {/* ── GLASSMORPHISM SHEET ── */}
      <Animated.View style={[styles.sheetOuter, { transform: [{ translateY: slideAnim }] }]}>

        {/* Frosted glass layer — blurs the content underneath */}
        <BlurView intensity={70} tint="extraLight" style={StyleSheet.absoluteFill} />

        {/* White overlay to boost the glass opacity */}
        <View style={styles.sheetOverlay} />

        {/* Content sits above blur + overlay */}
        <View style={styles.sheetContent}>

          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Emoji */}
          {!!emoji && <Text style={styles.emoji}>{emoji}</Text>}

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {!!message && <Text style={styles.message}>{message}</Text>}

          {/* Optional action button */}
          {!!action && (
            <TouchableOpacity
              style={[styles.actionBtn, action.destructive && styles.actionBtnDestructive]}
              onPress={() => { action.onPress?.(); onClose(); }}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionText, action.destructive && styles.actionTextDestructive]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          )}

          {/* Close / dismiss button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeText}>Dismiss</Text>
          </TouchableOpacity>

        </View>
      </Animated.View>
    </Modal>
  );
}

// ----------------------------------------------------------
// STYLES
// ----------------------------------------------------------
const styles = StyleSheet.create({

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  // Outer wrapper: handles position, border radius, overflow, shadow
  sheetOuter: {
    position:             'absolute',
    bottom:               0,
    left:                 0,
    right:                0,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    overflow:             'hidden',
    borderWidth:          1,
    borderBottomWidth:    0,
    borderColor:          'rgba(255,255,255,0.5)',
    ...Shadow.strong,
  },

  // Semi-transparent white layer on top of the blur
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },

  // Content layer sits on top of blur + overlay
  sheetContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop:        Spacing.sm,
    paddingBottom:     40,
    alignItems:        'center',
  },

  handle: {
    width:           44,
    height:          4,
    borderRadius:    Radius.full,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginBottom:    Spacing.lg,
  },

  emoji: {
    fontSize:     52,
    marginBottom: Spacing.md,
  },

  title: {
    fontSize:     20,
    fontWeight:   '800',
    color:        Colors.textPrimary,
    textAlign:    'center',
    marginBottom: Spacing.sm,
  },

  message: {
    fontSize:     14,
    color:        Colors.textMuted,
    textAlign:    'center',
    lineHeight:   22,
    marginBottom: Spacing.lg,
  },

  actionBtn: {
    width:           '100%',
    backgroundColor: Colors.teal,
    borderRadius:    Radius.lg,
    paddingVertical: 15,
    alignItems:      'center',
    marginBottom:    Spacing.sm,
    ...Shadow.card,
  },

  actionBtnDestructive: {
    backgroundColor: 'rgba(204,37,41,0.08)',
    borderWidth:     1,
    borderColor:     'rgba(204,37,41,0.25)',
  },

  actionText: {
    fontSize:   15,
    fontWeight: '800',
    color:      '#ffffff',
  },

  actionTextDestructive: {
    color: Colors.red,
  },

  closeBtn: {
    width:           '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius:    Radius.lg,
    paddingVertical: 14,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     'rgba(0,0,0,0.06)',
  },

  closeText: {
    fontSize:   14,
    fontWeight: '700',
    color:      Colors.textMuted,
  },
});
