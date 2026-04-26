// src/screens/creator/MyProjectsScreen.js — STUB (Phase 6)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPE } from '../../theme';

export default function MyProjectsScreen() {
  return (
    <View style={styles.root}>
      <Text style={TYPE.h2}>My Projects</Text>
      <Text style={TYPE.body}>Phase 6</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
});
