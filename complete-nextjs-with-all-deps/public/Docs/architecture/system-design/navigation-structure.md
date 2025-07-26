# Navigation Structure

## Overview

The Rishi platform employs a specialized navigation structure designed to accommodate different user types, roles, and organizational contexts. This document outlines the navigation structure and organization to provide a reference for developers and stakeholders.

## Navigation Types and Guiding Principles

The platform provides five different user roles, each with a tailored navigation experience:

1. **Super Admin**: Platform administrators with complete system access
2. **Rishi Management**: Internal Rishi staff for operations management
3. **Field Manager**: Regional managers overseeing Brand Agents
4. **Brand Agent**: Frontline workers representing brands at dispensaries
5. **Client User**: Cannabis brand representatives using the platform

### Navigation Guiding Principles

1. **Role-Based Navigation Structure**:

   - Users can only have one role type at a time
   - Each user only sees navigation items specific to their role
   - Some navigation items may appear across multiple roles, but are still role-specific

2. **Super Admin Special Navigation**:
   - Super Admins have a unique navigation structure organized by user type
   - At the top level, they see all user types as navigation sections (including Super Admin)
   - Within each section, they see all navigation items specific to that role
   - This allows Super Admins to effectively navigate the system from any user perspective

## Navigation Hierarchy

All navigation components follow a common hierarchical structure:

1. **Root Level**: The primary navigation container
2. **Sections**: Logical groupings of related navigation items
3. **Items**: Individual navigation links
4. **Subitems**: Nested navigation items (when applicable)

## Navigation Components by User Type

### 1. Super Admin Navigation

Super administrators have access to all platform features and have a specialized navigation structure organized by user type. This structure enables them to view and interact with the platform from the perspective of any user type.

#### Top-Level User Type Sections

- **Super Admin**: Super administrator specific functions
- **Rishi Management**: Internal staff functions
- **Field Manager**: Regional manager functions
- **Brand Agent**: Frontline worker functions
- **Client User**: Cannabis brand functions

#### Super Admin Section

Within the Super Admin section, they have access to:

- **System Settings**: Platform-wide configuration
- **RBAC Management**: Role and permission management
- **Organizations**: System-wide organization management
- **Users**: System-wide user management
- **Data Management**: Database and system data tools
- **Audit Logs**: Security and action auditing

#### Other User Type Sections

Within each of the other user type sections, Super Admins see the exact same navigation items that users of those roles would see. This allows Super Admins to effectively "switch perspectives" without changing their actual role.

### 2. Rishi Management Navigation

Internal Rishi staff members have navigation tailored to their operational needs.

#### Core Sections

- **Internal Dashboard**: Internal operations overview
- **Client Management**: Client account management
- **Field Operations**: Agent and field activity management
- **Resource Planning**: Staffing and resource allocation
- **Analytics**: Performance and operational metrics

#### Role-Specific Sections

Different internal roles may see specialized sections:

- **Account Managers**: Client-focused sections
- **Field Managers**: Agent-focused sections
- **Finance**: Billing and payment sections

### 3. Field Manager Navigation

Field Managers oversee groups of Brand Agents on a regional basis and have navigation focused on team management and operations.

#### Core Sections

- **Field Dashboard**: Regional performance overview
- **Team Management**: Brand Agent team oversight
- **Regional Schedule**: Calendar view of regional events and staff
- **Brand Agent Directory**: Management of Brand Agents in region
- **Event Management**: Oversight of regional events
- **Dispensary Venues**: Management of dispensary locations in region
- **Regions**: Geographical territory management
- **Performance Metrics**: Regional performance data and reporting

### 4. Brand Agent Navigation

Brand agents (frontline workers who represent cannabis brands at dispensary venues) have a streamlined navigation focused on their day-to-day activities.

#### Core Sections

- **My Dashboard**: Personal activity overview
- **My Availability**: Calendar and availability management
- **My Events**: Assigned events and schedules
- **My Venues**: Assigned dispensary locations
- **My Profile**: Personal details and certifications
- **Resources**: Training and reference materials

### 5. Client User Navigation

Client organization users (cannabis brands) have navigation focused on their organization's activity.

#### Core Sections

- **Client Dashboard**: Organization activity overview
- **Events**: Event creation and management
- **Brand Representatives**: View assigned brand agents
- **Venues**: View dispensaries where their products are sold
- **Marketing Campaigns**: Campaign management
- **Analytics**: Performance metrics and reporting
- **Brand Resources**: Marketing and promotional resources
- **Settings**: Organization and account settings

#### Tier-Specific Sections

Different client tiers see different navigation options:

- **Tier 1**: Basic event planning
- **Tier 2**: Enhanced event management and reporting
- **Tier 3**: White-labeled advanced features

