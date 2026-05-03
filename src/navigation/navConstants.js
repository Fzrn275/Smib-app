// src/navigation/navConstants.js
// Screen name constants and shared layout values.
// Kept in a separate file so screens can import these without creating
// a circular dependency with AppNavigator.js.

export const SCREENS = {
  // Learner
  HOME:           'Home',
  EXPLORE:        'Explore',
  PROJECT_LIST:   'ProjectList',
  PROJECT_DETAIL: 'ProjectDetail',
  STEP_DETAIL:    'StepDetail',
  PROGRESS:       'Progress',
  ACHIEVEMENTS:   'Achievements',
  CERTIFICATE:    'Certificate',
  AI_HELP:        'AIHelp',
  LEADERBOARD:    'Leaderboard',
  PROFILE:        'Profile',
  NOTIFICATIONS:  'Notifications',
  // Creator
  CREATOR_DASHBOARD:   'CreatorDashboard',
  MY_PROJECTS:         'MyProjects',
  CREATOR_PROJ_DETAIL: 'CreatorProjectDetail',
  NEW_PROJECT:         'NewProject',
  EDIT_PROJECT:        'EditProject',
  ANALYTICS:           'Analytics',
  CREATOR_PROFILE:     'CreatorProfile',
  // Parent
  PARENT_DASHBOARD: 'ParentDashboard',
  CHILD_PROGRESS:   'ChildProgress',
  ACTIVITY_FEED:    'ActivityFeed',
  PARENT_PROFILE:   'ParentProfile',
  // Shared
  PRIVACY_SECURITY: 'PrivacySecurity',
};

// Height of the custom tab bar (without safe-area insets).
// Screens add insets.bottom on top of this for their scroll padding.
export const TAB_BAR_TOTAL_HEIGHT = 82;
