# Shift Management API Documentation

## Overview

The Shift Management API provides comprehensive functionality for managing work shifts, including creation, assignment, lifecycle management, and availability checking. All endpoints require authentication and implement role-based access control.

## Base URL

```
/api/shifts
```

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Role-Based Access Control

### Permissions by Role:

- **brand_agent**: View assigned shifts and open shifts only
- **internal_field_manager**: Full shift management within organization
- **organization_admin**: Complete CRUD access within organization
- **super_admin**: Platform-wide access to all shifts

## Endpoints

### List Shifts

```http
GET /api/shifts
```

#### Query Parameters

| Parameter      | Type   | Description                             | Required |
| -------------- | ------ | --------------------------------------- | -------- |
| organizationId | string | Filter by organization ID               | No       |
| startDate      | string | Filter shifts after date (ISO 8601)     | No       |
| endDate        | string | Filter shifts before date (ISO 8601)    | No       |
| brandId        | string | Filter by brand ID                      | No       |
| locationId     | string | Filter by location ID                   | No       |
| status         | string | Filter by shift status                  | No       |
| agentId        | string | Filter by assigned agent ID             | No       |
| page           | number | Page number for pagination (default: 1) | No       |
| limit          | number | Items per page (default: 10)            | No       |

#### Example Request

```bash
curl -X GET "/api/shifts?organizationId=org123&status=open&limit=20" \
  -H "Authorization: Bearer <token>"
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "shift_uuid",
      "title": "Morning Merchandising Shift",
      "description": "Product placement and inventory check",
      "organizationId": "org_uuid",
      "brandId": "brand_uuid",
      "locationId": "location_uuid",
      "eventId": "event_uuid",
      "status": "open",
      "startDateTime": "2024-01-15T09:00:00Z",
      "endDateTime": "2024-01-15T17:00:00Z",
      "requiredAgents": 2,
      "assignedAgents": 0,
      "hourlyRate": 25.0,
      "totalBudget": 200.0,
      "requiredSkills": ["merchandising", "inventory"],
      "notes": "Bring safety equipment",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z",
      "createdBy": "user_uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Create Shift

```http
POST /api/shifts
```

#### Request Body

```json
{
  "title": "Evening Promotion Shift",
  "description": "Product demonstration and customer engagement",
  "organizationId": "org_uuid",
  "brandId": "brand_uuid",
  "locationId": "location_uuid",
  "eventId": "event_uuid",
  "startDateTime": "2024-01-15T18:00:00Z",
  "endDateTime": "2024-01-15T22:00:00Z",
  "requiredAgents": 3,
  "hourlyRate": 30.0,
  "totalBudget": 360.0,
  "requiredSkills": ["customer_service", "product_demo"],
  "notes": "High-traffic location, wear branded uniform"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "new_shift_uuid",
    "title": "Evening Promotion Shift",
    "status": "draft",
    "assignedAgents": 0,
    "createdAt": "2024-01-12T14:30:00Z",
    "updatedAt": "2024-01-12T14:30:00Z",
    "createdBy": "user_uuid"
  }
}
```

### Get Shift Details

```http
GET /api/shifts/{id}
```

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| id        | string | Shift UUID  |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "shift_uuid",
    "title": "Morning Merchandising Shift",
    "description": "Product placement and inventory check",
    "organizationId": "org_uuid",
    "status": "assigned",
    "assignments": [
      {
        "id": "assignment_uuid",
        "agentId": "agent_uuid",
        "assignmentStatus": "confirmed",
        "assignedAt": "2024-01-12T10:00:00Z",
        "confirmedAt": "2024-01-12T11:30:00Z",
        "notes": "Agent confirmed availability"
      }
    ],
    "location": {
      "id": "location_uuid",
      "name": "Downtown Store",
      "address": "123 Main St, City, State"
    },
    "event": {
      "id": "event_uuid",
      "name": "Product Launch Campaign",
      "brand": "Brand Name"
    }
  }
}
```

### Update Shift

```http
PUT /api/shifts/{id}
```

#### Request Body

```json
{
  "title": "Updated Shift Title",
  "description": "Updated description",
  "startDateTime": "2024-01-15T10:00:00Z",
  "endDateTime": "2024-01-15T18:00:00Z",
  "requiredAgents": 4,
  "hourlyRate": 28.0,
  "notes": "Updated requirements"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "shift_uuid",
    "title": "Updated Shift Title",
    "updatedAt": "2024-01-12T16:00:00Z"
  }
}
```

### Delete Shift

```http
DELETE /api/shifts/{id}
```

#### Response

```json
{
  "success": true,
  "message": "Shift deleted successfully"
}
```

## Shift Assignments

### Assign Agent to Shift

```http
POST /api/shifts/assignments
```

#### Request Body

