# Time Entries Endpoints

This section documents all API endpoints related to time tracking and attendance in the Cannabis Workforce Management Platform.

## Get All Time Entries

`GET /api/time-entries`

Retrieves a list of time entries based on query parameters.

### Query Parameters

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `facilityId` (optional): Filter by facility ID
- `employeeId` (optional): Filter by employee ID
- `shiftId` (optional): Filter by shift ID
- `startDate` (optional): Filter by entries starting on or after this date
- `endDate` (optional): Filter by entries ending on or before this date
- `status` (optional): Filter by status ('pending', 'approved', 'rejected')

### Response

```json
{
  "data": [
    {
      "id": 5001,
      "employeeId": 1,
      "employeeName": "John Doe",
      "facilityId": 1,
      "facilityName": "North Facility",
      "shiftId": 1001,
      "clockInTime": "2025-04-01T07:55:23Z",
      "clockOutTime": "2025-04-01T16:05:47Z",
      "breakStartTime": "2025-04-01T12:00:12Z",
      "breakEndTime": "2025-04-01T13:00:35Z",
      "totalDuration": 29124,
      "status": "approved",
      "approvedBy": "manager123",
      "approvedAt": "2025-04-02T09:15:30Z",
      "notes": "Regular shift"
    },
    {
      "id": 5002,
      "employeeId": 2,
      "employeeName": "Sarah Smith",
      "facilityId": 1,
      "facilityName": "North Facility",
      "shiftId": 1002,
      "clockInTime": "2025-04-01T07:50:18Z",
      "clockOutTime": "2025-04-01T17:10:22Z",
      "breakStartTime": "2025-04-01T12:30:05Z",
      "breakEndTime": "2025-04-01T13:30:15Z",
      "totalDuration": 33004,
      "status": "approved",
      "approvedBy": "manager123",
      "approvedAt": "2025-04-02T09:16:45Z",
      "notes": "Inventory day overtime approved"
    }
  ],
  "pagination": {
    "total": 245,
    "page": 1,
    "limit": 20,
    "pages": 13
  }
}
```

## Create Time Entry

`POST /api/time-entries`

Creates a new time entry in the system.

### Request

```json
{
  "employeeId": 1,
  "facilityId": 1,
  "shiftId": 1004,
  "clockInTime": "2025-04-04T07:58:42Z",
  "notes": "Regular shift"
}
```

### Response

