// Cannabis Booking Service - Strictly Following Architectural Pillars
// 1. Microservices: Clear service boundaries with dependency injection
// 2. Event-Driven: All state changes publish events through event bus
// 3. UUID-Based: All entities use UUID for consistent identification

import { v4 as uuidv4 } from "uuid";
import { db } from "../server/storage";
import { bookings, BookingStatus, BookingStage } from "../shared/schema";
import { eq } from "drizzle-orm";
import {
  CannabisBooking,
  CreateCannabisBookingRequest,
  BookingEvent,
  BookingEventType,
} from "../shared/types/cannabis-booking";
import { EventBusService } from "./event-bus-service";

export class CannabisBookingService {
  constructor(private eventBus: EventBusService) {}

  // Create Cannabis Booking - UUID-based with Event Publishing
  async createCannabisBooking(
    request: CreateCannabisBookingRequest,
    createdBy: string, // UUID
  ): Promise<CannabisBooking> {
    const bookingId = uuidv4();
    const now = new Date();

    const newBooking: CannabisBooking = {
      id: bookingId,
      organizationId: request.organizationId,
      clientId: request.clientId,
      locationId: request.locationId,
      createdBy,
      updatedBy: createdBy,

      cannabisBookingType: request.cannabisBookingType,
      operationalRequirements: {
        id: uuidv4(),
        bookingId,
        staffRequirements: {
          minimumExperience: request.minimumExperience || "intermediate",
          requiredSkills: request.requiredSkills || [],
          totalStaffNeeded: request.totalStaffNeeded || 2,
          specializations: request.specializations || [],
        },
        equipmentRequirements: {
          cannabisSpecificEquipment: request.cannabisEquipment || [],
          generalEventEquipment: request.generalEquipment || [],
          secureStorageNeeded: request.secureStorageNeeded || false,
          displayMaterialsNeeded: request.displayMaterialsNeeded || true,
        },
        operationalChecks: {
          locationVerified: false,
          resourcesConfirmed: false,
          logisticsPlanned: false,
          emergencyContactsEstablished: false,
        },
        createdAt: now,
        updatedAt: now,
      },

      title: request.title,
      description: request.description,
      status: "draft" as BookingStatus,
      stage: "stage_1_request" as BookingStage,
      priority: request.priority || "medium",

      state: request.state,
      region: request.region,
      city: request.city,

      startDateTime: request.startDateTime,
      endDateTime: request.endDateTime,
      timezone: request.timezone,

      cannabisProducts: request.cannabisProducts || [],

      estimatedAttendees: request.estimatedAttendees,
      consumptionAllowed: request.consumptionAllowed || false,
      ageVerificationRequired: request.ageVerificationRequired || true,

      assignedStaff: [],
      assignedKits: [],

      estimatedCost: request.estimatedCost,
      budgetApproved: false,

      activities: [],
      statusHistory: [],
      operationalData: {
        id: uuidv4(),
        bookingId,
        eventMetrics: {
          actualAttendees: 0,
          customerSatisfaction: 0,
          leadsGenerated: 0,
          salesConversions: 0,
          productInterest: {},
        },
        staffPerformance: {
          staffRatings: {},
          punctuality: {},
          professionalism: {},
          cannabisKnowledge: {},
        },
        operationalEfficiency: {
          setupTime: 0,
          eventDuration: 0,
          cleanupTime: 0,
          issuesReported: [],
          resolutionTime: [],
        },
        financialActuals: {
          actualCost: 0,
          costBreakdown: {},
          revenueGenerated: 0,
          roi: 0,
        },
        collectedAt: now,
        collectedBy: createdBy,
      },

      tags: request.tags || [],
      customFields: request.customFields || {},

      createdAt: now,
      updatedAt: now,
    };

    // Save to database
    await db.insert(bookings).values({
      id: newBooking.id,
      organizationId: newBooking.organizationId,
      clientOrganizationId: newBooking.clientId,
      createdById: newBooking.createdBy,
      title: newBooking.title,
      description: newBooking.description,
      status: newBooking.status,
      priority: newBooking.priority,
      locationId: newBooking.locationId,
      startDate: newBooking.startDateTime,
      endDate: newBooking.endDateTime,
      estimatedCost: newBooking.estimatedCost.toString(),
      createdAt: newBooking.createdAt,
      updatedAt: newBooking.updatedAt,
    });

    // Event-Driven: Publish booking created event
    await this.publishBookingEvent({
      id: uuidv4(),
      type: BookingEventType.BOOKING_CREATED,
      bookingId: newBooking.id,
      userId: createdBy,
      organizationId: newBooking.organizationId,
      timestamp: now,
      data: {
        cannabisBookingType: newBooking.cannabisBookingType,
        state: newBooking.state,
        region: newBooking.region,
        estimatedAttendees: newBooking.estimatedAttendees,
        estimatedCost: newBooking.estimatedCost,
      },
      metadata: {
        source: "cannabis-booking-service",
        version: "1.0.0",
        correlationId: uuidv4(),
      },
    });

    return newBooking;
  }

