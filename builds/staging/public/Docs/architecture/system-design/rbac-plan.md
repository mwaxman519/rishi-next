# Comprehensive RBAC Plan

## 1. Role Hierarchy and Structure

```
Super Admin
├── Internal Admin
│   ├── Internal Field Manager
│   │   └── Field Coordinator
│   │       └── Brand Agent
│   └── Internal Account Manager
└── Client Manager
    └── Client User
```

## 2. Detailed Role Definitions

### Super Admin

- **Description**: Highest-level administration role with full system access
- **Key Capabilities**:
  - Create and delete users of all types
  - Grant/revoke Internal Admin access
  - Access all system features and data
  - Configure system-wide settings
  - View audit logs and system activity
  - Manage billing information for all clients

### Internal Admin

- **Description**: High-level administrative role for internal staff
- **Key Capabilities**:
  - Add and manage clients
  - View all client data
  - Access state/region/client account data across the entire system
  - Configure system settings
  - View system reports and analytics
  - Assign Internal Field Managers and Account Managers to clients

### Internal Field Manager

- **Description**: Oversees teams of Brand Agents and Kits
- **Key Capabilities**:
  - Manage Brand Agent assignments and scheduling
  - View and manage kit inventory and distribution
  - Monitor field operations and event execution
  - View performance metrics for their assigned teams
  - Generate field operation reports
  - Coordinate with Account Managers on client needs

### Field Coordinator

- **Description**: Regional coordinator responsible for kits, Brand Agents, and Dispensaries in a specific region
- **Key Capabilities**:
  - Manage Brand Agents within their assigned region
  - Track and manage kit inventory and distribution in their region
  - Coordinate with local dispensaries for events and promotions
  - Schedule Brand Agents for events
  - Perform quality control checks on event execution
  - Generate regional performance reports
  - Handle immediate field issues and escalations

### Brand Agent

- **Description**: Frontline workers who perform marketing services at events
- **Key Capabilities**:
  - View and manage their own schedule and availability
  - Access event details for assigned events
  - Track kit usage for their events
  - Submit post-event reports
  - View their performance metrics
  - Communicate with Field Coordinators
  - Update their skills and qualifications profile

### Internal Account Manager

- **Description**: Manages relationships with specific assigned clients
- **Key Capabilities**:
  - Access data for their assigned clients only
  - View client account history and performance
  - Manage client communications and escalations
  - Support Client Managers with platform usage
  - View and analyze client-specific reports
  - Coordinate with Field Managers on client needs

### Client Manager

- **Description**: Administrative role for client organizations
- **Key Capabilities**:
  - Manage users within their client organization
  - View billing information for their client account
  - Access and manage their company's resources/records
  - View reports and analytics for their company
  - Configure client-specific settings
  - Request services and support

### Client User

- **Description**: Standard user for client organizations
- **Key Capabilities**:
  - Book events
  - View and edit kit and marketing data
  - Perform daily duties for the client
  - View assigned resources
  - Generate basic reports
  - Update personal profile

## 3. Permission Design

Permissions use a `{action}:{resource}` pattern, with granular control over each resource type:

### User Management Permissions

- `view:users`: View user listings
- `create:users`: Create new users
- `edit:users`: Edit existing users
- `delete:users`: Delete users
- `assign:roles`: Assign roles to users
- `view:user_activity`: View user activity logs

### Client Management Permissions

- `view:clients`: View client listings
- `create:clients`: Create new clients
- `edit:clients`: Edit client details
- `delete:clients`: Delete clients
- `view:client_billing`: View client billing information
- `edit:client_billing`: Edit client billing information

### Event Management Permissions

- `view:events`: View event listings
- `create:events`: Create new events
- `edit:events`: Edit event details
- `delete:events`: Delete events
- `approve:events`: Approve event requests

### Kit Management Permissions

- `view:kits`: View kit listings
- `create:kits`: Create new kits
- `edit:kits`: Edit kit details
- `delete:kits`: Delete kits
- `assign:kits`: Assign kits to events/users

### Marketing Data Permissions

