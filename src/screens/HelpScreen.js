// ============================================================
// FILE: src/screens/HelpScreen.js
// PURPOSE: Placeholder for the Help screen.
//          Will show troubleshooting tips and common problems.
//          Built properly in the next phase.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💡</Text>
      <Text style={styles.title}>Help</Text>
      <Text style={styles.sub}>Troubleshooting tips coming soon</Text>
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
