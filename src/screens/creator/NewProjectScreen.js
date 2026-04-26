// src/screens/creator/NewProjectScreen.js — STUB (Phase 6)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPE } from '../../theme';

export default function NewProjectScreen() {
  return (
    <View style={styles.root}>
      <Text style={TYPE.h2}>New Project</Text>
      <Text style={TYPE.body}>Phase 6</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
});
