# Cannabis Booking Management API Specification

## API Overview

The Cannabis Booking Management API provides comprehensive endpoints for managing cannabis industry staffed engagements with real-time updates, geographic filtering, and operational tracking capabilities.

**Base URL**: `https://api.cannabis-booking-platform.com/v1`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`

## Authentication & Authorization

### JWT Token Structure

```typescript
interface JWTPayload {
  sub: string; // User UUID
  org: string; // Organization UUID
  role: string; // User role
  permissions: string[]; // RBAC permissions
  cannabis_expertise: CannabisExpertiseLevel; // Staff expertise level
  iat: number; // Issued at
  exp: number; // Expiration
}
```

### Required Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Organization-ID: <organization_uuid>
X-Request-ID: <unique_request_uuid>
```

## Core Endpoints

### Booking Management

#### Create Cannabis Booking

```http
POST /bookings
```

**Request Body:**

```typescript
interface CreateCannabisBookingRequest {
  title: string;
  description: string;
  cannabisBookingType: CannabisBookingType;

  // Location and geography
  locationId: string; // UUID
  state: string;
  region: string;
  city: string;

  // Timing
  startDateTime: string; // ISO 8601
  endDateTime: string; // ISO 8601
  timezone: string;

  // Requirements
  estimatedAttendees: number;
  estimatedCost?: number;
  consumptionAllowed?: boolean;

  // Cannabis products
  cannabisProducts?: CannabisProductRequest[];

  // Special requirements
  specialRequirements?: string[];
  operationalNotes?: string;
}

interface CannabisProductRequest {
  productId: string; // UUID
  quantityPlanned: number;
  unitType: UnitType;
  usagePurpose: UsagePurpose;
  samplingAllowed?: boolean;
  displayOnly?: boolean;
}
```

**Response:**

```typescript
interface CreateBookingResponse {
  booking: CannabisBooking;
  operationalStatus: OperationalCheckResult;
  nextSteps: BookingNextStep[];
  estimatedTimeline: BookingTimeline;
}

interface CannabisBooking {
  id: string; // UUID
  organizationId: string; // UUID
  clientId: string; // UUID
  createdBy: string; // UUID

  cannabisBookingType: CannabisBookingType;
  operationalStatus: OperationalStatus;

  title: string;
  description: string;
  status: BookingStatus;
  stage: BookingStage;

  location: BookingLocation;
  dateTime: BookingDateTime;
  requirements: BookingRequirements;

  assignedStaff: string[]; // UUID[]
  assignedKits: string[]; // UUID[]

  operationalData: OperationalData;
  activityTrail: ActivityTrailEntry[];

  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

#### Get Bookings with Cannabis Filtering

```http
GET /bookings
```

**Query Parameters:**

```typescript
interface GetBookingsQuery {
  // Pagination
  page?: number;
  limit?: number;

  // Filtering
  organizationId?: string; // UUID
  clientId?: string; // UUID
  state?: string;
  region?: string;
  city?: string;

  // Cannabis-specific filters
  cannabisBookingType?: CannabisBookingType[];
  expertiseLevel?: CannabisExpertiseLevel[];

  // Status filters
  status?: BookingStatus[];
  stage?: BookingStage[];

  // Date filters
  startDateFrom?: string; // ISO 8601
  startDateTo?: string; // ISO 8601

  // Staff filters
  assignedStaff?: string; // UUID
  unassignedOnly?: boolean;

  // Sorting
  sortBy?: "createdAt" | "startDateTime" | "title" | "status";
  sortOrder?: "asc" | "desc";
}
```

**Response:**

```typescript
interface GetBookingsResponse {
  bookings: CannabisBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: AppliedFilters;
  aggregations: BookingAggregations;
}

