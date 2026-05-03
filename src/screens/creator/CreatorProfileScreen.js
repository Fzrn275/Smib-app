// src/screens/creator/CreatorProfileScreen.js
// Screen 25 — c-profile — Creator Profile

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                        from '../../context/AuthContext';
import * as authService                   from '../../services/authService';
import { SCREENS, TAB_BAR_TOTAL_HEIGHT } from '../../navigation/navConstants';
import {
  getCreatorProjects, getCreatorProfileByUserId, getProjectEnrolmentCount,
} from '../../services/projectService';
import Creator         from '../../models/Creator';
import VerifiedCreator from '../../models/VerifiedCreator';
import {
  COLORS, FONTS, TYPE, SPACING, RADIUS,
} from '../../theme';

export default function CreatorProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [creator,      setCreator]      = useState(null);
  const [creatorModel, setCreatorModel] = useState(null);
  const [projCount,    setProjCount]    = useState(0);
  const [students,     setStudents]     = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [signOutModal, setSignOutModal] = useState(false);
  const [signingOut,   setSigningOut]   = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const creatorRow = await getCreatorProfileByUserId(user.id);
        setCreator(creatorRow);
        // Build Creator or VerifiedCreator model and call getPublicProfile()
        if (creatorRow) {
          const model = creatorRow.is_verified
            ? new VerifiedCreator(user.id, user.name, user.email, user.role, user.avatar_url, creatorRow.organisation ?? '', creatorRow.focus_area ?? '', creatorRow.bio ?? '', creatorRow.verified_at)
            : new Creator(user.id, user.name, user.email, user.role, user.avatar_url, creatorRow.organisation ?? '', creatorRow.focus_area ?? '', creatorRow.bio ?? '');
          setCreatorModel(model);
          model.getPublicProfile(); // used for export/share in future; exercises the method now
        }

        if (creatorRow) {
          const projs = await getCreatorProjects(creatorRow.id);
          setProjCount(projs.filter(p => p.status === 'published').length);

          let total = 0;
          for (const p of projs.filter(pr => pr.status === 'published')) {
            total += await getProjectEnrolmentCount(p.id);
          }
          setStudents(total);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  async function handleSignOut() {
    setSigningOut(true);
    try { await authService.signOut(); } catch { setSigningOut(false); setSignOutModal(false); }
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.deleteAccount();
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  }

  const initial = (user?.name ?? 'C').charAt(0).toUpperCase();

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.aiCyan} size="large" /></View>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.lg, paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={[TYPE.h2, { marginTop: SPACING.md, textAlign: 'center' }]}>{user?.name}</Text>
          {creator?.organisation ? (
            <Text style={[TYPE.caption, { textAlign: 'center', marginTop: 2 }]}>{creator.organisation}</Text>
          ) : null}
          {creator?.focus_area ? (
            <Text style={[TYPE.caption, { textAlign: 'center' }]}>{creator.focus_area}</Text>
          ) : null}
          {(creatorModel instanceof VerifiedCreator || creator?.is_verified) && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.aiCyan} />
              <Text style={styles.verifiedText}>Verified Creator</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.aiCyan }]}>{projCount}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>{students}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.hornbillGold }]}>—</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Settings list */}
        <View style={styles.settingsList}>
          {[
            { icon: 'folder-outline',        label: 'My Projects',        onPress: () => navigation.navigate(SCREENS.MY_PROJECTS) },
            { icon: 'bar-chart-outline',     label: 'Analytics',          onPress: () => navigation.navigate(SCREENS.ANALYTICS) },
            { icon: 'notifications-outline', label: 'Notifications',      onPress: () => {} },
            { icon: 'shield-outline',        label: 'Privacy & Security', onPress: () => navigation.navigate(SCREENS.PRIVACY_SECURITY) },
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

          {/* Delete account */}
          <TouchableOpacity style={styles.settingsRow} onPress={handleDeleteAccount} activeOpacity={0.7}>
            <View style={[styles.settingsIcon, { backgroundColor: COLORS.errorBgSubtle }]}>
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </View>
            <Text style={[styles.settingsLabel, { color: COLORS.error }]}>Delete Account</Text>
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
  center:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { alignItems: 'center', marginBottom: SPACING.xl },
  avatar: {
    width: 80, height: 80, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.riverTeal,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.heading900, fontSize: 32, color: COLORS.white },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm,
    backgroundColor: COLORS.cyanBg,
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 4,
  },
  verifiedText: { fontFamily: FONTS.body600, fontSize: 12, color: COLORS.aiCyan },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: FONTS.heading900, fontSize: 22 },
  statLabel: { fontFamily: FONTS.body400, fontSize: 11, color: COLORS.textCaption, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.1)' },
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