```json
{
  "shiftId": "shift_uuid",
  "agentId": "agent_uuid",
  "assignmentStatus": "assigned",
  "notes": "Agent has required skills and availability"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "assignment_uuid",
    "shiftId": "shift_uuid",
    "agentId": "agent_uuid",
    "assignmentStatus": "assigned",
    "assignedAt": "2024-01-12T14:00:00Z",
    "assignedBy": "manager_uuid"
  }
}
```

### Update Assignment Status

```http
PUT /api/shifts/assignments/{assignmentId}
```

#### Request Body

```json
{
  "assignmentStatus": "confirmed",
  "notes": "Agent confirmed attendance"
}
```

### Remove Assignment

```http
DELETE /api/shifts/assignments/{assignmentId}
```

## Shift Lifecycle Management

### Start Shift

```http
POST /api/shifts/lifecycle
```

#### Request Body

```json
{
  "action": "start",
  "shiftId": "shift_uuid",
  "startTime": "2024-01-15T09:00:00Z",
  "notes": "Shift started on time"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "shift_uuid",
    "status": "in_progress",
    "actualStartTime": "2024-01-15T09:00:00Z"
  }
}
```

### Complete Shift

```http
POST /api/shifts/lifecycle
```

#### Request Body

```json
{
  "action": "complete",
  "shiftId": "shift_uuid",
  "endTime": "2024-01-15T17:00:00Z",
  "totalHours": 8.0,
  "notes": "All tasks completed successfully"
}
```

### Cancel Shift

```http
POST /api/shifts/lifecycle
```

#### Request Body

```json
{
  "action": "cancel",
  "shiftId": "shift_uuid",
  "reason": "Event cancelled due to weather",
  "notes": "Will reschedule for next week"
}
```

## Availability Checking

### Check Agent Availability

```http
POST /api/shifts/availability
```

#### Request Body

```json
{
  "agentId": "agent_uuid",
  "startDateTime": "2024-01-15T09:00:00Z",
  "endDateTime": "2024-01-15T17:00:00Z",
  "excludeShiftId": "current_shift_uuid"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "available": false,
    "conflictingShifts": [
      {
        "id": "conflict_shift_uuid",
        "title": "Conflicting Shift",
        "startDateTime": "2024-01-15T08:00:00Z",
        "endDateTime": "2024-01-15T16:00:00Z"
      }
    ],
    "conflictingEvents": []
  }
}
```

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### Common Error Codes

| Code               | Description                                   |
| ------------------ | --------------------------------------------- |
| `UNAUTHORIZED`     | Invalid or missing authentication token       |
| `FORBIDDEN`        | Insufficient permissions for requested action |
| `NOT_FOUND`        | Requested shift or resource not found         |
| `VALIDATION_ERROR` | Request body validation failed                |
| `CONFLICT`         | Schedule conflict or business rule violation  |
| `ALREADY_ASSIGNED` | Agent already assigned to shift               |
| `INVALID_STATUS`   | Invalid status transition                     |

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per organization

## Webhooks

The system publishes events for external integrations:

### Event Types

- `shift.created`
- `shift.updated`
- `shift.deleted`
- `shift.assigned`
- `shift.started`
- `shift.completed`
- `shift.cancelled`

### Webhook Payload Example

```json
{
  "event": "shift.assigned",
  "timestamp": "2024-01-12T14:00:00Z",
  "data": {
    "shiftId": "shift_uuid",
    "agentId": "agent_uuid",
    "organizationId": "org_uuid"
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ShiftAPI } from "@rishi/api-client";

const shiftApi = new ShiftAPI({ token: "your-jwt-token" });

// Create a shift
const shift = await shiftApi.createShift({
  title: "Morning Shift",
  organizationId: "org123",
  startDateTime: new Date("2024-01-15T09:00:00Z"),
  endDateTime: new Date("2024-01-15T17:00:00Z"),
  requiredAgents: 2,
});

// Assign agent
await shiftApi.assignAgent(shift.id, "agent123");

// Check availability
const availability = await shiftApi.checkAvailability({
  agentId: "agent123",
  startDateTime: new Date("2024-01-15T09:00:00Z"),
  endDateTime: new Date("2024-01-15T17:00:00Z"),
});
```

### Python

```python
from rishi_api import ShiftAPI
from datetime import datetime

shift_api = ShiftAPI(token='your-jwt-token')

# Create shift
shift = shift_api.create_shift({
    'title': 'Evening Shift',
    'organization_id': 'org123',
    'start_date_time': datetime(2024, 1, 15, 18, 0),
    'end_date_time': datetime(2024, 1, 15, 22, 0),
    'required_agents': 3
})

# List shifts with filters
shifts = shift_api.list_shifts(
    organization_id='org123',
    status='open',
    limit=20
)
```
