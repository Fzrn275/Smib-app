// ============================================================
// FILE: src/components/AppModal.js
// PURPOSE: Reusable in-app bottom-sheet modal.
//          Replaces all plain Alert.alert() calls app-wide.
//
// DESIGN: Web3-style slide-up sheet with spring entrance,
//         animated backdrop, and the app's design system.
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
import { Colors, Spacing, Radius, Shadow } from '../theme';

export default function AppModal({ visible, onClose, emoji, title, message, action }) {
  // Keep the sheet rendered during the close animation
  const [showing, setShowing] = useState(false);
  const slideAnim   = useRef(new Animated.Value(500)).current;
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
      // Animate out, then hide
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

      {/* ── SHEET ── */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>

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

  sheet: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    backgroundColor: Colors.card,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop:        Spacing.sm,
    paddingBottom:     40,
    alignItems:        'center',
    ...Shadow.strong,
  },

  handle: {
    width:           44,
    height:          4,
    borderRadius:    Radius.full,
    backgroundColor: Colors.border,
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
    backgroundColor: '#fff0f0',
    borderWidth:     1,
    borderColor:     '#fecaca',
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
    backgroundColor: Colors.background,
    borderRadius:    Radius.lg,
    paddingVertical: 14,
    alignItems:      'center',
  },

  closeText: {
    fontSize:   14,
    fontWeight: '700',
    color:      Colors.textMuted,
  },
});
