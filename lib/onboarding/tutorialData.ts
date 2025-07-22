/**
 * Tutorial Data Configuration
 * Character-specific tutorial steps and flows
 */

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  instruction: string;
  tip?: string;
  target?: string; // CSS selector for highlighting
  action?: 'click' | 'hover' | 'type' | 'navigate';
  expectedResult?: string;
}

export interface TutorialModule {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
}

export interface TutorialCharacter {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  specialty: string;
  description: string;
  modules: string[];
  duration: string;
  difficulty: string;
  tutorialFlow: TutorialModule[];
}

// Character-specific tutorial flows
export const tutorialCharacters: TutorialCharacter[] = [
  {
    id: 'sage',
    name: 'Sage',
    role: 'Platform Expert',
    avatar: '🧙‍♀️',
    color: 'purple',
    specialty: 'Complete Platform Mastery',
    description: 'I\'ll guide you through every feature of the Rishi Platform, from basic navigation to advanced analytics.',
    modules: ['Dashboard Navigation', 'Organization Management', 'Advanced Features', 'Analytics & Reports'],
    duration: '15-20 minutes',
    difficulty: 'Comprehensive',
    tutorialFlow: [
      {
        id: 'navigation',
        title: 'Dashboard Navigation',
        description: 'Learn to navigate the main dashboard and key sections',
        steps: [
          {
            id: 'welcome_dashboard',
            title: 'Welcome to Your Dashboard',
            description: 'This is your central command center where you can access all platform features.',
            instruction: 'Take a look around the dashboard. Notice the navigation sidebar on the left and the main content area.',
            tip: 'The sidebar adapts based on your role and permissions.',
            target: '[data-sidebar]',
            expectedResult: 'You should see the main dashboard with navigation elements clearly visible.'
          },
          {
            id: 'sidebar_navigation',
            title: 'Explore the Sidebar',
            description: 'The sidebar contains all the main sections of the platform.',
            instruction: 'Click on different sections in the sidebar to see how navigation works.',
            tip: 'Each section has sub-items that appear when you hover or click.',
            action: 'click',
            target: '[data-sidebar-item]',
            expectedResult: 'The sidebar should expand or highlight the selected section.'
          },
          {
            id: 'organization_switcher',
            title: 'Organization Context',
            description: 'You can work with multiple organizations using the organization switcher.',
            instruction: 'Look for the organization switcher at the top of the sidebar.',
            tip: 'Different organizations may have different available features based on their tier.',
            target: '[data-org-switcher]',
            expectedResult: 'You should see your current organization displayed prominently.'
          }
        ]
      },
      {
        id: 'locations',
        title: 'Location Management',
        description: 'Learn how to manage locations and geographic data',
        steps: [
          {
            id: 'locations_overview',
            title: 'Locations Section',
            description: 'Locations are central to workforce management in the cannabis industry.',
            instruction: 'Navigate to the Locations section using the sidebar.',
            action: 'navigate',
            target: '[href*="location"]',
            expectedResult: 'You should see a list or map view of locations.'
          },
          {
            id: 'location_details',
            title: 'View Location Details',
            description: 'Each location contains important information like address, contacts, and scheduling.',
            instruction: 'Click on any location to view its detailed information.',
            action: 'click',
            tip: 'Location details include staffing requirements, equipment needs, and operational hours.',
            expectedResult: 'A detailed view of the location should open.'
          }
        ]
      }
    ]
  },
  {
    id: 'luna',
    name: 'Luna',
    role: 'Field Operations Specialist',
    avatar: '👩‍🏭',
    color: 'teal',
    specialty: 'Field Worker Essentials',
    description: 'Perfect for field workers! I\'ll show you mobile-friendly features and offline capabilities.',
    modules: ['Mobile Interface', 'Offline Features', 'Location Check-ins', 'Task Management'],
    duration: '8-12 minutes',
    difficulty: 'Quick Start',
    tutorialFlow: [
      {
        id: 'mobile_basics',
        title: 'Mobile Interface',
        description: 'Learn the mobile-optimized features for field work',
        steps: [
          {
            id: 'mobile_navigation',
            title: 'Mobile Navigation',
            description: 'The platform is optimized for mobile use in the field.',
            instruction: 'Notice how the interface adapts for touch interactions and smaller screens.',
            tip: 'All essential features are accessible with thumb navigation.',
            expectedResult: 'You should see a mobile-friendly layout with large touch targets.'
          },
          {
            id: 'offline_indicator',
            title: 'Offline Capability',
            description: 'The platform works offline for field workers without reliable internet.',
            instruction: 'Look for the connectivity indicator in the top navigation.',
            tip: 'When offline, your data syncs automatically when connection is restored.',
            target: '[data-offline-indicator]',
            expectedResult: 'You should see a connectivity status indicator.'
          }
        ]
      },
      {
        id: 'field_tasks',
        title: 'Field Task Management',
        description: 'Manage your daily tasks and check-ins',
        steps: [
          {
            id: 'my_tasks',
            title: 'Your Daily Tasks',
            description: 'View and manage tasks assigned to you.',
            instruction: 'Navigate to your task list to see today\'s assignments.',
            action: 'navigate',
            target: '[href*="task"]',
            expectedResult: 'You should see a list of your assigned tasks.'
          },
          {
            id: 'location_checkin',
            title: 'Location Check-in',
            description: 'Check in at locations to log your presence and start work.',
            instruction: 'Find the check-in button for location-based tasks.',
            action: 'click',
            tip: 'Check-ins use GPS to verify your location automatically.',
            expectedResult: 'A check-in interface should appear.'
          }
        ]
      }
    ]
  },
  {
    id: 'alex',
    name: 'Alex',
    role: 'Manager\'s Assistant',
    avatar: '👨‍💼',
    color: 'blue',
    specialty: 'Management Tools',
    description: 'I specialize in management features - staff oversight, scheduling, and performance tracking.',
    modules: ['Staff Management', 'Scheduling', 'Performance Analytics', 'Reporting'],
    duration: '12-15 minutes',
    difficulty: 'Management Focus',
    tutorialFlow: [
      {
        id: 'staff_overview',
        title: 'Staff Management',
        description: 'Manage your team and workforce effectively',
        steps: [
          {
            id: 'staff_directory',
            title: 'Staff Directory',
            description: 'View and manage all staff members under your supervision.',
            instruction: 'Navigate to the Staff section to see your team.',
            action: 'navigate',
            target: '[href*="staff"]',
            expectedResult: 'You should see a directory of staff members.'
          },
          {
            id: 'staff_performance',
            title: 'Performance Tracking',
            description: 'Monitor staff performance and productivity metrics.',
            instruction: 'Look for performance indicators and metrics for each staff member.',
            tip: 'Performance data includes task completion rates, attendance, and quality scores.',
            expectedResult: 'Performance metrics should be visible for your team.'
          }
        ]
      },
      {
        id: 'scheduling',
        title: 'Schedule Management',
        description: 'Create and manage staff schedules efficiently',
        steps: [
          {
            id: 'schedule_view',
            title: 'Schedule Overview',
            description: 'View current schedules and staffing levels.',
            instruction: 'Navigate to the scheduling section.',
            action: 'navigate',
            target: '[href*="schedule"]',
            expectedResult: 'You should see a calendar or schedule view.'
          },
          {
            id: 'create_shift',
            title: 'Creating Shifts',
            description: 'Learn how to create and assign shifts to staff.',
            instruction: 'Look for the option to create a new shift or booking.',
            action: 'click',
            tip: 'Consider staff availability, skills, and location when creating shifts.',
            expectedResult: 'A shift creation form should appear.'
          }
        ]
      }
    ]
  }
];

// Helper functions
export function getTutorialCharacter(characterId: string): TutorialCharacter | undefined {
  return tutorialCharacters.find(char => char.id === characterId);
}

export function getTotalStepsForCharacter(characterId: string): number {
  const character = getTutorialCharacter(characterId);
  if (!character) return 0;
  
  return character.tutorialFlow.reduce((total, module) => total + module.steps.length, 0);
}

export function getStepByIndex(characterId: string, stepIndex: number): TutorialStep | undefined {
  const character = getTutorialCharacter(characterId);
  if (!character) return undefined;

  let currentIndex = 0;
  for (const module of character.tutorialFlow) {
    if (stepIndex < currentIndex + module.steps.length) {
      return module.steps[stepIndex - currentIndex];
    }
    currentIndex += module.steps.length;
  }
  
  return undefined;
}

export function getRecommendedCharacter(userRole: string): string {
  if (userRole.includes('admin') || userRole.includes('manager')) return 'alex';
  if (userRole.includes('agent') || userRole.includes('field')) return 'luna';
  return 'sage';
}