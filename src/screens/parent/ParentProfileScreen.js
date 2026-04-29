// src/screens/parent/ParentProfileScreen.js
// Screen 29 — p-profile — Parent Profile

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }      from '../../context/AuthContext';
import * as authService from '../../services/authService';
import {
  COLORS, FONTS, TYPE, SPACING, RADIUS,
} from '../../theme';

export default function ParentProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [signOutModal, setSignOutModal] = useState(false);
  const [signingOut,   setSigningOut]   = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try { await authService.signOut(); } catch { setSigningOut(false); setSignOutModal(false); }
  }

  const initial = (user?.name ?? 'P').charAt(0).toUpperCase();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={[TYPE.h2, { marginTop: SPACING.md, textAlign: 'center' }]}>{user?.name}</Text>
          <Text style={[TYPE.caption, { textAlign: 'center', marginTop: 2 }]}>
            Parent Account · {user?.email}
          </Text>
        </View>

        {/* Settings list */}
        <View style={styles.settingsList}>
          {[
            { icon: 'people-outline',       label: 'My Children',    onPress: () => navigation.navigate('ParentDashboard') },
            { icon: 'pulse-outline',        label: 'Activity Feed',  onPress: () => navigation.navigate('ActivityFeed') },
            { icon: 'notifications-outline', label: 'Notifications',  onPress: () => {} },
            { icon: 'shield-outline',       label: 'Privacy & Security', onPress: () => {} },
          ].map(item => (
            <TouchableOpacity key={item.label} style={styles.settingsRow} onPress={item.onPress} activeOpacity={0.7}>
              <View style={styles.settingsIcon}>
                <Ionicons name={item.icon} size={18} color={COLORS.textCaption} />
              </View>
              <Text style={styles.settingsLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textCaption} />
            </TouchableOpacity>
          ))}

          {/* Sign out */}
          <TouchableOpacity style={styles.settingsRow} onPress={() => setSignOutModal(true)} activeOpacity={0.7}>
            <View style={[styles.settingsIcon, { backgroundColor: COLORS.errorBgSubtle }]}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
            </View>
            <Text style={[styles.settingsLabel, { color: COLORS.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sign out confirmation */}
      <Modal visible={signOutModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={TYPE.h2}>Sign Out?</Text>
            <Text style={[TYPE.body, { marginTop: SPACING.sm }]}>You'll need to sign in again to access S-MIB.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                onPress={() => setSignOutModal(false)}
              >
                <Text style={[TYPE.body, { fontFamily: FONTS.body600 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.error }]}
                onPress={handleSignOut}
                disabled={signingOut}
              >
                {signingOut
                  ? <ActivityIndicator color={COLORS.white} size="small" />
                  : <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: COLORS.white }}>Sign Out</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll:   { paddingHorizontal: SPACING.xl },
  avatarWrap: { alignItems: 'center', marginBottom: SPACING.xl },
  avatar: {
    width: 80, height: 80, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.success,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.heading900, fontSize: 32, color: COLORS.white },
  settingsList: { gap: SPACING.xs },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md, padding: SPACING.md,
  },
  settingsIcon: {
    width: 34, height: 34, borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingsLabel: { flex: 1, fontFamily: FONTS.body600, fontSize: 14, color: COLORS.textPrimary },
  modalBackdrop: {
    flex: 1, backgroundColor: COLORS.overlay60,
    alignItems: 'center', justifyContent: 'center', padding: SPACING.xl,
  },
  modalCard: {
    width: '100%', backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.xl, padding: SPACING.xl,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
    gap: SPACING.md,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  modalBtn: {
    flex: 1, height: 46, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
});
