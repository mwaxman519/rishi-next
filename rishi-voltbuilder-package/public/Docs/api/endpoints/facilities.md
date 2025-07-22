# Facilities Endpoints

This section documents all API endpoints related to facility management in the Cannabis Workforce Management Platform.

## Get All Facilities

`GET /api/facilities`

Retrieves a list of all facilities.

### Query Parameters

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `active` (optional): Filter by active status (true/false)

### Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "North Facility",
      "address": "123 North St, Portland, OR 97201",
      "contact": "John Manager",
      "phone": "503-555-1234",
      "email": "north@example.com",
      "licenseNumber": "OR-F12345",
      "licenseExpiration": "2026-03-31T23:59:59Z",
      "active": true,
      "capacity": 5000,
      "type": "cultivation"
    },
    {
      "id": 2,
      "name": "South Processing",
      "address": "456 South Ave, Portland, OR 97239",
      "contact": "Sarah Director",
      "phone": "503-555-5678",
      "email": "south@example.com",
      "licenseNumber": "OR-P54321",
      "licenseExpiration": "2025-12-31T23:59:59Z",
      "active": true,
      "capacity": 2500,
      "type": "processing"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

## Create Facility

`POST /api/facilities`

Creates a new facility.

### Request

```json
{
  "name": "East Dispensary",
  "address": "789 East Blvd, Portland, OR 97214",
  "contact": "Mike Supervisor",
  "phone": "503-555-9012",
  "email": "east@example.com",
  "licenseNumber": "OR-D98765",
  "licenseExpiration": "2026-06-30T23:59:59Z",
  "active": true,
  "capacity": 1200,
  "type": "dispensary"
}
```

### Response

```json
{
  "data": {
    "id": 3,
    "name": "East Dispensary",
    "address": "789 East Blvd, Portland, OR 97214",
    "contact": "Mike Supervisor",
    "phone": "503-555-9012",
    "email": "east@example.com",
    "licenseNumber": "OR-D98765",
    "licenseExpiration": "2026-06-30T23:59:59Z",
    "active": true,
    "capacity": 1200,
    "type": "dispensary",
    "createdAt": "2025-03-31T16:45:30Z",
    "updatedAt": "2025-03-31T16:45:30Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **409 Conflict**: Facility with the same license number already exists
- **500 Internal Server Error**: Server error

## Get Facility

`GET /api/facilities/:id`

Retrieves a specific facility by ID.

### Response

```json
{
  "data": {
    "id": 1,
    "name": "North Facility",
    "address": "123 North St, Portland, OR 97201",
    "contact": "John Manager",
    "phone": "503-555-1234",
    "email": "north@example.com",
    "licenseNumber": "OR-F12345",
    "licenseExpiration": "2026-03-31T23:59:59Z",
    "active": true,
    "capacity": 5000,
    "type": "cultivation",
    "createdAt": "2024-10-15T12:30:45Z",
    "updatedAt": "2025-02-12T09:15:22Z"
  }
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Facility not found
- **500 Internal Server Error**: Server error

## Update Facility

`PUT /api/facilities/:id`

Updates an existing facility.

### Request

```json
{
  "name": "North Facility Updated",
  "contact": "Jane Director",
  "phone": "503-555-4321",
  "capacity": 5500
}
```

### Response

```json
{
  "data": {
    "id": 1,
    "name": "North Facility Updated",
    "address": "123 North St, Portland, OR 97201",
    "contact": "Jane Director",
    "phone": "503-555-4321",
    "email": "north@example.com",
    "licenseNumber": "OR-F12345",
    "licenseExpiration": "2026-03-31T23:59:59Z",
    "active": true,
    "capacity": 5500,
    "type": "cultivation",
    "createdAt": "2024-10-15T12:30:45Z",
    "updatedAt": "2025-03-31T17:12:45Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Facility not found
- **409 Conflict**: Facility with the same license number already exists
- **500 Internal Server Error**: Server error

## Delete Facility

`DELETE /api/facilities/:id`

Marks a facility as inactive (soft delete).

### Response

```json
{
  "data": {
    "success": true,
    "message": "Facility deactivated successfully"
  }
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Facility not found
- **500 Internal Server Error**: Server error

## Get Facility Capacity

`GET /api/facilities/:id/capacity`

Retrieves capacity information for a facility, including current usage.

### Response

```json
{
  "data": {
    "facilityId": 1,
    "totalCapacity": 5000,
    "currentUsage": 3750,
    "availableCapacity": 1250,
    "utilizationPercentage": 75,
    "lastUpdated": "2025-03-31T15:30:00Z"
  }
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Facility not found
- **500 Internal Server Error**: Server error

## Get Facility License Status

`GET /api/facilities/:id/license`

Retrieves license information for a facility, including expiration status.

### Response

```json
{
  "data": {
    "facilityId": 1,
    "licenseNumber": "OR-F12345",
    "licenseType": "Cultivation",
    "issuedDate": "2023-04-01T00:00:00Z",
    "expirationDate": "2026-03-31T23:59:59Z",
    "status": "active",
    "daysUntilExpiration": 365,
    "renewalRequired": false,
    "renewalAvailable": true
  }
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Facility not found
- **500 Internal Server Error**: Server error
