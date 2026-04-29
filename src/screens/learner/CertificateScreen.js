// src/screens/learner/CertificateScreen.js
// s-cert — Certificate viewer with verification code copy button and share.
//
// Route params: { certId }  — UUID of the certificate to display.
// Falls back to showing all of the user's certificates when certId is absent.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator,
  Share, Alert,
} from 'react-native';
import * as Clipboard        from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                       from '../../context/AuthContext';
import { TAB_BAR_TOTAL_HEIGHT }          from '../../navigation/navConstants';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, SPRING, GRADIENTS,
} from '../../theme';
import { getCertificates } from '../../services/achievementService';
import Certificate from '../../models/Certificate';

// ─── CERTIFICATE CARD ────────────────────────────────────────────────────────

function CertCard({ cert, userName }) {
  const [copied, setCopied] = useState(false);
  const scaleA = useRef(new Animated.Value(1)).current;

  // Build Certificate model — use getCertTypeLabel() instead of hardcoded display strings
  const certModel  = new Certificate(
    cert.id, cert.achievement_id, cert.student_id,
    cert.achievements?.title ?? '', cert.trigger_type ?? '',
    cert.cert_type, cert.verification_code ?? '', cert.issued_by ?? 'S-MIB Platform',
  );
  const typeLabel  = certModel.getCertTypeLabel();
  const isMastery  = cert.cert_type === 'category_mastery';
  const proj       = cert.projects;
  const title      = proj?.title ?? cert.achievements?.title ?? 'S-MIB Achievement';
  const category   = proj?.category ?? '';
  const code       = certModel.verificationCode || '—';
  const issuedAt   = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('en-MY', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  async function copyCode() {
    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      Animated.sequence([
        Animated.spring(scaleA, { toValue: 0.96, tension: 300, friction: 18, useNativeDriver: true }),
        Animated.spring(scaleA, { toValue: 1,    tension: 200, friction: 16, useNativeDriver: true }),
      ]).start();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Could not copy', 'Please copy the code manually.');
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        message:
          `I earned a certificate from S-MIB!\n\n` +
          `📜 ${title}\n` +
          `Issued to: ${userName ?? 'Learner'}\n` +
          `Date: ${issuedAt}\n` +
          `Verification: ${code}\n\n` +
          `S-MIB — Sarawak Maker-In-A-Box`,
      });
    } catch {
      // User cancelled — no-op
    }
  }

  return (
    <Animated.View style={[cStyles.wrapper, { transform: [{ scale: scaleA }] }]}>
      <LinearGradient {...GRADIENTS.certificate} style={cStyles.card}>
        {/* Header band */}
        <View style={cStyles.topBand}>
          <Text style={cStyles.hornbill}>🦅</Text>
          <Text style={cStyles.smibLabel}>S-MIB · Sarawak Maker-In-A-Box</Text>
        </View>

        {/* Type tag */}
        <View style={[cStyles.tag, isMastery ? cStyles.tagCyan : cStyles.tagAmber]}>
          <Text style={[cStyles.tagText, { color: isMastery ? COLORS.aiCyan : COLORS.hornbillGold }]}>
            {isMastery ? '🎓' : '🏆'} {typeLabel}
          </Text>
        </View>

        {/* Project / achievement name */}
        <Text style={cStyles.certTitle}>{title}</Text>
        {category ? (
          <Text style={[TYPE.caption, { textAlign: 'center', marginBottom: SPACING.sm }]}>
            {category}
          </Text>
        ) : null}

        {/* Issued to */}
        <View style={cStyles.issuedRow}>
          <Text style={cStyles.issuedLabel}>Issued to</Text>
          <Text style={cStyles.issuedName}>{userName ?? 'Learner'}</Text>
          <Text style={cStyles.issuedDate}>{issuedAt}</Text>
        </View>

        {/* Divider */}
        <View style={cStyles.divider} />

        {/* Verification code */}
        <Text style={cStyles.codeLabel}>Verification ID</Text>
        <View style={cStyles.codeRow}>
          <Text style={cStyles.code} numberOfLines={1} adjustsFontSizeToFit>
            {code}
          </Text>
          <TouchableOpacity onPress={copyCode} style={cStyles.copyBtn} activeOpacity={0.8}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={16}
              color={copied ? COLORS.success : COLORS.aiCyan}
            />
            <Text style={[cStyles.copyText, copied && { color: COLORS.success }]}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Action buttons */}
      <View style={cStyles.actions}>
        <TouchableOpacity style={cStyles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={18} color={COLORS.white} />
          <Text style={cStyles.shareBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={cStyles.verifyBtn} onPress={copyCode} activeOpacity={0.8}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.aiCyan} />
          <Text style={cStyles.verifyBtnText}>Copy Code</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const cStyles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.xl },
  card: {
    borderRadius:   RADIUS.xl,
    padding:        SPACING.xl,
    alignItems:     'center',
    gap:            SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.15)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  topBand: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  hornbill:  { fontSize: 28 },
  smibLabel: { fontFamily: FONTS.body600, fontSize: 12, color: COLORS.textCaption, letterSpacing: 0.5 },

  tag: {
    borderRadius:      RADIUS.pill,
    paddingVertical:   4,
    paddingHorizontal: SPACING.md,
    borderWidth:       1,
  },
  tagAmber: { backgroundColor: COLORS.goldBgMid, borderColor: COLORS.goldBorder },
  tagCyan:  { backgroundColor: COLORS.cyanBgMid, borderColor: COLORS.cyanBorder },
  tagText:  { fontFamily: FONTS.body700, fontSize: 11 },

  certTitle: {
    fontFamily: FONTS.heading900,
    fontSize:   22,
    color:      COLORS.textPrimary,
    textAlign:  'center',
    lineHeight: 30,
  },
  issuedRow: { alignItems: 'center', gap: 2 },
  issuedLabel: { fontFamily: FONTS.body400, fontSize: 11, color: COLORS.textCaption, textTransform: 'uppercase', letterSpacing: 0.8 },
  issuedName:  { fontFamily: FONTS.heading800, fontSize: 18, color: COLORS.textPrimary },
  issuedDate:  { fontFamily: FONTS.body400,    fontSize: 12, color: COLORS.textCaption },

  divider: {
    width:           '80%',
    height:          1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical:  SPACING.xs,
  },

  codeLabel: { fontFamily: FONTS.body700, fontSize: 10, color: COLORS.textLabel, textTransform: 'uppercase', letterSpacing: 0.8 },
  codeRow: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   'rgba(255,255,255,0.06)',
    borderRadius:      RADIUS.md,
    paddingVertical:   SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap:               SPACING.md,
    width:             '100%',
  },
  code: {
    flex:       1,
    fontFamily: FONTS.body700,
    fontSize:   13,
    color:      COLORS.aiCyan,
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    backgroundColor:   COLORS.cyanBg,
    borderRadius:      RADIUS.pill,
    paddingVertical:   5,
    paddingHorizontal: SPACING.sm,
  },
  copyText: { fontFamily: FONTS.body700, fontSize: 11, color: COLORS.aiCyan },

  actions: {
    flexDirection: 'row',
    gap:           SPACING.md,
    marginTop:     SPACING.sm,
  },
  shareBtn: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             SPACING.sm,
    backgroundColor: COLORS.riverTeal,
    borderRadius:    RADIUS.lg,
    paddingVertical: 12,
  },
  shareBtnText: { fontFamily: FONTS.body700, fontSize: 14, color: COLORS.white },
  verifyBtn: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             SPACING.sm,
    backgroundColor: COLORS.cyanBg,
    borderRadius:    RADIUS.lg,
    paddingVertical: 12,
    borderWidth:     1,
    borderColor:     COLORS.cyanBorderLight,
  },
  verifyBtnText: { fontFamily: FONTS.body700, fontSize: 14, color: COLORS.aiCyan },
});