  // Update Booking Status - Event-Driven with UUID tracking
  async updateBookingStatus(
    bookingId: string, // UUID
    newStatus: BookingStatus,
    newStage: BookingStage,
    updatedBy: string, // UUID
    reason?: string,
  ): Promise<CannabisBooking> {
    const now = new Date();

    // Get current booking
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!existingBooking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    const previousStatus = existingBooking.status as BookingStatus;
    const previousStage = existingBooking.stage as BookingStage;

    // Update booking in database
    await db
      .update(bookings)
      .set({
        status: newStatus,
        stage: newStage,
        updatedAt: now,
        ...(newStatus === "approved" && {
          approvedById: updatedBy,
          approvedAt: now,
        }),
        ...(newStatus === "rejected" && {
          rejectedById: updatedBy,
          rejectedAt: now,
          rejectionReason: reason,
        }),
        ...(newStatus === "canceled" && {
          canceledById: updatedBy,
          canceledAt: now,
          cancelReason: reason,
        }),
      })
      .where(eq(bookings.id, bookingId));

    // Event-Driven: Publish status change event
    await this.publishBookingEvent({
      id: uuidv4(),
      type: BookingEventType.BOOKING_STATUS_CHANGED,
      bookingId,
      userId: updatedBy,
      organizationId: existingBooking.organizationId,
      timestamp: now,
      data: {
        previousStatus,
        newStatus,
        previousStage,
        newStage,
        reason,
      },
      metadata: {
        source: "cannabis-booking-service",
        version: "1.0.0",
        correlationId: uuidv4(),
      },
    });

    // Stage-specific events
    if (newStage !== previousStage) {
      await this.publishBookingEvent({
        id: uuidv4(),
        type: BookingEventType.BOOKING_STAGE_ADVANCED,
        bookingId,
        userId: updatedBy,
        organizationId: existingBooking.organizationId,
        timestamp: now,
        data: {
          fromStage: previousStage,
          toStage: newStage,
          nextActions: this.getNextActions(newStage),
        },
        metadata: {
          source: "cannabis-booking-service",
          version: "1.0.0",
          correlationId: uuidv4(),
        },
      });
    }

    // Return updated booking
    return this.getBookingById(bookingId);
  }

  // Assign Staff to Booking - UUID-based with Event Publishing
  async assignStaffToBooking(
    bookingId: string, // UUID
    staffIds: string[], // UUID[]
    assignedBy: string, // UUID
  ): Promise<void> {
    const now = new Date();

    // Validate booking exists
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!existingBooking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // Update booking with assigned staff
    await db
      .update(bookings)
      .set({
        assignedStaff: staffIds,
        updatedAt: now,
      })
      .where(eq(bookings.id, bookingId));

    // Event-Driven: Publish staff assignment event
    for (const staffId of staffIds) {
      await this.publishBookingEvent({
        id: uuidv4(),
        type: BookingEventType.STAFF_ASSIGNED,
        bookingId,
        userId: assignedBy,
        organizationId: existingBooking.organizationId,
        timestamp: now,
        data: {
          staffId,
          assignedBy,
          cannabisBookingType: existingBooking.cannabisBookingType,
        },
        metadata: {
          source: "cannabis-booking-service",
          version: "1.0.0",
          correlationId: uuidv4(),
        },
      });
    }
  }