interface BookingAggregations {
  byStatus: Record<BookingStatus, number>;
  byStage: Record<BookingStage, number>;
  byCannabisType: Record<CannabisBookingType, number>;
  byState: Record<string, number>;
  byExpertiseLevel: Record<CannabisExpertiseLevel, number>;
}
```

#### Update Booking Status

```http
PUT /bookings/{bookingId}/status
```

**Request Body:**

```typescript
interface UpdateBookingStatusRequest {
  newStatus: BookingStatus;
  newStage: BookingStage;
  reason?: string;
  metadata?: {
    approvedBy?: string; // UUID
    rejectionReason?: string;
    operationalNotes?: string;
    nextReviewDate?: string; // ISO 8601
  };
}
```

**Response:**

```typescript
interface UpdateBookingStatusResponse {
  booking: CannabisBooking;
  statusChange: StatusChangeRecord;
  triggeredActions: TriggeredAction[];
  operationalImpact: OperationalImpactAssessment;
}
```

### Staff Assignment

#### Assign Cannabis-Experienced Staff

```http
POST /bookings/{bookingId}/staff-assignments
```

**Request Body:**

```typescript
interface AssignStaffRequest {
  staffRequirements: CannabisStaffRequirements;
  autoAssign?: boolean;
  overrideConflicts?: boolean;
}

interface CannabisStaffRequirements {
  roles: StaffRole[];
  cannabisExpertiseLevel: CannabisExpertiseLevel;
  requiredSkills: CannabisStaffSkill[];
  preferredStaff?: string[]; // UUID[]
  excludedStaff?: string[]; // UUID[]

  experience: {
    minimumMonths: number;
    cannabisEventTypes: CannabisBookingType[];
    stateExperience?: string[];
  };

  logistics: {
    maxTravelDistance: number;
    hasReliableTransportation: boolean;
    availableForOvertime: boolean;
  };

  specialRequirements: {
    languageSkills?: string[];
    publicSpeakingAbility?: boolean;
    salesExperience?: boolean;
    securityBackground?: boolean;
  };
}
```

**Response:**

```typescript
interface AssignStaffResponse {
  assignments: StaffAssignment[];
  matchingAnalysis: StaffMatchingAnalysis;
  conflicts: AssignmentConflict[];
  recommendations: StaffRecommendation[];
}

interface StaffAssignment {
  id: string; // UUID
  bookingId: string; // UUID
  staffId: string; // UUID
  assignmentType: StaffAssignmentType;
  status: AssignmentStatus;

  matchScore: number; // 0-100
  assignedAt: string; // ISO 8601
  assignedBy: string; // UUID

  cannabisQualifications: {
    expertiseLevel: CannabisExpertiseLevel;
    skills: CannabisStaffSkill[];
    stateExperience: string[];
    productKnowledge: CannabisProductCategory[];
  };

  estimatedCosts: {
    hourlyRate: number;
    overtimeRate: number;
    travelCompensation: number;
    totalEstimated: number;
  };
}
```

#### Get Staff Availability

```http
GET /staff/availability
```

**Query Parameters:**

```typescript
interface StaffAvailabilityQuery {
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  state?: string;
  region?: string;
  cannabisExpertiseLevel?: CannabisExpertiseLevel;
  requiredSkills?: CannabisStaffSkill[];
  maxTravelDistance?: number;
}
```

### Kit Management

#### Assign Cannabis-Specific Kits

```http
POST /bookings/{bookingId}/kit-assignments
```

**Request Body:**

```typescript
interface AssignKitRequest {
  kitRequirements: CannabisKitRequirements;
  autoAssign?: boolean;
  expressShipping?: boolean;
}

interface CannabisKitRequirements {
  cannabisSpecificEquipment: {
    precisionScales: boolean;
    displayCases: boolean;
    storageContainers: boolean;
    pointOfSaleSystem: boolean;
    inventoryTrackingDevices: boolean;
  };

  generalEventEquipment: {
    tables: number;
    chairs: number;
    tentCanopy: boolean;
    audioSystem: boolean;
    displayMaterials: boolean;
  };

