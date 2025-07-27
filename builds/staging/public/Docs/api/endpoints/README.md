# API Endpoints Documentation

## Overview

Complete API endpoint documentation for the Workforce Management Platform. All endpoints support CRUD operations with EventBusService integration, UUID-based entities, and role-based access control.

## Base URL

```
https://polite-mud-027da750f.2.azurestaticapps.net/api
```

## Authentication

All endpoints require JWT authentication via Authorization header:

```
Authorization: Bearer <token>
```

## Core Endpoints

### Activities

- [`activities.md`](activities.md) - Activity management
- [`activities-id.md`](activities-id.md) - Individual activity operations
- [`activities-id-approve.md`](activities-id-approve.md) - Activity approval
- [`activities-id-reject.md`](activities-id-reject.md) - Activity rejection

### Authentication & Authorization

- [`auth-login.md`](auth-login.md) - User login
- [`auth-logout.md`](auth-logout.md) - User logout
- [`auth-me.md`](auth-me.md) - Current user session
- [`auth-permissions.md`](auth-permissions.md) - User permissions
- [`auth-register.md`](auth-register.md) - User registration
- [`rbac-permissions.md`](rbac-permissions.md) - RBAC permission management

### Bookings & Events

- [`bookings.md`](bookings.md) - Booking management
- [`bookings-id.md`](bookings-id.md) - Individual booking operations
- [`events.md`](events.md) - Event management
- [`events-id.md`](events-id.md) - Individual event operations

### Organizations

- [`organizations.md`](organizations.md) - Organization management
- [`organizations-id.md`](organizations-id.md) - Individual organization operations
- [`organizations-users.md`](organizations-users.md) - Organization user management
- [`organizations-settings.md`](organizations-settings.md) - Organization settings

### Users & Teams

- [`users.md`](users.md) - User management
- [`users-id.md`](users-id.md) - Individual user operations
- [`team-id.md`](team-id.md) - Team member operations
- [`roster-brand-agents.md`](roster-brand-agents.md) - Brand agent roster

### Locations & Geography

- [`locations.md`](locations.md) - Location management
- [`locations-id.md`](locations-id.md) - Individual location operations
- [`locations-geocode.md`](locations-geocode.md) - Address geocoding
- [`maps-geocode.md`](maps-geocode.md) - Google Maps geocoding
- [`maps-places.md`](maps-places.md) - Places API integration

### Scheduling & Availability

- [`shifts.md`](shifts.md) - Shift scheduling
- [`shifts-id.md`](shifts-id.md) - Individual shift operations
- [`availability.md`](availability.md) - Staff availability
- [`availability-id.md`](availability-id.md) - Individual availability management

### Inventory & Equipment

- [`kits.md`](kits.md) - Equipment kit templates
- [`kits-id.md`](kits-id.md) - Individual kit operations
- [`items.md`](items.md) - Inventory item management
- [`items-id.md`](items-id.md) - Individual item operations

### Administrative

- [`admin-users.md`](admin-users.md) - User administration
- [`admin-organizations.md`](admin-organizations.md) - Organization administration
- [`admin-locations.md`](admin-locations.md) - Location administration
- [`tasks.md`](tasks.md) - Task management
- [`audit.md`](audit.md) - Audit logging

### Health & Monitoring

- [`health.md`](health.md) - System health checks
- [`healthcheck.md`](healthcheck.md) - Application health monitoring
- [`status.md`](status.md) - System status

## Response Format

All endpoints return responses in the following format:

### Success Response

```json
{
  "success": true,
  "data": {},
  "metadata": {
    "total": 0,
    "page": 1,
    "limit": 50
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## RBAC Permissions

All endpoints implement role-based access control:

- **super_admin**: Full system access
- **internal_admin**: Organization management access
- **field_manager**: Staff and event management access
- **brand_agent**: Event execution access
- **client_manager**: Client organization admin access
- **client_user**: Basic booking access

## Event Publishing

All state-changing operations publish events to EventBusService for microservices communication and audit trails.

## Rate Limiting

API endpoints are rate limited:

- **Authenticated users**: 1000 requests/hour
- **Anonymous users**: 100 requests/hour
- **Burst limit**: 50 requests/minute

## Pagination

List endpoints support pagination:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `sort`: Sort field
- `order`: Sort order (asc/desc)

## Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error
