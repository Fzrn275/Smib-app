// src/screens/parent/ActivityFeedScreen.js — STUB (Phase 7)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPE } from '../../theme';

export default function ActivityFeedScreen() {
  return (
    <View style={styles.root}>
      <Text style={TYPE.h2}>Activity Feed</Text>
      <Text style={TYPE.body}>Phase 7</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
});
