// src/navigation/RootNavigator.js
// Top-level navigator. Owns the fixed LinearGradient background and the
// AuthProvider. Switches between AuthFlow (signed out) and AppNavigator
// (signed in) once the session restore completes.

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { GRADIENTS, COLORS } from '../theme';
import AppNavigator from './AppNavigator';

// Auth screens
import LoginScreen           from '../screens/auth/LoginScreen';
import ForgotPasswordModal   from '../screens/auth/ForgotPasswordModal';
import RegisterStep1Screen   from '../screens/auth/RegisterStep1Screen';
import RegisterStep2Screen   from '../screens/auth/RegisterStep2Screen';
import RegisterSuccessScreen from '../screens/auth/RegisterSuccessScreen';

// ─── AUTH STACK ──────────────────────────────────────────────────────────────

const Auth = createStackNavigator();

function AuthFlow() {
  return (
    <Auth.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Auth.Screen name="Login"           component={LoginScreen} />
      <Auth.Screen
        name="ForgotPassword"
        component={ForgotPasswordModal}
        options={{ presentation: 'modal' }}
      />
      <Auth.Screen name="RegisterStep1"   component={RegisterStep1Screen} />
      <Auth.Screen name="RegisterStep2"   component={RegisterStep2Screen} />
      <Auth.Screen name="RegisterSuccess" component={RegisterSuccessScreen} />
    </Auth.Navigator>
  );
}

// ─── INNER ROOT ──────────────────────────────────────────────────────────────
// Separate inner component so useAuth() can be called inside AuthProvider.

function NavigationRoot() {
  const { session, user, loading, justRegistered } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.riverTeal} />
      </View>
    );
  }

  // Keep AuthFlow alive while showing RegisterSuccessScreen after registration
  if (session && user && !justRegistered) return <AppNavigator />;
  return <AuthFlow />;
}

// ─── ROOT NAVIGATOR ──────────────────────────────────────────────────────────

export default function RootNavigator() {
  return (
    <AuthProvider>
      {/* Fixed gradient rendered behind every screen via absoluteFill */}
      <LinearGradient
        {...GRADIENTS.background}
        style={StyleSheet.absoluteFill}
      />
      <NavigationRoot />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
  },
});
