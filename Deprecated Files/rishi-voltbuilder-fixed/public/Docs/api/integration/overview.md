# API Overview

This document provides an overview of our API, including authentication methods, request formats, and general guidelines.

## Base URL

All API requests should be made to the following base URL:

```
https://api.ourplatform.com/v1
```

## Authentication

Our API uses JWT (JSON Web Tokens) for authentication. To authenticate your requests, include an `Authorization` header with a Bearer token:

```
Authorization: Bearer your_jwt_token
```

### Obtaining a JWT Token

To obtain a JWT token, make a POST request to the `/auth/login` endpoint:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

Successful response:

```json
{
  "token": "your_jwt_token",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Request Format

Most API endpoints accept JSON-encoded request bodies:

```http
POST /resources
Content-Type: application/json

{
  "name": "New Resource",
  "description": "Description of the resource"
}
```

## Response Format

All responses are returned in JSON format. A typical response structure looks like this:

```json
{
  "data": {
    // Response data here
  },
  "meta": {
    "pagination": {
      "total": 100,
      "per_page": 10,
      "current_page": 1,
      "last_page": 10
    }
  }
}
```

### Error Responses

Error responses follow this structure:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      // Additional error details, if any
    }
  }
}
```

Common HTTP status codes:

- `200 OK`: The request was successful
- `201 Created`: The resource was created successfully
- `400 Bad Request`: The request was invalid
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: The authenticated user doesn't have permission
- `404 Not Found`: The requested resource was not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Something went wrong on the server

## Rate Limiting

Our API implements rate limiting to prevent abuse. Current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1617215400
```

## Pagination

For endpoints that return lists of items, pagination is supported using the following query parameters:

- `page`: Page number (default: 1)
- `per_page`: Number of items per page (default: 10, max: 100)

Example:

```
GET /resources?page=2&per_page=20
```

Response includes pagination metadata:

```json
{
  "data": [
    // Resources here
  ],
  "meta": {
    "pagination": {
      "total": 45,
      "per_page": 20,
      "current_page": 2,
      "last_page": 3
    }
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting using query parameters:

### Filtering

Use field names as query parameters:

```
GET /resources?status=active&type=document
```

### Sorting

Use the `sort` parameter with a field name, prefixed with `-` for descending order:

```
GET /resources?sort=created_at        // Ascending order by created_at
GET /resources?sort=-created_at       // Descending order by created_at
```

## API Versioning

Our API is versioned via the URL path. The current version is `v1`. When a new, incompatible version is released, it will be available at a new path (e.g., `/v2`).

## Available Endpoints

For detailed documentation on specific endpoints, see:

- [Users API](/docs/api/endpoints/users)
- [Items API](/docs/api/endpoints/items)

## SDK Support

We provide official client libraries for several languages:

- [JavaScript SDK](https://github.com/ourorganization/sdk-js)
- [Python SDK](https://github.com/ourorganization/sdk-python)
- [Ruby SDK](https://github.com/ourorganization/sdk-ruby)

## Tags

[api, reference, authentication, endpoints]
