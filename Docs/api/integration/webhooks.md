# Webhook Integration Guide

## Overview

Webhooks allow your application to receive real-time notifications when events occur in the Rishi Platform. This enables you to build responsive integrations that react immediately to changes.

## Webhook Configuration

### Setting Up Webhooks

Configure webhooks through the API or admin interface:

```javascript
// POST /api/webhooks
{
  "url": "https://your-domain.com/webhook/rishi",
  "events": [
    "booking.created",
    "booking.updated",
    "booking.cancelled",
    "staff.assigned",
    "location.updated"
  ],
  "secret": "your-webhook-secret-key",
  "active": true
}
```

### Webhook Configuration Options

```json
{
  "url": "https://your-domain.com/webhook/rishi",
  "events": ["event.name"],
  "secret": "secret-key",
  "active": true,
  "headers": {
    "X-Custom-Header": "value"
  },
  "timeout": 30000,
  "retries": 3
}
```

## Supported Events

### Booking Events
- `booking.created` - New booking created
- `booking.updated` - Booking details modified
- `booking.cancelled` - Booking cancelled
- `booking.confirmed` - Booking confirmed
- `booking.started` - Booking started
- `booking.completed` - Booking completed

### Staff Events
- `staff.assigned` - Staff assigned to booking
- `staff.unassigned` - Staff removed from booking
- `staff.checkin` - Staff checked in
- `staff.checkout` - Staff checked out
- `staff.availability_updated` - Staff availability changed

### Location Events
- `location.created` - New location added
- `location.updated` - Location details modified
- `location.archived` - Location archived
- `location.approved` - Location approved
- `location.rejected` - Location rejected

### Inventory Events
- `inventory.kit_created` - New kit template created
- `inventory.kit_updated` - Kit template modified
- `inventory.kit_assigned` - Kit assigned to booking
- `inventory.kit_returned` - Kit returned from booking

### Organization Events
- `organization.created` - New organization created
- `organization.updated` - Organization details modified
- `organization.user_added` - User added to organization
- `organization.user_removed` - User removed from organization

## Webhook Payload Format

### Standard Payload Structure
```json
{
  "event": "booking.created",
  "data": {
    "id": "booking-123",
    "organizationId": "org-456",
    "createdAt": "2025-01-16T10:30:00Z",
    "details": {
      "title": "Event Title",
      "startTime": "2025-01-20T14:00:00Z",
      "endTime": "2025-01-20T18:00:00Z",
      "location": {
        "id": "loc-789",
        "name": "Event Venue"
      },
      "staff": [
        {
          "id": "staff-101",
          "name": "John Doe",
          "role": "brand_agent"
        }
      ]
    }
  },
  "timestamp": "2025-01-16T10:30:01Z",
  "signature": "sha256=signature-hash"
}
```

### Event-Specific Payloads

#### Booking Created
```json
{
  "event": "booking.created",
  "data": {
    "id": "booking-123",
    "organizationId": "org-456",
    "title": "Product Launch Event",
    "description": "Cannabis product launch event",
    "startTime": "2025-01-20T14:00:00Z",
    "endTime": "2025-01-20T18:00:00Z",
    "location": {
      "id": "loc-789",
      "name": "Downtown Convention Center",
      "address": "123 Main St, City, State"
    },
    "status": "confirmed",
    "requirements": {
      "staffCount": 5,
      "certifications": ["cannabis_handler", "event_staff"]
    },
    "createdBy": {
      "id": "user-456",
      "name": "Jane Smith"
    }
  },
  "timestamp": "2025-01-16T10:30:01Z",
  "signature": "sha256=abc123..."
}
```

#### Staff Assigned
```json
{
  "event": "staff.assigned",
  "data": {
    "bookingId": "booking-123",
    "staffId": "staff-101",
    "staff": {
      "id": "staff-101",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "brand_agent",
      "certifications": ["cannabis_handler", "event_staff"]
    },
    "assignment": {
      "position": "Brand Representative",
      "startTime": "2025-01-20T14:00:00Z",
      "endTime": "2025-01-20T18:00:00Z",
      "hourlyRate": 25.00
    },
    "assignedBy": {
      "id": "user-456",
      "name": "Jane Smith"
    }
  },
  "timestamp": "2025-01-16T10:30:01Z",
  "signature": "sha256=def456..."
}
```

## Webhook Security

### Signature Verification

Verify webhook authenticity using the signature header:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

