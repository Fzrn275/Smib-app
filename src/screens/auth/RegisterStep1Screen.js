// src/screens/auth/RegisterStep1Screen.js — STUB (Phase 4)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPE } from '../../theme';

export default function RegisterStep1Screen() {
  return (
    <View style={styles.root}>
      <Text style={TYPE.h2}>Register — Step 1</Text>
      <Text style={TYPE.body}>Phase 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
});
