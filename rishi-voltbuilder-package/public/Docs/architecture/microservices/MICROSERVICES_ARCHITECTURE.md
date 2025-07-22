# Cannabis Booking Management - Microservices Architecture

## Service Architecture Overview

The Cannabis Booking Management Platform follows a comprehensive microservices architecture with event-driven communication, UUID-based entity identification, and authentic data integration throughout all services.

## Core Microservices

### 1. Booking Management Service

#### Service Definition

```typescript
interface BookingManagementService {
  serviceId: string; // UUID: 'bms-550e8400-e29b-41d4-a716-446655440001'
  name: "booking-management-service";
  version: "1.0.0";
  port: 3001;
  healthEndpoint: "/health";
  metricsEndpoint: "/metrics";

  database: {
    primary: "bookings_db";
    connectionPool: "booking_pool";
    replication: "read_replicas_enabled";
  };

  eventBus: {
    publishTopics: [
      "booking.created",
      "booking.status_changed",
      "booking.updated",
      "booking.cancelled",
      "booking.stage_advanced",
    ];
    subscribeTopics: [
      "staff.assigned",
      "kit.assigned",
      "operational.verified",
      "location.updated",
    ];
  };
}
```

#### API Endpoints

```typescript
// Booking CRUD Operations
interface BookingAPI {
  // Create new cannabis booking
  POST: '/api/v1/bookings' => {
    body: CreateBookingRequest;
    response: Booking;
    events: ['booking.created'];
  };

  // Get bookings with cannabis-specific filtering
  GET: '/api/v1/bookings' => {
    query: {
      organizationId: string; // UUID
      clientId?: string; // UUID
      state?: string;
      region?: string;
      cannabisType?: CannabisBookingType[];
      status?: BookingStatus[];
      stage?: BookingStage[];
      dateFrom?: string;
      dateTo?: string;
      assignedStaff?: string; // UUID
      operationalStatus?: OperationalStatus;
    };
    response: PaginatedBookings;
  };

  // Get single booking with full details
  GET: '/api/v1/bookings/{bookingId}' => {
    params: { bookingId: string }; // UUID
    response: BookingWithDetails;
  };

  // Update booking status and stage
  PUT: '/api/v1/bookings/{bookingId}/status' => {
    params: { bookingId: string }; // UUID
    body: {
      newStatus: BookingStatus;
      newStage: BookingStage;
      reason?: string;
      metadata?: BookingUpdateMetadata;
    };
    response: BookingStatusUpdate;
    events: ['booking.status_changed', 'booking.stage_advanced'];
  };

  // Cannabis operational verification
  POST: '/api/v1/bookings/{bookingId}/operational-check' => {
    params: { bookingId: string }; // UUID
    body: OperationalCheckRequest;
    response: OperationalCheckResult;
    events: ['booking.operational_verified'];
  };
}
```

#### Data Models

```typescript
interface Booking {
  id: string; // UUID
  organizationId: string; // UUID
  clientId: string; // UUID
  createdBy: string; // UUID
  updatedBy: string; // UUID

  // Cannabis-specific fields
  cannabisBookingType: CannabisBookingType;
  cannabisProducts: CannabisProduct[];
  operationalRequirements: CannabisOperationalRequirements;

  // Core booking information
  title: string;
  description: string;
  status: BookingStatus;
  stage: BookingStage;

  // Location and geography
  locationId: string; // UUID
  state: string;
  region: string;
  city: string;

  // Timing
  startDateTime: Date;
  endDateTime: Date;
  timezone: string;

  // Assignments
  assignedStaff: string[]; // UUID[]
  assignedKits: string[]; // UUID[]

  // Financial
  estimatedCost: number;
  actualCost?: number;
  budgetApproved: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  metadata: BookingMetadata;
}

enum CannabisBookingType {
  PRODUCT_DEMO = "product_demo",
  PRODUCT_PROMOTION = "product_promotion",
  PRIVATE_PARTY = "private_party",
  STAFF_TRAINING = "staff_training",
  BRAND_ACTIVATION = "brand_activation",
  EDUCATIONAL_SESSION = "educational_session",
  DISPENSARY_OPENING = "dispensary_opening",
  TRADE_SHOW = "trade_show",
  CUSTOMER_EXPERIENCE = "customer_experience",
}

interface CannabisProduct {
  id: string; // UUID
  name: string;
  category: CannabisProductCategory;
  thcContent: number;
  cbdContent: number;
  strain?: string;
  brand: string;
  productInfo: {
    tested: boolean;
    batchNumber: string;
    labResults: string[]; // Document IDs
    description: string;
  };
}

enum CannabisProductCategory {
  FLOWER = "flower",
  EDIBLES = "edibles",
  CONCENTRATES = "concentrates",
  TOPICALS = "topicals",
  BEVERAGES = "beverages",
  ACCESSORIES = "accessories",
  SEEDS = "seeds",
  CLONES = "clones",
}
```

