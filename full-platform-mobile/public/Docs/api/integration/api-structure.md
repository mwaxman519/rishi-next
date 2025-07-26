# API Structure and Endpoints

## Availability Management API

The Availability Management API provides endpoints for creating, retrieving, updating, and deleting availability blocks.

### Base URL

All availability API endpoints are accessed via:

```
/api/agent/availability
```

### Endpoints

#### Get Availability Blocks

**Request:**

```
GET /api/agent/availability?userId={userId}
GET /api/agent/availability?userId={userId}&from={date}&to={date}
```

**Parameters:**

- `userId` (required): The ID of the user to get availability for
- `from` (optional): Start date for the date range (ISO format)
- `to` (optional): End date for the date range (ISO format)

**Response:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Morning Availability",
    "userId": 1,
    "startTime": "2025-03-01T09:00:00.000Z",
    "endTime": "2025-03-01T12:00:00.000Z",
    "availabilityType": "available",
    "notes": "Available for client meetings",
    "isRecurring": true,
    "recurrencePattern": {
      "frequency": "weekly",
      "daysOfWeek": [1, 3, 5],
      "startDate": "2025-03-01T00:00:00.000Z",
      "endDate": "2025-05-31T00:00:00.000Z"
    },
    "createdAt": "2025-02-15T10:30:00.000Z",
    "updatedAt": "2025-02-15T10:30:00.000Z"
  }
]
```

#### Create Availability Block

**Request:**

```
POST /api/agent/availability
```

**Body:**

```json
{
  "title": "Afternoon Availability",
  "userId": 1,
  "startTime": "2025-03-01T13:00:00.000Z",
  "endTime": "2025-03-01T17:00:00.000Z",
  "availabilityType": "available",
  "notes": "Available for client consultations",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "weekly",
    "daysOfWeek": [2, 4],
    "startDate": "2025-03-01T00:00:00.000Z",
    "endDate": "2025-04-30T00:00:00.000Z"
  }
}
```

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Afternoon Availability",
  "userId": 1,
  "startTime": "2025-03-01T13:00:00.000Z",
  "endTime": "2025-03-01T17:00:00.000Z",
  "availabilityType": "available",
  "notes": "Available for client consultations",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "weekly",
    "daysOfWeek": [2, 4],
    "startDate": "2025-03-01T00:00:00.000Z",
    "endDate": "2025-04-30T00:00:00.000Z"
  },
  "createdAt": "2025-02-15T11:30:00.000Z",
  "updatedAt": "2025-02-15T11:30:00.000Z"
}
```

#### Update Availability Block

**Request:**

```
PUT /api/agent/availability?id={id}
```

**Body:**

```json
{
  "title": "Updated Availability",
  "startTime": "2025-03-01T14:00:00.000Z",
  "endTime": "2025-03-01T18:00:00.000Z",
  "notes": "Updated availability notes",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "biweekly",
    "daysOfWeek": [2, 4],
    "startDate": "2025-03-01T00:00:00.000Z",
    "endDate": "2025-05-31T00:00:00.000Z"
  }
}
```

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Updated Availability",
  "userId": 1,
  "startTime": "2025-03-01T14:00:00.000Z",
  "endTime": "2025-03-01T18:00:00.000Z",
  "availabilityType": "available",
  "notes": "Updated availability notes",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "biweekly",
    "daysOfWeek": [2, 4],
    "startDate": "2025-03-01T00:00:00.000Z",
    "endDate": "2025-05-31T00:00:00.000Z"
  },
  "createdAt": "2025-02-15T11:30:00.000Z",
  "updatedAt": "2025-02-15T12:45:00.000Z"
}
```

#### Delete Availability Block

**Request:**

```
DELETE /api/agent/availability?id={id}
```

**Response:**

```json
{
  "success": true,
  "message": "Availability block deleted successfully"
}
```

### Error Responses

All API endpoints return standard error responses:

```json
{
  "error": true,
  "message": "Error message description",
  "statusCode": 400
}
```

Common status codes:

- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (e.g., time slot conflict)
- `500` - Internal Server Error

## Advanced Features

### Conflict Detection

The API automatically detects and prevents scheduling conflicts:

**Conflict Response:**

```json
{
  "error": true,
  "message": "Time slot conflicts with existing availability",
  "statusCode": 409,
  "conflicts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Existing Availability",
      "startTime": "2025-03-01T13:00:00.000Z",
      "endTime": "2025-03-01T15:00:00.000Z"
    }
  ]
}
```

### Bulk Operations (Coming Soon)

The API will support bulk operations for creating, updating, and deleting multiple availability blocks:

```
POST /api/agent/availability/bulk
PUT /api/agent/availability/bulk
DELETE /api/agent/availability/bulk
```

### Team Availability (Coming Soon)

Endpoints for retrieving team-wide availability information:

```
GET /api/team/availability?teamId={teamId}&from={date}&to={date}
```
