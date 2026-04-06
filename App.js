// ============================================================
// FILE: App.js
// PURPOSE: The root of the S-MIB app.
//          Sets up required wrappers (outermost → innermost):
//            1. GestureHandlerRootView — enables swipe gestures
//                                        on the Stack navigator
//            2. SafeAreaProvider       — tells every screen where
//                                        the safe zone is (notch,
//                                        home bar, system nav bar)
//            3. NavigationContainer    — manages navigation state
//          Then renders RootNavigator which has the Tab + Stack.
// ============================================================

// IMPORTANT: gesture-handler import must be the very first line
import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    // GestureHandlerRootView enables swipe-back on the Stack navigator
    <GestureHandlerRootView style={{ flex: 1 }}>

      {/* SafeAreaProvider must wrap everything so screens know
          where the safe zone is (notch, status bar, home bar) */}
      <SafeAreaProvider>

        {/* NavigationContainer manages all navigation state */}
        <NavigationContainer>

          {/* Status bar — light content (white text/icons) */}
          <StatusBar style="light" />

          {/* RootNavigator: Stack(Tabs + ProjectDetail) */}
          <RootNavigator />

        </NavigationContainer>

      </SafeAreaProvider>

    </GestureHandlerRootView>
  );
}
