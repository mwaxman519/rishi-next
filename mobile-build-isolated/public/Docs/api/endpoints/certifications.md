# Certifications Endpoints

This section documents all API endpoints related to certification management in the Cannabis Workforce Management Platform.

## Get All Certifications

`GET /api/certifications`

Retrieves a list of all certifications.

### Query Parameters

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `employeeId` (optional): Filter by employee ID
- `facilityId` (optional): Filter by facility ID (returns certifications for employees at that facility)
- `type` (optional): Filter by certification type
- `status` (optional): Filter by status ('active', 'expired', 'expiring', 'revoked')
- `expiringBefore` (optional): Filter by certifications expiring before this date

### Response

```json
{
  "data": [
    {
      "id": 101,
      "employeeId": 1,
      "employeeName": "John Doe",
      "type": "State Worker Permit",
      "number": "OR-SWP-12345",
      "issuedDate": "2024-06-15",
      "expirationDate": "2026-06-15",
      "status": "active",
      "issuer": "Oregon Cannabis Commission",
      "verificationUrl": "https://verify.example.org/OR-SWP-12345",
      "documentUrl": "https://docs.example.com/certifications/101.pdf",
      "notes": null
    },
    {
      "id": 102,
      "employeeId": 1,
      "employeeName": "John Doe",
      "type": "Safety Training",
      "number": "ST-987654",
      "issuedDate": "2024-07-10",
      "expirationDate": "2026-07-10",
      "status": "active",
      "issuer": "Cannabis Safety Institute",
      "verificationUrl": null,
      "documentUrl": "https://docs.example.com/certifications/102.pdf",
      "notes": "Annual safety training requirements met"
    }
  ],
  "pagination": {
    "total": 87,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

## Create Certification

`POST /api/certifications`

Creates a new certification record.

### Request

```json
{
  "employeeId": 2,
  "type": "State Worker Permit",
  "number": "OR-SWP-23456",
  "issuedDate": "2024-09-01",
  "expirationDate": "2026-09-01",
  "issuer": "Oregon Cannabis Commission",
  "verificationUrl": "https://verify.example.org/OR-SWP-23456",
  "notes": "Initial certification"
}
```

### Response

```json
{
  "data": {
    "id": 103,
    "employeeId": 2,
    "employeeName": "Sarah Smith",
    "type": "State Worker Permit",
    "number": "OR-SWP-23456",
    "issuedDate": "2024-09-01",
    "expirationDate": "2026-09-01",
    "status": "active",
    "issuer": "Oregon Cannabis Commission",
    "verificationUrl": "https://verify.example.org/OR-SWP-23456",
    "documentUrl": null,
    "notes": "Initial certification",
    "createdAt": "2025-03-31T19:45:30Z",
    "updatedAt": "2025-03-31T19:45:30Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Employee not found
- **500 Internal Server Error**: Server error

## Get Certification

`GET /api/certifications/:id`

Retrieves a specific certification by ID.

### Response

```json
{
  "data": {
    "id": 101,
    "employeeId": 1,
    "employeeName": "John Doe",
    "type": "State Worker Permit",
    "number": "OR-SWP-12345",
    "issuedDate": "2024-06-15",
    "expirationDate": "2026-06-15",
    "status": "active",
    "issuer": "Oregon Cannabis Commission",
    "verificationUrl": "https://verify.example.org/OR-SWP-12345",
    "documentUrl": "https://docs.example.com/certifications/101.pdf",
    "notes": null,
    "createdAt": "2024-06-15T14:30:22Z",
    "updatedAt": "2024-06-15T14:30:22Z",
    "lastVerified": "2025-01-15T09:45:12Z",
    "verifiedBy": "compliance_admin"
  }
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Certification not found
- **500 Internal Server Error**: Server error

## Update Certification

`PUT /api/certifications/:id`

Updates an existing certification record.

### Request

```json
{
  "expirationDate": "2026-09-15",
  "notes": "Extended expiration date due to agency processing delays",
  "verificationUrl": "https://verify.example.org/OR-SWP-23456-updated"
}
```

### Response

```json
{
  "data": {
    "id": 103,
    "employeeId": 2,
    "type": "State Worker Permit",
    "number": "OR-SWP-23456",
    "issuedDate": "2024-09-01",
    "expirationDate": "2026-09-15",
    "status": "active",
    "verificationUrl": "https://verify.example.org/OR-SWP-23456-updated",
    "notes": "Extended expiration date due to agency processing delays",
    "updatedAt": "2025-03-31T20:00:15Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Certification not found
- **500 Internal Server Error**: Server error

## Upload Certification Document

`POST /api/certifications/:id/document`

Uploads a document for an existing certification.

### Request

Multipart form data with:

- `document`: File upload (PDF, PNG, or JPG, max 10MB)
- `description` (optional): Text description of the document

### Response

```json
{
  "data": {
    "id": 103,
    "documentUrl": "https://docs.example.com/certifications/103.pdf",
    "documentType": "application/pdf",
    "documentSize": 1458256,
    "uploadedAt": "2025-03-31T20:15:30Z",
    "uploadedBy": "manager123"
  }
}
```

### Error Responses

- **400 Bad Request**: Invalid file format or size
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Certification not found
- **500 Internal Server Error**: Server error

## Verify Certification

`POST /api/certifications/:id/verify`

Records verification of a certification's validity.

### Request

```json
{
  "verificationMethod": "manual",
  "verificationNotes": "Called Oregon Cannabis Commission directly and confirmed status",
  "verified": true
}
```

### Response

```json
{
  "data": {
    "id": 103,
    "status": "active",
    "lastVerified": "2025-03-31T20:30:45Z",
    "verifiedBy": "compliance_admin",
    "verificationMethod": "manual",
    "verificationNotes": "Called Oregon Cannabis Commission directly and confirmed status"
  }
}
```

### Error Responses

- **400 Bad Request**: Missing required fields
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Certification not found
- **500 Internal Server Error**: Server error

## Get Employee Certifications

`GET /api/certifications/employee/:employeeId`

Retrieves all certifications for a specific employee.

### Query Parameters

- `status` (optional): Filter by status ('active', 'expired', 'expiring', 'revoked')

### Response

Same format as the Get All Certifications endpoint, filtered for the specified employee.

## Get Expiring Certifications

`GET /api/certifications/expiring`

Retrieves certifications that are expiring soon.

### Query Parameters

- `days` (optional): Number of days to check for expiration (default: 30)
- `facilityId` (optional): Filter by facility ID
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 20)

### Response

```json
{
  "data": {
    "expiringCount": 5,
    "expiringCertifications": [
      {
        "id": 105,
        "employeeId": 3,
        "employeeName": "Robert Johnson",
        "type": "State Worker Permit",
        "expirationDate": "2025-04-15",
        "daysUntilExpiration": 15,
        "status": "expiring",
        "facilityId": 3,
        "facilityName": "East Dispensary"
      },
      {
        "id": 110,
        "employeeId": 5,
        "employeeName": "Lisa Williams",
        "type": "Safety Training",
        "expirationDate": "2025-04-20",
        "daysUntilExpiration": 20,
        "status": "expiring",
        "facilityId": 2,
        "facilityName": "South Processing"
      }
    ]
  },
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### Error Responses

- **400 Bad Request**: Invalid parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **500 Internal Server Error**: Server error

## Get Certification Types

`GET /api/certifications/types`

Retrieves the list of available certification types.

### Response

```json
{
  "data": [
    {
      "id": "state_worker_permit",
      "name": "State Worker Permit",
      "requiredFor": ["all"],
      "defaultDuration": 730,
      "renewalReminder": 60,
      "isRequired": true
    },
    {
      "id": "safety_training",
      "name": "Safety Training",
      "requiredFor": ["cultivation", "processing"],
      "defaultDuration": 365,
      "renewalReminder": 30,
      "isRequired": true
    },
    {
      "id": "pesticide_handling",
      "name": "Pesticide Handling Certification",
      "requiredFor": ["cultivation"],
      "defaultDuration": 730,
      "renewalReminder": 60,
      "isRequired": false
    }
  ]
}
```

### Error Responses

- **401 Unauthorized**: Authentication required
- **500 Internal Server Error**: Server error

## Get Compliance Report

`GET /api/certifications/report/compliance`

Generates a compliance report for certifications.

### Query Parameters

- `facilityId` (optional): Filter by facility ID
- `includeExpired` (optional): Include expired certifications (default: false)
- `format` (optional): Response format ('json', 'csv', 'pdf') - default: 'json'

### Response (JSON format)

```json
{
  "data": {
    "generatedAt": "2025-03-31T21:00:00Z",
    "complianceStatus": {
      "compliantEmployees": 18,
      "nonCompliantEmployees": 2,
      "expiringCertifications": 5,
      "complianceRate": 90
    },
    "certificationStats": {
      "total": 87,
      "active": 75,
      "expiring": 5,
      "expired": 5,
      "revoked": 2
    },
    "nonCompliantEmployees": [
      {
        "employeeId": 7,
        "employeeName": "Michael Brown",
        "position": "Cultivation Assistant",
        "facilityId": 1,
        "facilityName": "North Facility",
        "missingCertifications": ["State Worker Permit"]
      },
      {
        "employeeId": 12,
        "employeeName": "Jessica Lee",
        "position": "Processing Technician",
        "facilityId": 2,
        "facilityName": "South Processing",
        "missingCertifications": ["Safety Training"]
      }
    ]
  }
}
```

### Error Responses

- **400 Bad Request**: Invalid parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **500 Internal Server Error**: Server error
