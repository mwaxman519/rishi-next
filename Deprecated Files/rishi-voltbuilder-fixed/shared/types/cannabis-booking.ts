// Cannabis Booking Management Types - Following Architectural Pillars
// 1. Microservices: Clear service boundaries with UUID references
// 2. Event-Driven: All state changes publish events
// 3. UUID-Based: All entities use UUID for consistent identification

import { z } from "zod";

// Core Cannabis Booking Types (UUID-based entities)
export interface CannabisBooking {
  id: string; // UUID v4
  organizationId: string; // UUID
  clientId: string; // UUID
  locationId: string; // UUID
  createdBy: string; // UUID
  updatedBy: string; // UUID

  // Cannabis-specific metadata
  cannabisBookingType: CannabisBookingType;
  operationalRequirements: CannabisOperationalRequirements;

  // Core booking information
  title: string;
  description: string;
  status: BookingStatus;
  stage: BookingStage;
  priority: BookingPriority;

  // Location and geography
  state: string;
  region: string;
  city: string;

  // Timing
  startDateTime: Date;
  endDateTime: Date;
  timezone: string;

  // Cannabis products for demonstration/education
  cannabisProducts: CannabisProduct[];

  // Requirements
  estimatedAttendees: number;
  consumptionAllowed: boolean;
  ageVerificationRequired: boolean;

  // Staff and equipment assignments (UUID references)
  assignedStaff: string[]; // UUID[]
  assignedKits: string[]; // UUID[]

  // Financial
  estimatedCost: number;
  actualCost?: number;
  budgetApproved: boolean;

  // Activity and event tracking
  activities: BookingActivity[];
  statusHistory: BookingStatusChange[];
  operationalData: OperationalData;

  // Metadata
  tags: string[];
  customFields: Record<string, any>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Cannabis Booking Types (No compliance events)
export enum CannabisBookingType {
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

// Cannabis Product Information (Operational, not compliance)
export interface CannabisProduct {
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
    displayPurpose: string;
  };
  usageForEvent: {
    displayOnly: boolean;
    samplingAllowed: boolean;
    educationalPurpose: boolean;
    quantityPlanned: number;
    unitType: string;
  };
}

export enum CannabisProductCategory {
  FLOWER = "flower",
  EDIBLES = "edibles",
  CONCENTRATES = "concentrates",
  TOPICALS = "topicals",
  BEVERAGES = "beverages",
  ACCESSORIES = "accessories",
  SEEDS = "seeds",
  CLONES = "clones",
}

// Operational Requirements (Replaced compliance requirements)
export interface CannabisOperationalRequirements {
  id: string; // UUID
  bookingId: string; // UUID

  staffRequirements: {
    minimumExperience: CannabisExpertiseLevel;
    requiredSkills: CannabisStaffSkill[];
    totalStaffNeeded: number;
    specializations: string[];
  };

  equipmentRequirements: {
    cannabisSpecificEquipment: string[];
    generalEventEquipment: string[];
    secureStorageNeeded: boolean;
    displayMaterialsNeeded: boolean;
  };

  operationalChecks: {
    locationVerified: boolean;
    resourcesConfirmed: boolean;
    logisticsPlanned: boolean;
    emergencyContactsEstablished: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Cannabis Staff Skills and Expertise
export enum CannabisExpertiseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  EXPERIENCED = "experienced",
  EXPERT = "expert",
  SPECIALIST = "specialist",
}

export enum CannabisStaffSkill {
  PRODUCT_KNOWLEDGE = "product_knowledge",
  CUSTOMER_EDUCATION = "customer_education",
  SALES_EXPERIENCE = "sales_experience",
  EVENT_MANAGEMENT = "event_management",
  PUBLIC_SPEAKING = "public_speaking",
  INVENTORY_MANAGEMENT = "inventory_management",
  SECURITY_PROTOCOLS = "security_protocols",
  STRAIN_EXPERTISE = "strain_expertise",
}

// Booking Status and Stages (8-stage lifecycle)
export enum BookingStatus {
  DRAFT = "draft",
  REQUESTED = "requested",
  UNDER_REVIEW = "under_review",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  ON_HOLD = "on_hold",
}

export enum BookingStage {
  STAGE_1_REQUEST = "stage_1_request",
  STAGE_2_REVIEW = "stage_2_review",
  STAGE_3_APPROVAL = "stage_3_approval",
  STAGE_4_STAFF_ASSIGNMENT = "stage_4_staff_assignment",
  STAGE_5_KIT_ASSIGNMENT = "stage_5_kit_assignment",
  STAGE_6_EVENT_EXECUTION = "stage_6_event_execution",
  STAGE_7_CHECK_IN_OUT = "stage_7_check_in_out",
  STAGE_8_DATA_COLLECTION = "stage_8_data_collection",
}

export enum BookingPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

// Event-Driven Architecture: Booking Events
export interface BookingEvent {
  id: string; // UUID
  type: BookingEventType;
  bookingId: string; // UUID
  userId: string; // UUID
  organizationId: string; // UUID
  timestamp: Date;
  data: Record<string, any>;
  metadata: {
    source: string;
    version: string;
    correlationId: string; // UUID
  };
}

export enum BookingEventType {
  // Core booking lifecycle events
  BOOKING_CREATED = "booking.created",
  BOOKING_UPDATED = "booking.updated",
  BOOKING_STATUS_CHANGED = "booking.status_changed",
  BOOKING_STAGE_ADVANCED = "booking.stage_advanced",
  BOOKING_CANCELLED = "booking.cancelled",