- `view:marketing`: View marketing materials and data
- `create:marketing`: Create new marketing materials
- `edit:marketing`: Edit marketing materials
- `delete:marketing`: Delete marketing materials
- `approve:marketing`: Approve marketing materials

### System Management Permissions

- `view:system`: View system settings
- `edit:system`: Edit system settings
- `view:logs`: View system logs
- `view:metrics`: View system metrics
- `edit:configuration`: Edit system configuration

### Regional/State Data Access

- `access:global_data`: Access data across all regions/states
- `access:region_data`: Access data for specific regions
- `access:state_data`: Access data for specific states

### Field Management Permissions

- `view:field_teams`: View field teams and their structure
- `manage:field_teams`: Assign and manage field team members
- `view:regions`: View regional data and boundaries
- `assign:regions`: Assign staff to specific regions

### Brand Agent Management

- `view:agents`: View Brand Agent listings
- `create:agents`: Create new Brand Agent profiles
- `edit:agents`: Edit Brand Agent details
- `assign:agents`: Assign Brand Agents to events
- `view:agent_performance`: View Brand Agent performance metrics

### Dispensary Management

- `view:dispensaries`: View dispensary listings
- `create:dispensaries`: Create new dispensary profiles
- `edit:dispensaries`: Edit dispensary details
- `assign:dispensaries`: Assign dispensaries to events/promotions

### Scheduling Permissions

- `view:schedules`: View scheduling information
- `create:schedules`: Create new schedules
- `edit:schedules`: Edit existing schedules
- `view:availability`: View availability of resources/personnel
- `edit:availability`: Update availability information

## 4. Role-Permission Mappings

### Super Admin

All permissions, including:

- All user management permissions
- All client management permissions
- All event management permissions
- All kit management permissions
- All marketing data permissions
- All system management permissions
- All regional/state data access permissions
- All field management permissions
- All brand agent management permissions
- All dispensary management permissions
- All scheduling permissions

### Internal Admin

Most permissions, excluding certain Super Admin capabilities:

- All user management permissions except `delete:users`
- All client management permissions
- All event management permissions
- All kit management permissions
- All marketing data permissions
- View-only system management permissions (`view:system`, `view:logs`, `view:metrics`)
- All regional/state data access permissions
- All field management permissions
- All brand agent management permissions
- All dispensary management permissions
- All scheduling permissions

### Internal Field Manager

Field operation-focused permissions:

- Limited user management (`view:users`, `edit:users` for Brand Agents)
- View-only client management (`view:clients`)
- All event management permissions
- All kit management permissions
- Limited marketing data permissions (`view:marketing`, `assign:marketing`)
- No system management permissions
- Limited regional access based on assignment (`access:region_data`)
- All field management permissions
- All brand agent management permissions
- All dispensary management permissions
- All scheduling permissions

### Field Coordinator

Region-specific operational permissions:

- Limited user management (`view:users`, `edit:users` for Brand Agents in their region)
- Brand Agent management (`view:agents`, `edit:agents`, `assign:agents` for their region)
- Scheduling permissions (`view:schedules`, `create:schedules`, `edit:schedules`, `view:availability`)
- Dispensary management (`view:dispensaries`, `edit:dispensaries` for their region)
- Kit management (`view:kits`, `edit:kits`, `assign:kits` for their region)
- Limited event management (`view:events`, `edit:events`, `create:events` for their region)
- Regional reporting (`view:region` for their assigned region)

### Brand Agent

Front-line execution permissions:

- Personal profile management (`edit:users` for own profile only)
- Limited schedule visibility (`view:schedules` for own assignments)
- Availability management (`view:availability`, `edit:availability` for self only)
- Event execution (`view:events` for assigned events only)
- Kit usage tracking (`view:kits`, `edit:kits` for assigned kits only)
- Post-event reporting (`create:reports`, `edit:reports` for own events)

### Internal Account Manager

Client relationship-focused permissions:

- Limited user management (`view:users` for assigned clients)
- Limited client management (`view:clients`, `edit:clients` for assigned clients)
- Limited event management (`view:events`, `approve:events` for assigned clients)
- View-only kit management (`view:kits` for assigned clients)
- Limited marketing data permissions (`view:marketing`, `approve:marketing` for assigned clients)
- No system management permissions
- Limited regional access based on assigned clients

