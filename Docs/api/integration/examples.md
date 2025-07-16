# API Integration Examples

## Complete Integration Examples

This document provides comprehensive examples for integrating with the Rishi Platform API, including authentication, CRUD operations, and real-world use cases.

## Authentication Examples

### Basic Authentication Flow

```javascript
// JavaScript/Node.js Example
const axios = require('axios');

class RishiAPIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
    this.refreshToken = null;
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth-service/login`, {
        username,
        password
      });

      this.token = response.data.token;
      this.refreshToken = response.data.refreshToken;
      
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async refreshAccessToken() {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth-service/refresh`, {
        refreshToken: this.refreshToken
      });

      this.token = response.data.token;
      return response.data;
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.response?.data?.message || error.message}`);
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }
}

// Usage
const client = new RishiAPIClient('https://your-rishi-platform.com');
await client.login('mike', 'wrench519');
```

### Python Authentication Example

```python
import requests
import json
from datetime import datetime, timedelta

class RishiAPIClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.refresh_token = None
        self.token_expires_at = None

    def login(self, username, password):
        """Authenticate and get access token"""
        url = f"{self.base_url}/api/auth-service/login"
        data = {
            "username": username,
            "password": password
        }
        
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        auth_data = response.json()
        self.token = auth_data['token']
        self.refresh_token = auth_data['refreshToken']
        self.token_expires_at = datetime.now() + timedelta(hours=24)
        
        return auth_data

    def refresh_access_token(self):
        """Refresh expired access token"""
        url = f"{self.base_url}/api/auth-service/refresh"
        data = {"refreshToken": self.refresh_token}
        
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        auth_data = response.json()
        self.token = auth_data['token']
        self.token_expires_at = datetime.now() + timedelta(hours=24)
        
        return auth_data

    def get_headers(self):
        """Get authentication headers"""
        if not self.token:
            raise Exception("Not authenticated - call login() first")
        
        # Check if token needs refresh
        if datetime.now() >= self.token_expires_at:
            self.refresh_access_token()
        
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }

    def make_request(self, endpoint, method='GET', data=None):
        """Make authenticated API request"""
        url = f"{self.base_url}{endpoint}"
        headers = self.get_headers()
        
        response = requests.request(method, url, headers=headers, json=data)
        response.raise_for_status()
        
        return response.json()

# Usage
client = RishiAPIClient('https://your-rishi-platform.com')
client.login('mike', 'wrench519')
```

## CRUD Operations Examples

### Booking Management

```javascript
// Create Booking
async function createBooking(client, bookingData) {
  const booking = await client.makeRequest('/api/bookings', 'POST', {
    title: bookingData.title,
    description: bookingData.description,
    startTime: bookingData.startTime,
    endTime: bookingData.endTime,
    locationId: bookingData.locationId,
    organizationId: bookingData.organizationId,
    requirements: {
      staffCount: bookingData.staffCount,
      certifications: bookingData.certifications
    }
  });
  
  console.log('Booking created:', booking.id);
  return booking;
}

// Get Bookings with Filters
async function getBookings(client, filters = {}) {
  const queryParams = new URLSearchParams();
  
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.organizationId) queryParams.append('organizationId', filters.organizationId);
  if (filters.status) queryParams.append('status', filters.status);
  
  const bookings = await client.makeRequest(`/api/bookings?${queryParams}`);
  return bookings;
}

// Update Booking
async function updateBooking(client, bookingId, updates) {
  const booking = await client.makeRequest(`/api/bookings/${bookingId}`, 'PUT', updates);
  console.log('Booking updated:', booking.id);
  return booking;
}

// Cancel Booking
async function cancelBooking(client, bookingId, reason) {
  await client.makeRequest(`/api/bookings/${bookingId}`, 'DELETE', { reason });
  console.log('Booking cancelled:', bookingId);
}
```

### Staff Management

```javascript
// Assign Staff to Booking
async function assignStaff(client, bookingId, staffId, assignmentDetails) {
  const assignment = await client.makeRequest('/api/staff/assignments', 'POST', {
    bookingId,
    staffId,
    position: assignmentDetails.position,
    startTime: assignmentDetails.startTime,
    endTime: assignmentDetails.endTime,
    hourlyRate: assignmentDetails.hourlyRate
  });
  
  return assignment;
}

// Get Staff Availability
async function getStaffAvailability(client, startDate, endDate, organizationId) {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
    organizationId
  });
  
  const availability = await client.makeRequest(`/api/staff/availability?${queryParams}`);
  return availability;
}

