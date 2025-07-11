import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/services/BookingService";
import { getCurrentUser } from "../auth-service/utils/auth-utils";
import { z } from "zod";
import { BOOKING_STATUS, BOOKING_PRIORITY } from "@shared/schema";

// Cannabis Booking Creation Schema
const CreateCannabisBookingSchema = z.object({
  title: z.string().min(1),
  cannabisBookingType: z.enum([
    "product_demo",
    "promotional_event",
    "party_staffing",
    "staff_training",
  ]),
  description: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  state: z.string(),
  region: z.string(),
  city: z.string(),
  venue: z.string(),
  address: z.string(),
  startDateTime: z.string(),
  endDateTime: z.string(),
  timezone: z.string(),
  cannabisProducts: z.array(z.string()),
  targetAudience: z.enum([
    "medical_patients",
    "recreational_consumers",
    "industry_professionals",
    "general_public",
  ]),
  estimatedAttendees: z.number(),
  consumptionAllowed: z.boolean(),
  ageVerificationRequired: z.boolean(),
  estimatedCost: z.number(),
  budget: z.number(),
  currency: z.string().default("USD"),
  minimumExperience: z.enum([
    "entry_level",
    "intermediate",
    "experienced",
    "expert",
  ]),
  requiredSkills: z.array(z.string()),
  totalStaffNeeded: z.number(),
  specializations: z.array(z.string()),
  cannabisEquipment: z.array(z.string()),
  generalEquipment: z.array(z.string()),
  secureStorageNeeded: z.boolean(),
  displayMaterialsNeeded: z.boolean(),
  organizationId: z.string().uuid(),
  clientId: z.string().uuid(),
  locationId: z.string().uuid(),
});

