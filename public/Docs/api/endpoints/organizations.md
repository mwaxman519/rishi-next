# organizations API Endpoint

## Overview

Workforce management API endpoint for organizations operations.

## Base URL

```
https://polite-mud-027da750f.2.azurestaticapps.net/api/organizations
```

## Methods

### GET

Retrieve organizations data.

**Parameters:**

- Query parameters for filtering and pagination

**Response:**

```json
{
  "success": true,
  "data": [],
  "metadata": {
    "total": 0,
    "page": 1,
    "limit": 50
  }
}
```

### POST

Create new organizations resource.

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

Update existing organizations resource.

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

Delete organizations resource.

**Parameters:**

- `id` (path): Resource identifier

## Authentication

Requires valid JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## RBAC Permissions

- **GET**: Read permissions for organizations
- **POST**: Create permissions for organizations
- **PUT/PATCH**: Update permissions for organizations
- **DELETE**: Delete permissions for organizations

## Role Access

- **super_admin**: Full access
- **internal_admin**: Full access
- **field_manager**: Read/Write access
- **brand_agent**: Read access
- **client_user**: Limited access

## Event Publishing

This endpoint publishes events to the EventBusService:

- `organizations.created`
- `organizations.updated`
- `organizations.deleted`

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
  "https://polite-mud-027da750f.2.azurestaticapps.net/api/organizations" \
  -H "Authorization: Bearer <token>"
```

### Create new resource

```bash
curl -X POST \
  "https://polite-mud-027da750f.2.azurestaticapps.net/api/organizations" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "uuid",
    "name": "Resource Name",
    "description": "Resource description"
  }'
```