// Update Staff Schedule
async function updateStaffSchedule(client, staffId, schedule) {
  const updated = await client.makeRequest(`/api/staff/${staffId}/schedule`, 'PUT', {
    schedule: schedule.map(slot => ({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: slot.available
    }))
  });
  
  return updated;
}
```

## Real-World Use Cases

### Event Management System Integration

```javascript
// Complete event management workflow
class EventManagementIntegration {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async createEvent(eventData) {
    try {
      // 1. Create the booking
      const booking = await this.api.makeRequest('/api/bookings', 'POST', {
        title: eventData.title,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        locationId: eventData.locationId,
        organizationId: eventData.organizationId,
        requirements: eventData.requirements
      });

      // 2. Find and assign staff
      const availableStaff = await this.findAvailableStaff(
        eventData.startTime,
        eventData.endTime,
        eventData.organizationId,
        eventData.requirements
      );

      const assignments = [];
      for (const staffMember of availableStaff.slice(0, eventData.requirements.staffCount)) {
        const assignment = await this.api.makeRequest('/api/staff/assignments', 'POST', {
          bookingId: booking.id,
          staffId: staffMember.id,
          position: staffMember.preferredPosition,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          hourlyRate: staffMember.hourlyRate
        });
        assignments.push(assignment);
      }

      // 3. Assign inventory/kits
      if (eventData.kitTemplateId) {
        const kitAssignment = await this.api.makeRequest('/api/inventory/assignments', 'POST', {
          bookingId: booking.id,
          kitTemplateId: eventData.kitTemplateId,
          quantity: 1
        });
      }

      // 4. Send notifications
      await this.sendEventNotifications(booking, assignments);

      return {
        booking,
        assignments,
        success: true,
        message: `Event "${eventData.title}" created successfully`
      };

    } catch (error) {
      console.error('Event creation failed:', error);
      throw error;
    }
  }

  async findAvailableStaff(startTime, endTime, organizationId, requirements) {
    const availability = await this.api.makeRequest(
      `/api/staff/availability?startDate=${startTime}&endDate=${endTime}&organizationId=${organizationId}`
    );

    return availability.filter(staff => {
      // Check if staff has required certifications
      if (requirements.certifications) {
        return requirements.certifications.every(cert => 
          staff.certifications.includes(cert)
        );
      }
      return true;
    });
  }

  async sendEventNotifications(booking, assignments) {
    // Send notifications to assigned staff
    for (const assignment of assignments) {
      await this.api.makeRequest('/api/notifications', 'POST', {
        recipientId: assignment.staffId,
        type: 'booking_assignment',
        title: `New Assignment: ${booking.title}`,
        message: `You've been assigned to ${booking.title} on ${booking.startTime}`,
        data: { bookingId: booking.id, assignmentId: assignment.id }
      });
    }

    // Send notification to booking creator
    await this.api.makeRequest('/api/notifications', 'POST', {
      recipientId: booking.createdBy,
      type: 'booking_created',
      title: `Booking Created: ${booking.title}`,
      message: `Your booking has been created and staff assigned`,
      data: { bookingId: booking.id }
    });
  }
}

// Usage
const eventIntegration = new EventManagementIntegration(apiClient);
const result = await eventIntegration.createEvent({
  title: 'Cannabis Product Launch',
  description: 'Launch event for new product line',
  startTime: '2025-01-20T14:00:00Z',
  endTime: '2025-01-20T18:00:00Z',
  locationId: 'loc-123',
  organizationId: 'org-456',
  requirements: {
    staffCount: 5,
    certifications: ['cannabis_handler', 'event_staff']
  },
  kitTemplateId: 'kit-789'
});
```

### Staff Scheduling System

```python
# Python example for staff scheduling integration
import requests
from datetime import datetime, timedelta

class StaffSchedulingIntegration:
    def __init__(self, api_client):
        self.api = api_client

    def create_weekly_schedule(self, organization_id, week_start_date):
        """Create optimal staff schedule for a week"""
        week_end_date = week_start_date + timedelta(days=7)
        
        # Get all bookings for the week
        bookings = self.get_bookings_for_period(week_start_date, week_end_date, organization_id)
        
        # Get staff availability
        staff_availability = self.get_staff_availability(week_start_date, week_end_date, organization_id)
        
        # Create schedule
        schedule = self.optimize_schedule(bookings, staff_availability)
        
        # Apply schedule
        for assignment in schedule:
            self.assign_staff_to_booking(assignment)
        
        return schedule

    def get_bookings_for_period(self, start_date, end_date, organization_id):
        """Get all bookings in date range"""
        params = {
            'startDate': start_date.isoformat(),
            'endDate': end_date.isoformat(),
            'organizationId': organization_id
        }
        
        return self.api.make_request('/api/bookings', 'GET', params)

    def get_staff_availability(self, start_date, end_date, organization_id):
        """Get staff availability for period"""
        params = {
            'startDate': start_date.isoformat(),
            'endDate': end_date.isoformat(),
            'organizationId': organization_id
        }
        
        return self.api.make_request('/api/staff/availability', 'GET', params)

    def optimize_schedule(self, bookings, staff_availability):
        """Optimize staff assignments"""
        schedule = []
        
        for booking in bookings:
            # Find best staff for this booking
            suitable_staff = self.find_suitable_staff(booking, staff_availability)
            
            if suitable_staff:
                assignment = {
                    'bookingId': booking['id'],
                    'staffId': suitable_staff['id'],
                    'position': suitable_staff['preferredPosition'],
                    'startTime': booking['startTime'],
                    'endTime': booking['endTime'],
                    'hourlyRate': suitable_staff['hourlyRate']
                }
                schedule.append(assignment)
                
                # Remove staff from availability for this time slot
                self.update_staff_availability(suitable_staff['id'], booking['startTime'], booking['endTime'])
        
        return schedule

    def find_suitable_staff(self, booking, staff_availability):
        """Find best staff member for booking"""
        for staff in staff_availability:
            if self.is_staff_available(staff, booking['startTime'], booking['endTime']):
                if self.has_required_certifications(staff, booking.get('requirements', {})):
                    return staff
        return None

    def assign_staff_to_booking(self, assignment):
        """Assign staff member to booking"""
        return self.api.make_request('/api/staff/assignments', 'POST', assignment)