// Express.js example
app.post('/webhook/rishi', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-rishi-signature'];
  const payload = req.body;
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  const event = JSON.parse(payload);
  handleWebhookEvent(event);
  
  res.status(200).send('OK');
});
```

### Python Example
```python
import hmac
import hashlib
import json

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return f"sha256={expected_signature}" == signature

# Flask example
from flask import Flask, request

@app.route('/webhook/rishi', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Rishi-Signature')
    payload = request.get_data()
    
    if not verify_webhook_signature(payload, signature, os.environ['WEBHOOK_SECRET']):
        return 'Invalid signature', 401
    
    event = json.loads(payload)
    handle_webhook_event(event)
    
    return 'OK', 200
```

## Webhook Handling

### Event Processing Examples

#### Booking Event Handler
```javascript
function handleWebhookEvent(event) {
  switch(event.event) {
    case 'booking.created':
      handleBookingCreated(event.data);
      break;
    case 'booking.updated':
      handleBookingUpdated(event.data);
      break;
    case 'booking.cancelled':
      handleBookingCancelled(event.data);
      break;
    case 'staff.assigned':
      handleStaffAssigned(event.data);
      break;
    default:
      console.log(`Unknown event: ${event.event}`);
  }
}

function handleBookingCreated(data) {
  // Send notification to relevant team members
  sendNotification({
    type: 'booking_created',
    title: `New booking: ${data.title}`,
    message: `Booking created for ${data.startTime}`,
    recipients: getBookingStakeholders(data.organizationId)
  });
  
  // Update external calendar system
  updateExternalCalendar(data);
  
  // Log the event
  console.log(`Booking created: ${data.id}`);
}

function handleStaffAssigned(data) {
  // Send notification to assigned staff
  sendStaffNotification({
    staffId: data.staffId,
    message: `You've been assigned to ${data.assignment.position}`,
    bookingDetails: data
  });
  
  // Update staffing dashboard
  updateStaffingDashboard(data);
}
```

### Error Handling and Retries

```javascript
app.post('/webhook/rishi', async (req, res) => {
  try {
    // Verify signature
    if (!verifyWebhookSignature(req.body, req.headers['x-rishi-signature'], process.env.WEBHOOK_SECRET)) {
      return res.status(401).send('Invalid signature');
    }
    
    const event = JSON.parse(req.body);
    
    // Process event with retry logic
    await processEventWithRetry(event);
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function processEventWithRetry(event, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await handleWebhookEvent(event);
      return; // Success
    } catch (error) {
      console.error(`Webhook processing attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) {
        throw error; // Final attempt failed
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}
```

## Testing Webhooks

### Local Development
Use tools like ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL in webhook configuration
# https://abc123.ngrok.io/webhook/rishi
```

### Testing Webhook Endpoints

```javascript
// Test webhook endpoint
const express = require('express');
const app = express();

app.use(express.raw({type: 'application/json'}));

app.post('/webhook/rishi', (req, res) => {
  console.log('Received webhook:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body.toString());
  
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook test server running on port 3000');
});
```

## Webhook Management

### List Webhooks
```javascript
// GET /api/webhooks
{
  "webhooks": [
    {
      "id": "webhook-123",
      "url": "https://your-domain.com/webhook/rishi",
      "events": ["booking.created", "booking.updated"],
      "active": true,
      "createdAt": "2025-01-16T10:00:00Z",
      "lastTriggered": "2025-01-16T10:30:00Z"
    }
  ]
}
```

### Update Webhook
```javascript
// PUT /api/webhooks/webhook-123
{
  "url": "https://new-domain.com/webhook/rishi",
  "events": ["booking.created", "booking.updated", "staff.assigned"],
  "active": true
}
```

### Delete Webhook
```javascript
// DELETE /api/webhooks/webhook-123
```

## Best Practices

### Reliability
- Implement idempotency for webhook handlers
- Use database transactions for data consistency
- Implement proper error handling and logging
- Set up monitoring and alerting

### Security
- Always verify webhook signatures
- Use HTTPS endpoints only
- Implement rate limiting
- Store webhook secrets securely

### Performance
- Process webhooks asynchronously
- Use queues for heavy processing
- Return 200 status quickly
- Implement exponential backoff for retries

### Monitoring
- Log all webhook events
- Monitor webhook processing times
- Set up alerts for webhook failures
- Track webhook delivery rates

For more information about API integration, see the [API Integration Guide](README.md).