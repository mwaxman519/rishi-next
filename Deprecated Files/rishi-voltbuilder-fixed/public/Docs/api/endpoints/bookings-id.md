# bookings/[id] API Endpoint

## Overview

Workforce management API endpoint for bookings [id] operations.

## Base URL

```
https://polite-mud-027da750f.2.azurestaticapps.net/api/bookings/[id]
```

## Methods

### GET

Retrieve bookings [id] data.

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

Create new bookings [id] resource.

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

Update existing bookings [id] resource.

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

Delete bookings [id] resource.

**Parameters:**

- `id` (path): Resource identifier

## Authentication

Requires valid JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## RBAC Permissions

- **GET**: Read permissions for bookings
- **POST**: Create permissions for bookings
- **PUT/PATCH**: Update permissions for bookings
- **DELETE**: Delete permissions for bookings

## Role Access

- **super_admin**: Full access
- **internal_admin**: Full access
- **field_manager**: Read/Write access
- **brand_agent**: Read access
- **client_user**: Limited access

## Event Publishing

This endpoint publishes events to the EventBusService:

- `bookings.[id].created`
- `bookings.[id].updated`
- `bookings.[id].deleted`

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
  "https://polite-mud-027da750f.2.azurestaticapps.net/api/bookings/[id]" \
  -H "Authorization: Bearer <token>"
```

### Create new resource

```bash
curl -X POST \
  "https://polite-mud-027da750f.2.azurestaticapps.net/api/bookings/[id]" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "uuid",
    "name": "Resource Name",
    "description": "Resource description"
  }'
```
