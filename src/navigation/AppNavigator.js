// src/navigation/AppNavigator.js
// Authenticated app shell. Renders the correct tab set based on the user's
// role (learner / creator / parent). Owns the custom animated sliding-pill
// tab bar and the top-level AppStack (modal screens above the tabs).

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { createStackNavigator }     from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets }        from 'react-native-safe-area-context';
import { Ionicons }                 from '@expo/vector-icons';

import { useAuth }   from '../context/AuthContext';
import {
  COLORS, GLASS, FONTS, SPACING, RADIUS, SPRING,
} from '../theme';
import { SCREENS, TAB_BAR_TOTAL_HEIGHT as TAB_BAR_TOTAL_HEIGHT_CONST } from './navConstants';

// Re-export so any existing import from AppNavigator still resolves
export { SCREENS, TAB_BAR_TOTAL_HEIGHT_CONST as TAB_BAR_TOTAL_HEIGHT };

// ─── LEARNER SCREENS ─────────────────────────────────────────────────────────
import HomeScreen          from '../screens/learner/HomeScreen';
import ExploreScreen       from '../screens/learner/ExploreScreen';
import ProjectListScreen   from '../screens/learner/ProjectListScreen';
import ProjectDetailScreen from '../screens/learner/ProjectDetailScreen';
import StepDetailScreen    from '../screens/learner/StepDetailScreen';
import ProgressScreen      from '../screens/learner/ProgressScreen';
import AchievementsScreen  from '../screens/learner/AchievementsScreen';
import CertificateScreen   from '../screens/learner/CertificateScreen';
import AIHelpScreen        from '../screens/learner/AIHelpScreen';
import LeaderboardScreen   from '../screens/learner/LeaderboardScreen';
import ProfileScreen       from '../screens/learner/ProfileScreen';
import NotificationsScreen from '../screens/learner/NotificationsScreen';

// ─── CREATOR SCREENS ─────────────────────────────────────────────────────────
import CreatorDashboardScreen     from '../screens/creator/CreatorDashboardScreen';
import MyProjectsScreen           from '../screens/creator/MyProjectsScreen';
import CreatorProjectDetailScreen from '../screens/creator/CreatorProjectDetailScreen';
import NewProjectScreen           from '../screens/creator/NewProjectScreen';
import EditProjectScreen          from '../screens/creator/EditProjectScreen';
import AnalyticsScreen            from '../screens/creator/AnalyticsScreen';
import CreatorProfileScreen       from '../screens/creator/CreatorProfileScreen';

// ─── PARENT SCREENS ──────────────────────────────────────────────────────────
import ParentDashboardScreen from '../screens/parent/ParentDashboardScreen';
import ChildProgressScreen   from '../screens/parent/ChildProgressScreen';
import ActivityFeedScreen    from '../screens/parent/ActivityFeedScreen';
import ParentProfileScreen   from '../screens/parent/ParentProfileScreen';

// ─── SHARED STACK OPTIONS ────────────────────────────────────────────────────

const STACK_OPTS = {
  headerShown: false,
  cardStyle:   { backgroundColor: 'transparent' },
};

// ─── LEARNER TAB STACKS ──────────────────────────────────────────────────────

const HomeNav    = createStackNavigator();
const ExploreNav = createStackNavigator();
const ProgressNav = createStackNavigator();
const ProfileNav  = createStackNavigator();

function HomeStack() {
  return (
    <HomeNav.Navigator screenOptions={STACK_OPTS}>
      <HomeNav.Screen name={SCREENS.HOME}           component={HomeScreen} />
      <HomeNav.Screen name={SCREENS.PROJECT_DETAIL} component={ProjectDetailScreen} />
      <HomeNav.Screen name={SCREENS.STEP_DETAIL}    component={StepDetailScreen} />
    </HomeNav.Navigator>
  );
}

function ExploreStack() {
  return (
    <ExploreNav.Navigator screenOptions={STACK_OPTS}>
      <ExploreNav.Screen name={SCREENS.EXPLORE}        component={ExploreScreen} />
      <ExploreNav.Screen name={SCREENS.PROJECT_LIST}   component={ProjectListScreen} />
      <ExploreNav.Screen name={SCREENS.PROJECT_DETAIL} component={ProjectDetailScreen} />
      <ExploreNav.Screen name={SCREENS.STEP_DETAIL}    component={StepDetailScreen} />
    </ExploreNav.Navigator>
  );
}

function ProgressStack() {
  return (
    <ProgressNav.Navigator screenOptions={STACK_OPTS}>
      <ProgressNav.Screen name={SCREENS.PROGRESS} component={ProgressScreen} />
    </ProgressNav.Navigator>
  );
}

function LearnerProfileStack() {
  return (
    <ProfileNav.Navigator screenOptions={STACK_OPTS}>
      <ProfileNav.Screen name={SCREENS.PROFILE}      component={ProfileScreen} />
      <ProfileNav.Screen name={SCREENS.ACHIEVEMENTS} component={AchievementsScreen} />
      <ProfileNav.Screen name={SCREENS.CERTIFICATE}  component={CertificateScreen} />
      <ProfileNav.Screen name={SCREENS.LEADERBOARD}  component={LeaderboardScreen} />
    </ProfileNav.Navigator>
  );
}