  // Get Booking by ID - UUID-based retrieval
  async getBookingById(bookingId: string): Promise<CannabisBooking> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // Transform database record to CannabisBooking interface
    return this.transformToBookingEntity(booking);
  }

  // Operational Check - Replaces compliance check
  async performOperationalCheck(
    bookingId: string, // UUID
    checkedBy: string, // UUID
  ): Promise<{ checksPassed: boolean; issues: string[] }> {
    const now = new Date();
    const issues: string[] = [];

    const booking = await this.getBookingById(bookingId);

    // Check location verification
    if (!booking.operationalRequirements.operationalChecks.locationVerified) {
      issues.push("Location not verified");
    }

    // Check resource availability
    if (!booking.operationalRequirements.operationalChecks.resourcesConfirmed) {
      issues.push("Resources not confirmed");
    }

    // Check staff assignment
    if (
      booking.assignedStaff.length <
      booking.operationalRequirements.staffRequirements.totalStaffNeeded
    ) {
      issues.push("Insufficient staff assigned");
    }

    const checksPassed = issues.length === 0;

    // Event-Driven: Publish operational check event
    await this.publishBookingEvent({
      id: uuidv4(),
      type: BookingEventType.OPERATIONAL_CHECK_COMPLETED,
      bookingId,
      userId: checkedBy,
      organizationId: booking.organizationId,
      timestamp: now,
      data: {
        checksPassed,
        issues,
        checkedBy,
      },
      metadata: {
        source: "cannabis-booking-service",
        version: "1.0.0",
        correlationId: uuidv4(),
      },
    });

    return { checksPassed, issues };
  }

  // Event Publishing - Core microservices communication
  private async publishBookingEvent(event: BookingEvent): Promise<void> {
    try {
      await this.eventBus.publish(event.type, event);
    } catch (error) {
      console.error(`Failed to publish event ${event.type}:`, error);
      // In production, implement retry logic or dead letter queue
    }
  }

  // Get next actions based on stage
  private getNextActions(stage: BookingStage): string[] {
    const actionMap: Record<BookingStage, string[]> = {
      stage_1_request: ["Review booking details", "Verify location"],
      stage_2_review: ["Perform operational checks", "Estimate costs"],
      stage_3_approval: ["Assign staff", "Allocate equipment"],
      stage_4_staff_assignment: ["Confirm staff availability", "Brief staff"],
      stage_5_kit_assignment: ["Ship equipment", "Verify delivery"],
      stage_6_event_execution: ["Monitor event", "Provide support"],
      stage_7_check_in_out: ["Verify attendance", "Track time"],
      stage_8_data_collection: ["Submit event data", "Process feedback"],
    };

    return actionMap[stage] || [];
  }

  // Transform database record to domain entity
  private transformToBookingEntity(dbRecord: any): CannabisBooking {
    // This would include full transformation logic
    // For now, returning a basic transformation
    const now = new Date();

    return {
      id: dbRecord.id,
      organizationId: dbRecord.organizationId,
      clientId: dbRecord.clientOrganizationId,
      locationId: dbRecord.locationId,
      createdBy: dbRecord.createdById,
      updatedBy: dbRecord.updatedById || dbRecord.createdById,

      cannabisBookingType: dbRecord.cannabisBookingType || "product_demo",
      operationalRequirements: {
        id: uuidv4(),
        bookingId: dbRecord.id,
        staffRequirements: {
          minimumExperience: "intermediate",
          requiredSkills: [],
          totalStaffNeeded: 2,
          specializations: [],
        },
        equipmentRequirements: {
          cannabisSpecificEquipment: [],
          generalEventEquipment: [],
          secureStorageNeeded: false,
          displayMaterialsNeeded: true,
        },
        operationalChecks: {
          locationVerified: false,
          resourcesConfirmed: false,
          logisticsPlanned: false,
          emergencyContactsEstablished: false,
        },
        createdAt: now,
        updatedAt: now,
      },

      title: dbRecord.title,
      description: dbRecord.description || "",
      status: dbRecord.status as BookingStatus,
      stage: (dbRecord.stage as BookingStage) || "stage_1_request",
      priority: (dbRecord.priority as any) || "medium",

      state: dbRecord.state || "",
      region: dbRecord.region || "",
      city: dbRecord.city || "",

      startDateTime: dbRecord.startDate,
      endDateTime: dbRecord.endDate,
      timezone: dbRecord.timezone || "UTC",

      cannabisProducts: [],

      estimatedAttendees: dbRecord.estimatedAttendees || 0,
      consumptionAllowed: dbRecord.consumptionAllowed || false,
      ageVerificationRequired: true,

      assignedStaff: dbRecord.assignedStaff || [],
      assignedKits: dbRecord.assignedKits || [],

      estimatedCost: parseFloat(dbRecord.estimatedCost || "0"),
      actualCost: parseFloat(dbRecord.actualCost || "0"),
      budgetApproved: dbRecord.budgetApproved || false,

      activities: [],
      statusHistory: [],
      operationalData: {
        id: uuidv4(),
        bookingId: dbRecord.id,
        eventMetrics: {
          actualAttendees: 0,
          customerSatisfaction: 0,
          leadsGenerated: 0,
          salesConversions: 0,
          productInterest: {},
        },
        staffPerformance: {
          staffRatings: {},
          punctuality: {},
          professionalism: {},
          cannabisKnowledge: {},
        },
        operationalEfficiency: {
          setupTime: 0,
          eventDuration: 0,
          cleanupTime: 0,
          issuesReported: [],
          resolutionTime: [],
        },
        financialActuals: {
          actualCost: 0,
          costBreakdown: {},
          revenueGenerated: 0,
          roi: 0,
        },
        collectedAt: now,
        collectedBy: dbRecord.createdById,
      },

      tags: [],
      customFields: {},

      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
      deletedAt: dbRecord.deletedAt,
    };
  }
}
