// src/screens/parent/ActivityFeedScreen.js
// Screen 28 — p-activity — Activity Feed

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth }          from '../../context/AuthContext';
import { supabase }         from '../../services/supabaseClient';
import { getActivityFeed }  from '../../services/progressService';
import { getUserProfile }   from '../../services/authService';
import {
  COLORS, FONTS, TYPE, SPACING, RADIUS,
} from '../../theme';

const ACTIVITY_ICONS = {
  step:     { emoji: '⚡', color: COLORS.aiCyan },
  badge:    { emoji: '🏆', color: COLORS.hornbillGold },
  enrol:    { emoji: '📚', color: COLORS.riverTeal },
  streak:   { emoji: '🔥', color: COLORS.sarawakRed },
  default:  { emoji: '📌', color: COLORS.textCaption },
};

function groupByDate(items) {
  const today     = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const todayStr  = today.toDateString();
  const yestStr   = yesterday.toDateString();

  const groups = {};
  for (const item of items) {
    const d = item.completed_at ? new Date(item.completed_at) : new Date();
    const ds = d.toDateString();
    const label = ds === todayStr ? 'Today' : ds === yestStr ? 'Yesterday' : d.toLocaleDateString();
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return groups;
}

export default function ActivityFeedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [children,    setChildren]    = useState([]);
  const [childIdx,    setChildIdx]    = useState(0); // -1 = All
  const [activities,  setActivities]  = useState({});   // { childId: [...] }
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setError('');
      const { data: links } = await supabase
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_id', user.id);

      const childIds = (links ?? []).map(l => l.student_id);
      const profiles  = await Promise.all(childIds.map(id => getUserProfile(id)));
      setChildren(profiles);

      const activityMap = {};
      for (const id of childIds) {
        const feed = await getActivityFeed(id, 30);
        activityMap[id] = feed;
      }
      setActivities(activityMap);
    } catch (err) {
      setError(err.message || 'Could not load activity.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  function onRefresh() { setRefreshing(true); load(); }

  const selectedChild = childIdx >= 0 ? children[childIdx] : null;
  const rawFeed = selectedChild
    ? (activities[selectedChild.id] ?? [])
    : Object.values(activities).flat().sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
  const grouped = groupByDate(rawFeed);

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.aiCyan} size="large" /></View>;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.aiCyan} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={TYPE.h1}>Activity</Text>
          <Text style={TYPE.caption}>Recent activity</Text>
        </View>
        {rawFeed.length > 0 && (
          <TouchableOpacity onPress={() => {}}>
            <Text style={{ fontFamily: FONTS.body600, fontSize: 12, color: COLORS.aiCyan }}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}

      {/* Child filter tabs */}
      {children.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <TouchableOpacity
              style={[styles.tab, childIdx === -1 && styles.tabActive]}
              onPress={() => setChildIdx(-1)}
            >
              <Text style={[styles.tabText, childIdx === -1 && styles.tabTextActive]}>All</Text>
            </TouchableOpacity>
            {children.map((c, i) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.tab, childIdx === i && styles.tabActive]}
                onPress={() => setChildIdx(i)}
              >
                <Text style={[styles.tabText, childIdx === i && styles.tabTextActive]}>
                  {c.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {rawFeed.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={{ fontSize: 40, marginBottom: SPACING.md }}>📭</Text>
          <Text style={TYPE.body}>No activity yet</Text>
        </View>
      ) : (
        Object.entries(grouped).map(([dateLabel, items]) => (
          <View key={dateLabel} style={{ marginBottom: SPACING.lg }}>
            <Text style={styles.dateLabel}>{dateLabel}</Text>
            {items.map((item, idx) => {
              const icon = ACTIVITY_ICONS.step;
              const childName = selectedChild?.name?.split(' ')[0] ?? '';
              return (
                <View key={`${item.id}-${idx}`} style={styles.activityRow}>
                  <View style={[styles.iconCircle, { backgroundColor: `${icon.color}20` }]}>
                    <Text style={{ fontSize: 16 }}>{icon.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[TYPE.body, { fontSize: 13, fontFamily: FONTS.body700 }]} numberOfLines={1}>
                      Completed: {item.steps?.title ?? 'a step'}
                    </Text>
                    <Text style={TYPE.caption} numberOfLines={1}>
                      {item.projects?.title ?? 'Unknown project'}
                    </Text>
                  </View>
                  <Text style={TYPE.caption}>
                    {item.completed_at ? new Date(item.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:  { paddingHorizontal: SPACING.xl },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.xl },
  errorCard: {
    backgroundColor: COLORS.errorBgSubtle, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  errorText: { fontFamily: FONTS.body400, fontSize: 13, color: COLORS.errorLight },
  tab: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabActive: { backgroundColor: COLORS.success },
  tabText:   { fontFamily: FONTS.body600, fontSize: 12, color: COLORS.textCaption },
  tabTextActive: { color: COLORS.white },
  dateLabel: {
    fontFamily: FONTS.body700,
    fontSize: 11,
    color: COLORS.textLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  iconCircle: {
    width: 40, height: 40, borderRadius: RADIUS.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.xl,
    padding: SPACING.xxl, alignItems: 'center',
  },
});