# Usage
scheduling = StaffSchedulingIntegration(api_client)
schedule = scheduling.create_weekly_schedule('org-123', datetime(2025, 1, 20))
```

### Inventory Management Integration

```javascript
// Complete inventory management system
class InventoryIntegration {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async createKitTemplate(templateData) {
    const template = await this.api.makeRequest('/api/inventory/templates', 'POST', {
      name: templateData.name,
      description: templateData.description,
      items: templateData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        required: item.required,
        category: item.category
      })),
      organizationId: templateData.organizationId
    });

    return template;
  }

  async assignKitToBooking(bookingId, kitTemplateId) {
    const assignment = await this.api.makeRequest('/api/inventory/assignments', 'POST', {
      bookingId,
      kitTemplateId,
      assignedAt: new Date().toISOString()
    });

    // Generate checklist
    const checklist = await this.generateChecklist(assignment.id);
    
    return { assignment, checklist };
  }

  async generateChecklist(assignmentId) {
    const checklist = await this.api.makeRequest(`/api/inventory/assignments/${assignmentId}/checklist`, 'POST');
    return checklist;
  }

  async trackKitUsage(assignmentId, usageData) {
    const usage = await this.api.makeRequest(`/api/inventory/assignments/${assignmentId}/usage`, 'POST', {
      items: usageData.items.map(item => ({
        itemId: item.id,
        quantityUsed: item.quantityUsed,
        condition: item.condition,
        notes: item.notes
      })),
      returnedAt: usageData.returnedAt
    });

    return usage;
  }
}
```

## Error Handling Examples

### Comprehensive Error Handling

```javascript
class RobustAPIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async makeRequestWithRetry(endpoint, method = 'GET', data = null, retryCount = 0) {
    try {
      const response = await this.makeRequest(endpoint, method, data);
      return response;
    } catch (error) {
      if (this.shouldRetry(error, retryCount)) {
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.makeRequestWithRetry(endpoint, method, data, retryCount + 1);
      }
      
      throw this.handleError(error);
    }
  }

  shouldRetry(error, retryCount) {
    if (retryCount >= this.maxRetries) return false;
    
    // Retry on network errors or 5xx server errors
    return error.code === 'ENOTFOUND' || 
           error.code === 'ECONNRESET' || 
           (error.response && error.response.status >= 500);
  }

  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          return new Error('Authentication failed - please login again');
        case 403:
          return new Error(`Access denied - insufficient permissions: ${data.message}`);
        case 404:
          return new Error(`Resource not found: ${data.message}`);
        case 429:
          return new Error('Rate limit exceeded - please wait before retrying');
        case 500:
          return new Error('Server error - please try again later');
        default:
          return new Error(`API error (${status}): ${data.message}`);
      }
    }
    
    return new Error(`Network error: ${error.message}`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Performance Optimization

### Batch Operations

```javascript
// Efficient batch operations
async function batchCreateBookings(client, bookings) {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < bookings.length; i += batchSize) {
    const batch = bookings.slice(i, i + batchSize);
    const batchPromises = batch.map(booking => 
      client.makeRequest('/api/bookings', 'POST', booking)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}

// Pagination handling
async function getAllBookings(client, organizationId) {
  const allBookings = [];
  let page = 1;
  const limit = 100;
  
  while (true) {
    const response = await client.makeRequest(
      `/api/bookings?organizationId=${organizationId}&page=${page}&limit=${limit}`
    );
    
    allBookings.push(...response.data);
    
    if (response.data.length < limit) {
      break; // No more pages
    }
    
    page++;
  }
  
  return allBookings;
}
```

For more integration patterns and advanced examples, see the [API Reference Documentation](../endpoints/README.md) and [Webhook Integration Guide](webhooks.md).