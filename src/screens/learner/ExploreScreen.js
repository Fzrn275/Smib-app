// src/screens/learner/ExploreScreen.js — STUB (Phase 5)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPE } from '../../theme';

export default function ExploreScreen() {
  return (
    <View style={styles.root}>
      <Text style={TYPE.h2}>Explore</Text>
      <Text style={TYPE.body}>Phase 5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
});