### Client Manager

Client organization management permissions:

- Limited user management within their organization (`view:users`, `create:users`, `edit:users`)
- Limited client management for their organization (`view:clients`, `edit:clients`)
- All event management permissions within their organization
- All kit management permissions within their organization
- All marketing data permissions within their organization
- View-only billing information (`view:client_billing`)
- No system management permissions
- Limited data access to their organization only

### Client User

Basic operational permissions:

- No user management permissions
- No client management permissions
- Limited event management (`view:events`, `create:events`, `edit:events` for events they create)
- Limited kit management (`view:kits`, `edit:kits` for assigned kits)
- Limited marketing data permissions (`view:marketing`, `edit:marketing` for assigned materials)
- No system management permissions
- Limited data access to their assignments only

## 5. Data Access Control

Multi-level data access controls:

### Organizational Boundaries

- Super Admin and Internal Admin: Access across all organizations
- Internal Field Manager and Account Manager: Access limited to assigned clients/regions
- Client Manager and Client User: Access limited to their organization
- Field Coordinator: Limited to their assigned region
- Brand Agent: Limited to their assignments only

### Resource Ownership

- Apply ownership filters (created_by, assigned_to) at the database query level
- Enforce hierarchical access (managers can see their team's resources)

### Regional/State Boundaries

- Define geographic scopes for each role
- Filter data queries based on geographic permissions

## 6. Technical Implementation Plan

### 1. Schema Updates

- Update the `USER_ROLES` in `shared/schema.ts` to include the new roles
- Add organization/client relationship tables to track user-client mappings
- Add assignment tables to track Internal Field Manager and Account Manager responsibilities
- Create region tables and assignments for Field Coordinators

### 2. RBAC System Updates

- Expand the `Permission` type in `app/lib/rbac.ts` with the new permissions
- Update the `rolePermissions` mapping with appropriate permissions for each role
- Enhance the permission helper functions to handle organizational boundaries

### 3. Middleware Enhancements

- Update route protection to consider organizational context
- Implement data access filtering based on user role and organization
- Add regional context to route protection

### 4. UI Components

- Create role-specific dashboards for each user type
- Implement conditional rendering based on user permissions
- Develop administrative interfaces for role assignment
- Create mobile-optimized interfaces for field workers

### 5. API Endpoints

- Add role and permission checks to all API endpoints
- Implement data filtering based on user role and access level
- Create role management endpoints for user administration
- Design efficient field reporting endpoints

## 7. Security Considerations

- Implement the principle of least privilege for all roles
- Enforce strict validation for role assignments
- Log all security-relevant actions (role changes, permission grants)
- Implement session timeouts and secure cookie handling
- Add two-factor authentication for high-privilege roles
- Regular security audits for role assignments

## 8. Implementation Roadmap

### Phase 1: Core Role Structure

1. Update schema with new roles
2. Implement basic permission structure
3. Update user management to support role assignment

### Phase 2: Permission Enforcement

1. Enhance middleware for role-based route protection
2. Implement data access controls in API endpoints
3. Add conditional UI rendering based on permissions

### Phase 3: Client Organization Model

1. Develop client organization data model
2. Implement organizational boundaries for data access
3. Create client management interfaces

### Phase 4: Field Operations Features

1. Develop Brand Agent management interfaces
2. Implement regional filtering for Field Coordinators
3. Create event assignment and reporting workflows

### Phase 5: Mobile Access

1. Develop mobile-optimized interfaces for Brand Agents
2. Implement field reporting capabilities
3. Create real-time notification system

### Phase 6: Advanced Features

1. Add audit logging for security events
2. Implement report generation by role
3. Develop administrative dashboards for each role

## 9. Maintenance and Evolution

- Plan for regular reviews of the role-permission structure
- Document processes for adding new roles or permissions
- Create tools for auditing role assignments
- Develop migration plans for role changes
- Establish monitoring for permission-related issues
