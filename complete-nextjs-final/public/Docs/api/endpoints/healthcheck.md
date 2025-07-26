# Health Check Endpoint

This endpoint allows monitoring systems to verify the health of the API.

## Get Health Status

`GET /api/healthcheck`

Returns a simple response indicating that the API is running. This endpoint is designed to be lightweight and fast, making it suitable for frequent health checks by load balancers, monitoring tools, and container orchestration systems.

### Response

```json
{
  "status": "healthy",
  "timestamp": "2025-03-31T15:45:30.123Z"
}
```

## Get Detailed Health Status

`GET /api/healthcheck/details`

Returns detailed information about the health of various system components.

### Response

```json
{
  "status": "healthy",
  "components": {
    "api": {
      "status": "healthy",
      "latency": "2ms"
    },
    "database": {
      "status": "healthy",
      "connections": 5,
      "latency": "15ms"
    },
    "cache": {
      "status": "healthy",
      "hitRate": 0.92,
      "latency": "3ms"
    },
    "external": {
      "auth": {
        "status": "healthy",
        "latency": "45ms"
      },
      "storage": {
        "status": "healthy",
        "latency": "35ms"
      }
    }
  },
  "timestamp": "2025-03-31T15:45:30.123Z"
}
```

### Possible Status Values

- `healthy`: Component is functioning normally
- `degraded`: Component is operational but experiencing issues
- `unhealthy`: Component is not functioning properly
- `unknown`: Component status could not be determined

### Response Codes

- **200 OK**: System is healthy or partially degraded
- **503 Service Unavailable**: Critical components are unhealthy

### Notes

- The health check endpoint does not require authentication
- It's designed to be highly available even when other parts of the system are experiencing issues
- Response times are optimized to be as fast as possible
