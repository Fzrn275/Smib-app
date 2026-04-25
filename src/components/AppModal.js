// ============================================================
// FILE: src/components/AppModal.js
// PURPOSE: Reusable bottom-sheet modal used app-wide.
//          Replaces all plain Alert.alert() calls.
//
// DESIGN: Clean white slide-up sheet with spring entrance,
//         animated backdrop, and the app's design system.
//
// USAGE:
//   const [modal, setModal] = useState(null);
//
//   <AppModal
//     visible={!!modal}
//     onClose={() => setModal(null)}
//     emoji="🎉"
//     title="Well done!"
//     message="You completed a step."
//     action={{ label: 'Keep going', onPress: () => {} }}
//   />
// ============================================================

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors, Spacing, Radius, Shadow } from '../theme';

export default function AppModal({ visible, onClose, emoji, title, message, action }) {
  const [showing, setShowing]  = useState(false);
  const slideAnim    = useRef(new Animated.Value(500)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowing(true);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1, duration: 220, useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0, tension: 200, friction: 22, useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0, duration: 180, useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 500, duration: 220, useNativeDriver: true,
        }),
      ]).start(() => setShowing(false));
    }
  }, [visible]);

  if (!showing) return null;

  return (
    <Modal transparent animationType="none" visible={showing} onRequestClose={onClose}>

      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
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

        {/* Dismiss button */}
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
    backgroundColor: 'rgba(0,0,0,0.50)',
  },

  sheet: {
    position:             'absolute',
    bottom:               0,
    left:                 0,
    right:                0,
    backgroundColor:      Colors.card,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    paddingHorizontal:    Spacing.lg,
    paddingTop:           Spacing.sm,
    paddingBottom:        40,
    alignItems:           'center',
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
    fontSize:     44,
    marginBottom: Spacing.sm,
  },

  title: {
    fontSize:      18,
    fontWeight:    '800',
    color:         Colors.textPrimary,
    textAlign:     'center',
    marginBottom:  Spacing.sm,
  },

  message: {
    fontSize:      14,
    color:         Colors.textMuted,
    textAlign:     'center',
    lineHeight:    21,
    marginBottom:  Spacing.lg,
  },

  actionBtn: {
    width:            '100%',
    backgroundColor:  Colors.teal,
    borderRadius:     Radius.lg,
    paddingVertical:  14,
    alignItems:       'center',
    marginBottom:     Spacing.sm,
    ...Shadow.card,
  },

  actionBtnDestructive: {
    backgroundColor: '#fff0f0',
    borderWidth:     1,
    borderColor:     '#fecaca',
    shadowOpacity:   0,
    elevation:       0,
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
    fontWeight: '600',
    color:      Colors.textMuted,
  },
});
