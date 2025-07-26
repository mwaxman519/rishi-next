# Cannabis Booking Management - Implementation Guide

## Core Implementation Architecture

### Database Schema Implementation

#### Cannabis-Specific Tables

```sql
-- Bookings table with cannabis industry extensions
CREATE TABLE cannabis_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  client_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),

  -- Cannabis-specific fields
  cannabis_booking_type cannabis_booking_type_enum NOT NULL,
  cannabis_license_id UUID REFERENCES cannabis_licenses(id),
  state_compliance_status compliance_status_enum DEFAULT 'pending',
  municipal_compliance_status compliance_status_enum DEFAULT 'pending',

  -- Core booking data
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status booking_status_enum NOT NULL DEFAULT 'requested',
  stage booking_stage_enum NOT NULL DEFAULT 'stage_1_request',

  -- Geographic data
  location_id UUID NOT NULL REFERENCES locations(id),
  state VARCHAR(50) NOT NULL,
  region VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,

  -- Timing
  start_date_time TIMESTAMPTZ NOT NULL,
  end_date_time TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(50) NOT NULL,

  -- Financial
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  budget_approved BOOLEAN DEFAULT FALSE,
  budget_approved_by UUID REFERENCES users(id),
  budget_approved_at TIMESTAMPTZ,

  -- Requirements
  estimated_attendees INTEGER,
  age_verification_required BOOLEAN DEFAULT TRUE,
  consumption_allowed BOOLEAN DEFAULT FALSE,
  medical_only BOOLEAN DEFAULT FALSE,

  -- Compliance tracking
  compliance_notes TEXT,
  regulatory_requirements JSONB,
  audit_trail JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT valid_dates CHECK (end_date_time > start_date_time),
  CONSTRAINT valid_attendees CHECK (estimated_attendees > 0)
);

-- Cannabis products table
CREATE TABLE cannabis_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category cannabis_product_category_enum NOT NULL,
  subcategory VARCHAR(100),

  -- Potency information
  thc_percentage DECIMAL(5,2),
  cbd_percentage DECIMAL(5,2),
  total_cannabinoids DECIMAL(5,2),

  -- Product details
  strain_name VARCHAR(255),
  strain_type strain_type_enum,
  brand VARCHAR(255),
  manufacturer VARCHAR(255),

  -- Compliance data
  batch_number VARCHAR(100),
  lab_tested BOOLEAN DEFAULT FALSE,
  lab_results_id UUID REFERENCES lab_test_results(id),
  state_tracking_id VARCHAR(100),

  -- Regulatory
  approved_states TEXT[] DEFAULT '{}',
  medical_use_approved BOOLEAN DEFAULT FALSE,
  recreational_use_approved BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cannabis licenses table
CREATE TABLE cannabis_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),

  -- License information
  license_number VARCHAR(100) NOT NULL,
  license_type cannabis_license_type_enum NOT NULL,
  issuing_authority VARCHAR(255) NOT NULL,
  state VARCHAR(50) NOT NULL,
  municipality VARCHAR(100),

  -- Status and dates
  status license_status_enum NOT NULL DEFAULT 'active',
  issue_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  renewal_date DATE,

  -- License details
  scope_of_operations TEXT[],
  restrictions TEXT[],
  conditions TEXT[],

  -- Compliance
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  last_inspection_date DATE,
  next_inspection_due DATE,
  violations_count INTEGER DEFAULT 0,

  -- Documentation
  license_document_url TEXT,
  supporting_documents JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(license_number, state)
);

-- Booking cannabis products junction table
CREATE TABLE booking_cannabis_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES cannabis_bookings(id),
  product_id UUID NOT NULL REFERENCES cannabis_products(id),

  -- Quantity and usage
  quantity_planned DECIMAL(10,3),
  quantity_actual DECIMAL(10,3),
  unit_type unit_type_enum NOT NULL,

  -- Purpose and compliance
  usage_purpose usage_purpose_enum NOT NULL,
  sampling_allowed BOOLEAN DEFAULT FALSE,
  display_only BOOLEAN DEFAULT TRUE,

  -- Tracking
  state_tracking_required BOOLEAN DEFAULT TRUE,
  tracking_manifest_id VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time check-ins table
CREATE TABLE staff_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES cannabis_bookings(id),
  staff_assignment_id UUID NOT NULL REFERENCES booking_staff_assignments(id),
  staff_id UUID NOT NULL REFERENCES users(id),

  -- Check-in data
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_in_location POINT NOT NULL,
  check_in_accuracy_meters DECIMAL(8,2),
  verification_method check_in_method_enum NOT NULL,

  -- Check-out data
  check_out_time TIMESTAMPTZ,
  check_out_location POINT,
  check_out_accuracy_meters DECIMAL(8,2),

  -- Cannabis-specific checks
  cannabis_certification_verified BOOLEAN DEFAULT FALSE,
  age_verification_completed BOOLEAN DEFAULT FALSE,
  compliance_briefing_completed BOOLEAN DEFAULT FALSE,

  -- Equipment and materials
  equipment_received JSONB DEFAULT '[]'::jsonb,
  equipment_returned JSONB DEFAULT '[]'::jsonb,
  cannabis_products_received JSONB DEFAULT '[]'::jsonb,
  cannabis_products_returned JSONB DEFAULT '[]'::jsonb,

  -- Notes and issues
  check_in_notes TEXT,
  check_out_notes TEXT,
  issues_reported JSONB DEFAULT '[]'::jsonb,

  -- Photo documentation
  check_in_photos JSONB DEFAULT '[]'::jsonb,
  check_out_photos JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cannabis compliance checks table
CREATE TABLE cannabis_compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES cannabis_bookings(id),
  check_type compliance_check_type_enum NOT NULL,

  -- Check details
  checked_by UUID NOT NULL REFERENCES users(id),
  check_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status compliance_status_enum NOT NULL,

  -- State-specific data
  state VARCHAR(50) NOT NULL,
  applicable_regulations JSONB,
  requirements_met JSONB,
  violations_found JSONB DEFAULT '[]'::jsonb,

  -- Documentation
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  corrective_actions JSONB DEFAULT '[]'::jsonb,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMPTZ,

  -- Audit trail
  automated_check BOOLEAN DEFAULT FALSE,
  manual_override BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  override_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enums for cannabis industry
CREATE TYPE cannabis_booking_type_enum AS ENUM (
  'product_demo',
  'product_promotion',
  'private_party',
  'staff_training',
  'compliance_event',
  'brand_activation',
  'educational_session',
  'dispensary_opening',
  'trade_show',
  'extraction_demo',
  'cultivation_tour',
  'medical_consultation'
);

CREATE TYPE cannabis_product_category_enum AS ENUM (
  'flower',
  'edibles',
  'concentrates',
  'topicals',
  'beverages',
  'accessories',
  'seeds',
  'clones',
  'pre_rolls',
  'vaporizers',
  'tinctures',
  'capsules'
);

CREATE TYPE strain_type_enum AS ENUM (
  'sativa',
  'indica',
  'hybrid',
  'ruderalis',
  'unknown'
);

CREATE TYPE cannabis_license_type_enum AS ENUM (
  'cultivation',
  'manufacturing',
  'dispensary',
  'testing_laboratory',
  'distribution',
  'delivery',
  'consumption_lounge',
  'event_organizer',
  'research',
  'hemp_processor'
);

CREATE TYPE license_status_enum AS ENUM (
  'active',
  'expired',
  'suspended',
  'revoked',
  'pending_renewal',
  'under_review'
);

CREATE TYPE compliance_status_enum AS ENUM (
  'compliant',
  'non_compliant',
  'pending',
  'under_review',
  'requires_action',
  'exempt'
);

CREATE TYPE check_in_method_enum AS ENUM (
  'gps_verified',
  'qr_code_scan',
  'manual_entry',
  'biometric',
  'nfc_tag',
  'bluetooth_beacon'
);

CREATE TYPE compliance_check_type_enum AS ENUM (
  'license_verification',
  'age_verification_system',
  'product_tracking',
  'inventory_management',
  'security_compliance',
  'advertising_compliance',
  'packaging_labeling',
  'waste_disposal',
  'consumption_area',
  'transportation'
);

CREATE TYPE unit_type_enum AS ENUM (
  'grams',
  'ounces',
  'pounds',
  'kilograms',
  'pieces',
  'milliliters',
  'liters',
  'units'
);

CREATE TYPE usage_purpose_enum AS ENUM (
  'display_only',
  'sampling',
  'demonstration',
  'education',
  'training',
  'research',
  'compliance_testing'
);
```