// ─── CREATOR TAB STACKS ──────────────────────────────────────────────────────

const CreatorDashNav    = createStackNavigator();
const CreatorProjectNav = createStackNavigator();
const AnalyticsNav      = createStackNavigator();
const CreatorProfileNav = createStackNavigator();

function CreatorDashStack() {
  return (
    <CreatorDashNav.Navigator screenOptions={STACK_OPTS}>
      <CreatorDashNav.Screen name={SCREENS.CREATOR_DASHBOARD} component={CreatorDashboardScreen} />
    </CreatorDashNav.Navigator>
  );
}

function CreatorProjectStack() {
  return (
    <CreatorProjectNav.Navigator screenOptions={STACK_OPTS}>
      <CreatorProjectNav.Screen name={SCREENS.MY_PROJECTS}         component={MyProjectsScreen} />
      <CreatorProjectNav.Screen name={SCREENS.CREATOR_PROJ_DETAIL} component={CreatorProjectDetailScreen} />
      <CreatorProjectNav.Screen name={SCREENS.NEW_PROJECT}         component={NewProjectScreen} />
      <CreatorProjectNav.Screen name={SCREENS.EDIT_PROJECT}        component={EditProjectScreen} />
    </CreatorProjectNav.Navigator>
  );
}

function AnalyticsStack() {
  return (
    <AnalyticsNav.Navigator screenOptions={STACK_OPTS}>
      <AnalyticsNav.Screen name={SCREENS.ANALYTICS} component={AnalyticsScreen} />
    </AnalyticsNav.Navigator>
  );
}

function CreatorProfileStack() {
  return (
    <CreatorProfileNav.Navigator screenOptions={STACK_OPTS}>
      <CreatorProfileNav.Screen name={SCREENS.CREATOR_PROFILE} component={CreatorProfileScreen} />
    </CreatorProfileNav.Navigator>
  );
}

// ─── PARENT TAB STACKS ───────────────────────────────────────────────────────

const ParentHomeNav    = createStackNavigator();
const ActivityNav      = createStackNavigator();
const ParentProfileNav = createStackNavigator();

function ParentHomeStack() {
  return (
    <ParentHomeNav.Navigator screenOptions={STACK_OPTS}>
      <ParentHomeNav.Screen name={SCREENS.PARENT_DASHBOARD} component={ParentDashboardScreen} />
      <ParentHomeNav.Screen name={SCREENS.CHILD_PROGRESS}   component={ChildProgressScreen} />
    </ParentHomeNav.Navigator>
  );
}

function ActivityStack() {
  return (
    <ActivityNav.Navigator screenOptions={STACK_OPTS}>
      <ActivityNav.Screen name={SCREENS.ACTIVITY_FEED} component={ActivityFeedScreen} />
    </ActivityNav.Navigator>
  );
}

function ParentProfileStack() {
  return (
    <ParentProfileNav.Navigator screenOptions={STACK_OPTS}>
      <ParentProfileNav.Screen name={SCREENS.PARENT_PROFILE} component={ParentProfileScreen} />
    </ParentProfileNav.Navigator>
  );
}

// ─── ANIMATED TAB BAR ────────────────────────────────────────────────────────

const TAB_HEIGHT = 68; // local alias; canonical value lives in navConstants

