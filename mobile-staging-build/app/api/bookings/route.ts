import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

import { BookingService } from "@/services/BookingService";
import { checkPermission } from "@/lib/rbac";
import { getOrganizationHeaderData } from "@/lib/organization-context";
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

/**
 * Bookings API Route - Microservices Pattern
 * Implements: Authentication → Validation → Service Layer → Event Publishing → Response
 */
export async function GET(request: NextRequest) {
  const correlationId = crypto.randomUUID();
  
  try {
    // Step 1: Get organization context from request headers
    const organizationData = await getOrganizationHeaderData(request);

    // Step 2: Check permissions using RBAC system
    const hasPermission = await checkPermission(request, "read:staff");
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 3: Service Layer (includes Event Publishing)
    const bookingService = BookingService.getInstance();
    // Use organization data from headers for context
    const organizationId = organizationData?.organizationId || "ec83b1b1-af6e-4465-806e-8d51a1449e86";
    const userId = organizationData?.userId || "default-user";
    
    const allBookings = await bookingService.getAllBookings(
      userId,
      organizationId,
      correlationId
    );

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") || undefined) || undefined;
    const filterOrganizationId = (searchParams.get("organizationId") || undefined) || undefined;
    const startDate = (searchParams.get("startDate") || undefined) || undefined;
    const endDate = (searchParams.get("endDate") || undefined) || undefined;

    // Apply filters
    let filteredBookings = [...allBookings];

    if (status) {
    filteredBookings = filteredBookings.filter((b) => b.status === status);
  }

  if (filterOrganizationId) {
    const orgIds = filterOrganizationId.split(",");
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
