// ============================================================
// FILE: src/screens/ProfileScreen.js
// PURPOSE: Profile tab — student info, stats summary, settings.
//
// LAYOUT:
//   - Dark header with avatar initials + name + level badge
//   - Stats row overlapping the header (XP, done, streak)
//   - Info card — student ID, school, programme
//   - Settings list — language, notifications, about, sign out
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, Radius, Shadow } from '../theme';
import { USER } from '../data';
import AnimatedNumber from '../components/AnimatedNumber';
import AppModal from '../components/AppModal';

// ----------------------------------------------------------
// COMPONENT: STAT BOX
// ----------------------------------------------------------
function StatBox({ icon, value, label, valueColor, trigger }) {
  return (
    <View style={styles.statBox}>
      <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
      <Text style={styles.statIcon}>{icon}</Text>
      <AnimatedNumber value={value} style={[styles.statNum, { color: valueColor }]} trigger={trigger} />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ----------------------------------------------------------
// COMPONENT: SETTINGS ROW
// ----------------------------------------------------------
function SettingsRow({ icon, iconBg, label, sublabel, onPress, right, index = 0, focusTrigger = 0 }) {
  const scale        = useRef(new Animated.Value(1)).current;
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entranceAnim.setValue(0);
    Animated.spring(entranceAnim, {
      toValue:         1,
      delay:           index * 50,
      useNativeDriver: true,
      tension:         80,
      friction:        9,
    }).start();
  }, [focusTrigger]);

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={{
      opacity:   entranceAnim,
      transform: [
        { scale },
        { translateX: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
      ],
    }}>
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={[styles.settingsIconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color="#fff" />
        </View>
        <View style={styles.settingsBody}>
          <Text style={styles.settingsLabel}>{label}</Text>
          {sublabel ? <Text style={styles.settingsSub}>{sublabel}</Text> : null}
        </View>
        {right ?? (
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ----------------------------------------------------------
// COMPONENT: SECTION CARD wrapper
// ----------------------------------------------------------
function SectionCard({ children }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

// ----------------------------------------------------------
// MAIN SCREEN
// ----------------------------------------------------------
export default function ProfileScreen() {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [langBM, setLangBM]             = useState(true);
  const [modal, setModal]               = useState(null);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      setFocusTrigger(t => t + 1);
      entranceAnim.setValue(0);
      Animated.timing(entranceAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, [])
  );

  const entranceStyle = {
    opacity:   entranceAnim,
    transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.View style={[{ flex: 1 }, entranceStyle]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── DARK HEADER ──────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.decCircleTop} />
          <View style={styles.decCircleBottom} />

          {/* Logo row */}
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoEmoji}>🦅</Text>
              </View>
              <Text style={styles.logoName}>
                S-<Text style={styles.logoAccent}>MIB</Text>
              </Text>
            </View>
          </View>

          {/* Avatar + name */}
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{USER.initials}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarName}>{USER.name}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>
                  LVL {USER.level} · {USER.rank}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── STATS ROW (overlaps header) ───────────────────── */}
        <View style={styles.statsGrid}>
          <StatBox icon="⭐" value={USER.xp}    label="Total XP"   valueColor={Colors.gold}    trigger={focusTrigger} />
          <StatBox icon="✅" value={USER.done}   label="Done"       valueColor={Colors.success} trigger={focusTrigger} />
          <StatBox icon="🔥" value={USER.streak} label="Day Streak" valueColor={Colors.warning} trigger={focusTrigger} />
        </View>

        {/* ── STUDENT INFO CARD ─────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Student Info</Text>
        </View>

        <SectionCard>
          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="card-outline" size={18} color={Colors.info} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Student ID</Text>
              <Text style={styles.infoValue}>{USER.studentId}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: Colors.tealLight }]}>
              <Ionicons name="school-outline" size={18} color={Colors.teal} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>School</Text>
              <Text style={styles.infoValue}>{USER.school}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="ribbon-outline" size={18} color={Colors.success} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Programme</Text>
              <Text style={styles.infoValue}>{USER.programme}</Text>
            </View>
          </View>
        </SectionCard>

        {/* ── PREFERENCES ───────────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>

        <SectionCard>
          <SettingsRow
            icon="notifications-outline"
            iconBg={Colors.teal}
            label="Notifications"
            sublabel="Project reminders & updates"
            index={0}
            focusTrigger={focusTrigger}
            right={
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: Colors.border, true: Colors.teal }}
                thumbColor="#fff"
              />
            }
          />

          <View style={styles.divider} />

          <SettingsRow
            icon="language-outline"
            iconBg={Colors.info}
            label="Language / Bahasa"
            sublabel={langBM ? 'Bahasa Malaysia' : 'English'}
            index={1}
            focusTrigger={focusTrigger}
            right={
              <Switch
                value={langBM}
                onValueChange={setLangBM}
                trackColor={{ false: Colors.border, true: Colors.info }}
                thumbColor="#fff"
              />
            }
          />
        </SectionCard>

        {/* ── MORE ──────────────────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>More</Text>
        </View>

        <SectionCard>
          <SettingsRow
            icon="information-circle-outline"
            iconBg={Colors.warning}
            label="About S-MIB"
            sublabel="Version 1.0.0"
            index={2}
            focusTrigger={focusTrigger}
            onPress={() => setModal({ emoji: '🦅', title: 'About S-MIB', message: 'S-MIB v1.0.0\nSarawak STEM Inovator Belia\n\nBuilt to help students discover and complete hands-on maker projects.' })}
          />

          <View style={styles.divider} />

          <SettingsRow
            icon="help-circle-outline"
            iconBg={Colors.teal}
            label="Help & Support"
            sublabel="FAQs and contact"
            index={3}
            focusTrigger={focusTrigger}
            onPress={() => setModal({ emoji: '🛟', title: 'Help & Support', message: 'Having trouble?\n\nAsk your teacher or contact your school STEM coordinator for assistance.' })}
          />

          <View style={styles.divider} />

          <SettingsRow
            icon="log-out-outline"
            iconBg={Colors.red}
            label="Sign Out"
            index={4}
            focusTrigger={focusTrigger}
            onPress={() => setModal({
              emoji: '🚪',
              title: 'Log Keluar / Sign Out',
              message: 'Sign out will be available once your account is connected to the server.',
              action: { label: 'Sign Out', destructive: true, onPress: () => {} },
            })}
          />
        </SectionCard>

        {/* Footer note */}
        <Text style={styles.footer}>S-MIB · Sarawak STEM Initiative 🦅</Text>

      </ScrollView>
      </Animated.View>

      <AppModal
        visible={!!modal}
        onClose={() => setModal(null)}
        {...(modal ?? {})}
      />
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
    paddingHorizontal:       Spacing.md,
    paddingTop:              Spacing.md,
    paddingBottom:           Spacing.xxl,
    borderBottomLeftRadius:  28,
    borderBottomRightRadius: 28,
    overflow:                'hidden',
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

  headerTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.md,
    zIndex:         1,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },

  logoIcon: {
    width:           38,
    height:          38,
    borderRadius:    Radius.md,
    backgroundColor: Colors.gold,
    alignItems:      'center',
    justifyContent:  'center',
  },

  logoEmoji:  { fontSize: 20 },
  logoName:   { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  logoAccent: { color: Colors.gold },

  // ── Avatar ─────────────────────────────────────────────
  avatarRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
    zIndex:        1,
  },

  avatar: {
    width:           64,
    height:          64,
    borderRadius:    Radius.full,
    backgroundColor: Colors.gold,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     3,
    borderColor:     'rgba(255,255,255,0.20)',
  },

  avatarInitials: {
    fontSize:   24,
    fontWeight: '900',
    color:      '#1a1a2e',
  },

  avatarInfo: {
    flex: 1,
  },

  avatarName: {
    fontSize:     20,
    fontWeight:   '800',
    color:        '#ffffff',
    marginBottom: 6,
  },

  levelBadge: {
    alignSelf:         'flex-start',
    backgroundColor:   'rgba(244, 196, 48, 0.20)',
    borderRadius:      Radius.full,
    paddingHorizontal: 10,
    paddingVertical:   3,
    borderWidth:       1,
    borderColor:       'rgba(244, 196, 48, 0.40)',
  },

  levelBadgeText: {
    fontSize:   11,
    fontWeight: '700',
    color:      Colors.gold,
    letterSpacing: 0.3,
  },

  // ── Stats Grid ─────────────────────────────────────────
  statsGrid: {
    flexDirection:    'row',
    marginHorizontal: Spacing.md,
    marginTop:        -22,
    gap:              Spacing.sm,
    marginBottom:     Spacing.md,
    zIndex:           2,
  },

  statBox: {
    flex:             1,
    borderRadius:     Radius.lg,
    paddingVertical:  12,
    alignItems:       'center',
    overflow:         'hidden',
    backgroundColor:  'rgba(255,255,255,0.06)',
    borderWidth:      1,
    borderColor:      'rgba(255,255,255,0.16)',
  },

  statIcon: {
    fontSize:    16,
    marginBottom: 2,
  },

  statNum: {
    fontSize:   22,
    fontWeight: '900',
  },

  statLabel: {
    fontSize:      10,
    fontWeight:    '600',
    color:         'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop:     2,
  },

  // ── Section headers ─────────────────────────────────────
  sectionHead: {
    paddingHorizontal: Spacing.md,
    marginBottom:      Spacing.sm,
  },

  sectionTitle: {
    fontSize:   16,
    fontWeight: '800',
    color:      Colors.textPrimary,
  },

  // ── Section Card ───────────────────────────────────────
  sectionCard: {
    backgroundColor:  Colors.card,
    borderRadius:     Radius.xl,
    marginHorizontal: Spacing.md,
    marginBottom:     Spacing.lg,
    paddingVertical:  Spacing.xs,
    ...Shadow.card,
  },

  divider: {
    height:           1,
    backgroundColor:  Colors.border,
    marginHorizontal: Spacing.md,
  },

  // ── Info rows ──────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
    paddingVertical:   14,
    paddingHorizontal: Spacing.md,
  },

  infoIconBox: {
    width:         36,
    height:        36,
    borderRadius:  Radius.md,
    alignItems:    'center',
    justifyContent: 'center',
    flexShrink:    0,
  },

  infoBody: {
    flex: 1,
  },

  infoLabel: {
    fontSize:   11,
    fontWeight: '600',
    color:      Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },

  infoValue: {
    fontSize:   14,
    fontWeight: '700',
    color:      Colors.textPrimary,
  },

  // ── Settings rows ──────────────────────────────────────
  settingsRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing.md,
    paddingVertical:   14,
    paddingHorizontal: Spacing.md,
  },

  settingsIconBox: {
    width:          36,
    height:         36,
    borderRadius:   Radius.md,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },

  settingsBody: {
    flex: 1,
  },

  settingsLabel: {
    fontSize:   14,
    fontWeight: '700',
    color:      Colors.textPrimary,
  },

  settingsSub: {
    fontSize:  11,
    color:     Colors.textMuted,
    marginTop: 1,
  },

  // ── Footer ─────────────────────────────────────────────
  footer: {
    textAlign:  'center',
    fontSize:   12,
    color:      Colors.textMuted,
    marginTop:  Spacing.sm,
  },
});