### 2. Staff Assignment Service

#### Service Definition

```typescript
interface StaffAssignmentService {
  serviceId: string; // UUID: 'sas-660e8400-e29b-41d4-a716-446655440001'
  name: "staff-assignment-service";
  version: "1.0.0";
  port: 3002;

  specialization: "cannabis_industry_staff_management";

  intelligentMatching: {
    skillsEngine: "ml_powered_skills_matching";
    availabilityEngine: "real_time_availability_checking";
    locationEngine: "geo_proximity_optimization";
    cannabisExpertise: "specialized_knowledge_matching";
  };

  eventBus: {
    publishTopics: [
      "staff.assigned",
      "staff.availability_changed",
      "staff.checked_in",
      "staff.checked_out",
      "staff.assignment_updated",
    ];
    subscribeTopics: [
      "booking.created",
      "booking.status_changed",
      "location.updated",
      "training.completed",
    ];
  };
}
```

#### Advanced Staff Matching Algorithm

```typescript
interface CannabisStaffMatchingEngine {
  findOptimalStaff(
    bookingId: string,
    requirements: CannabisStaffRequirements
  ): Promise<StaffMatchResult[]>;

  private calculateMatchScore(
    staff: StaffProfile,
    requirements: CannabisStaffRequirements,
    booking: Booking
  ): Promise<StaffMatchScore>;

  private assessCannabisExpertise(
    staff: StaffProfile,
    requiredExpertise: CannabisExpertiseLevel
  ): number;

  private calculateTravelFeasibility(
    staffLocation: GeoLocation,
    eventLocation: GeoLocation,
    travelPreferences: TravelPreferences
  ): Promise<TravelFeasibilityScore>;
}

interface CannabisStaffRequirements {
  id: string; // UUID
  bookingId: string; // UUID

  cannabisExpertise: {
    level: CannabisExpertiseLevel;
    productKnowledge: CannabisProductCategory[];
    complianceTraining: boolean;
    budtenderExperience: boolean;
    extrationKnowledge: boolean;
    medicalCannabisExperience: boolean;
  };

  certifications: {
    required: CannabisStaffCertification[];
    preferred: CannabisStaffCertification[];
    mustBeCurrents: boolean;
  };

  experience: {
    minimumMonths: number;
    eventTypes: CannabisBookingType[];
    clientPreferences: string[];
  };

  logistics: {
    maxTravelDistance: number;
    hasReliableTransportation: boolean;
    availableForOvertime: boolean;
    backgroundCheckRequired: boolean;
  };

  specialRequirements: {
    languageSkills: string[];
    publicSpeakingAbility: boolean;
    salesExperience: boolean;
    securityClearance: boolean;
  };
}

enum CannabisExpertiseLevel {
  NOVICE = 'novice',
  INTERMEDIATE = 'intermediate',
  EXPERIENCED = 'experienced',
  EXPERT = 'expert',
  MASTER = 'master'
}

enum CannabisStaffCertification {
  BUDTENDER_CERTIFIED = 'budtender_certified',
  COMPLIANCE_TRAINED = 'compliance_trained',
  PRODUCT_SPECIALIST = 'product_specialist',
  EXTRACTION_CERTIFIED = 'extraction_certified',
  MEDICAL_CANNABIS_CERTIFIED = 'medical_cannabis_certified',
  SECURITY_LICENSED = 'security_licensed',
  FIRST_AID_CPR = 'first_aid_cpr',
  RESPONSIBLE_VENDOR = 'responsible_vendor'
}

interface StaffMatchScore {
  totalScore: number; // 0-100
  breakdown: {
    cannabisExpertise: number;
    productKnowledge: number;
    certificationMatch: number;
    experienceMatch: number;
    availabilityMatch: number;
    locationMatch: number;
    clientFit: number;
    costEfficiency: number;
  };

  riskFactors: {
    availabilityConflicts: string[];
    transportationConcerns: string[];
    certificationExpiries: Date[];
    performanceHistory: string[];
  };

  recommendations: {
    primaryAssignment: boolean;
    backupAssignment: boolean;
    trainingNeeded: string[];
    specialConsiderations: string[];
  };
}
```

