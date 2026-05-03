// src/screens/creator/MyProjectsScreen.js
// Screen 20 — c-myprojects — My Projects List

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';

import { useAuth }                                      from '../../context/AuthContext';
import { SCREENS, TAB_BAR_TOTAL_HEIGHT }               from '../../navigation/navConstants';
import { getCreatorProjects, getCreatorRowByUserId }   from '../../services/projectService';
import {
  COLORS, GLASS, FONTS, TYPE, SPACING, RADIUS, BUTTONS,
} from '../../theme';

const STATUS_COLOR = { published: COLORS.success, draft: COLORS.hornbillGold, in_review: COLORS.aiCyan };
const STATUS_LABEL = { published: 'Published', draft: 'Draft', in_review: 'In Review' };
const TABS = ['All', 'Published', 'Drafts'];

export default function MyProjectsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [creatorId,  setCreatorId]  = useState(null);
  const [projects,   setProjects]   = useState([]);
  const [search,     setSearch]     = useState('');
  const [activeTab,  setActiveTab]  = useState('All');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setError('');
      let cId = creatorId;
      if (!cId) {
        const creatorRow = await getCreatorRowByUserId(user.id);
        if (!creatorRow) {
          setError('Creator profile not found. Please sign out and sign back in.');
          setLoading(false);
          return;
        }
        cId = creatorRow.id;
        setCreatorId(cId);
      }
      const data = await getCreatorProjects(cId);
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, creatorId]);

  useEffect(() => { load(); }, [load]);
  function onRefresh() { setRefreshing(true); load(); }

  const filtered = projects.filter(p => {
    const matchTab = activeTab === 'All'
      ? true
      : activeTab === 'Published' ? p.status === 'published' : p.status === 'draft';
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.aiCyan} size="large" /></View>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.lg, paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.aiCyan} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={TYPE.h1}>My Projects</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate(SCREENS.NEW_PROJECT)}
          >
            <Ionicons name="add" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, { marginBottom: SPACING.md }]}>
          <Ionicons name="search-outline" size={16} color={COLORS.textCaption} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search projects..."
            placeholderTextColor={COLORS.textLabel}
          />
        </View>

        {/* Filter tabs */}
        <View style={styles.tabsRow}>
          {TABS.map(tab => {
            const count = tab === 'All' ? projects.length
              : tab === 'Published' ? projects.filter(p => p.status === 'published').length
              : projects.filter(p => p.status === 'draft').length;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? (
          <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View>
        ) : null}

        {/* Project list */}
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 32, marginBottom: SPACING.md }}>📂</Text>
            <Text style={TYPE.body}>No projects yet. Tap + to create one.</Text>
          </View>
        ) : (
          filtered.map(proj => (
            <TouchableOpacity
              key={proj.id}
              style={styles.projectCard}
              onPress={() => navigation.navigate(SCREENS.CREATOR_PROJ_DETAIL, { projectId: proj.id })}
              activeOpacity={0.8}
            >
              {/* Category colour strip */}
              <View style={[styles.colorStrip, { backgroundColor: STATUS_COLOR[proj.status] ?? COLORS.textCaption }]} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.cardTopRow}>
                  <Text style={[TYPE.h3, { flex: 1 }]} numberOfLines={1}>{proj.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[proj.status] ?? COLORS.textCaption}20` }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[proj.status] ?? COLORS.textCaption }]}>
                      {STATUS_LABEL[proj.status] ?? proj.status}
                    </Text>
                  </View>
                </View>
                <Text style={TYPE.caption}>{proj.category} · {proj.difficulty} · {proj.type}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textCaption} />
            </TouchableOpacity>
          ))
        )}

        {/* Create button at bottom */}
        <TouchableOpacity
          style={[styles.createBtn]}
          onPress={() => navigation.navigate('NewProject')}
        >
          <Ionicons name="add-circle-outline" size={18} color={COLORS.white} />
          <Text style={styles.createBtnText}>+ Create New Project</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll:  { paddingHorizontal: SPACING.xl },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  addBtn: {
    width: 40, height: 40, borderRadius: RADIUS.pill,
    backgroundColor: BUTTONS.variants.primary.backgroundColor,
    alignItems: 'center', justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 44,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.15)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: { flex: 1, fontFamily: FONTS.body400, fontSize: 14, color: COLORS.textPrimary },
  tabsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  tab: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabActive: { backgroundColor: COLORS.riverTeal },
  tabText:   { fontFamily: FONTS.body600, fontSize: 12, color: COLORS.textCaption },
  tabTextActive: { color: COLORS.white },
  errorCard: {
    backgroundColor: COLORS.errorBgSubtle, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  errorText: { fontFamily: FONTS.body400, fontSize: 13, color: COLORS.errorLight },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.xl,
    padding: SPACING.xxl, alignItems: 'center', marginVertical: SPACING.lg,
  },
  projectCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)',
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm,
  },
  colorStrip: { width: 4, height: 44, borderRadius: RADIUS.pill },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  statusBadge: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  statusText: { fontFamily: FONTS.body600, fontSize: 11 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, height: 50, borderRadius: RADIUS.md, marginTop: SPACING.md,
    backgroundColor: BUTTONS.variants.primary.backgroundColor,
  },
  createBtnText: { fontFamily: FONTS.heading800, fontSize: 14, color: COLORS.white },
});
