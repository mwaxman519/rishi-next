# Navigation Implementation

## Overview

This document details the technical implementation of the Rishi platform's navigation system. The navigation implementation handles dynamic menu generation based on user roles, permissions, and organizational context.

## Core Components

### 1. Navigation Component (`app/components/Navigation.tsx`)

The main navigation component serves as the entry point for rendering the appropriate navigation menu based on user type, role, and organizational context.

Key responsibilities:

- Determines which specialized navigation component to render
- Passes down user data, permissions, and organization context
- Handles navigation state management

Implementation pattern:

```tsx
export default function Navigation({ user, permissions, currentOrganization }) {
  // Determine which navigation to render based on user type
  if (user.isSuperAdmin) {
    return (
      <SuperAdminNav
        user={user}
        permissions={permissions}
        currentOrganization={currentOrganization}
      />
    );
  }

  if (isInternalRishiStaff(user)) {
    return (
      <RishiManagementNav
        user={user}
        permissions={permissions}
        currentOrganization={currentOrganization}
      />
    );
  }

  if (isBrandAgent(user)) {
    return (
      <BrandAgentNav
        user={user}
        permissions={permissions}
        currentOrganization={currentOrganization}
      />
    );
  }

  return (
    <ClientUserNav
      user={user}
      permissions={permissions}
      currentOrganization={currentOrganization}
    />
  );
}
```

### 2. Sidebar Layout (`app/components/SidebarLayout.tsx`)

The sidebar layout component integrates the navigation with the overall application layout.

Key responsibilities:

- Arranges navigation menu within the sidebar layout
- Handles mobile responsiveness
- Manages sidebar collapse/expand state
- Integrates with client-side authentication
- Determines active states for navigation items

Implementation pattern:

```tsx
export default function SidebarLayout({ children }) {
  const { user, permissions, currentOrganization } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  if (!user) {
    return <LoadingState />;
  }

  return (
    <div className="flex h-screen">
      <aside className={cn("sidebar", collapsed && "collapsed")}>
        <Navigation
          user={user}
          permissions={permissions}
          currentOrganization={currentOrganization}
        />

        {/* Navigation links rendering with active state detection */}
        <ul className="space-y-1">
          {links.map((link) => {
            // Special handling for Dashboard link to ensure it's highlighted both on / and /dashboard
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname?.startsWith(link.href)) ||
              (link.href === "/" && pathname === "/dashboard");

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`sidebar-item ${isActive ? "sidebar-item-active" : "sidebar-item-inactive"}`}
                >
                  <span className="flex-shrink-0">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
```

### 3. Specialized Navigation Components

#### SuperAdminNav (`app/components/navigation/SuperAdminNav.tsx`)

Provides comprehensive navigation options for super administrators, including all sections from other user types.

#### RishiManagementNav (`app/components/navigation/RishiManagementNav.tsx`)

Navigation specific to Rishi internal staff.

#### BrandAgentNav (`app/components/navigation/BrandAgentNav.tsx`)

Navigation designed for frontline brand agents.

#### ClientUserNav (`app/components/navigation/ClientUserNav.tsx`)

Navigation designed for client organization users.

### 4. Navigation Utilities (`app/utils/navigation-utils.ts`)

Utility functions that support navigation implementation:

- `isNavItemVisible`: Determines if a navigation item should be visible based on user permissions
- `filterNavItems`: Filters navigation items based on permissions
- `getOrganizationSection`: Generates organization-specific navigation items
- `generateUserMenu`: Creates user menu options

## Permission Integration

The navigation system integrates with the RBAC permission system to determine which navigation items should be displayed.

Each navigation item can have:

- A `permission` property that specifies the required permission (e.g., `read:events`)
- A `permissions` array for items requiring multiple permissions (using OR logic)
- A `checkAllPermissions` flag to require all permissions in the array (using AND logic)

Example implementation:

```tsx
const navItems = [
  {
    href: "/events",
    label: "Events",
    icon: <CalendarIcon />,
    permission: "read:events",
  },
  {
    href: "/admin",
    label: "Admin",
    icon: <SettingsIcon />,
    permissions: ["manage:users", "manage:settings"],
    checkAllPermissions: false, // OR logic
  },
  {
    href: "/reports/advanced",
    label: "Advanced Reports",
    icon: <BarChartIcon />,
    permissions: ["read:reports", "access:advanced_features"],
    checkAllPermissions: true, // AND logic
  },
];
```

## Organization Context

The navigation system accounts for the current organization context:

- Organization-specific sections adapt based on the current organization
- Certain navigation items only appear for specific organization types or tiers
- Organization switching functionality updates the navigation context

## Mobile Responsiveness

The navigation implementation handles different screen sizes:

- Full sidebar on desktop
- Collapsible sidebar on medium screens
- Drawer/modal navigation on mobile devices
- Appropriate touch targets for mobile interactions

## Navigation Constants (`shared/navigation-constants.ts`)

Navigation constants are centralized to ensure consistency:

- Standard navigation sections
- Common navigation items
- Icon mappings
- Permission requirements

## Performance Optimizations

The navigation system employs several performance optimizations:

- Memoization to prevent unnecessary re-renders
- Lazy loading of navigation sections
- Efficient permission checking
- Minimal state updates

## Error Handling

Error handling strategies:

- Fallback navigation options when permissions can't be determined
- Graceful degradation when user data is incomplete
- Default routes for invalid navigation paths

## Design System Integration

The navigation components integrate with the broader design system:

- Consistent use of spacing, colors, and typography
- Responsive behavior aligned with design system principles
- Accessibility considerations for all navigation elements

## Testing Strategies

Strategies for testing navigation components:

- Unit tests for permission-based visibility logic
- Component tests for rendering of different navigation types
- Integration tests for authentication and permission integration
- E2E tests for user flows through the navigation system

## Deployment Considerations

- Progressive loading of navigation components
- Caching strategies for navigation state
- Environment-specific navigation features (dev/staging/production)
