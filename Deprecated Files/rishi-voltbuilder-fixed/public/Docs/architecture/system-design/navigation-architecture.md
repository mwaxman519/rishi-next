# Rishi Navigation Architecture

This document explains the navigation architecture for the Rishi platform, covering the organization of menu items, user-specific navigation components, and the principles governing navigation item visibility.

## Table of Contents

1. [Navigation Structure Overview](#navigation-structure-overview)
2. [User Types and Navigation Components](#user-types-and-navigation-components)
3. [Navigation Item Placement Guidelines](#navigation-item-placement-guidelines)
4. [Super Admin Navigation Guidelines](#super-admin-navigation-guidelines)
5. [Technical Implementation](#technical-implementation)

## Navigation Structure Overview

The Rishi platform uses a hierarchical navigation system with these key sections:

- **Primary Navigation**: Main sidebar navigation for all users
- **Secondary Navigation**: User-specific actions (profile, logout, settings)
- **Sectional Navigation**: User type-specific sections in the main navigation
- **Contextual Navigation**: Navigation specific to the current context (organization, team, etc.)

The navigation system adapts based on:

- User's role (Super Admin, Rishi Management, Field Manager, Brand Agent, Client User)
- User's permissions (RBAC-based access control)
- Current organization context

## User Types and Navigation Components

Each user type has a specific navigation component that determines their visible menu items:

1. **Super Admin Navigation** (`SuperAdminNav.tsx`)

   - Has access to all user type sections (Super Admin, Rishi Management, Field Manager, Brand Agent, Client User)
   - Each section contains the full navigation copy for that user type
   - Special "Super Admin" section for platform-wide administration

2. **Rishi Management Navigation** (`RishiManagementNav.tsx`)

   - Internal staff navigation
   - Focused on client/organization management
   - Does NOT include "My Availability" (only in Brand Agents section)

3. **Field Manager Navigation** (`FieldManagerNav.tsx`)

   - Regional management navigation
   - Focused on Brand Agent oversight and regional operations
   - Manages dispensary venues within their regions
   - Responsible for Brand Agent scheduling and performance

4. **Brand Agent Navigation** (`BrandAgentNav.tsx`)

   - Navigation for staffing brand agents who work at dispensary venues
   - INCLUDES "My Availability" as a primary menu item
   - Focused on personal dashboard, availability, and events

5. **Client User Navigation** (`ClientUserNav.tsx`)
   - Navigation for cannabis brand users
   - Does NOT include "My Availability" (only in Brand Agents section)
   - Focused on organization management, marketing, and event planning

## Navigation Item Placement Guidelines

### Core Principles

1. **Role Appropriateness**: Navigation items should only appear for relevant user roles
2. **Context Sensitivity**: Items should respect the current organization context
3. **Hierarchical Organization**: Items should be logically grouped by function
4. **Consistent Naming**: Use consistent terminology across all navigation components

### Specific Guidelines

1. **My Availability Placement**:

   - ONLY appears in the Brand Agents section
   - NEVER appears as a standalone item in the main navigation
   - Super Admins access it through the Brand Agents submenu

2. **Team Calendar Placement**:

   - Available to Brand Agents and Rishi Management
   - Located in respective sections based on user type

3. **Admin Section Placement**:
   - Only visible to users with admin permissions
   - Super Admins have an expanded Admin section
   - Organization admins have a limited Admin section

## Super Admin Navigation Guidelines

Super Admins are special users who need to have access to all areas of the platform. Following our guiding principle that users should only see second-level navigation items for their user type, Super Admins have a unique structure:

1. At the top level, they see all five user type sections:

   - Super Admin
   - Rishi Management
   - Field Manager
   - Brand Agent
   - Client User

2. Each user type section contains the complete navigation structure for that specific role

   - This allows Super Admins to effectively "navigate as" any user type
   - No duplication of navigation across sections outside of their specific role

3. The Super Admin section contains platform-wide administration tools exclusive to Super Admins

Super Admins can thus access any feature in the system by:

1. First selecting the appropriate user type section
2. Then navigating to the specific feature within that user type's navigation structure

## Technical Implementation

### Navigation Component Structure

The navigation system consists of these key files:

1. `app/components/Navigation.tsx`: Main navigation component
2. `app/components/SidebarLayout.tsx`: Sidebar layout with navigation rendering
3. `app/utils/navigation-utils.ts`: Utility functions for navigation items
4. `shared/navigation-constants.ts`: Shared navigation constants and types
5. User type-specific navigation components:
   - `app/components/navigation/SuperAdminNav.tsx`
   - `app/components/navigation/RishiManagementNav.tsx`
   - `app/components/navigation/FieldManagerNav.tsx`
   - `app/components/navigation/BrandAgentNav.tsx`
   - `app/components/navigation/ClientUserNav.tsx`

### Navigation Component Hierarchy

The navigation system uses this component hierarchy:

```
RootLayout
└── ClientLayout
    └── ClientSidebarLayout
        └── SidebarLayout
            ├── (Dynamic user-specific navigation)
            ├── SuperAdminNav
            ├── RishiManagementNav
            ├── BrandAgentNav
            └── ClientUserNav
```

## Active State Detection

The navigation system implements smart active state detection to highlight the current navigation item:

1. **Exact Path Matching**: Highlights items when `pathname === link.href`
2. **Path Prefix Matching**: Highlights items when `pathname.startsWith(link.href)` for non-root paths
3. **Special Case Handling**: Custom logic for specific routes like Dashboard which should be highlighted on multiple paths

The active state determination for the Dashboard link is a special case:

```tsx
// Special handling for Dashboard link to ensure it's highlighted both on / and /dashboard
const isActive =
  pathname === link.href ||
  (link.href !== "/" && pathname?.startsWith(link.href)) ||
  (link.href === "/" && pathname === "/dashboard");
```

### Important Navigation Constants

```typescript
// From shared/navigation-constants.ts
export enum NAV_ITEM_TYPES {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  type: NAV_ITEM_TYPES;
  permission?: string;
  priority?: string;
  children?: NavItem[];
}
```

### Anti-patterns to Avoid

1. **NEVER** add "My Availability" as a standalone item in the main navigation
2. **NEVER** duplicate navigation items across multiple sections unnecessarily
3. **AVOID** hard-coding navigation items outside the proper navigation components
4. **AVOID** creating fixed links (like FixedAvailabilityLink.tsx) that bypass the navigation system

## Maintaining Navigation Components

When modifying navigation:

1. Check which user type(s) should see the navigation item
2. Add the item to the appropriate user-specific navigation component(s)
3. Update the SuperAdminNav component if applicable, adding the item to the appropriate section
4. Test with different user roles to ensure proper visibility
5. Maintain consistent naming and structure across all navigation components

By following these guidelines, navigation will remain consistent, intuitive, and role-appropriate throughout the platform.