### 3. Kit Management Service

#### Service Definition

```typescript
interface KitManagementService {
  serviceId: string; // UUID: 'kms-770e8400-e29b-41d4-a716-446655440001'
  name: "kit-management-service";
  version: "1.0.0";
  port: 3003;

  specialization: "cannabis_industry_equipment_management";

  capabilities: {
    cannabisSpecificEquipment: true;
    complianceTracking: true;
    inventoryManagement: true;
    shippingLogistics: true;
    qualityAssurance: true;
  };

  eventBus: {
    publishTopics: [
      "kit.assigned",
      "kit.shipped",
      "kit.delivered",
      "kit.returned",
      "inventory.updated",
      "equipment.maintenance_due",
    ];
    subscribeTopics: [
      "booking.created",
      "booking.cancelled",
      "staff.assigned",
      "location.updated",
    ];
  };
}
```

#### Cannabis Equipment Management

```typescript
interface CannabisKitTemplates {
  productDemoKit: CannabisKitTemplate;
  dispensaryOpeningKit: CannabisKitTemplate;
  complianceTrainingKit: CannabisKitTemplate;
  brandActivationKit: CannabisKitTemplate;
  tradeShowKit: CannabisKitTemplate;
}

interface CannabisKitTemplate {
  id: string; // UUID
  name: string;
  cannabisBookingTypes: CannabisBookingType[];

  equipment: {
    cannabisSpecific: CannabisSpecificEquipment[];
    generalEvent: GeneralEventEquipment[];
    compliance: ComplianceEquipment[];
    safety: SafetyEquipment[];
  };

  shippingRequirements: {
    specialHandling: boolean;
    temperatureControlled: boolean;
    secureTransport: boolean;
    trackingRequired: boolean;
    insuranceRequired: boolean;
  };

  complianceRequirements: {
    stateSpecific: boolean;
    calibrationRequired: boolean;
    certificationDocuments: string[];
    auditTrailRequired: boolean;
  };
}

interface CannabisSpecificEquipment {
  id: string; // UUID
  name: string;
  category: CannabisEquipmentCategory;

  specifications: {
    model: string;
    manufacturer: string;
    serialNumber: string;
    calibrationDate?: Date;
    certificationNumber?: string;
  };

  complianceData: {
    approvedStates: string[];
    certificationLevel: string;
    lastInspection: Date;
    nextInspectionDue: Date;
  };

  condition: EquipmentCondition;
  location: EquipmentLocation;
  availability: EquipmentAvailability;
}

enum CannabisEquipmentCategory {
  PRECISION_SCALES = "precision_scales",
  TESTING_EQUIPMENT = "testing_equipment",
  STORAGE_CONTAINERS = "storage_containers",
  DISPLAY_CASES = "display_cases",
  SECURITY_EQUIPMENT = "security_equipment",
  POINT_OF_SALE = "point_of_sale",
  INVENTORY_TRACKING = "inventory_tracking",
  AGE_VERIFICATION = "age_verification",
  PACKAGING_EQUIPMENT = "packaging_equipment",
  EXTRACTION_TOOLS = "extraction_tools",
}

enum EquipmentCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  NEEDS_MAINTENANCE = "needs_maintenance",
  OUT_OF_SERVICE = "out_of_service",
}
```

