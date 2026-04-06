// ============================================================
// FILE: src/screens/ProjectsScreen.js
// PURPOSE: Placeholder for the My Projects screen.
//          Will show the user's started and completed projects.
//          Built properly in the next phase.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

export default function ProjectsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📦</Text>
      <Text style={styles.title}>My Projects</Text>
      <Text style={styles.sub}>Your progress will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.title,
    marginBottom: Spacing.sm,
  },
  sub: {
    ...Typography.subhead,
  },
});