### Service Implementation

#### Booking Management Service

```typescript
// booking-management-service/src/services/CannabisBookingService.ts
import { EventPublisher } from "../events/EventPublisher";
import { ComplianceChecker } from "./ComplianceChecker";
import { StateRegulationEngine } from "./StateRegulationEngine";

export class CannabisBookingService {
  constructor(
    private eventPublisher: EventPublisher,
    private complianceChecker: ComplianceChecker,
    private stateRegulationEngine: StateRegulationEngine,
  ) {}

  async createCannabisBooking(
    request: CreateCannabisBookingRequest,
  ): Promise<CannabisBooking> {
    // Validate cannabis-specific requirements
    await this.validateCannabisRequirements(request);

    // Check state compliance
    const complianceResult =
      await this.complianceChecker.checkBookingCompliance(
        request.state,
        request.cannabisBookingType,
        request.cannabisProducts,
      );

    if (!complianceResult.isCompliant) {
      throw new ComplianceError(
        "Booking does not meet state requirements",
        complianceResult,
      );
    }

    // Create booking with UUID
    const booking: CannabisBooking = {
      id: generateUUID(),
      organizationId: request.organizationId,
      clientId: request.clientId,
      createdBy: request.userId,
      updatedBy: request.userId,

      cannabisBookingType: request.cannabisBookingType,
      cannabisLicenseId: request.cannabisLicenseId,
      stateComplianceStatus: "pending",
      municipalComplianceStatus: "pending",

      title: request.title,
      description: request.description,
      status: "requested",
      stage: "stage_1_request",

      locationId: request.locationId,
      state: request.state,
      region: request.region,
      city: request.city,

      startDateTime: request.startDateTime,
      endDateTime: request.endDateTime,
      timezone: request.timezone,

      estimatedCost: request.estimatedCost,
      estimatedAttendees: request.estimatedAttendees,
      ageVerificationRequired: request.ageVerificationRequired ?? true,
      consumptionAllowed: request.consumptionAllowed ?? false,
      medicalOnly: request.medicalOnly ?? false,

      regulatoryRequirements: complianceResult.requirements,
      auditTrail: [
        {
          action: "booking_created",
          timestamp: new Date().toISOString(),
          userId: request.userId,
          details: { complianceResult },
        },
      ],

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    const savedBooking = await this.bookingRepository.save(booking);

    // Publish creation event
    await this.eventPublisher.publishBookingCreated(savedBooking);

    // Schedule initial compliance checks
    await this.scheduleComplianceChecks(savedBooking);

    return savedBooking;
  }

  async updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    newStage: BookingStage,
    userId: string,
    metadata?: BookingUpdateMetadata,
  ): Promise<CannabisBooking> {
    const booking = await this.getBookingById(bookingId);

    // Validate status transition
    await this.validateStatusTransition(booking, newStatus, newStage);

    // Cannabis-specific status validations
    await this.validateCannabisStatusTransition(booking, newStatus, newStage);

    const previousStatus = booking.status;
    const previousStage = booking.stage;

    // Update booking
    booking.status = newStatus;
    booking.stage = newStage;
    booking.updatedBy = userId;
    booking.updatedAt = new Date();

    // Add to audit trail
    booking.auditTrail.push({
      action: "status_updated",
      timestamp: new Date().toISOString(),
      userId,
      details: {
        previousStatus,
        newStatus,
        previousStage,
        newStage,
        metadata,
      },
    });

    // Save changes
    const updatedBooking = await this.bookingRepository.save(booking);

    // Publish status change event
    await this.eventPublisher.publishStatusChanged(
      updatedBooking,
      previousStatus,
      newStatus,
      previousStage,
      newStage,
      userId,
    );

    // Trigger stage-specific actions
    await this.handleStageTransition(updatedBooking, newStage);

    return updatedBooking;
  }

  private async validateCannabisRequirements(
    request: CreateCannabisBookingRequest,
  ): Promise<void> {
    // Validate cannabis license
    if (request.cannabisLicenseId) {
      const license = await this.validateCannabisLicense(
        request.cannabisLicenseId,
        request.state,
        request.cannabisBookingType,
      );

      if (!license.isValid) {
        throw new ValidationError(
          "Invalid cannabis license for booking type and state",
        );
      }
    }

    // Validate cannabis products
    if (request.cannabisProducts?.length > 0) {
      for (const product of request.cannabisProducts) {
        await this.validateCannabisProduct(product, request.state);
      }
    }

    // Validate age requirements
    if (request.ageVerificationRequired && request.estimatedAttendees > 0) {
      const ageRequirements =
        await this.stateRegulationEngine.getAgeRequirements(request.state);
      // Additional age validation logic
    }
  }

  private async scheduleComplianceChecks(
    booking: CannabisBooking,
  ): Promise<void> {
    const stateRequirements =
      await this.stateRegulationEngine.getComplianceRequirements(
        booking.state,
        booking.cannabisBookingType,
      );

    for (const requirement of stateRequirements) {
      await this.complianceChecker.scheduleCheck({
        bookingId: booking.id,
        checkType: requirement.type,
        scheduledFor: requirement.timing,
        automated: requirement.canBeAutomated,
      });
    }
  }

  private async handleStageTransition(
    booking: CannabisBooking,
    newStage: BookingStage,
  ): Promise<void> {
    switch (newStage) {
      case "stage_2_review":
        await this.initiateComplianceReview(booking);
        break;

      case "stage_3_approval":
        await this.initiateApprovalWorkflow(booking);
        break;

      case "stage_4_assignment":
        await this.initiateCannabisStaffAssignment(booking);
        break;

      case "stage_5_preparation":
        await this.initiateCannabisKitAssignment(booking);
        break;

      case "stage_6_execution":
        await this.enableRealTimeTracking(booking);
        break;

      case "stage_7_completion":
        await this.initiateDataCollection(booking);
        break;

      case "stage_8_finalized":
        await this.finalizeBookingDocumentation(booking);
        break;
    }
  }
}
```