// ─── SCREEN ──────────────────────────────────────────────────────────────────

export default function CertificateScreen({ navigation, route }) {
  const { certId } = route.params ?? {};
  const { user }   = useAuth();
  const insets     = useSafeAreaInsets();

  const [certs,   setCerts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fadeA = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const all = await getCertificates(user.id);
      // If certId supplied, show that one first; otherwise show all
      if (certId) {
        const target = all.find(c => c.id === certId);
        setCerts(target ? [target, ...all.filter(c => c.id !== certId)] : all);
      } else {
        setCerts(all);
      }
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
      Animated.spring(fadeA, {
        toValue: 1, tension: SPRING.default.tension, friction: SPRING.default.friction, useNativeDriver: true,
      }).start();
    }
  }, [user?.id, certId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.hornbillGold} />
      </View>
    );
  }

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeA }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom:     TAB_BAR_TOTAL_HEIGHT + SPACING.xxl,
          paddingTop:        insets.top + SPACING.sm,
          paddingHorizontal: SPACING.lg,
        }}
      >
        {/* ── HEADER ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Certificates</Text>
        </View>

        {certs.length === 0 ? (
          <View style={[GLASS.standard, styles.emptyCard]}>
            <Text style={{ fontSize: 40 }}>📜</Text>
            <Text style={[TYPE.body, { textAlign: 'center' }]}>
              No certificates yet.{'\n'}Complete a project to earn one!
            </Text>
          </View>
        ) : (
          certs.map((cert, i) => (
            <CertCard
              key={cert.id ?? i}
              cert={cert}
              userName={user?.name}
            />
          ))
        )}
      </ScrollView>
    </Animated.View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.md,
    marginBottom:  SPACING.xl,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius:    RADIUS.pill,
    padding:         SPACING.sm,
  },
  title: { fontFamily: FONTS.heading900, fontSize: 24, color: COLORS.textPrimary },
  emptyCard: {
    borderRadius: RADIUS.xl,
    padding:      SPACING.xxl,
    alignItems:   'center',
    gap:          SPACING.lg,
  },
});