  // Staff assignment events
  STAFF_ASSIGNED = "booking.staff_assigned",
  STAFF_UNASSIGNED = "booking.staff_unassigned",
  STAFF_CHECKED_IN = "booking.staff_checked_in",
  STAFF_CHECKED_OUT = "booking.staff_checked_out",

  // Equipment and kit events
  KIT_ASSIGNED = "booking.kit_assigned",
  KIT_DELIVERED = "booking.kit_delivered",
  KIT_RETURNED = "booking.kit_returned",

  // Operational events
  OPERATIONAL_CHECK_COMPLETED = "booking.operational_check_completed",
  LOCATION_VERIFIED = "booking.location_verified",
  EVENT_DATA_SUBMITTED = "booking.event_data_submitted",

  // Financial events
  BUDGET_APPROVED = "booking.budget_approved",
  COST_UPDATED = "booking.cost_updated",
  INVOICE_GENERATED = "booking.invoice_generated",
}

// Activity Tracking (Operational, not compliance)
export interface BookingActivity {
  id: string; // UUID
  bookingId: string; // UUID
  activityType: ActivityType;
  performedBy: string; // UUID
  timestamp: Date;
  description: string;
  metadata: Record<string, any>;
}

export enum ActivityType {
  STATUS_CHANGE = "status_change",
  STAFF_ASSIGNMENT = "staff_assignment",
  KIT_ASSIGNMENT = "kit_assignment",
  OPERATIONAL_CHECK = "operational_check",
  LOCATION_UPDATE = "location_update",
  COST_UPDATE = "cost_update",
  NOTE_ADDED = "note_added",
  FILE_UPLOADED = "file_uploaded",
}

// Operational Data Collection
export interface OperationalData {
  id: string; // UUID
  bookingId: string; // UUID

  eventMetrics: {
    actualAttendees: number;
    customerSatisfaction: number; // 1-10 scale
    leadsGenerated: number;
    salesConversions: number;
    productInterest: Record<string, number>;
  };

  staffPerformance: {
    staffRatings: Record<string, number>; // staff UUID -> rating
    punctuality: Record<string, boolean>;
    professionalism: Record<string, number>;
    cannabisKnowledge: Record<string, number>;
  };

  operationalEfficiency: {
    setupTime: number; // minutes
    eventDuration: number; // minutes
    cleanupTime: number; // minutes
    issuesReported: string[];
    resolutionTime: number[]; // minutes per issue
  };

  financialActuals: {
    actualCost: number;
    costBreakdown: Record<string, number>;
    revenueGenerated?: number;
    roi?: number;
  };

  collectedAt: Date;
  collectedBy: string; // UUID
}

// Status Change History
export interface BookingStatusChange {
  id: string; // UUID
  bookingId: string; // UUID
  fromStatus: BookingStatus;
  toStatus: BookingStatus;
  fromStage: BookingStage;
  toStage: BookingStage;
  changedBy: string; // UUID
  reason?: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

// Zod Schemas for Validation
export const CannabisBookingSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  clientId: z.string().uuid(),
  locationId: z.string().uuid(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid(),

  cannabisBookingType: z.nativeEnum(CannabisBookingType),

  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  status: z.nativeEnum(BookingStatus),
  stage: z.nativeEnum(BookingStage),
  priority: z.nativeEnum(BookingPriority),

  state: z.string().min(2).max(50),
  region: z.string().min(2).max(100),
  city: z.string().min(2).max(100),

  startDateTime: z.date(),
  endDateTime: z.date(),
  timezone: z.string(),

  estimatedAttendees: z.number().min(1).max(10000),
  consumptionAllowed: z.boolean(),
  ageVerificationRequired: z.boolean(),

  assignedStaff: z.array(z.string().uuid()),
  assignedKits: z.array(z.string().uuid()),

  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0).optional(),
  budgetApproved: z.boolean(),

  tags: z.array(z.string()),
  customFields: z.record(z.any()),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});

export const CreateCannabisBookingSchema = CannabisBookingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  actualCost: true,
  assignedStaff: true,
  assignedKits: true,
  activities: true,
  statusHistory: true,
  operationalData: true,
});

export type CreateCannabisBookingRequest = z.infer<
  typeof CreateCannabisBookingSchema
>;
export type CannabisBookingResponse = CannabisBooking;

// Microservices Communication Interfaces
export interface BookingServiceInterface {
  // Core CRUD operations
  createBooking(
    request: CreateCannabisBookingRequest,
  ): Promise<CannabisBooking>;
  getBookingById(id: string): Promise<CannabisBooking | null>;
  updateBookingStatus(
    id: string,
    status: BookingStatus,
    stage: BookingStage,
    userId: string,
  ): Promise<CannabisBooking>;
  cancelBooking(
    id: string,
    reason: string,
    userId: string,
  ): Promise<CannabisBooking>;

  // Cannabis-specific operations
  assignStaffToBooking(
    bookingId: string,
    staffIds: string[],
    assignedBy: string,
  ): Promise<void>;
  assignKitToBooking(
    bookingId: string,
    kitIds: string[],
    assignedBy: string,
  ): Promise<void>;
  submitEventData(bookingId: string, data: OperationalData): Promise<void>;

  // Event publishing (microservices communication)
  publishBookingEvent(event: BookingEvent): Promise<void>;
}

// Event Bus Interface for Microservices
export interface BookingEventBus {
  publish(
    eventType: BookingEventType,
    data: any,
    metadata?: any,
  ): Promise<void>;
  subscribe(
    eventType: BookingEventType,
    handler: (event: BookingEvent) => Promise<void>,
  ): Promise<void>;
  unsubscribe(eventType: BookingEventType, handlerId: string): Promise<void>;
}

// Export all types for use across microservices
export * from "./cannabis-booking";
