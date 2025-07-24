# Sync Endpoints

This section documents all API endpoints related to mobile synchronization in the Cannabis Workforce Management Platform.

## Get Sync Status

`GET /api/sync/status`

Retrieves the current sync status for a user's device.

### Query Parameters

- `deviceId` (required): The unique identifier for the mobile device

### Response

```json
{
  "data": {
    "deviceId": "d789-456g-789h-012i",
    "userId": 101,
    "lastSyncTimestamp": "2025-03-30T14:30:22Z",
    "syncStatus": "completed",
    "version": "1.2.3",
    "pendingChanges": 0,
    "nextSyncRecommended": "2025-03-31T14:30:22Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Missing deviceId
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Device not registered
- **500 Internal Server Error**: Server error

## Register Device

`POST /api/sync/register`

Registers a new mobile device for synchronization.

### Request

```json
{
  "deviceId": "d789-456g-789h-012i",
  "deviceName": "iPhone 15 Pro Max",
  "deviceType": "ios",
  "osVersion": "17.4.1",
  "appVersion": "1.2.3",
  "timezone": "America/Los_Angeles"
}
```

### Response

```json
{
  "data": {
    "deviceId": "d789-456g-789h-012i",
    "userId": 101,
    "registrationTimestamp": "2025-03-31T21:30:45Z",
    "syncToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "initialSyncRequired": true
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **409 Conflict**: Device already registered
- **500 Internal Server Error**: Server error

## Initialize Sync

`POST /api/sync/initialize`

Initializes a full synchronization for a new or reset device.

### Request

```json
{
  "deviceId": "d789-456g-789h-012i",
  "dataTypes": ["profile", "schedule", "facilities", "certifications"],
  "targetTimezone": "America/Los_Angeles"
}
```

### Response

```json
{
  "data": {
    "syncId": "sync-123456",
    "status": "processing",
    "estimatedSize": "2.4MB",
    "estimatedTime": "15s",
    "queuePosition": 1,
    "statusEndpoint": "/api/sync/status/sync-123456"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Device not registered
- **429 Too Many Requests**: Sync already in progress
- **500 Internal Server Error**: Server error

## Get Sync Data

`GET /api/sync/data`

Retrieves synchronized data for a device.

### Query Parameters

- `syncId` (required): The sync ID from initialize or delta sync
- `deviceId` (required): The unique identifier for the mobile device

### Response

```json
{
  "data": {
    "syncId": "sync-123456",
    "timestamp": "2025-03-31T21:45:30Z",
    "dataVersion": 245,
    "deltaSync": false,
    "userData": {
      "profile": {
        "id": 101,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "503-555-1234",
        "role": "employee",
        "employeeId": 1,
        "profileImageUrl": "https://assets.example.com/profiles/101.jpg"
      }
    },
    "scheduleData": {
      "shifts": [
        {
          "id": 1001,
          "facilityId": 1,
          "startTime": "2025-04-01T08:00:00Z",
          "endTime": "2025-04-01T16:00:00Z",
          "position": "Cultivation Specialist",
          "status": "scheduled",
          "notes": "Morning harvest duty"
        }
      ],
      "availability": [
        {
          "id": 501,
          "startTime": "2025-04-05T00:00:00Z",
          "endTime": "2025-04-05T23:59:59Z",
          "status": "unavailable",
          "reason": "Personal"
        }
      ]
    },
    "facilityData": {
      "facilities": [
        {
          "id": 1,
          "name": "North Facility",
          "address": "123 North St, Portland, OR 97201",
          "contactPhone": "503-555-1234",
          "locationData": {
            "latitude": 45.523064,
            "longitude": -122.676483
          }
        }
      ]
    },
    "certificationData": {
      "certifications": [
        {
          "id": 101,
          "type": "State Worker Permit",
          "number": "OR-SWP-12345",
          "expirationDate": "2026-06-15",
          "status": "active"
        }
      ]
    }
  }
}
```

### Error Responses

- **400 Bad Request**: Missing required parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Invalid sync ID
- **404 Not Found**: Sync data not found
- **500 Internal Server Error**: Server error

## Delta Sync

`POST /api/sync/delta`

Initiates a delta synchronization to get only changed data since last sync.

### Request

```json
{
  "deviceId": "d789-456g-789h-012i",
  "lastSyncTimestamp": "2025-03-30T14:30:22Z",
  "dataVersion": 245,
  "dataTypes": ["schedule", "timeEntries"]
}
```

### Response

```json
{
  "data": {
    "syncId": "sync-123457",
    "status": "completed",
    "deltaSync": true,
    "changes": {
      "updated": 3,
      "deleted": 1,
      "added": 2
    },
    "dataEndpoint": "/api/sync/data?syncId=sync-123457&deviceId=d789-456g-789h-012i"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Device not registered
- **409 Conflict**: Data version mismatch, full sync required
- **429 Too Many Requests**: Sync already in progress
- **500 Internal Server Error**: Server error

## Upload Offline Changes

`POST /api/sync/upload`

Uploads changes made while the device was offline.

### Request

```json
{
  "deviceId": "d789-456g-789h-012i",
  "lastSyncTimestamp": "2025-03-30T14:30:22Z",
  "changes": {
    "timeEntries": [
      {
        "type": "create",
        "offlineId": "offline-123",
        "data": {
          "shiftId": 1004,
          "clockInTime": "2025-03-31T08:02:15Z",
          "clockOutTime": "2025-03-31T16:05:30Z",
          "breakStartTime": "2025-03-31T12:00:00Z",
          "breakEndTime": "2025-03-31T13:00:00Z",
          "notes": "Offline time entry"
        }
      }
    ],
    "availability": [
      {
        "type": "update",
        "id": 501,
        "data": {
          "status": "available"
        }
      }
    ]
  }
}
```

### Response

```json
{
  "data": {
    "success": true,
    "processed": {
      "total": 2,
      "succeeded": 2,
      "failed": 0
    },
    "results": [
      {
        "type": "timeEntries",
        "operation": "create",
        "offlineId": "offline-123",
        "status": "success",
        "serverId": 5020
      },
      {
        "type": "availability",
        "operation": "update",
        "id": 501,
        "status": "success"
      }
    ],
    "syncRequired": true
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Device not registered
- **409 Conflict**: Data version mismatch
- **500 Internal Server Error**: Server error

## Get Sync Conflicts

`GET /api/sync/conflicts`

Retrieves any conflicts that occurred during sync.

### Query Parameters

- `deviceId` (required): The unique identifier for the mobile device

### Response

```json
{
  "data": {
    "hasConflicts": true,
    "conflicts": [
      {
        "type": "timeEntries",
        "offlineId": "offline-456",
        "conflictReason": "overlapping_entries",
        "serverData": {
          "id": 5015,
          "shiftId": 1005,
          "clockInTime": "2025-03-31T08:00:00Z",
          "clockOutTime": "2025-03-31T16:00:00Z"
        },
        "clientData": {
          "shiftId": 1005,
          "clockInTime": "2025-03-31T07:45:15Z",
          "clockOutTime": "2025-03-31T16:10:30Z"
        },
        "resolutionOptions": ["use_server", "use_client", "merge"]
      }
    ]
  }
}
```

### Error Responses

- **400 Bad Request**: Missing deviceId
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Device not registered
- **500 Internal Server Error**: Server error

## Resolve Conflict

`POST /api/sync/conflicts/resolve`

Resolves a synchronization conflict.

### Request

```json
{
  "deviceId": "d789-456g-789h-012i",
  "conflictId": "conflict-123",
  "resolution": "use_client",
  "mergeData": null
}
```

### Response

```json
{
  "data": {
    "success": true,
    "conflictId": "conflict-123",
    "resolution": "use_client",
    "resultId": 5015,
    "remainingConflicts": 0
  }
}
```

### Error Responses

- **400 Bad Request**: Invalid resolution
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Conflict not found
- **500 Internal Server Error**: Server error

## Reset Sync

`POST /api/sync/reset`

Resets synchronization for a device, requiring a full re-sync.

### Request

```json
{
  "deviceId": "d789-456g-789h-012i",
  "reason": "device_reset",
  "clearLocalData": true
}
```

### Response

```json
{
  "data": {
    "success": true,
    "resetTimestamp": "2025-03-31T22:15:30Z",
    "initialSyncRequired": true,
    "message": "Sync data has been reset. Please perform an initial sync."
  }
}
```

### Error Responses

- **400 Bad Request**: Missing deviceId
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Device not registered
- **500 Internal Server Error**: Server error
