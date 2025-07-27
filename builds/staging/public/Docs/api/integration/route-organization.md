# Route Organization for Microservices-Inspired Architecture

## Architectural Principles

1. **Service-Based Organization with Role Context**: Frontend routes are organized primarily by service domain, not by user role
2. **Role-Based Access Control**: Authorization is managed through permissions, not route structure
3. **API Consistency**: API routes follow RESTful conventions with clear domain prefixes
4. **Frontend-Backend Alignment**: Frontend route structure mirrors API service boundaries

## Service-Based Frontend Route Structure

### Authentication Service Routes

- `/auth/login` - User login page
- `/auth/register` - User registration page
- `/auth/reset-password` - Password reset page

### Profile Service Routes

- `/profile` - User profile management page
- `/profile/settings` - User settings

### Availability Service Routes

- `/availability` - Main availability management page (adapts based on user role)
- `/availability/calendar` - Calendar view of availability
- `/availability/settings` - Availability preferences
- `/availability/team` - Team view (visible to managers and admins only)

### Scheduling Service Routes

- `/scheduling` - Main scheduling page (adapts based on user role)
- `/scheduling/calendar` - Calendar view of scheduled sessions
- `/scheduling/appointments` - Appointment management

### Compliance Service Routes - Removed

- These routes have been removed as compliance functionality is not needed for this business

### User Management Routes

- `/users` - User management interface (restricted by role permissions)
- `/users/agents` - Agent management
- `/users/managers` - Manager management

### System Administration Routes

- `/admin` - System administration dashboard
- `/admin/settings` - System settings
- `/admin/logs` - System logs

## API Route Structure (Unchanged)

### User Management API

- `/api/users` - User CRUD operations
- `/api/users/:id` - Specific user operations
- `/api/auth/*` - Authentication endpoints

### Availability Service API

- `/api/availability` - Availability CRUD operations
- `/api/availability/:id` - Specific availability operations
- `/api/availability/conflicts` - Conflict detection

### Scheduling Service API

- `/api/scheduling` - Scheduling CRUD operations
- `/api/scheduling/:id` - Specific schedule operations

### Compliance Service API - Removed

- These endpoints have been removed as compliance functionality is not needed for this business

## Implementation Guidelines

1. **Service-First, Role-Aware Design**:

   - Organize routes by service domain (not by user role)
   - Use conditional rendering within components based on user role
   - Share components across roles where possible

2. **Component Structure**:

   ```
   /app/availability/
     ├── page.tsx           # Main availability page with role-aware rendering
     ├── calendar/
     │   └── page.tsx       # Calendar view with role-specific features
     ├── settings/
     │   └── page.tsx       # Settings page with role-aware permissions
     ├── team/
     │   └── page.tsx       # Team view (for managers/admins only)
     └── components/        # Shared components used by multiple views
   ```

3. **Role-Aware Rendering**:

   ```tsx
   function AvailabilityPage() {
     const { user } = useAuth();

     return (
       <AvailabilityLayout>
         {/* Common components for all roles */}
         <AvailabilityHeader />

         {/* Role-specific components */}
         {user.role === "brand_agent" && <AgentAvailabilityView />}
         {user.role === "manager" && <ManagerAvailabilityView />}
         {user.role === "admin" && <AdminAvailabilityView />}
       </AvailabilityLayout>
     );
   }
   ```

4. **Permissions-Based Access Control**:
   - Use middleware and permission guards to control access to routes
   - Define required permissions at the route level in RBAC configuration

## Authorization Implementation

For each route, define the required permissions in `app/lib/rbac.ts` under `routePermissions`:

```typescript
export const routePermissions: Record<string, Permission | null> = {
  // Public routes
  "/": null,
  "/auth/login": null,
  "/auth/register": null,

  // Service routes with role-based permissions
  "/profile": null, // Available to all authenticated users

  // Agent routes
  "/agent": "view:availability",
  "/agent/availability": "edit:availability",
  "/agent/availability/settings": "edit:availability",

  // Availability routes
  "/availability": "view:availability",
  "/availability/calendar": "view:availability",
  "/availability/settings": "edit:availability",
  "/availability/team": "view:users", // Requires higher permissions

  // Scheduling routes
  "/scheduling": "view:availability",
  "/scheduling/calendar": "view:availability",

  // Compliance routes removed as not needed for this business

  // User management routes
  "/users": "view:users",
  "/users/agents": "view:users",

  // Admin routes
  "/admin": "view:admin",
  "/admin/settings": "edit:system",
  "/admin/logs": "edit:system",
};
```

Then use middleware to enforce these permissions based on the user's role.