#### Real-time Tracking Implementation

```typescript
// real-time-tracking/src/services/RealTimeTrackingService.ts
import { WebSocketManager } from "../websocket/WebSocketManager";
import { GPSVerificationService } from "./GPSVerificationService";
import { ComplianceMonitor } from "./ComplianceMonitor";

export class RealTimeTrackingService {
  constructor(
    private wsManager: WebSocketManager,
    private gpsVerification: GPSVerificationService,
    private complianceMonitor: ComplianceMonitor,
  ) {}

  async processStaffCheckIn(
    request: StaffCheckInRequest,
  ): Promise<StaffCheckInResult> {
    // Verify GPS location
    const locationVerification = await this.gpsVerification.verifyLocation(
      request.gpsCoordinates,
      request.bookingLocationId,
      request.accuracyMeters,
    );

    if (!locationVerification.isValid) {
      throw new LocationVerificationError(
        "GPS location does not match booking location",
      );
    }

    // Get booking details for cannabis compliance
    const booking = await this.getBookingDetails(request.bookingId);

    // Create check-in record
    const checkIn: StaffCheckIn = {
      id: generateUUID(),
      bookingId: request.bookingId,
      staffAssignmentId: request.staffAssignmentId,
      staffId: request.staffId,

      checkInTime: new Date(),
      checkInLocation: {
        latitude: request.gpsCoordinates.latitude,
        longitude: request.gpsCoordinates.longitude,
      },
      checkInAccuracyMeters: request.accuracyMeters,
      verificationMethod: request.verificationMethod,

      // Cannabis-specific verifications
      cannabisCertificationVerified:
        await this.verifyCannabisStaffCertification(
          request.staffId,
          booking.state,
          booking.cannabisBookingType,
        ),
      ageVerificationCompleted: request.ageVerificationCompleted ?? false,
      complianceBriefingCompleted: request.complianceBriefingCompleted ?? false,

      equipmentReceived: request.equipmentReceived ?? [],
      cannabisProductsReceived: request.cannabisProductsReceived ?? [],

      checkInNotes: request.notes,
      checkInPhotos: request.photos ?? [],

      createdAt: new Date(),
    };

    // Save check-in
    const savedCheckIn = await this.checkInRepository.save(checkIn);

    // Update booking status if this is the first check-in
    await this.updateBookingStatusOnCheckIn(booking, savedCheckIn);

    // Send real-time updates
    await this.broadcastCheckInUpdate(booking, savedCheckIn);

    // Start compliance monitoring
    await this.complianceMonitor.startMonitoring(booking, savedCheckIn);

    // Publish check-in event
    await this.eventPublisher.publishStaffCheckIn(savedCheckIn);

    return {
      checkInId: savedCheckIn.id,
      success: true,
      locationVerified: locationVerification.isValid,
      complianceStatus: savedCheckIn.cannabisCertificationVerified
        ? "compliant"
        : "requires_attention",
      nextSteps: await this.getNextStepsForStaff(booking, savedCheckIn),
    };
  }

  async processStaffCheckOut(
    request: StaffCheckOutRequest,
  ): Promise<StaffCheckOutResult> {
    // Get original check-in
    const checkIn = await this.getCheckInById(request.checkInId);

    // Verify GPS location for check-out
    const locationVerification = await this.gpsVerification.verifyLocation(
      request.gpsCoordinates,
      checkIn.bookingId,
      request.accuracyMeters,
    );

    // Update check-in record with check-out data
    checkIn.checkOutTime = new Date();
    checkIn.checkOutLocation = {
      latitude: request.gpsCoordinates.latitude,
      longitude: request.gpsCoordinates.longitude,
    };
    checkIn.checkOutAccuracyMeters = request.accuracyMeters;
    checkIn.equipmentReturned = request.equipmentReturned ?? [];
    checkIn.cannabisProductsReturned = request.cannabisProductsReturned ?? [];
    checkIn.checkOutNotes = request.notes;
    checkIn.checkOutPhotos = request.photos ?? [];
    checkIn.issuesReported = request.issuesReported ?? [];

    // Cannabis-specific check-out validations
    await this.validateCannabisProductReturn(checkIn);
    await this.validateEquipmentReturn(checkIn);

    // Save updated check-in
    const updatedCheckIn = await this.checkInRepository.save(checkIn);

    // Calculate work duration and performance metrics
    const workSession = await this.calculateWorkSession(updatedCheckIn);

    // Update booking status if all staff have checked out
    await this.updateBookingStatusOnCheckOut(
      updatedCheckIn.bookingId,
      updatedCheckIn,
    );

    // Send real-time updates
    await this.broadcastCheckOutUpdate(updatedCheckIn, workSession);

    // Stop compliance monitoring for this staff member
    await this.complianceMonitor.stopMonitoring(updatedCheckIn);

    // Publish check-out event
    await this.eventPublisher.publishStaffCheckOut(updatedCheckIn, workSession);

    return {
      checkOutId: updatedCheckIn.id,
      success: true,
      workDuration: workSession.duration,
      performanceMetrics: workSession.metrics,
      complianceStatus: "compliant",
      issuesReported: updatedCheckIn.issuesReported.length,
    };
  }

  private async broadcastCheckInUpdate(
    booking: CannabisBooking,
    checkIn: StaffCheckIn,
  ): Promise<void> {
    const update: RealTimeUpdate = {
      id: generateUUID(),
      type: "staff_check_in",
      bookingId: booking.id,
      timestamp: new Date().toISOString(),
      data: {
        staffId: checkIn.staffId,
        staffName: await this.getStaffName(checkIn.staffId),
        checkInTime: checkIn.checkInTime,
        location: checkIn.checkInLocation,
        complianceStatus: checkIn.cannabisCertificationVerified
          ? "compliant"
          : "pending",
      },
    };

    // Send to all relevant parties
    await this.wsManager.broadcastToBookingStakeholders(booking.id, update);
    await this.wsManager.broadcastToOrganization(
      booking.organizationId,
      update,
    );

    // Send mobile push notification
    await this.notificationService.sendPushNotification({
      userId: booking.createdBy,
      title: "Staff Check-in",
      body: `Staff member has checked in to ${booking.title}`,
      data: { bookingId: booking.id, checkInId: checkIn.id },
    });
  }

  private async validateCannabisProductReturn(
    checkIn: StaffCheckIn,
  ): Promise<void> {
    const receivedProducts = checkIn.cannabisProductsReceived || [];
    const returnedProducts = checkIn.cannabisProductsReturned || [];

    // Ensure all cannabis products are accounted for
    for (const received of receivedProducts) {
      const returned = returnedProducts.find(
        (r) => r.productId === received.productId,
      );

      if (!returned) {
        throw new ComplianceError(
          `Cannabis product ${received.productId} was not returned`,
          { checkInId: checkIn.id, productId: received.productId },
        );
      }

      // Validate quantities match (accounting for sampling/consumption if allowed)
      if (returned.quantity > received.quantity) {
        throw new ComplianceError(
          `Returned quantity exceeds received quantity for product ${received.productId}`,
          { checkInId: checkIn.id, productId: received.productId },
        );
      }
    }
  }
}
```