// Mock bookings data for testing
const mockBookings: Booking[] = [
  {
    id: crypto.randomUUID(),
    title: "Quarterly Team Training",
    description:
      "Quarterly training session for the marketing team focusing on new product features.",
    clientOrganizationId: "org-1",
    locationId: "loc-1",
    activityTypeId: "act-1",
    startDate: new Date("2025-05-15"),
    endDate: new Date("2025-05-15"),
    startTime: "09:00",
    endTime: "17:00",
    budget: 5000,
    attendeeEstimate: 25,
    status: BOOKING_STATUS.APPROVED,
    priority: BOOKING_PRIORITY.MEDIUM,
    notes:
      "Lunch will be provided. Require training materials for all attendees.",
    promotionTypeId: null,
    kitTemplateId: null,
    staffCount: 2,
    requiresTraining: true,
    isRecurring: false,
    createdById: "user-1",
    createdAt: new Date("2025-04-05"),
    updatedAt: new Date("2025-04-10"),
    approvedById: "user-2",
    approvedAt: new Date("2025-04-12"),
    rejectedById: null,
    rejectedAt: null,
    rejectionReason: null,
    canceledAt: null,
    canceledById: null,
    cancelReason: null,
    recurrencePattern: null,
    recurrenceEndDate: null,
  },
  {
    id: crypto.randomUUID(),
    title: "Product Launch Event",
    description: "Major product launch at the Sydney Convention Center.",
    clientOrganizationId: "org-2",
    locationId: "loc-2",
    activityTypeId: "act-3",
    startDate: new Date("2025-06-20"),
    endDate: new Date("2025-06-22"),
    startTime: "10:00",
    endTime: "18:00",
    budget: 25000,
    attendeeEstimate: 200,
    status: BOOKING_STATUS.PENDING,
    priority: BOOKING_PRIORITY.HIGH,
    notes:
      "Multiple breakout sessions and main presentation. VIP guests expected.",
    promotionTypeId: null,
    kitTemplateId: null,
    staffCount: 15,
    requiresTraining: true,
    isRecurring: false,
    createdById: "user-3",
    createdAt: new Date("2025-04-15"),
    updatedAt: new Date("2025-04-15"),
    approvedById: null,
    approvedAt: null,
    rejectedById: null,
    rejectedAt: null,
    rejectionReason: null,
    canceledAt: null,
    canceledById: null,
    cancelReason: null,
    recurrencePattern: null,
    recurrenceEndDate: null,
  },
  {
    id: crypto.randomUUID(),
    title: "Weekly Sales Training",
    description: "Recurring sales training sessions for new hires.",
    clientOrganizationId: "org-1",
    locationId: "loc-3",
    activityTypeId: "act-1",
    startDate: new Date("2025-05-07"),
    endDate: new Date("2025-05-07"),
    startTime: "13:00",
    endTime: "16:00",
    budget: 1000,
    attendeeEstimate: 15,
    status: BOOKING_STATUS.APPROVED,
    priority: BOOKING_PRIORITY.MEDIUM,
    notes: "Focus on product knowledge and sales techniques.",
    promotionTypeId: null,
    kitTemplateId: null,
    staffCount: 1,
    requiresTraining: false,
    isRecurring: true,
    recurrencePattern: "FREQ=WEEKLY;INTERVAL=1;BYDAY=WE",
    recurrenceEndDate: new Date("2025-06-25"),
    createdById: "user-1",
    createdAt: new Date("2025-04-01"),
    updatedAt: new Date("2025-04-02"),
    approvedById: "user-2",
    approvedAt: new Date("2025-04-03"),
    rejectedById: null,
    rejectedAt: null,
    rejectionReason: null,
    canceledAt: null,
    canceledById: null,
    cancelReason: null,
  },
  {
    id: crypto.randomUUID(),
    title: "Annual Company Retreat",
    description: "Three-day team building and strategy planning retreat.",
    clientOrganizationId: "org-2",
    locationId: "loc-4",
    activityTypeId: "act-4",
    startDate: new Date("2025-07-15"),
    endDate: new Date("2025-07-17"),
    startTime: "08:00",
    endTime: "20:00",
    budget: 50000,
    attendeeEstimate: 75,
    status: BOOKING_STATUS.DRAFT,
    priority: BOOKING_PRIORITY.LOW,
    notes: "Accommodation and meals required for all attendees.",
    promotionTypeId: null,
    kitTemplateId: null,
    staffCount: 6,
    requiresTraining: true,
    isRecurring: false,
    createdById: "user-3",
    createdAt: new Date("2025-04-20"),
    updatedAt: new Date("2025-04-20"),
    approvedById: null,
    approvedAt: null,
    rejectedById: null,
    rejectedAt: null,
    rejectionReason: null,
    canceledAt: null,
    canceledById: null,
    cancelReason: null,
    recurrencePattern: null,
    recurrenceEndDate: null,
  },
  {
    id: crypto.randomUUID(),
    title: "Trade Show Booth",
    description: "Presence at the industry trade show with product demos.",
    clientOrganizationId: "org-3",
    locationId: "loc-2",
    activityTypeId: "act-2",
    startDate: new Date("2025-05-30"),
    endDate: new Date("2025-06-01"),
    startTime: "09:00",
    endTime: "17:00",
    budget: 15000,
    attendeeEstimate: 500,
    status: BOOKING_STATUS.COMPLETED,
    priority: BOOKING_PRIORITY.MEDIUM,
    notes: "10x10 booth with product displays and video presentations.",
    promotionTypeId: null,
    kitTemplateId: null,
    staffCount: 4,
    requiresTraining: true,
    isRecurring: false,
    createdById: "user-2",
    createdAt: new Date("2025-03-15"),
    updatedAt: new Date("2025-06-02"),
    approvedById: "user-1",
    approvedAt: new Date("2025-03-20"),
    rejectedById: null,
    rejectedAt: null,
    rejectionReason: null,
    canceledAt: null,
    canceledById: null,
    cancelReason: null,
    recurrencePattern: null,
    recurrenceEndDate: null,
  },
  {
    id: crypto.randomUUID(),
    title: "VIP Client Dinner",
    description:
      "Exclusive dinner with top clients to discuss partnership opportunities.",
    clientOrganizationId: "org-1",
    locationId: "loc-1",
    activityTypeId: "act-4",
    startDate: new Date("2025-05-12"),
    endDate: new Date("2025-05-12"),
    startTime: "18:00",
    endTime: "22:00",
    budget: 5000,
    attendeeEstimate: 15,
    status: BOOKING_STATUS.CANCELED,
    priority: BOOKING_PRIORITY.HIGH,
    notes: "Upscale venue required with private dining room.",
    promotionTypeId: null,
    kitTemplateId: null,
    staffCount: 2,
    requiresTraining: false,
    isRecurring: false,
    createdById: "user-1",
    createdAt: new Date("2025-04-05"),
    updatedAt: new Date("2025-04-28"),
    approvedById: "user-2",
    approvedAt: new Date("2025-04-10"),
    rejectedById: null,
    rejectedAt: null,
    rejectionReason: null,
    canceledAt: new Date("2025-04-28"),
    canceledById: "user-1",
    cancelReason: "Client schedule conflict",
    recurrencePattern: null,
    recurrenceEndDate: null,
  },
  {
    id: crypto.randomUUID(),
    title: "Monthly Staff Development",
    description:
      "Recurring monthly training for field staff on new procedures.",
    clientOrganizationId: "org-3",
    locationId: "loc-3",
    activityTypeId: "act-1",
    startDate: new Date("2025-05-25"),
    endDate: new Date("2025-05-25"),
    startTime: "14:00",
    endTime: "17:00",
    budget: 2000,
    attendeeEstimate: 30,
    status: BOOKING_STATUS.APPROVED,
    priority: BOOKING_PRIORITY.MEDIUM,
    notes: "Interactive workshop format with hands-on exercises.",
    promotionTypeId: null,
    kitTemplateId: null,
    staffCount: 2,
    requiresTraining: true,
    isRecurring: true,
    recurrencePattern: "FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=25",
    recurrenceEndDate: new Date("2025-12-25"),
    createdById: "user-2",
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2025-03-15"),
    approvedById: "user-1",
    approvedAt: new Date("2025-03-20"),
    rejectedById: null,
    rejectedAt: null,
    rejectionReason: null,
    canceledAt: null,
    canceledById: null,
    cancelReason: null,
  },
];