  shippingRequirements: {
    deliveryAddress: Address;
    specialHandling: boolean;
    temperatureControlled: boolean;
    insuredShipping: boolean;
    trackingRequired: boolean;
  };
}
```

### Real-time Tracking

#### Staff Check-in

```http
POST /bookings/{bookingId}/check-in
```

**Request Body:**

```typescript
interface StaffCheckInRequest {
  staffAssignmentId: string; // UUID
  gpsCoordinates: {
    latitude: number;
    longitude: number;
    accuracy: number; // meters
    timestamp: string; // ISO 8601
  };

  verificationMethod: CheckInMethod;

  // Cannabis-specific check-in data
  cannabisExperienceConfirmed: boolean;
  equipmentReceived: EquipmentItem[];
  cannabisProductsReceived: CannabisProductItem[];

  // Documentation
  notes?: string;
  photos: CheckInPhoto[];
}
```

**Response:**

```typescript
interface StaffCheckInResponse {
  checkInId: string; // UUID
  success: boolean;
  locationVerified: boolean;
  operationalStatus: OperationalStatus;

  verificationResults: {
    gpsAccuracy: number;
    distanceFromBookingLocation: number;
    equipmentVerified: boolean;
  };

  nextSteps: string[];
  contactInformation: ContactInfo[];
}
```

#### Staff Check-out

```http
POST /bookings/{bookingId}/check-out
```

**Request Body:**

```typescript
interface StaffCheckOutRequest {
  checkInId: string; // UUID
  gpsCoordinates: GPSCoordinates;

  // Equipment and materials return
  equipmentReturned: EquipmentItem[];
  cannabisProductsReturned: CannabisProductItem[];

  // Event data collection
  eventData: EventDataCollection;

  // Issues and feedback
  issuesReported: EventIssue[];
  notes?: string;
  photos: CheckOutPhoto[];
}

interface EventDataCollection {
  attendanceData: {
    totalAttendees: number;
    ageDistribution: AgeDistribution;
    newCustomers: number;
    returningCustomers: number;
  };

  salesMetrics: {
    productsDisplayed: string[]; // Product IDs
    samplesDistributed: number;
    leadsGenerated: number;
    salesConversions: number;
    estimatedRevenue?: number;
  };

  satisfactionMetrics: {
    overallSatisfaction: number; // 1-10
    productInterest: number; // 1-10
    brandAwareness: number; // 1-10
    likelyToRecommend: number; // 1-10
  };
}
```

### Geographic Management

#### Get Regional Booking Data

```http
GET /regions/{region}/bookings
```

**Query Parameters:**

```typescript
interface RegionalBookingsQuery {
  timeframe: "week" | "month" | "quarter" | "year";
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  includeMetrics?: boolean;
  includeForecast?: boolean;
}
```

**Response:**

```typescript
interface RegionalBookingsResponse {
  region: string;
  timeframe: TimeFrame;

  bookings: CannabisBooking[];
  metrics: RegionalMetrics;
  forecast?: RegionalForecast;

  stateBreakdown: StateBookingBreakdown[];
  operationalOverview: RegionalOperationalOverview;
}

interface RegionalMetrics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  totalRevenue: number;

  staffMetrics: {
    totalStaffAssigned: number;
    averageUtilization: number;
    averageRating: number;
    expertiseDistribution: Record<CannabisExpertiseLevel, number>;
  };

  operationalMetrics: {
    averageSetupTime: number;
    equipmentUtilization: number;
    customerSatisfaction: number;
    eventSuccessRate: number;
  };
}
```

## WebSocket Events

### Real-time Updates

**Connection URL**: `wss://api.cannabis-booking-platform.com/v1/ws`

#### Authentication

```typescript
// Send after connection
{
  type: 'auth',
  token: 'jwt_token_here',
  organizationId: 'uuid',
  subscriptions: ['bookings', 'staff_tracking', 'operational_alerts']
}
```

#### Event Types