## Navigation Item Structure

Each navigation item has a standardized structure:

```typescript
interface NavItem {
  href: string; // Route path
  label: string; // Display name
  icon: JSX.Element; // Visual icon
  permission?: string; // Required permission
  type?: "item" | "section"; // Item type
  items?: NavItem[]; // Subitems (for nested navigation)
}
```

## Special Navigation Features

### Organization Switching

The navigation includes an organization switcher component that allows users to:

- View organizations they have access to
- Switch between organizations
- See their current organization context

### Context-Aware Navigation

Navigation adapts based on:

- Current organization context
- Organization type (Internal, Client, Partner)
- Client tier level (Tier 1, 2, or 3)
- User role and permissions

### Mobile Navigation

On mobile devices, the navigation:

- Collapses into a drawer/hamburger menu
- Maintains the same structural organization
- Adapts touch targets for mobile interaction

## Navigation Permission Rules

Navigation visibility follows these permission rules:

1. If a navigation item has a `permission` property, the user must have that permission to see it
2. If a navigation item has a `permissions` array, the visibility depends on:
   - By default, user must have ANY of the permissions (OR logic)
   - If `checkAllPermissions` is true, user must have ALL permissions (AND logic)
3. If a navigation section has no visible items, the entire section is hidden
4. Super admins bypass permission checks and see all navigation items

## Location/Venue Concept

In the Rishi platform, it's important to understand the distinction between different location types:

1. **Dispensary Venues**: These are third-party dispensaries where our brand agents perform their work. These are NOT client locations, but rather venues where client products are sold.

2. **Client Business Addresses**: Cannabis brands (our clients) have business addresses used for administrative and billing purposes. These are not operational locations for our field work.

3. **Regions**: Geographic territories managed by Field Managers, containing multiple dispensary venues.

This distinction is important for navigation, as "Locations" in our system primarily refers to dispensary venues where our brand agents work, not client business locations.

## Recent Navigation Changes

### April 2025 Updates

1. Removed "Clock My Availability" from main navigation
2. Added "My Availability" to Brand Agents section
3. Reorganized Super Admin navigation to include sections from all user types
4. Fixed navigation style issues (removed debug outlines and border styles)
5. Improved mobile navigation responsiveness
6. Fixed Dashboard link highlight issue on /dashboard path
   - Enhanced active state detection to highlight Dashboard link when on both / and /dashboard
   - Special case handling for root path navigation items
7. Updated Field Manager navigation to focus on dispensary venue management
8. Clarified "Locations" terminology to refer to dispensary venues, not client locations
9. Standardized terminology around "Regions" to replace "Regional Territories"

## Best Practices

### Navigation Addition Guidelines

When adding new navigation items:

1. Place items in the appropriate section based on function
2. Assign correct permission requirements
3. Provide clear, concise labels
4. Use consistent icons from the design system
5. Test visibility across different user roles

### Navigation Implementation Notes

- Navigation state should be memoized to prevent re-renders
- Use constants for navigation item definitions when possible
- Ensure mobile responsiveness for all navigation components
- Add proper aria attributes for accessibility

## Navigation-Related API Endpoints

The following API endpoints support navigation functionality:

- `/api/organizations/user`: Retrieves organizations for the organization switcher
- `/api/rbac/organization-permissions`: Retrieves permissions for the current organization context
- `/api/auth/me`: Retrieves the current user profile for navigation context

## Troubleshooting Common Navigation Issues

### Missing Navigation Items

If navigation items are missing:

- Verify user has the required permissions
- Check the current organization context
- Confirm the navigation item definition includes proper href/label/icon
- Inspect the Navigation component rendering logic

### Navigation Rendering Errors

For navigation rendering issues:

- Check for null/undefined values in navigation props
- Verify the authentication state is properly loaded
- Ensure permission data is correctly fetched
- Look for console errors related to navigation components

### Navigation Highlighting Issues

If navigation items don't highlight correctly when active:

- Check the `isActive` logic in the SidebarLayout component
- Verify that special route cases (like `/` and `/dashboard`) are handled
- Ensure the `pathname` from `usePathname()` is being compared correctly
- Look for special cases where a link should be highlighted on multiple paths
- Remember that parent routes should highlight when on child routes (e.g., `/admin` should highlight on `/admin/users`)

### Performance Issues

If navigation feels slow or causes performance problems:

- Check for excessive re-renders
- Ensure navigation data is properly memoized
- Verify efficient permission checking
- Optimize icon rendering

## Additional Resources

- [Navigation Architecture](./navigation-architecture.md)
- [Navigation Implementation](./navigation-implementation.md)
- [RBAC Documentation](../rbac/README.md)
- [Multi-Organization Architecture](../multi-organization/architecture.md)
