# Status Endpoint

This endpoint provides information about the API's current status.

## Get API Status

`GET /api/status`

Returns information about the API's current operational status, including version, uptime, and environment.

### Response

```json
{
  "status": "operational",
  "version": "1.5.2",
  "environment": "production",
  "uptime": {
    "seconds": 36542,
    "formatted": "10 hours, 9 minutes, 2 seconds"
  },
  "timestamp": "2025-03-31T15:45:30.123Z"
}
```

### Error Responses

The status endpoint is designed to be highly available. In case of database connectivity issues, it will still return a 200 OK with partial information.