```typescript
interface WebSocketEvent {
  id: string; // UUID
  type: EventType;
  timestamp: string; // ISO 8601
  data: any;
}

enum EventType {
  // Booking events
  BOOKING_CREATED = "booking.created",
  BOOKING_STATUS_CHANGED = "booking.status_changed",
  BOOKING_STAFF_ASSIGNED = "booking.staff_assigned",

  // Staff events
  STAFF_CHECKED_IN = "staff.checked_in",
  STAFF_CHECKED_OUT = "staff.checked_out",
  STAFF_LOCATION_UPDATE = "staff.location_update",

  // Operational events
  EQUIPMENT_ASSIGNED = "equipment.assigned",
  EVENT_DATA_SUBMITTED = "event.data_submitted",

  // System events
  EMERGENCY_ALERT = "emergency.alert",
  SYSTEM_MAINTENANCE = "system.maintenance",
}
```

#### Sample Events

```typescript
// Staff check-in event
{
  id: 'evt-123e4567-e89b-12d3-a456-426614174000',
  type: 'staff.checked_in',
  timestamp: '2025-06-17T10:30:00Z',
  data: {
    bookingId: 'booking-uuid',
    staffId: 'staff-uuid',
    staffName: 'John Doe',
    checkInTime: '2025-06-17T10:30:00Z',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 5
    },
    operationalStatus: 'ready',
    cannabisExperienceLevel: 'experienced'
  }
}

// Event completion alert
{
  id: 'evt-234e5678-e89b-12d3-a456-426614174001',
  type: 'event.data_submitted',
  timestamp: '2025-06-17T16:00:00Z',
  data: {
    bookingId: 'booking-uuid',
    eventType: 'product_demo',
    attendeeCount: 45,
    leadsGenerated: 12,
    customerSatisfaction: 8.5,
    nextActions: [
      'Process leads',
      'Schedule follow-up',
      'Return equipment'
    ]
  }
}
```

## Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string; // ISO 8601
    requestId: string; // UUID
    path: string;
  };

  // Cannabis-specific error context
  cannabisContext?: {
    state: string;
    operationalImpact: "none" | "low" | "medium" | "high" | "critical";
    suggestedActions?: string[];
  };
}
```

### Error Codes

```typescript
enum CannabisAPIErrorCode {
  // Authentication/Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  INVALID_CANNABIS_EXPERTISE = "INVALID_CANNABIS_EXPERTISE",

  // Validation
  INVALID_REQUEST = "INVALID_REQUEST",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_DATE_RANGE = "INVALID_DATE_RANGE",
  INVALID_GPS_COORDINATES = "INVALID_GPS_COORDINATES",

  // Business Logic
  BOOKING_CONFLICT = "BOOKING_CONFLICT",
  STAFF_UNAVAILABLE = "STAFF_UNAVAILABLE",
  KIT_UNAVAILABLE = "KIT_UNAVAILABLE",
  INSUFFICIENT_CANNABIS_EXPERTISE = "INSUFFICIENT_CANNABIS_EXPERTISE",

  // Operations
  LOCATION_VERIFICATION_FAILED = "LOCATION_VERIFICATION_FAILED",
  EQUIPMENT_TRACKING_ERROR = "EQUIPMENT_TRACKING_ERROR",
  EVENT_DATA_INCOMPLETE = "EVENT_DATA_INCOMPLETE",

  // System
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}
```

## Rate Limiting

### Rate Limits by Endpoint Category

```typescript
interface RateLimits {
  standard: "1000 requests per hour";
  authentication: "10 requests per minute";
  realTimeTracking: "500 requests per hour";
  operationalChecks: "200 requests per hour";
  fileUploads: "50 requests per hour";
  bulkOperations: "20 requests per hour";
}
```

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
```

## API Versioning

### Version Strategy

- **Current Version**: v1
- **Deprecation Policy**: 12 months notice
- **Breaking Changes**: New major version
- **Cannabis Feature Updates**: Minor versions with backward compatibility

### Version Headers

```http
Accept: application/vnd.cannabis-booking.v1+json
API-Version: 1.0.0
```

This API specification provides complete integration capabilities for cannabis industry booking management with operational tracking and real-time monitoring features, focusing purely on workflow efficiency without regulatory dependencies.
