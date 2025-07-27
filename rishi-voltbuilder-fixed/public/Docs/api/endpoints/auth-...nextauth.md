# auth/[...nextauth] API Endpoint

## Overview

Workforce management API endpoint for auth [...nextauth] operations.

## Base URL

```
https://polite-mud-027da750f.2.azurestaticapps.net/api/auth/[...nextauth]
```

## Methods

### GET

Retrieve auth [...nextauth] data.

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

Create new auth [...nextauth] resource.

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

Update existing auth [...nextauth] resource.

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

Delete auth [...nextauth] resource.

**Parameters:**

- `id` (path): Resource identifier

## Authentication

Requires valid JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## RBAC Permissions

- **GET**: Read permissions for auth
- **POST**: Create permissions for auth
- **PUT/PATCH**: Update permissions for auth
- **DELETE**: Delete permissions for auth

## Role Access

- **super_admin**: Full access
- **internal_admin**: Full access
- **field_manager**: Read/Write access
- **brand_agent**: Read access
- **client_user**: Limited access

## Event Publishing

This endpoint publishes events to the EventBusService:

- `auth.[...nextauth].created`
- `auth.[...nextauth].updated`
- `auth.[...nextauth].deleted`

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
  "https://polite-mud-027da750f.2.azurestaticapps.net/api/auth/[...nextauth]" \
  -H "Authorization: Bearer <token>"
```

### Create new resource

```bash
curl -X POST \
  "https://polite-mud-027da750f.2.azurestaticapps.net/api/auth/[...nextauth]" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "uuid",
    "name": "Resource Name",
    "description": "Resource description"
  }'
```
