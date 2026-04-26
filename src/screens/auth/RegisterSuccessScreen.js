// src/screens/auth/RegisterSuccessScreen.js — STUB (Phase 4)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPE } from '../../theme';

export default function RegisterSuccessScreen() {
  return (
    <View style={styles.root}>
      <Text style={TYPE.h2}>Registration Successful</Text>
      <Text style={TYPE.body}>Phase 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
});
