# Employees Endpoints

This section documents all API endpoints related to employee management in the Cannabis Workforce Management Platform.

## Get All Employees

`GET /api/employees`

Retrieves a list of all employees.

### Query Parameters

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `facilityId` (optional): Filter by facility ID
- `status` (optional): Filter by status ('active', 'inactive', 'onboarding', 'terminated')
- `role` (optional): Filter by employee role
- `search` (optional): Search by name, ID, or email

### Response

```json
{
  "data": [
    {
      "id": 1,
      "userId": 101,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "503-555-1234",
      "position": "Cultivation Specialist",
      "facilityId": 1,
      "facilityName": "North Facility",
      "status": "active",
      "hireDate": "2024-06-15",
      "emergencyContact": {
        "name": "Jane Doe",
        "relationship": "Spouse",
        "phone": "503-555-5678"
      },
      "badgeNumber": "OR-12345-EMP",
      "badgeExpiration": "2026-06-15"
    },
    {
      "id": 2,
      "userId": 102,
      "firstName": "Sarah",
      "lastName": "Smith",
      "email": "sarah.smith@example.com",
      "phone": "503-555-8765",
      "position": "Processing Manager",
      "facilityId": 2,
      "facilityName": "South Processing",
      "status": "active",
      "hireDate": "2023-11-01",
      "emergencyContact": {
        "name": "Mike Smith",
        "relationship": "Husband",
        "phone": "503-555-9876"
      },
      "badgeNumber": "OR-23456-EMP",
      "badgeExpiration": "2025-11-01"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

## Create Employee

`POST /api/employees`

Creates a new employee record.

### Request

```json
{
  "userId": 103,
  "firstName": "Robert",
  "lastName": "Johnson",
  "email": "robert.johnson@example.com",
  "phone": "503-555-4321",
  "position": "Dispensary Manager",
  "facilityId": 3,
  "status": "onboarding",
  "hireDate": "2025-04-01",
  "emergencyContact": {
    "name": "Mary Johnson",
    "relationship": "Wife",
    "phone": "503-555-8765"
  },
  "badgeNumber": "OR-34567-EMP",
  "badgeExpiration": "2027-04-01"
}
```

### Response

```json
{
  "data": {
    "id": 3,
    "userId": 103,
    "firstName": "Robert",
    "lastName": "Johnson",
    "email": "robert.johnson@example.com",
    "phone": "503-555-4321",
    "position": "Dispensary Manager",
    "facilityId": 3,
    "facilityName": "East Dispensary",
    "status": "onboarding",
    "hireDate": "2025-04-01",
    "emergencyContact": {
      "name": "Mary Johnson",
      "relationship": "Wife",
      "phone": "503-555-8765"
    },
    "badgeNumber": "OR-34567-EMP",
    "badgeExpiration": "2027-04-01",
    "createdAt": "2025-03-31T17:30:45Z",
    "updatedAt": "2025-03-31T17:30:45Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **409 Conflict**: Employee with the same user ID already exists
- **500 Internal Server Error**: Server error

## Get Employee

`GET /api/employees/:id`

Retrieves a specific employee by ID.

### Response

```json
{
  "data": {
    "id": 1,
    "userId": 101,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "503-555-1234",
    "position": "Cultivation Specialist",
    "facilityId": 1,
    "facilityName": "North Facility",
    "status": "active",
    "hireDate": "2024-06-15",
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "503-555-5678"
    },
    "badgeNumber": "OR-12345-EMP",
    "badgeExpiration": "2026-06-15",
    "createdAt": "2024-06-15T09:00:00Z",
    "updatedAt": "2025-02-20T14:15:30Z"
  }
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Employee not found
- **500 Internal Server Error**: Server error

## Update Employee

`PUT /api/employees/:id`

Updates an existing employee record.

### Request

```json
{
  "position": "Senior Cultivation Specialist",
  "phone": "503-555-9876",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "503-555-1111"
  }
}
```

### Response

```json
{
  "data": {
    "id": 1,
    "userId": 101,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "503-555-9876",
    "position": "Senior Cultivation Specialist",
    "facilityId": 1,
    "facilityName": "North Facility",
    "status": "active",
    "hireDate": "2024-06-15",
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "503-555-1111"
    },
    "badgeNumber": "OR-12345-EMP",
    "badgeExpiration": "2026-06-15",
    "createdAt": "2024-06-15T09:00:00Z",
    "updatedAt": "2025-03-31T17:45:22Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Employee not found
- **500 Internal Server Error**: Server error

## Update Employee Status

`PATCH /api/employees/:id/status`

Updates the status of an employee.

### Request

```json
{
  "status": "inactive",
  "reason": "Leave of absence",
  "effectiveDate": "2025-04-01"
}
```

### Response

```json
{
  "data": {
    "id": 1,
    "status": "inactive",
    "statusReason": "Leave of absence",
    "statusEffectiveDate": "2025-04-01",
    "updatedAt": "2025-03-31T17:50:15Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Invalid status or missing required fields
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Employee not found
- **500 Internal Server Error**: Server error

## Update Badge Information

`PATCH /api/employees/:id/badge`

Updates employee badge information.

### Request

```json
{
  "badgeNumber": "OR-12345-EMP-RENEWED",
  "badgeExpiration": "2028-06-15",
  "renewalDate": "2025-06-15"
}
```

### Response

```json
{
  "data": {
    "id": 1,
    "badgeNumber": "OR-12345-EMP-RENEWED",
    "badgeExpiration": "2028-06-15",
    "badgeRenewalDate": "2025-06-15",
    "badgeStatus": "active",
    "updatedAt": "2025-03-31T17:55:30Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Employee not found
- **500 Internal Server Error**: Server error

## Get Employee Certifications

`GET /api/employees/:id/certifications`

Retrieves all certifications for an employee.

### Response

```json
{
  "data": [
    {
      "id": 101,
      "employeeId": 1,
      "type": "State Worker Permit",
      "number": "OR-SWP-12345",
      "issuedDate": "2024-06-15",
      "expirationDate": "2026-06-15",
      "status": "active",
      "issuer": "Oregon Cannabis Commission",
      "verificationUrl": "https://verify.example.org/OR-SWP-12345"
    },
    {
      "id": 102,
      "employeeId": 1,
      "type": "Safety Training",
      "number": "ST-987654",
      "issuedDate": "2024-07-10",
      "expirationDate": "2026-07-10",
      "status": "active",
      "issuer": "Cannabis Safety Institute",
      "verificationUrl": null
    }
  ]
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Employee not found
- **500 Internal Server Error**: Server error

## Get Employee Schedule

`GET /api/employees/:id/schedule`

Retrieves the employee's work schedule.

### Query Parameters

- `startDate` (optional): Start date for schedule period (default: today)
- `endDate` (optional): End date for schedule period (default: 7 days from start)

### Response

```json
{
  "data": {
    "employeeId": 1,
    "startDate": "2025-04-01",
    "endDate": "2025-04-07",
    "shifts": [
      {
        "id": 1001,
        "facilityId": 1,
        "facilityName": "North Facility",
        "startTime": "2025-04-01T08:00:00Z",
        "endTime": "2025-04-01T16:00:00Z",
        "position": "Cultivation Specialist",
        "status": "scheduled"
      },
      {
        "id": 1002,
        "facilityId": 1,
        "facilityName": "North Facility",
        "startTime": "2025-04-02T08:00:00Z",
        "endTime": "2025-04-02T16:00:00Z",
        "position": "Cultivation Specialist",
        "status": "scheduled"
      },
      {
        "id": 1003,
        "facilityId": 1,
        "facilityName": "North Facility",
        "startTime": "2025-04-03T08:00:00Z",
        "endTime": "2025-04-03T16:00:00Z",
        "position": "Cultivation Specialist",
        "status": "scheduled"
      }
    ]
  }
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Employee not found
- **500 Internal Server Error**: Server error
