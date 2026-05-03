// ============================================================
// FILE: src/components/AppModal.js
// PURPOSE: Reusable bottom-sheet modal used app-wide.
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
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';

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

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay50,
  },
  sheet: {
    position:             'absolute',
    bottom:               0,
    left:                 0,
    right:                0,
    backgroundColor:      COLORS.cardDark,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    paddingHorizontal:    SPACING.lg,
    paddingTop:           SPACING.sm,
    paddingBottom:        40,
    alignItems:           'center',
    ...SHADOWS.lg,
  },
  handle: {
    width:           44,
    height:          4,
    borderRadius:    RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom:    SPACING.lg,
  },
  emoji: {
    fontSize:     44,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize:      18,
    fontWeight:    '800',
    color:         COLORS.textPrimary,
    textAlign:     'center',
    marginBottom:  SPACING.sm,
  },
  message: {
    fontSize:      14,
    color:         COLORS.textCaption,
    textAlign:     'center',
    lineHeight:    21,
    marginBottom:  SPACING.lg,
  },
  actionBtn: {
    width:            '100%',
    backgroundColor:  COLORS.riverTeal,
    borderRadius:     RADIUS.lg,
    paddingVertical:  14,
    alignItems:       'center',
    marginBottom:     SPACING.sm,
    ...SHADOWS.md,
  },
  actionBtnDestructive: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth:     1,
    borderColor:     'rgba(239,68,68,0.30)',
    shadowOpacity:   0,
    elevation:       0,
  },
  actionText: {
    fontSize:   15,
    fontWeight: '800',
    color:      COLORS.white,
  },
  actionTextDestructive: {
    color: COLORS.error,
  },
  closeBtn: {
    width:           '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius:    RADIUS.lg,
    paddingVertical: 14,
    alignItems:      'center',
  },
  closeText: {
    fontSize:   14,
    fontWeight: '600',
    color:      COLORS.textCaption,
  },
});