#### Cannabis Compliance Engine

```typescript
// compliance-engine/src/services/StateComplianceEngine.ts
export class StateComplianceEngine {
  private stateRegulations: Map<string, StateRegulations> = new Map();

  async checkBookingCompliance(
    booking: CannabisBooking,
  ): Promise<ComplianceCheckResult> {
    const stateRegs = await this.getStateRegulations(booking.state);
    const results: ComplianceCheck[] = [];

    // License verification
    const licenseCheck = await this.checkLicenseCompliance(booking, stateRegs);
    results.push(licenseCheck);

    // Age verification requirements
    const ageCheck = await this.checkAgeVerificationCompliance(
      booking,
      stateRegs,
    );
    results.push(ageCheck);

    // Product compliance
    if (booking.cannabisProducts?.length > 0) {
      const productCheck = await this.checkProductCompliance(
        booking,
        stateRegs,
      );
      results.push(productCheck);
    }

    // Location compliance
    const locationCheck = await this.checkLocationCompliance(
      booking,
      stateRegs,
    );
    results.push(locationCheck);

    // Event type compliance
    const eventTypeCheck = await this.checkEventTypeCompliance(
      booking,
      stateRegs,
    );
    results.push(eventTypeCheck);

    // Consumption compliance
    if (booking.consumptionAllowed) {
      const consumptionCheck = await this.checkConsumptionCompliance(
        booking,
        stateRegs,
      );
      results.push(consumptionCheck);
    }

    const overallCompliant = results.every(
      (check) => check.status === "compliant",
    );
    const criticalViolations = results.filter(
      (check) =>
        check.status === "non_compliant" && check.severity === "critical",
    );

    return {
      bookingId: booking.id,
      state: booking.state,
      overallStatus: overallCompliant ? "compliant" : "non_compliant",
      checks: results,
      criticalViolations,
      requiresManualReview: criticalViolations.length > 0,
      complianceScore: this.calculateComplianceScore(results),
      nextReviewDate: this.calculateNextReviewDate(booking, stateRegs),
      recommendations: this.generateComplianceRecommendations(results),
    };
  }

  private async getStateRegulations(state: string): Promise<StateRegulations> {
    if (!this.stateRegulations.has(state)) {
      const regulations = await this.loadStateRegulations(state);
      this.stateRegulations.set(state, regulations);
    }
    return this.stateRegulations.get(state)!;
  }

  private async loadStateRegulations(state: string): Promise<StateRegulations> {
    // Load from database or external API
    const regulations = await this.regulationsRepository.getByState(state);

    return {
      state,
      lastUpdated: regulations.lastUpdated,

      licensing: {
        businessLicenseRequired: regulations.licensing.businessLicenseRequired,
        cannabisLicenseRequired: regulations.licensing.cannabisLicenseRequired,
        eventPermitRequired: regulations.licensing.eventPermitRequired,
        municipalPermitRequired: regulations.licensing.municipalPermitRequired,
        validLicenseTypes: regulations.licensing.validLicenseTypes,
        reciprocityStates: regulations.licensing.reciprocityStates,
      },

      ageVerification: {
        minimumAge: regulations.ageVerification.minimumAge,
        acceptedIdTypes: regulations.ageVerification.acceptedIdTypes,
        verificationRequired: regulations.ageVerification.verificationRequired,
        recordKeepingRequired:
          regulations.ageVerification.recordKeepingRequired,
        retentionPeriodDays: regulations.ageVerification.retentionPeriodDays,
      },

      productRestrictions: {
        allowedCategories: regulations.productRestrictions.allowedCategories,
        thcLimits: regulations.productRestrictions.thcLimits,
        packagingRequirements:
          regulations.productRestrictions.packagingRequirements,
        labelingRequirements:
          regulations.productRestrictions.labelingRequirements,
        testingRequirements:
          regulations.productRestrictions.testingRequirements,
      },

      eventRestrictions: {
        publicEventsAllowed: regulations.eventRestrictions.publicEventsAllowed,
        privateEventsAllowed:
          regulations.eventRestrictions.privateEventsAllowed,
        consumptionAllowed: regulations.eventRestrictions.consumptionAllowed,
        samplingAllowed: regulations.eventRestrictions.samplingAllowed,
        locationRestrictions:
          regulations.eventRestrictions.locationRestrictions,
        timeRestrictions: regulations.eventRestrictions.timeRestrictions,
      },

      securityRequirements: {
        securityPersonnelRequired:
          regulations.securityRequirements.securityPersonnelRequired,
        videoSurveillanceRequired:
          regulations.securityRequirements.videoSurveillanceRequired,
        accessControlRequired:
          regulations.securityRequirements.accessControlRequired,
        alarmSystemRequired:
          regulations.securityRequirements.alarmSystemRequired,
      },

      penalties: {
        minorViolationFine: regulations.penalties.minorViolationFine,
        majorViolationFine: regulations.penalties.majorViolationFine,
        licenseRevocationOffenses:
          regulations.penalties.licenseRevocationOffenses,
        criminalOffenses: regulations.penalties.criminalOffenses,
      },
    };
  }

  private async checkLicenseCompliance(
    booking: CannabisBooking,
    stateRegs: StateRegulations,
  ): Promise<ComplianceCheck> {
    const violations: string[] = [];
    let status: ComplianceStatus = "compliant";

    // Business license check
    if (stateRegs.licensing.businessLicenseRequired) {
      const businessLicense = await this.getBusinessLicense(
        booking.organizationId,
        booking.state,
      );
      if (!businessLicense || businessLicense.status !== "active") {
        violations.push("Active business license required for cannabis events");
        status = "non_compliant";
      }
    }

    // Cannabis license check
    if (stateRegs.licensing.cannabisLicenseRequired) {
      const cannabisLicense = await this.getCannabisLicense(
        booking.cannabisLicenseId,
      );

      if (!cannabisLicense) {
        violations.push("Cannabis license required for this event type");
        status = "non_compliant";
      } else {
        // Check license validity
        if (cannabisLicense.status !== "active") {
          violations.push(
            `Cannabis license status is ${cannabisLicense.status}`,
          );
          status = "non_compliant";
        }

        // Check expiration
        if (cannabisLicense.expirationDate < booking.startDateTime) {
          violations.push("Cannabis license will be expired at time of event");
          status = "non_compliant";
        }

        // Check license type compatibility
        if (
          !this.isLicenseTypeValid(
            cannabisLicense.licenseType,
            booking.cannabisBookingType,
            stateRegs,
          )
        ) {
          violations.push(
            `License type ${cannabisLicense.licenseType} not valid for ${booking.cannabisBookingType}`,
          );
          status = "non_compliant";
        }
      }
    }

    return {
      id: generateUUID(),
      bookingId: booking.id,
      checkType: "license_verification",
      status,
      severity: status === "non_compliant" ? "critical" : "low",
      violations,
      checkedAt: new Date(),
      checkedBy: "system",
      automated: true,
    };
  }
}
```

This implementation provides a comprehensive foundation for cannabis industry booking management with full compliance tracking, real-time monitoring, and authentic data integration following microservices architecture patterns.
