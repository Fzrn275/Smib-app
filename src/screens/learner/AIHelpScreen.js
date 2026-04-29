// src/screens/learner/AIHelpScreen.js
// s-aichat — AI Help chat screen. Calls aiService → Supabase Edge Function → Gemini.
//
// Route params:
//   project  {object}  — { id, title, category }
//   step     {object}  — { id, title } | null

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Animated, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }              from '../../context/AuthContext';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, SPRING,
} from '../../theme';
import { askAI, buildAIPayload } from '../../services/aiService';
import ContentMentor from '../../models/ContentMentor';

// ─── CHAT BUBBLE ─────────────────────────────────────────────────────────────

function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  const slideA = useRef(new Animated.Value(isUser ? 40 : -40)).current;
  const fadeA  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideA, { toValue: 0, tension: 200, friction: 20, useNativeDriver: true }),
      Animated.timing(fadeA,  { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  if (msg.role === 'typing') {
    return (
      <Animated.View style={[bubStyles.row, { opacity: fadeA }]}>
        <View style={bubStyles.aiBubble}>
          <View style={bubStyles.dotsRow}>
            {[0, 1, 2].map(i => <BounceDot key={i} delay={i * 140} />)}
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        bubStyles.row,
        isUser ? bubStyles.rowUser : bubStyles.rowAI,
        { opacity: fadeA, transform: [{ translateX: slideA }] },
      ]}
    >
      {!isUser && (
        <View style={bubStyles.aiAvatar}>
          <Text style={{ fontSize: 14 }}>🦅</Text>
        </View>
      )}
      <View style={[isUser ? bubStyles.userBubble : bubStyles.aiBubble, { maxWidth: '78%' }]}>
        <Text style={isUser ? bubStyles.userText : bubStyles.aiText}>
          {msg.text}
        </Text>
      </View>
    </Animated.View>
  );
}

function BounceDot({ delay }) {
  const bounceA = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(bounceA, { toValue: -6, tension: 300, friction: 10, useNativeDriver: true }),
        Animated.spring(bounceA, { toValue:  0, tension: 200, friction: 12, useNativeDriver: true }),
        Animated.delay(300),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View style={[bubStyles.dot, { transform: [{ translateY: bounceA }] }]} />
  );
}

const bubStyles = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'flex-end', marginBottom: SPACING.md, paddingHorizontal: SPACING.lg },
  rowUser:    { justifyContent: 'flex-end' },
  rowAI:      { justifyContent: 'flex-start', gap: SPACING.sm },
  aiAvatar: {
    width:           32,
    height:          32,
    borderRadius:    RADIUS.pill,
    backgroundColor: COLORS.tealBorder,
    justifyContent:  'center',
    alignItems:      'center',
    flexShrink:      0,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderRadius:    RADIUS.lg,
    borderBottomRightRadius: 4,
    padding:         SPACING.md,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.12)',
  },
  aiBubble: {
    ...GLASS.standard,
    borderRadius:  RADIUS.lg,
    borderBottomLeftRadius: 4,
    padding:       SPACING.md,
  },
  userText: { fontFamily: FONTS.body400, fontSize: 14, color: COLORS.textPrimary, lineHeight: 22 },
  aiText:   { fontFamily: FONTS.body400, fontSize: 14, color: COLORS.textPrimary, lineHeight: 22 },
  dotsRow:  { flexDirection: 'row', gap: 5, paddingVertical: 4 },
  dot: {
    width:           8,
    height:          8,
    borderRadius:    RADIUS.pill,
    backgroundColor: COLORS.aiCyan,
  },
});

// ─── SCREEN ──────────────────────────────────────────────────────────────────

const WELCOME_MSG = {
  id:   'welcome',
  role: 'ai',
  text: "Hi! I'm the S-MIB AI Helper 🦅 Ask me anything about your current project or step — I'm here to help you learn and build!",
};

