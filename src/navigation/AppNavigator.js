// ============================================================
// FILE: src/navigation/AppNavigator.js
// PURPOSE: Sets up the bottom tab navigation for S-MIB.
//          4 tabs: Home, Projects, Help, Profile.
//
// STYLE: Web3 dark vibe
//   - Black tab bar background
//   - Sarawak gold active icon + label
//   - Gold top border on tab bar
//   - Gold glow on active tab indicator
// ============================================================

import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen    from '../screens/HomeScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import HelpScreen    from '../screens/HelpScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { Colors } from '../theme';

const Tab = createBottomTabNavigator();

// ----------------------------------------------------------
// CUSTOM TAB BAR ICON
// Renders the icon with a gold glow background when active.
// ----------------------------------------------------------
function TabIcon({ name, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={name}
        size={22}
        color={focused ? Colors.gold : Colors.textMuted}
      />
    </View>
  );
}

// ----------------------------------------------------------
// NAVIGATOR
// ----------------------------------------------------------
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        // Hide the default top header on every screen
        headerShown: false,

        // Tab bar Web3 dark styling
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth:  2,
          borderTopColor:  Colors.gold,
          paddingTop:      8,
          // No fixed height — let SafeAreaProvider automatically add
          // the right bottom padding for Android nav buttons & iOS home bar
        },

        // Active label colour = gold
        tabBarActiveTintColor:   Colors.gold,
        // Inactive label colour = muted grey
        tabBarInactiveTintColor: Colors.textMuted,

        tabBarLabelStyle: {
          fontSize:   11,
          fontWeight: '700',
          marginTop:  2,
        },
      }}
    >
      {/* ── HOME TAB ───────────────────────────────────── */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Utama',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />

      {/* ── PROJECTS TAB ───────────────────────────────── */}
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarLabel: 'Projek',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'cube' : 'cube-outline'} focused={focused} />
          ),
        }}
      />

      {/* ── HELP TAB ───────────────────────────────────── */}
      <Tab.Screen
        name="Help"
        component={HelpScreen}
        options={{
          tabBarLabel: 'Bantuan',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'help-circle' : 'help-circle-outline'} focused={focused} />
          ),
        }}
      />

      {/* ── PROFILE TAB ────────────────────────────────── */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ----------------------------------------------------------
// STYLES
// ----------------------------------------------------------
const styles = StyleSheet.create({
  // Wrapper around each tab icon
  iconWrap: {
    width:         40,
    height:        32,
    alignItems:    'center',
    justifyContent:'center',
    borderRadius:  8,
  },

  // Active tab: gold tinted background glow
  iconWrapActive: {
    backgroundColor: Colors.goldDim,    // rgba(255, 215, 0, 0.12) — subtle gold bg
    shadowColor:     Colors.gold,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.5,
    shadowRadius:    8,
  },
});