```json
{
  "data": {
    "id": 5010,
    "employeeId": 1,
    "employeeName": "John Doe",
    "facilityId": 1,
    "facilityName": "North Facility",
    "shiftId": 1004,
    "clockInTime": "2025-04-04T07:58:42Z",
    "clockOutTime": null,
    "breakStartTime": null,
    "breakEndTime": null,
    "totalDuration": null,
    "status": "pending",
    "notes": "Regular shift",
    "createdAt": "2025-04-04T07:58:42Z",
    "updatedAt": "2025-04-04T07:58:42Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **409 Conflict**: Already clocked in
- **500 Internal Server Error**: Server error

## Get Time Entry

`GET /api/time-entries/:id`

Retrieves a specific time entry by ID.

### Response

```json
{
  "data": {
    "id": 5001,
    "employeeId": 1,
    "employeeName": "John Doe",
    "facilityId": 1,
    "facilityName": "North Facility",
    "shiftId": 1001,
    "clockInTime": "2025-04-01T07:55:23Z",
    "clockOutTime": "2025-04-01T16:05:47Z",
    "breakStartTime": "2025-04-01T12:00:12Z",
    "breakEndTime": "2025-04-01T13:00:35Z",
    "totalDuration": 29124,
    "status": "approved",
    "approvedBy": "manager123",
    "approvedAt": "2025-04-02T09:15:30Z",
    "notes": "Regular shift",
    "createdAt": "2025-04-01T07:55:23Z",
    "updatedAt": "2025-04-02T09:15:30Z"
  }
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Time entry not found
- **500 Internal Server Error**: Server error

## Update Time Entry (Clock Out)

`PATCH /api/time-entries/:id/clock-out`

Updates a time entry with clock out information.

### Request

```json
{
  "clockOutTime": "2025-04-04T16:02:37Z",
  "notes": "Completed all scheduled tasks"
}
```

### Response

```json
{
  "data": {
    "id": 5010,
    "employeeId": 1,
    "facilityId": 1,
    "shiftId": 1004,
    "clockInTime": "2025-04-04T07:58:42Z",
    "clockOutTime": "2025-04-04T16:02:37Z",
    "breakStartTime": null,
    "breakEndTime": null,
    "totalDuration": 29035,
    "status": "pending",
    "notes": "Completed all scheduled tasks",
    "updatedAt": "2025-04-04T16:02:37Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed (e.g., clockOutTime before clockInTime)
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Time entry not found
- **409 Conflict**: Already clocked out
- **500 Internal Server Error**: Server error

## Update Time Entry (Start Break)

`PATCH /api/time-entries/:id/break-start`

Updates a time entry with break start information.

### Request

```json
{
  "breakStartTime": "2025-04-04T12:00:00Z"
}
```

### Response

```json
{
  "data": {
    "id": 5010,
    "employeeId": 1,
    "facilityId": 1,
    "shiftId": 1004,
    "breakStartTime": "2025-04-04T12:00:00Z",
    "status": "pending",
    "updatedAt": "2025-04-04T12:00:00Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Time entry not found
- **409 Conflict**: Already on break or break inconsistency
- **500 Internal Server Error**: Server error

## Update Time Entry (End Break)

`PATCH /api/time-entries/:id/break-end`

Updates a time entry with break end information.

### Request

```json
{
  "breakEndTime": "2025-04-04T13:00:00Z"
}
```

### Response

```json
{
  "data": {
    "id": 5010,
    "employeeId": 1,
    "facilityId": 1,
    "shiftId": 1004,
    "breakStartTime": "2025-04-04T12:00:00Z",
    "breakEndTime": "2025-04-04T13:00:00Z",
    "status": "pending",
    "updatedAt": "2025-04-04T13:00:00Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Time entry not found
- **409 Conflict**: Break not started or break inconsistency
- **500 Internal Server Error**: Server error

## Update Time Entry Status

`PATCH /api/time-entries/:id/status`

Updates the approval status of a time entry.

### Request

```json
{
  "status": "approved",
  "notes": "Hours verified against schedule"
}
```

### Response

```json
{
  "data": {
    "id": 5010,
    "status": "approved",
    "approvedBy": "manager123",
    "approvedAt": "2025-04-05T09:30:15Z",
    "notes": "Hours verified against schedule",
    "updatedAt": "2025-04-05T09:30:15Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Invalid status or missing required fields
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Time entry not found
- **500 Internal Server Error**: Server error

## Get Employee Time Entries

`GET /api/time-entries/employee/:employeeId`

Retrieves all time entries for a specific employee.

### Query Parameters

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `startDate` (optional): Filter by entries starting on or after this date
- `endDate` (optional): Filter by entries ending on or before this date
- `status` (optional): Filter by status ('pending', 'approved', 'rejected')

### Response

Same format as the Get All Time Entries endpoint, filtered for the specified employee.

## Get Shift Time Entries

`GET /api/time-entries/shift/:shiftId`

Retrieves all time entries for a specific shift.

### Response

```json
{
  "data": [
    {
      "id": 5001,
      "employeeId": 1,
      "employeeName": "John Doe",
      "facilityId": 1,
      "facilityName": "North Facility",
      "shiftId": 1001,
      "clockInTime": "2025-04-01T07:55:23Z",
      "clockOutTime": "2025-04-01T16:05:47Z",
      "breakStartTime": "2025-04-01T12:00:12Z",
      "breakEndTime": "2025-04-01T13:00:35Z",
      "totalDuration": 29124,
      "status": "approved",
      "approvedBy": "manager123",
      "approvedAt": "2025-04-02T09:15:30Z",
      "notes": "Regular shift"
    }
  ]
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Shift not found
- **500 Internal Server Error**: Server error

## Get Facility Time Report

`GET /api/time-entries/report/facility/:facilityId`

Generates a time report for a facility within a date range.

### Query Parameters

- `startDate` (required): Start date for report period (YYYY-MM-DD)
- `endDate` (required): End date for report period (YYYY-MM-DD)
- `format` (optional): Response format ('json', 'csv', 'pdf') - default: 'json'

### Response (JSON format)

```json
{
  "data": {
    "facilityId": 1,
    "facilityName": "North Facility",
    "reportPeriod": {
      "startDate": "2025-04-01",
      "endDate": "2025-04-07"
    },
    "totalHours": 320.5,
    "employeeHours": [
      {
        "employeeId": 1,
        "employeeName": "John Doe",
        "position": "Cultivation Specialist",
        "totalHours": 40.1,
        "regularHours": 40.0,
        "overtimeHours": 0.1,
        "entries": [
          {
            "date": "2025-04-01",
            "duration": 8.02,
            "status": "approved"
          },
          {
            "date": "2025-04-02",
            "duration": 8.05,
            "status": "approved"
          }
        ]
      },
      {
        "employeeId": 2,
        "employeeName": "Sarah Smith",
        "position": "Processing Manager",
        "totalHours": 42.3,
        "regularHours": 40.0,
        "overtimeHours": 2.3,
        "entries": [
          {
            "date": "2025-04-01",
            "duration": 9.17,
            "status": "approved"
          },
          {
            "date": "2025-04-02",
            "duration": 8.42,
            "status": "approved"
          }
        ]
      }
    ],
    "generatedAt": "2025-04-08T10:15:30Z",
    "generatedBy": "manager123"
  }
}
```

### Error Responses

- **400 Bad Request**: Invalid date format or missing required fields
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Facility not found
- **500 Internal Server Error**: Server error
