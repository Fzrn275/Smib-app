// ============================================================
// FILE: src/navigation/RootNavigator.js
// PURPOSE: The top-level Stack navigator.
//          It contains two screens:
//            1. MainTabs     — the 4-tab bottom nav (AppNavigator)
//            2. ProjectDetail — slides in over the tabs when a
//                               project card is tapped
//
//          Why a Stack here instead of inside the Tab?
//          Because the detail screen should slide OVER the tab
//          bar entirely, hiding it while you're in the detail.
// ============================================================

import { createStackNavigator } from '@react-navigation/stack';

import AppNavigator        from './AppNavigator';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,   // We build our own headers on each screen
      }}
    >
      {/* MainTabs — the bottom tab navigator lives here */}
      <Stack.Screen name="MainTabs" component={AppNavigator} />

      {/* ProjectDetail — slides in from the right when a card is tapped */}
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{
          // Smooth card slide — feels native and intentional
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange:  [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }),
        }}
      />

    </Stack.Navigator>
  );
}
