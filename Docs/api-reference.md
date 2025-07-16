# API Reference

## Authentication

### Login
```
POST /api/auth-service/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "organizationId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "organizationId": "string"
  },
  "token": "string"
}
```

### Logout
```
POST /api/auth-service/logout
```

## User Management

### Get Current User
```
GET /api/auth/user
```

**Response:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "role": "string",
  "organizationId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Get Users
```
GET /api/users
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term
- `role`: Filter by role

## Booking Management

### Create Booking
```
POST /api/bookings
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "startTime": "datetime",
  "endTime": "datetime",
  "locationId": "string",
  "clientOrganizationId": "string",
  "requirements": ["string"],
  "staffNeeded": "number"
}
```

### Get Bookings
```
GET /api/bookings
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status
- `startDate`: Filter by start date
- `endDate`: Filter by end date

### Update Booking
```
PUT /api/bookings/{id}
```

### Delete Booking
```
DELETE /api/bookings/{id}
```

## Staff Management

### Get Staff
```
GET /api/staff
```

### Get Staff Availability
```
GET /api/staff/{id}/availability
```

### Update Staff Availability
```
PUT /api/staff/{id}/availability
```

**Request Body:**
```json
{
  "availability": [
    {
      "dayOfWeek": "number",
      "startTime": "time",
      "endTime": "time",
      "isAvailable": "boolean"
    }
  ]
}
```

## Location Management

### Get Locations
```
GET /api/locations
```

### Create Location
```
POST /api/locations
```

**Request Body:**
```json
{
  "name": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "capacity": "number",
  "equipment": ["string"],
  "requirements": ["string"]
}
```

## Inventory Management

### Get Kit Templates
```
GET /api/kit-templates
```

### Create Kit Template
```
POST /api/kit-templates
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "items": [
    {
      "name": "string",
      "quantity": "number",
      "required": "boolean"
    }
  ]
}
```

### Get Kit Instances
```
GET /api/kit-instances
```

## Error Handling

All API endpoints return consistent error responses:

**Error Response:**
```json
{
  "success": false,
  "error": "string",
  "message": "string",
  "code": "string"
}
```

**HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

API requests are rate limited to:
- 1000 requests per hour per user
- 100 requests per minute per IP

## Authentication Headers

Include the following header in authenticated requests:
```
Authorization: Bearer {token}
```

## Pagination

Paginated endpoints return:
```json
{
  "data": [],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```