export default function AIHelpScreen({ navigation, route }) {
  const { project, step } = route.params ?? {};
  const { user }          = useAuth();
  const insets            = useSafeAreaInsets();

  const [messages,  setMessages]  = useState([WELCOME_MSG]);
  const [input,     setInput]     = useState('');
  const [thinking,  setThinking]  = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  function scrollToBottom() {
    listRef.current?.scrollToEnd({ animated: true });
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text };
    const typingMsg = { id: 'typing', role: 'typing', text: '' };

    setMessages(prev => [...prev, userMsg, typingMsg]);
    setInput('');
    setThinking(true);
    setTimeout(scrollToBottom, 80);

    try {
      let payload = buildAIPayload(user, project, step, text);
      // If the user is a ContentMentor, use answerQuestion() to enrich the AI context
      if (user?.role === 'content_mentor') {
        const mentor = new ContentMentor(
          user.id, user.name, user.email, user.role, user.avatar_url,
          user.organisation ?? '', user.focus_area ?? '', user.bio ?? '',
        );
        const mentorCtx = mentor.answerQuestion({ projectId: project?.id, stepId: step?.id }, text);
        payload = { ...payload, mentor_name: mentorCtx.mentorName, focus_area: mentorCtx.focusArea };
      }
      const reply = await askAI(payload);
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        { id: Date.now().toString(), role: 'ai', text: reply },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        {
          id:   Date.now().toString(),
          role: 'ai',
          text: err.message || 'Sorry, I could not reach the AI right now. Please check your connection.',
        },
      ]);
    } finally {
      setThinking(false);
      setTimeout(scrollToBottom, 100);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.aiAvatarLg}>
            <Text style={{ fontSize: 20 }}>🦅</Text>
          </View>
          <View>
            <Text style={styles.aiName}>S-MIB AI Helper</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Ready to help</Text>
            </View>
          </View>
        </View>
        {project?.title ? (
          <Text style={styles.projectLabel} numberOfLines={1}>{project.title}</Text>
        ) : <View />}
      </View>

      {/* ── CONTEXT CHIP ─────────────────────────────────────────── */}
      {step?.title && (
        <View style={styles.contextChip}>
          <Text style={styles.contextText}>📌 {step.title}</Text>
        </View>
      )}

      {/* ── MESSAGES ─────────────────────────────────────────────── */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <Bubble msg={item} />}
        contentContainerStyle={{
          paddingTop:    SPACING.lg,
          paddingBottom: SPACING.xl,
        }}
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
      />

      {/* ── INPUT BAR ────────────────────────────────────────────── */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + SPACING.sm }]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Ask a question about this step..."
          placeholderTextColor={COLORS.textLabel}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
          maxLength={500}
          editable={!thinking}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || thinking) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || thinking}
          activeOpacity={0.8}
        >
          {thinking
            ? <ActivityIndicator size="small" color={COLORS.white} />
            : <Ionicons name="send" size={20} color={COLORS.white} />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.md,
    gap:               SPACING.sm,
    ...GLASS.nav,
    borderTopWidth:    0,
    borderLeftWidth:   0,
    borderRightWidth:  0,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius:    RADIUS.pill,
    padding:         SPACING.sm,
  },
  headerCenter: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
  },
  aiAvatarLg: {
    width:           42,
    height:          42,
    borderRadius:    RADIUS.pill,
    backgroundColor: COLORS.tealBgStrong,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     COLORS.cyanBorder,
  },
  aiName: { fontFamily: FONTS.heading800, fontSize: 15, color: COLORS.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: RADIUS.pill, backgroundColor: COLORS.success },
  statusText: { fontFamily: FONTS.body400, fontSize: 11, color: COLORS.success },
  projectLabel: {
    fontFamily: FONTS.body600,
    fontSize:   11,
    color:      COLORS.textCaption,
    maxWidth:   90,
    textAlign:  'right',
  },

  contextChip: {
    alignSelf:         'center',
    backgroundColor:   COLORS.cyanBg,
    borderRadius:      RADIUS.pill,
    paddingVertical:   5,
    paddingHorizontal: SPACING.md,
    marginVertical:    SPACING.sm,
    borderWidth:       1,
    borderColor:       COLORS.cyanBorderLight,
  },
  contextText: { fontFamily: FONTS.body600, fontSize: 12, color: COLORS.aiCyan },

  inputBar: {
    flexDirection:     'row',
    alignItems:        'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.sm,
    gap:               SPACING.sm,
    ...GLASS.nav,
    borderBottomWidth: 0,
    borderLeftWidth:   0,
    borderRightWidth:  0,
  },
  input: {
    flex:              1,
    ...GLASS.standard,
    borderRadius:      RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.md,
    fontFamily:        FONTS.body400,
    fontSize:          14,
    color:             COLORS.textPrimary,
    maxHeight:         100,
  },
  sendBtn: {
    width:           44,
    height:          44,
    borderRadius:    RADIUS.pill,
    backgroundColor: COLORS.riverTeal,
    justifyContent:  'center',
    alignItems:      'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.tealBgDisabled },
});
