# activities/[id]/approve API Endpoint

## Overview

Workforce management API endpoint for activities [id] approve operations.

## Base URL

```
https://polite-mud-027da750f.2.azurestaticapps.net/api/activities/[id]/approve
```

## Methods

### GET

Retrieve activities [id] approve data.

**Parameters:**

- `id` (path): Resource identifier

**Response:**

```json
{
  "success": true,
  "data": {},
  "metadata": {
    "total": 1,
    "page": 1,
    "limit": 50
  }
}
```

### POST

Create new activities [id] approve resource.

**Request Body:**

```json
{
  "organizationId": "uuid",
  "name": "string",
  "description": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "name": "string",
    "description": "string",
    "createdAt": "2025-06-19T12:00:00Z",
    "updatedAt": "2025-06-19T12:00:00Z"
  }
}
```

### PUT/PATCH

Update existing activities [id] approve resource.

**Parameters:**

- `id` (path): Resource identifier

**Request Body:**

```json
{
  "name": "string",
  "description": "string"
}
```

### DELETE

Delete activities [id] approve resource.

**Parameters:**

- `id` (path): Resource identifier

## Authentication

Requires valid JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## RBAC Permissions

- **GET**: Read permissions for activities
- **POST**: Create permissions for activities
- **PUT/PATCH**: Update permissions for activities
- **DELETE**: Delete permissions for activities

## Role Access

- **super_admin**: Full access
- **internal_admin**: Full access
- **field_manager**: Read/Write access
- **brand_agent**: Read access
- **client_user**: Limited access

## Event Publishing

This endpoint publishes events to the EventBusService:

- `activities.[id].approve.created`
- `activities.[id].approve.updated`
- `activities.[id].approve.deleted`

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {}
  }
}
```

## Examples

### Retrieve all resources

```bash
curl -X GET \
  "https://polite-mud-027da750f.2.azurestaticapps.net/api/activities/[id]/approve" \
  -H "Authorization: Bearer <token>"
```

### Create new resource

```bash
curl -X POST \
  "https://polite-mud-027da750f.2.azurestaticapps.net/api/activities/[id]/approve" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "uuid",
    "name": "Resource Name",
    "description": "Resource description"
  }'
```
