// ============================================================
// FILE: App.js
// PURPOSE: The root of the S-MIB app.
//          Sets up two required wrappers:
//            1. NavigationContainer  — makes navigation work
//            2. SafeAreaProvider     — respects phone notches/
//                                      home bars on iOS & Android
//          Then renders AppNavigator which has all 4 tabs.
// ============================================================

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/theme';

export default function App() {
  return (
    // SafeAreaProvider must wrap everything so screens know
    // where the safe zone is (avoiding notch, status bar, home bar)
    <SafeAreaProvider>

      {/* NavigationContainer manages the navigation state */}
      <NavigationContainer>

        {/* Status bar — light content (white icons) on our dark background */}
        <StatusBar style="light" backgroundColor={Colors.background} />

        {/* The main app with bottom tab navigation */}
        <AppNavigator />

      </NavigationContainer>

    </SafeAreaProvider>
  );
}
