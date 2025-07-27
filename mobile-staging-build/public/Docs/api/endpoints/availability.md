# Availability Endpoints

This section documents all API endpoints related to calendar availability management.

## Get Availability Blocks

`GET /api/availability`

Retrieves availability blocks for a user within a specified date range.

### Query Parameters

- `userId` (required): The ID of the user whose availability blocks to retrieve
- `startDate` (optional): The start date to filter blocks (ISO format)
- `endDate` (optional): The end date to filter blocks (ISO format)
- `status` (optional): Filter by status ('available', 'unavailable', 'tentative')

### Response

```json
{
  "blocks": [
    {
      "id": "1",
      "userId": "2",
      "start": "2025-03-25T10:00:00Z",
      "end": "2025-03-25T12:00:00Z",
      "status": "available",
      "recurring": false
    },
    {
      "id": "2",
      "userId": "2",
      "start": "2025-03-26T14:30:00Z",
      "end": "2025-03-26T16:30:00Z",
      "status": "available",
      "recurring": false
    }
  ]
}
```

## Create Availability Block

`POST /api/availability`

Creates a new availability block for a user.

### Request Body

```json
{
  "userId": "2",
  "start": "2025-04-01T09:00:00Z",
  "end": "2025-04-01T11:00:00Z",
  "status": "available",
  "recurring": false,
  "recurrenceRule": null
}
```

### Response

```json
{
  "id": "3",
  "userId": "2",
  "start": "2025-04-01T09:00:00Z",
  "end": "2025-04-01T11:00:00Z",
  "status": "available",
  "recurring": false,
  "recurrenceRule": null,
  "created": "2025-03-15T12:30:45Z"
}
```

## Update Availability Block

`PUT /api/availability/{id}`

Updates an existing availability block.

### Request Body

```json
{
  "start": "2025-04-01T10:00:00Z",
  "end": "2025-04-01T12:00:00Z",
  "status": "unavailable"
}
```

### Response

```json
{
  "id": "3",
  "userId": "2",
  "start": "2025-04-01T10:00:00Z",
  "end": "2025-04-01T12:00:00Z",
  "status": "unavailable",
  "recurring": false,
  "recurrenceRule": null,
  "updated": "2025-03-16T09:15:22Z"
}
```

## Delete Availability Block

`DELETE /api/availability/{id}`

Deletes an availability block.

### Response

```json
{
  "success": true,
  "message": "Availability block deleted successfully"
}
```

## Create Recurring Availability

`POST /api/availability/recurring`

Creates a recurring availability pattern.

### Request Body

```json
{
  "userId": "2",
  "start": "2025-04-01T13:00:00Z",
  "end": "2025-04-01T17:00:00Z",
  "status": "available",
  "recurring": true,
  "recurrenceRule": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5],
    "endDate": "2025-06-30"
  }
}
```

### Response

```json
{
  "id": "4",
  "userId": "2",
  "start": "2025-04-01T13:00:00Z",
  "end": "2025-04-01T17:00:00Z",
  "status": "available",
  "recurring": true,
  "recurrenceRule": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5],
    "endDate": "2025-06-30"
  },
  "created": "2025-03-20T11:45:30Z"
}
```