### 4. Compliance Management Service

#### Service Definition

```typescript
interface ComplianceManagementService {
  serviceId: string; // UUID: 'cms-880e8400-e29b-41d4-a716-446655440001'
  name: "compliance-management-service";
  version: "1.0.0";
  port: 3004;

  specialization: "cannabis_industry_regulatory_compliance";

  regulatoryScope: {
    federalCompliance: false; // Cannabis remains federally illegal
    stateCompliance: true;
    municipalCompliance: true;
    industryStandards: true;
  };

  complianceAreas: [
    "licensing_verification",
    "age_verification",
    "product_tracking",
    "inventory_management",
    "consumption_limits",
    "security_requirements",
    "advertising_restrictions",
    "lab_testing_requirements",
    "packaging_labeling",
    "waste_disposal",
  ];

  eventBus: {
    publishTopics: [
      "compliance.checked",
      "compliance.violation_detected",
      "compliance.audit_completed",
      "license.expiring",
      "regulation.updated",
    ];
    subscribeTopics: [
      "booking.created",
      "booking.status_changed",
      "staff.assigned",
      "kit.assigned",
      "location.updated",
    ];
  };
}
```

#### State-Specific Compliance Engine

```typescript
interface StateComplianceEngine {
  checkBookingCompliance(
    booking: Booking,
    state: string,
  ): Promise<ComplianceCheckResult>;

  getStateRequirements(state: string): Promise<StateComplianceRequirements>;

  validateLicenses(
    organizationId: string,
    state: string,
    bookingType: CannabisBookingType,
  ): Promise<LicenseValidationResult>;

  checkAgeVerificationRequirements(
    booking: Booking,
    state: string,
  ): Promise<AgeVerificationRequirements>;
}

interface StateComplianceRequirements {
  state: string;
  lastUpdated: Date;

  licensing: {
    businessLicense: LicenseRequirement;
    cannabisLicense: LicenseRequirement;
    eventPermit?: LicenseRequirement;
    municipalPermit?: LicenseRequirement;
  };

  operationalRequirements: {
    ageVerification: AgeVerificationRule;
    consumptionLimits: ConsumptionLimitRule;
    productTracking: ProductTrackingRule;
    securityRequirements: SecurityRequirementRule;
    labTesting: LabTestingRule;
  };

  eventSpecificRules: {
    publicEvents: PublicEventRule;
    privateEvents: PrivateEventRule;
    educationalEvents: EducationalEventRule;
    samplingEvents: SamplingEventRule;
  };

  penalties: {
    minorViolations: PenaltyStructure;
    majorViolations: PenaltyStructure;
    criminalOffenses: PenaltyStructure;
  };
}

interface LicenseRequirement {
  required: boolean;
  licenseTypes: string[];
  renewalPeriod: number; // months
  gracePeriod: number; // days
  reciprocity: string[]; // states that recognize this license
}

interface AgeVerificationRule {
  minimumAge: number;
  verificationMethods: AgeVerificationMethod[];
  documentRequirements: string[];
  recordKeeping: {
    required: boolean;
    retentionPeriod: number; // months
  };
}

enum AgeVerificationMethod {
  GOVERNMENT_ID = "government_id",
  PASSPORT = "passport",
  MILITARY_ID = "military_id",
  ENHANCED_ID = "enhanced_id",
  DIGITAL_VERIFICATION = "digital_verification",
}
```

### 5. Geographic Management Service

#### Service Definition

