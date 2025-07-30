import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { BookingService } from &quot;@/services/BookingService&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;
import { getOrganizationHeaderData } from &quot;@/lib/organization-context&quot;;
import { z } from &quot;zod&quot;;
import { BOOKING_STATUS, BOOKING_PRIORITY } from &quot;@shared/schema&quot;;

// Cannabis Booking Creation Schema
const CreateCannabisBookingSchema = z.object({
  title: z.string().min(1),
  cannabisBookingType: z.enum([
    &quot;product_demo&quot;,
    &quot;promotional_event&quot;,
    &quot;party_staffing&quot;,
    &quot;staff_training&quot;,
  ]),
  description: z.string().min(1),
  priority: z.enum([&quot;low&quot;, &quot;medium&quot;, &quot;high&quot;, &quot;urgent&quot;]),
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
    &quot;medical_patients&quot;,
    &quot;recreational_consumers&quot;,
    &quot;industry_professionals&quot;,
    &quot;general_public&quot;,
  ]),
  estimatedAttendees: z.number(),
  consumptionAllowed: z.boolean(),
  ageVerificationRequired: z.boolean(),
  estimatedCost: z.number(),
  budget: z.number(),
  currency: z.string().default(&quot;USD&quot;),
  minimumExperience: z.enum([
    &quot;entry_level&quot;,
    &quot;intermediate&quot;,
    &quot;experienced&quot;,
    &quot;expert&quot;,
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
    const hasPermission = await checkPermission(request, &quot;read:staff&quot;);
    if (!hasPermission) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Step 3: Service Layer (includes Event Publishing)
    const bookingService = BookingService.getInstance();
    // Use organization data from headers for context
    const organizationId = organizationData?.organizationId || &quot;ec83b1b1-af6e-4465-806e-8d51a1449e86&quot;;
    const userId = organizationData?.userId || &quot;default-user&quot;;
    
    const allBookings = await bookingService.getAllBookings(
      userId,
      organizationId,
      correlationId
    );

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get(&quot;status&quot;) || undefined) || undefined;
    const filterOrganizationId = (searchParams.get(&quot;organizationId&quot;) || undefined) || undefined;
    const startDate = (searchParams.get(&quot;startDate&quot;) || undefined) || undefined;
    const endDate = (searchParams.get(&quot;endDate&quot;) || undefined) || undefined;

    // Apply filters
    let filteredBookings = [...allBookings];

    if (status) {
    filteredBookings = filteredBookings.filter((b) => b.status === status);
  }

  if (filterOrganizationId) {
    const orgIds = filterOrganizationId.split(&quot;,&quot;);
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
    console.error(&quot;Error in GET /api/bookings:&quot;, error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: &quot;BOOKINGS_FETCH_ERROR&quot;,
          message: &quot;Failed to fetch bookings&quot;,
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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
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
    console.error(&quot;Error in POST /api/bookings:&quot;, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: &quot;VALIDATION_ERROR&quot;,
            message: &quot;Invalid request data&quot;,
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
          code: &quot;BOOKING_CREATE_ERROR&quot;,
          message: &quot;Failed to create booking&quot;,
          correlationId
        }
      },
      { status: 500 },
    );
  }
}
