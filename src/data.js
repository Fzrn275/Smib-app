// ============================================================
// FILE: src/data.js
// PURPOSE: Single source of truth for all static placeholder data.
//          All screens import USER and shared constants from here.
//          When Supabase is connected, this file gets replaced by
//          real API calls — one change point, not six.
// ============================================================

import { Colors } from './theme';

// ----------------------------------------------------------
// CURRENT USER — placeholder until Supabase auth
// ----------------------------------------------------------
export const USER = {
  name:       'Nazz',
  initials:   'NZ',
  studentId:  'STU-2024-0042',
  school:     'SMK Bandar Kuching',
  programme:  'STEM Inovator Belia',
  level:      4,
  rank:       'Maker Apprentice',
  xp:         620,
  xpMax:      1000,
  xpNext:     380,
  active:     3,
  done:       7,
  streak:     7,
  badges:     6,    // number of badges currently earned
};

// ----------------------------------------------------------
// HOME SCREEN PROJECTS — projects the user is enrolled in
// ----------------------------------------------------------
export const MY_PROJECTS = [
  {
    id:         'solar-charger',
    emoji:      '⚡',
    emojiColor: Colors.tealLight,
    title:      'Solar Phone Charger',
    subtitle:   'Electronics • 3 of 6 steps done',
    progress:   0.5,
    barColor:   Colors.teal,
    difficulty: 'Easy',
    diffStyle:  'easy',
    category:   'Electronics',
    duration:   'About 2 hours',
    tags:       ['Step-by-step', '♻️ Recycled'],
    steps: [
      { id: 1, title: 'Gather materials',    status: 'done'     },
      { id: 2, title: 'Connect solar panel', status: 'done'     },
      { id: 3, title: 'Wire the circuit',    status: 'done'     },
      { id: 4, title: 'Add USB port',        status: 'current'  },
      { id: 5, title: 'Test the charger',    status: 'upcoming' },
      { id: 6, title: 'Final assembly',      status: 'upcoming' },
    ],
  },
  {
    id:         'water-sensor',
    emoji:      '🌱',
    emojiColor: Colors.successLight,
    title:      'Smart Water Sensor',
    subtitle:   'Agriculture • 8 of 10 steps done',
    progress:   0.8,
    barColor:   Colors.success,
    difficulty: 'Medium',
    diffStyle:  'medium',
    category:   'Agriculture',
    duration:   'About 3 hours',
    tags:       ['Step-by-step', '🌊 Water'],
    steps: [
      { id: 1,  title: 'Gather components',      status: 'done'     },
      { id: 2,  title: 'Set up Arduino',          status: 'done'     },
      { id: 3,  title: 'Wire the sensor',         status: 'done'     },
      { id: 4,  title: 'Write sensor code',       status: 'done'     },
      { id: 5,  title: 'Test sensor readings',    status: 'done'     },
      { id: 6,  title: 'Build waterproof casing', status: 'done'     },
      { id: 7,  title: 'Mount in field position', status: 'done'     },
      { id: 8,  title: 'Calibrate sensor',        status: 'done'     },
      { id: 9,  title: 'Connect to data logger',  status: 'current'  },
      { id: 10, title: 'Final field test',        status: 'upcoming' },
    ],
  },
  {
    id:         'wind-turbine',
    emoji:      '♻️',
    emojiColor: Colors.warningLight,
    title:      'Recycled Wind Turbine',
    subtitle:   'Renewable Energy • Not started',
    progress:   0,
    barColor:   Colors.warning,
    difficulty: 'Easy',
    diffStyle:  'easy',
    category:   'Renewable Energy',
    duration:   'About 4 hours',
    tags:       ['Step-by-step', '♻️ Recycled'],
    steps: [
      { id: 1, title: 'Collect recycled materials', status: 'current'  },
      { id: 2, title: 'Cut turbine blades',          status: 'upcoming' },
      { id: 3, title: 'Assemble rotor',              status: 'upcoming' },
      { id: 4, title: 'Attach motor/generator',      status: 'upcoming' },
      { id: 5, title: 'Build the tower',             status: 'upcoming' },
      { id: 6, title: 'Test power output',           status: 'upcoming' },
    ],
  },
];