/**
 * Bookings API Route - Microservices Pattern
 * Implements: Authentication → Validation → Service Layer → Event Publishing → Response
 */
export async function GET(request: NextRequest) {
  const correlationId = crypto.randomUUID();
  
  try {
    // Step 1: Authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Authorization Check (basic permission check)
    // In production, implement proper RBAC checks based on user role

    // Step 3: Service Layer (includes Event Publishing)
    const bookingService = BookingService.getInstance();
    const allBookings = await bookingService.getAllBookings(
      user.id,
      (user as any).organizationId || "ec83b1b1-af6e-4465-806e-8d51a1449e86",
      correlationId
    );

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const organizationId = searchParams.get("organizationId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Apply filters
    let filteredBookings = [...allBookings];

    if (status) {
    filteredBookings = filteredBookings.filter((b) => b.status === status);
  }

  if (organizationId) {
    const orgIds = organizationId.split(",");
    filteredBookings = filteredBookings.filter((b) =>
      orgIds.includes(b.clientOrganizationId),
    );
  }

  if (startDate) {
    const filterStartDate = new Date(startDate);
    filteredBookings = filteredBookings.filter(
      (b) => new Date(b.startDate) >= filterStartDate,
    );
  }

  if (endDate) {
    const filterEndDate = new Date(endDate);
    filteredBookings = filteredBookings.filter(
      (b) => new Date(b.endDate) <= filterEndDate,
    );
  }

    // Step 4: Response
    return NextResponse.json({
      success: true,
      data: filteredBookings,
      metadata: {
        total: filteredBookings.length,
        correlationId
      }
    });
  } catch (error) {
    console.error("Error in GET /api/bookings:", error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: "BOOKINGS_FETCH_ERROR",
          message: "Failed to fetch bookings",
          correlationId
        }
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID();
  
  try {
    // Step 1: Authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Authorization Check (basic permission check)
    // In production, implement proper RBAC checks based on user role

    // Step 3: Validation
    const body = await request.json();
    const validatedData = CreateCannabisBookingSchema.parse(body);

    // Step 4: Service Layer (includes Event Publishing)
    const bookingService = BookingService.getInstance();
    const newBooking = await bookingService.createBooking(
      validatedData,
      user.id,
      correlationId
    );

    // Step 5: Response
    return NextResponse.json({
      success: true,
      data: newBooking,
      metadata: {
        correlationId
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/bookings:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors,
            correlationId
          }
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: {
          code: "BOOKING_CREATE_ERROR",
          message: "Failed to create booking",
          correlationId
        }
      },
      { status: 500 },
    );
  }
}
