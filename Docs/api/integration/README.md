# API Integration Guide

## Overview

The Rishi Platform provides a comprehensive REST API for integrating with external systems and building custom applications. This guide covers authentication, endpoints, and best practices for API integration.

## Authentication

### JWT Token Authentication
All API requests require authentication using JWT tokens:

```javascript
// Example authentication header
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

### Getting Access Tokens
1. **Login Endpoint**: POST `/api/auth-service/login`
2. **Token Refresh**: POST `/api/auth-service/refresh`
3. **Token Validation**: GET `/api/auth-service/session`

### Session Management
- **Session Duration**: 24 hours default
- **Token Refresh**: Automatic refresh before expiration
- **Multi-Organization**: Tokens include organization context

## Core API Endpoints

### Authentication Services
- **Login**: `POST /api/auth-service/login`
- **Logout**: `POST /api/auth-service/logout`
- **Session Check**: `GET /api/auth-service/session`
- **Password Reset**: `POST /api/auth-service/reset-password`

### User Management
- **Get Users**: `GET /api/users`
- **Create User**: `POST /api/users`
- **Update User**: `PUT /api/users/{id}`
- **Delete User**: `DELETE /api/users/{id}`

### Organization Management
- **Get Organizations**: `GET /api/organizations`
- **Create Organization**: `POST /api/organizations`
- **Update Organization**: `PUT /api/organizations/{id}`
- **Organization Users**: `GET /api/organizations/{id}/users`

### Booking Management
- **Get Bookings**: `GET /api/bookings`
- **Create Booking**: `POST /api/bookings`
- **Update Booking**: `PUT /api/bookings/{id}`
- **Cancel Booking**: `DELETE /api/bookings/{id}`

### Staff Management
- **Get Staff**: `GET /api/staff`
- **Staff Availability**: `GET /api/staff/availability`
- **Assign Staff**: `POST /api/staff/assignments`
- **Staff Schedule**: `GET /api/staff/{id}/schedule`

### Location Management
- **Get Locations**: `GET /api/locations`
- **Create Location**: `POST /api/locations`
- **Update Location**: `PUT /api/locations/{id}`
- **Location Details**: `GET /api/locations/{id}`

### Inventory Management
- **Get Inventory**: `GET /api/inventory`
- **Kit Templates**: `GET /api/inventory/templates`
- **Create Kit**: `POST /api/inventory/kits`
- **Update Kit**: `PUT /api/inventory/kits/{id}`

## Request/Response Format

### Standard Request Format
```json
{
  "data": {
    "field1": "value1",
    "field2": "value2"
  },
  "metadata": {
    "timestamp": "2025-01-16T00:00:00Z",
    "requestId": "unique-request-id"
  }
}
```

### Standard Response Format
```json
{
  "success": true,
  "data": {
    "result": "response_data"
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-16T00:00:00Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": "Additional error details"
  },
  "timestamp": "2025-01-16T00:00:00Z"
}
```

## Integration Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

class RishiAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async getBookings() {
    return this.makeRequest('/api/bookings');
  }

  async createBooking(bookingData) {
    return this.makeRequest('/api/bookings', 'POST', bookingData);
  }
}
```

### Python
```python
import requests
import json

class RishiAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def make_request(self, endpoint, method='GET', data=None):
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = requests.request(
                method, url, 
                headers=self.headers, 
                json=data if data else None
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {e}")

    def get_bookings(self):
        return self.make_request('/api/bookings')

    def create_booking(self, booking_data):
        return self.make_request('/api/bookings', 'POST', booking_data)
```

## Webhooks

### Webhook Configuration
Configure webhooks to receive real-time notifications:

```json
{
  "url": "https://your-domain.com/webhook",
  "events": [
    "booking.created",
    "booking.updated",
    "booking.cancelled",
    "staff.assigned",
    "location.updated"
  ],
  "secret": "webhook-secret-key"
}
```

### Webhook Payload Format
```json
{
  "event": "booking.created",
  "data": {
    "id": "booking-id",
    "organizationId": "org-id",
    "details": { ... }
  },
  "timestamp": "2025-01-16T00:00:00Z",
  "signature": "webhook-signature"
}
```

## Rate Limiting

### Request Limits
- **Standard Users**: 100 requests per minute
- **Premium Users**: 1000 requests per minute
- **Enterprise**: Custom limits available

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642284000
```

## Best Practices

### Security
- Always use HTTPS for API requests
- Store tokens securely (environment variables)
- Implement token refresh logic
- Validate webhook signatures

### Performance
- Use pagination for large datasets
- Implement caching where appropriate
- Use bulk operations when available
- Monitor API usage and optimize

### Error Handling
- Implement retry logic for transient errors
- Log API errors for debugging
- Handle rate limiting gracefully
- Provide meaningful error messages

## SDK and Libraries

### Official SDKs
- **JavaScript/Node.js**: `@rishi/api-client`
- **Python**: `rishi-api-python`
- **PHP**: `rishi-api-php`

### Community Libraries
- Check GitHub for community-maintained libraries
- Contribute to open-source SDK development

## Support

### Technical Support
- **API Documentation**: Complete reference available
- **Integration Support**: Contact technical team
- **Code Examples**: Available in documentation

### Resources
- **Postman Collection**: Import API endpoints
- **OpenAPI Spec**: Machine-readable API definition
- **Testing Environment**: Sandbox API available

For detailed API reference, see the [API Endpoints Documentation](../endpoints/README.md).