```typescript
interface GeographicManagementService {
  serviceId: string; // UUID: 'gms-990e8400-e29b-41d4-a716-446655440001'
  name: "geographic-management-service";
  version: "1.0.0";
  port: 3005;

  capabilities: {
    multiStateOperations: true;
    regionalFiltering: true;
    complianceZoneMapping: true;
    staffTerritoryManagement: true;
    costOptimization: true;
  };

  geographicScope: {
    operatingStates: [
      "california",
      "colorado",
      "washington",
      "oregon",
      "nevada",
      "arizona",
      "new_mexico",
      "illinois",
      "michigan",
      "massachusetts",
      "maine",
      "vermont",
      "new_york",
      "new_jersey",
      "connecticut",
      "rhode_island",
      "maryland",
      "delaware",
      "virginia",
      "florida",
    ];

    plannedExpansion: [
      "texas",
      "pennsylvania",
      "ohio",
      "georgia",
      "north_carolina",
    ];
  };

  eventBus: {
    publishTopics: [
      "location.updated",
      "region.staff_assigned",
      "compliance_zone.updated",
      "territory.optimized",
    ];
    subscribeTopics: [
      "booking.created",
      "staff.assigned",
      "compliance.regulation_updated",
    ];
  };
}
```

#### Regional Organization System

```typescript
interface RegionalOrganization {
  getBookingsByRegion(
    organizationId: string,
    filters: RegionalFilters,
  ): Promise<RegionalBookingData>;

  optimizeStaffAssignment(
    bookings: Booking[],
    availableStaff: StaffProfile[],
  ): Promise<OptimizedAssignmentPlan>;

  calculateRegionalMetrics(
    region: string,
    timeframe: TimeFrame,
  ): Promise<RegionalMetrics>;
}

interface RegionalFilters {
  states?: string[];
  regions?: string[];
  cities?: string[];
  complianceZones?: string[];
  cannabisLegalityStatus?: CannabisLegalityStatus[];
  operationalComplexity?: OperationalComplexity[];
}

enum CannabisLegalityStatus {
  FULLY_LEGAL = "fully_legal",
  MEDICAL_ONLY = "medical_only",
  DECRIMINALIZED = "decriminalized",
  CBD_ONLY = "cbd_only",
  ILLEGAL = "illegal",
}

enum OperationalComplexity {
  LOW = "low", // Well-established markets
  MEDIUM = "medium", // Developing markets
  HIGH = "high", // New or complex regulations
  VERY_HIGH = "very_high", // Pilot programs or changing laws
}

interface RegionalMetrics {
  regionId: string; // UUID
  regionName: string;
  timeframe: TimeFrame;

  bookingMetrics: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageBookingValue: number;
    totalRevenue: number;
  };

  staffMetrics: {
    totalStaff: number;
    availableStaff: number;
    utilizationRate: number;
    averageRating: number;
    certificationCompliance: number;
  };

  complianceMetrics: {
    complianceScore: number;
    violationsCount: number;
    auditsPassed: number;
    licenseExpirations: number;
  };

  operationalMetrics: {
    averageResponseTime: number;
    customerSatisfaction: number;
    costPerBooking: number;
    profitMargin: number;
  };
}
```

### 6. Real-time Communication Service

#### Service Definition

```typescript
interface RealTimeCommunicationService {
  serviceId: string; // UUID: 'rtcs-aa0e8400-e29b-41d4-a716-446655440001'
  name: "realtime-communication-service";
  version: "1.0.0";
  port: 3006;

  communicationChannels: {
    websockets: "socket.io";
    pushNotifications: "firebase_cloud_messaging";
    sms: "twilio";
    email: "sendgrid";
    inAppMessaging: "custom_implementation";
  };

  realTimeFeatures: {
    liveBookingUpdates: true;
    staffLocationTracking: true;
    emergencyCommunication: true;
    complianceAlerts: true;
    clientNotifications: true;
  };

  eventBus: {
    publishTopics: [
      "notification.sent",
      "message.delivered",
      "alert.triggered",
      "communication.failed",
    ];
    subscribeTopics: [
      "booking.status_changed",
      "staff.checked_in",
      "staff.checked_out",
      "compliance.violation_detected",
      "emergency.triggered",
    ];
  };
}
```

## Inter-Service Communication