function SmibTabBar({ state, descriptors, navigation }) {
  const insets       = useSafeAreaInsets();
  const pillX        = useRef(new Animated.Value(0)).current;
  const [barWidth, setBarWidth] = useState(0);

  const tabCount = state.routes.length;
  const tabW     = barWidth > 0 ? barWidth / tabCount : 0;
  // Pill is slightly narrower than the tab slot with equal side padding
  const pillW    = tabW > 0 ? tabW - SPACING.sm * 2 : 0;

  const animatePill = useCallback(
    (index) => {
      if (tabW === 0) return;
      Animated.spring(pillX, {
        toValue:         index * tabW + SPACING.sm,
        tension:         SPRING.card.tension,
        friction:        SPRING.card.friction,
        useNativeDriver: true,
      }).start();
    },
    [pillX, tabW],
  );

  // Jump to initial position without animation when bar first measures itself
  useEffect(() => {
    if (tabW === 0) return;
    pillX.setValue(state.index * tabW + SPACING.sm);
  }, [tabW]); // intentionally omit state.index — this is the "first layout" case

  // Animate on subsequent tab changes
  useEffect(() => {
    if (tabW === 0) return;
    animatePill(state.index);
  }, [state.index, animatePill]);

  const totalHeight = TAB_HEIGHT + insets.bottom;

  return (
    <View
      style={[styles.bar, { height: totalHeight, paddingBottom: insets.bottom }]}
      onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
    >
      {/* Glass layer */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, styles.barGlass]} />
      </View>

      {/* Sliding pill */}
      {pillW > 0 && (
        <Animated.View
          style={[
            styles.pill,
            { width: pillW, transform: [{ translateX: pillX }] },
          ]}
        />
      )}

      {/* Tab buttons */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused   = state.index === index;
        const label       = typeof options.tabBarLabel === 'string'
          ? options.tabBarLabel
          : (options.title ?? route.name);
        const iconFn = options.tabBarIcon;
        const iconEl = iconFn
          ? iconFn({
              focused: isFocused,
              color:   isFocused ? COLORS.navActiveText : COLORS.navInactive,
              size:    22,
            })
          : null;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={() => {
              const event = navigation.emit({
                type:             'tabPress',
                target:           route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            onLongPress={() => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            }}
          >
            {iconEl}
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── TAB NAVIGATORS ──────────────────────────────────────────────────────────

const LearnerTab = createBottomTabNavigator();
const CreatorTab = createBottomTabNavigator();
const ParentTab  = createBottomTabNavigator();

function LearnerTabs() {
  return (
    <LearnerTab.Navigator
      tabBar={(props) => <SmibTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneContainerStyle: { backgroundColor: 'transparent' } }}
    >
      <LearnerTab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon:  ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <LearnerTab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon:  ({ color, size }) => <Ionicons name="compass" color={color} size={size} />,
        }}
      />
      <LearnerTab.Screen
        name="ProgressTab"
        component={ProgressStack}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon:  ({ color, size }) => <Ionicons name="bar-chart" color={color} size={size} />,
        }}
      />
      <LearnerTab.Screen
        name="ProfileTab"
        component={LearnerProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon:  ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </LearnerTab.Navigator>
  );
}

function CreatorTabs() {
  return (
    <CreatorTab.Navigator
      tabBar={(props) => <SmibTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneContainerStyle: { backgroundColor: 'transparent' } }}
    >
      <CreatorTab.Screen
        name="DashboardTab"
        component={CreatorDashStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon:  ({ color, size }) => <Ionicons name="grid" color={color} size={size} />,
        }}
      />
      <CreatorTab.Screen
        name="ProjectsTab"
        component={CreatorProjectStack}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon:  ({ color, size }) => <Ionicons name="folder" color={color} size={size} />,
        }}
      />
      <CreatorTab.Screen
        name="AnalyticsTab"
        component={AnalyticsStack}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon:  ({ color, size }) => <Ionicons name="analytics" color={color} size={size} />,
        }}
      />
      <CreatorTab.Screen
        name="CreatorProfileTab"
        component={CreatorProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon:  ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </CreatorTab.Navigator>
  );
}

function ParentTabs() {
  return (
    <ParentTab.Navigator
      tabBar={(props) => <SmibTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneContainerStyle: { backgroundColor: 'transparent' } }}
    >
      <ParentTab.Screen
        name="ParentHomeTab"
        component={ParentHomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon:  ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <ParentTab.Screen
        name="ActivityTab"
        component={ActivityStack}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon:  ({ color, size }) => <Ionicons name="list" color={color} size={size} />,
        }}
      />
      <ParentTab.Screen
        name="ParentProfileTab"
        component={ParentProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon:  ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </ParentTab.Navigator>
  );
}

// ─── APP NAVIGATOR ───────────────────────────────────────────────────────────
// Top-level stack for authenticated sessions. Contains the role-based tabs
// plus modal screens that float above the tabs (AIHelp, Notifications).
// Any nested screen can reach these via navigation.navigate(SCREENS.xxx).

const AppStack = createStackNavigator();

export default function AppNavigator() {
  const { isLearner, isCreator, isParent } = useAuth();

  const MainTabs = isCreator ? CreatorTabs
    : isParent               ? ParentTabs
    : LearnerTabs; // default covers learner + unknown roles

  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle:   { backgroundColor: 'transparent' },
      }}
    >
      <AppStack.Screen name="MainTabs"           component={MainTabs} />
      <AppStack.Screen name={SCREENS.NOTIFICATIONS} component={NotificationsScreen} />
      <AppStack.Screen
        name={SCREENS.AI_HELP}
        component={AIHelpScreen}
        options={{ presentation: 'modal' }}
      />
    </AppStack.Navigator>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bar: {
    position:      'absolute',
    bottom:        0,
    left:          0,
    right:         0,
    flexDirection: 'row',
    alignItems:    'center',
    overflow:      'hidden',
    // Floating card look
    borderTopLeftRadius:  RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  barGlass: {
    ...GLASS.nav,
    borderTopLeftRadius:  RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  pill: {
    position:        'absolute',
    top:             8,
    height:          TAB_HEIGHT - 16,
    backgroundColor: COLORS.navActiveBg,
    borderRadius:    RADIUS.lg,
  },
  tab: {
    flex:           1,
    height:         TAB_HEIGHT,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            3,
  },
  label: {
    fontFamily:    FONTS.body700,
    fontSize:      10,
    color:         COLORS.navInactive,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  labelActive: {
    color: COLORS.navActiveText,
  },
});
