# Shifts Endpoints

This section documents all API endpoints related to shift management in the Cannabis Workforce Management Platform.

## Get All Shifts

`GET /api/shifts`

Retrieves a list of all shifts based on query parameters.

### Query Parameters

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `facilityId` (optional): Filter by facility ID
- `employeeId` (optional): Filter by employee ID
- `startDate` (optional): Filter by shifts starting on or after this date
- `endDate` (optional): Filter by shifts ending on or before this date
- `status` (optional): Filter by status ('scheduled', 'completed', 'in-progress', 'cancelled')

### Response

```json
{
  "data": [
    {
      "id": 1001,
      "facilityId": 1,
      "facilityName": "North Facility",
      "employeeId": 1,
      "employeeName": "John Doe",
      "position": "Cultivation Specialist",
      "startTime": "2025-04-01T08:00:00Z",
      "endTime": "2025-04-01T16:00:00Z",
      "breakDuration": 60,
      "status": "scheduled",
      "notes": "Morning harvest duty"
    },
    {
      "id": 1002,
      "facilityId": 1,
      "facilityName": "North Facility",
      "employeeId": 2,
      "employeeName": "Sarah Smith",
      "position": "Processing Manager",
      "startTime": "2025-04-01T08:00:00Z",
      "endTime": "2025-04-01T17:00:00Z",
      "breakDuration": 60,
      "status": "scheduled",
      "notes": "Inventory day"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

## Create Shift

`POST /api/shifts`

Creates a new shift in the system.

### Request

```json
{
  "facilityId": 1,
  "employeeId": 1,
  "position": "Cultivation Specialist",
  "startTime": "2025-04-04T08:00:00Z",
  "endTime": "2025-04-04T16:00:00Z",
  "breakDuration": 60,
  "notes": "Plant maintenance and inventory check"
}
```

### Response

```json
{
  "data": {
    "id": 1004,
    "facilityId": 1,
    "facilityName": "North Facility",
    "employeeId": 1,
    "employeeName": "John Doe",
    "position": "Cultivation Specialist",
    "startTime": "2025-04-04T08:00:00Z",
    "endTime": "2025-04-04T16:00:00Z",
    "breakDuration": 60,
    "status": "scheduled",
    "notes": "Plant maintenance and inventory check",
    "createdAt": "2025-03-31T18:15:45Z",
    "updatedAt": "2025-03-31T18:15:45Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **409 Conflict**: Schedule conflict detected
- **422 Unprocessable Entity**: Employee availability conflict
- **500 Internal Server Error**: Server error

## Get Shift

`GET /api/shifts/:id`

Retrieves a specific shift by ID.

### Response

```json
{
  "data": {
    "id": 1001,
    "facilityId": 1,
    "facilityName": "North Facility",
    "employeeId": 1,
    "employeeName": "John Doe",
    "position": "Cultivation Specialist",
    "startTime": "2025-04-01T08:00:00Z",
    "endTime": "2025-04-01T16:00:00Z",
    "breakDuration": 60,
    "status": "scheduled",
    "notes": "Morning harvest duty",
    "timeEntries": [],
    "createdAt": "2025-03-15T14:30:22Z",
    "updatedAt": "2025-03-15T14:30:22Z",
    "createdBy": "scheduler_system"
  }
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Shift not found
- **500 Internal Server Error**: Server error

## Update Shift

`PUT /api/shifts/:id`

Updates an existing shift.

### Request

```json
{
  "startTime": "2025-04-01T09:00:00Z",
  "endTime": "2025-04-01T17:00:00Z",
  "breakDuration": 45,
  "notes": "Morning harvest duty and inventory"
}
```

### Response

```json
{
  "data": {
    "id": 1001,
    "facilityId": 1,
    "facilityName": "North Facility",
    "employeeId": 1,
    "employeeName": "John Doe",
    "position": "Cultivation Specialist",
    "startTime": "2025-04-01T09:00:00Z",
    "endTime": "2025-04-01T17:00:00Z",
    "breakDuration": 45,
    "status": "scheduled",
    "notes": "Morning harvest duty and inventory",
    "updatedAt": "2025-03-31T18:30:15Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Shift not found
- **409 Conflict**: Schedule conflict detected
- **422 Unprocessable Entity**: Employee availability conflict
- **500 Internal Server Error**: Server error

## Update Shift Status

`PATCH /api/shifts/:id/status`

Updates the status of a shift.

### Request

```json
{
  "status": "cancelled",
  "reason": "Staffing adjustment required",
  "notifyEmployee": true
}
```

### Response

```json
{
  "data": {
    "id": 1001,
    "status": "cancelled",
    "statusReason": "Staffing adjustment required",
    "notificationSent": true,
    "updatedAt": "2025-03-31T18:45:30Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Invalid status or missing required fields
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Shift not found
- **500 Internal Server Error**: Server error

## Delete Shift

`DELETE /api/shifts/:id`

Deletes a shift (only if it has a 'scheduled' status).

### Response

```json
{
  "data": {
    "success": true,
    "message": "Shift deleted successfully"
  }
}
```

### Error Responses

- **400 Bad Request**: Cannot delete shift in current status
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Shift not found
- **500 Internal Server Error**: Server error

## Get Facility Shifts

`GET /api/shifts/facility/:facilityId`

Retrieves all shifts for a specific facility.

### Query Parameters

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `startDate` (required): Filter by shifts starting on or after this date
- `endDate` (required): Filter by shifts ending on or before this date
- `status` (optional): Filter by status ('scheduled', 'completed', 'in-progress', 'cancelled')

### Response

Same format as the Get All Shifts endpoint, filtered for the specified facility.

## Create Batch Shifts

`POST /api/shifts/batch`

Creates multiple shifts at once.

### Request

```json
{
  "facilityId": 1,
  "shifts": [
    {
      "employeeId": 1,
      "position": "Cultivation Specialist",
      "startTime": "2025-04-07T08:00:00Z",
      "endTime": "2025-04-07T16:00:00Z",
      "breakDuration": 60
    },
    {
      "employeeId": 1,
      "position": "Cultivation Specialist",
      "startTime": "2025-04-08T08:00:00Z",
      "endTime": "2025-04-08T16:00:00Z",
      "breakDuration": 60
    },
    {
      "employeeId": 2,
      "position": "Processing Manager",
      "startTime": "2025-04-07T09:00:00Z",
      "endTime": "2025-04-07T18:00:00Z",
      "breakDuration": 60
    }
  ],
  "notes": "Weekly schedule for cultivation team",
  "checkAvailability": true,
  "notifyEmployees": true
}
```

### Response

```json
{
  "data": {
    "success": true,
    "created": 3,
    "failed": 0,
    "shifts": [
      {
        "id": 1010,
        "employeeId": 1,
        "startTime": "2025-04-07T08:00:00Z",
        "endTime": "2025-04-07T16:00:00Z",
        "status": "scheduled"
      },
      {
        "id": 1011,
        "employeeId": 1,
        "startTime": "2025-04-08T08:00:00Z",
        "endTime": "2025-04-08T16:00:00Z",
        "status": "scheduled"
      },
      {
        "id": 1012,
        "employeeId": 2,
        "startTime": "2025-04-07T09:00:00Z",
        "endTime": "2025-04-07T18:00:00Z",
        "status": "scheduled"
      }
    ],
    "notificationsSent": true
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **409 Conflict**: One or more schedule conflicts detected
- **422 Unprocessable Entity**: One or more employee availability conflicts
- **500 Internal Server Error**: Server error

## Check Shift Conflicts

`POST /api/shifts/check-conflicts`

Checks for potential conflicts without creating shifts.

### Request

```json
{
  "facilityId": 1,
  "shifts": [
    {
      "employeeId": 1,
      "startTime": "2025-04-09T08:00:00Z",
      "endTime": "2025-04-09T16:00:00Z"
    },
    {
      "employeeId": 2,
      "startTime": "2025-04-09T09:00:00Z",
      "endTime": "2025-04-09T18:00:00Z"
    }
  ],
  "checkAvailability": true
}
```

### Response

```json
{
  "data": {
    "hasConflicts": true,
    "conflicts": [
      {
        "employeeId": 1,
        "type": "availability",
        "conflictingBlock": {
          "id": 201,
          "startTime": "2025-04-09T00:00:00Z",
          "endTime": "2025-04-09T23:59:59Z",
          "status": "unavailable",
          "reason": "Vacation"
        }
      }
    ],
    "validShifts": [
      {
        "employeeId": 2,
        "startTime": "2025-04-09T09:00:00Z",
        "endTime": "2025-04-09T18:00:00Z"
      }
    ]
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **500 Internal Server Error**: Server error
