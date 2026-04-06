// ============================================================
// FILE: src/navigation/AppNavigator.js
// PURPOSE: Bottom tab navigation for S-MIB.
//          4 tabs: Home, Explore, Progress, Profile.
//
// REFERENCE: docs/SMIB_Mockup.html — Version B (Student Friendly)
// STYLE:
//   - White tab bar background
//   - Top border (#e2e8f0)
//   - Active tab: teal-light bg pill + teal icon/label
//   - Inactive: grey icons
// ============================================================

import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen     from '../screens/HomeScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import HelpScreen     from '../screens/HelpScreen';
import ProfileScreen  from '../screens/ProfileScreen';

import { Colors } from '../theme';

const Tab = createBottomTabNavigator();

// ----------------------------------------------------------
// CUSTOM TAB ICON
// Active state gets a teal-light pill background behind icon.
// ----------------------------------------------------------
function TabIcon({ name, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={name}
        size={22}
        color={focused ? Colors.teal : Colors.textMuted}
      />
    </View>
  );
}

// ----------------------------------------------------------
// NAVIGATOR
// ----------------------------------------------------------
export default function AppNavigator() {
  // insets.bottom = height of the phone's system navigation bar.
  // On Android gesture-nav phones this is ~20-48px.
  // On iPhones with a home indicator it's ~34px.
  // We add it to the tab bar height and paddingBottom so the
  // tab bar sits ABOVE the system nav bar instead of behind it.
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: Colors.card,              // White background
          borderTopWidth:  1,
          borderTopColor:  Colors.border,            // Subtle grey top border
          height:          72 + insets.bottom,       // Grows to cover system nav
          paddingTop:      8,
          paddingBottom:   8 + insets.bottom,        // Pushes content up
        },

        tabBarActiveTintColor:   Colors.teal,
        tabBarInactiveTintColor: Colors.textMuted,

        tabBarLabelStyle: {
          fontSize:   10,
          fontWeight: '600',
          marginTop:  2,
        },
      }}
    >

      {/* ── HOME ───────────────────────────────────────── */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />

      {/* ── EXPLORE ────────────────────────────────────── */}
      <Tab.Screen
        name="Explore"
        component={ProjectsScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'search' : 'search-outline'} focused={focused} />
          ),
        }}
      />

      {/* ── PROGRESS ───────────────────────────────────── */}
      <Tab.Screen
        name="Progress"
        component={HelpScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} focused={focused} />
          ),
        }}
      />

      {/* ── PROFILE ────────────────────────────────────── */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
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
  iconWrap: {
    width:          40,
    height:         32,
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   10,
  },

  // Active tab: teal-light background pill
  iconWrapActive: {
    backgroundColor: Colors.tealLight,
  },
});