### Event Bus Architecture

```typescript
interface EventBusArchitecture {
  infrastructure: "apache_kafka" | "redis_streams" | "rabbitmq";

  eventRouting: {
    bookingEvents: [
      "booking-management",
      "staff-assignment",
      "kit-management",
      "compliance",
    ];
    staffEvents: [
      "staff-assignment",
      "booking-management",
      "geographic",
      "communication",
    ];
    complianceEvents: [
      "compliance",
      "booking-management",
      "geographic",
      "communication",
    ];
    locationEvents: [
      "geographic",
      "booking-management",
      "staff-assignment",
      "compliance",
    ];
  };

  eventPersistence: {
    retentionPeriod: "90_days";
    replayCapability: true;
    auditTrail: true;
    eventSourcing: true;
  };

  errorHandling: {
    retryPolicy: "exponential_backoff";
    deadLetterQueue: true;
    circuitBreaker: true;
    timeoutHandling: true;
  };
}

// Event Schema Validation
interface EventSchema {
  eventId: string; // UUID
  eventType: string;
  source: string; // Service name
  timestamp: string; // ISO 8601
  version: string;

  // Cannabis industry specific fields
  cannabisContext?: {
    complianceRelevant: boolean;
    auditRequired: boolean;
    stateSpecific: boolean;
    regulatoryImpact: RegulatoryImpact;
  };

  data: any; // Event-specific payload
  metadata: EventMetadata;
}

enum RegulatoryImpact {
  NONE = "none",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}
```

### API Gateway Configuration

```typescript
interface APIGatewayConfiguration {
  gatewayService: "kong" | "nginx" | "traefik";

  routing: {
    "/api/v1/bookings/*": "booking-management-service:3001";
    "/api/v1/staff/*": "staff-assignment-service:3002";
    "/api/v1/kits/*": "kit-management-service:3003";
    "/api/v1/compliance/*": "compliance-management-service:3004";
    "/api/v1/regions/*": "geographic-management-service:3005";
    "/api/v1/notifications/*": "realtime-communication-service:3006";
  };

  middleware: {
    authentication: "jwt_validation";
    authorization: "rbac_enforcement";
    rateLimit: "sliding_window";
    logging: "structured_json";
    monitoring: "prometheus_metrics";
    caching: "redis_cache";
  };

  cannabisCompliance: {
    auditLogging: true;
    requestTracking: true;
    dataClassification: true;
    geoBlocking: true; // Block requests from non-legal states
  };
}
```

## Data Consistency & Transactions

### Saga Pattern Implementation

```typescript
interface BookingCreationSaga {
  sagaId: string; // UUID
  bookingId: string; // UUID

  steps: [
    "validate_booking_request",
    "check_compliance_requirements",
    "verify_location_permissions",
    "calculate_cost_estimate",
    "create_booking_record",
    "initialize_approval_workflow",
    "notify_stakeholders",
  ];

  compensations: {
    create_booking_record: "delete_booking_record";
    initialize_approval_workflow: "cancel_approval_workflow";
    notify_stakeholders: "send_cancellation_notifications";
  };

  retryPolicy: {
    maxRetries: 3;
    backoffStrategy: "exponential";
    failureHandling: "compensation_cascade";
  };
}

interface StaffAssignmentSaga {
  sagaId: string; // UUID
  bookingId: string; // UUID

  steps: [
    "validate_staff_requirements",
    "check_staff_availability",
    "verify_cannabis_certifications",
    "calculate_assignment_costs",
    "create_assignment_records",
    "update_staff_calendars",
    "notify_assigned_staff",
    "update_booking_status",
  ];

  compensations: {
    create_assignment_records: "remove_assignment_records";
    update_staff_calendars: "restore_calendar_availability";
    notify_assigned_staff: "send_assignment_cancellation";
    update_booking_status: "revert_booking_status";
  };
}
```

This comprehensive microservices architecture provides the foundation for a scalable, compliant, and efficient cannabis booking management platform with authentic data integration and event-driven communication patterns.
