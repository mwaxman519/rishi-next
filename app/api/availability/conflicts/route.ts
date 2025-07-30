import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import {
  AvailabilityConflict,
  AvailabilityDTO,
  ConflictCheckResponse,
} from &quot;../../../services/availability/models&quot;;
import { db } from &quot;@/lib/db&quot;;
import { availabilityBlocks } from &quot;@shared/schema&quot;;
import { and, eq, sql } from &quot;drizzle-orm&quot;;

/**
 * GET /api/availability/conflicts - Check for conflicts with existing availability blocks
 *
 * This endpoint provides a way to check for conflicts without creating a block.
 * It's useful for client-side validation before submitting the full request.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = (searchParams.get(&quot;userId&quot;) || undefined) || undefined;
    const startDate = (searchParams.get(&quot;startDate&quot;) || undefined) || undefined;
    const endDate = (searchParams.get(&quot;endDate&quot;) || undefined) || undefined;
    const excludeBlockIdStr = (searchParams.get(&quot;excludeBlockId&quot;) || undefined) || undefined;

    if (!userId || !startDate || !endDate) {
      const errorResponse: ConflictCheckResponse = {
        success: false,
        error: &quot;userId, startDate, and endDate are required&quot;,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const userIdString = userId; // Keep as string for UUID comparison
    const excludeBlockId = excludeBlockIdStr
      ? parseInt(excludeBlockIdStr)
      : undefined;

    if (
      !userIdString ||
      (excludeBlockIdStr && isNaN(excludeBlockId as number))
    ) {
      const errorResponse: ConflictCheckResponse = {
        success: false,
        error: &quot;userId and excludeBlockId must be valid numbers&quot;,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    try {
      console.log(
        `[conflicts/route GET] Checking conflicts for userId=${userIdString}, startDate=${startDate}, endDate=${endDate}`,
      );

      // Build query filters
      const baseFilters = [
        eq(availabilityBlocks.user_id, userIdString),
        sql`${availabilityBlocks.start_date} < ${new Date(endDate)}`,
        sql`${availabilityBlocks.end_date} > ${new Date(startDate)}`,
      ];

      // Add exclude filter if needed
      if (excludeBlockId) {
        baseFilters.push(sql`${availabilityBlocks.id} != ${excludeBlockId}`);
      }

      // Execute the query
      const conflictingBlocks = await db
        .select()
        .from(availabilityBlocks)
        .where(and(...baseFilters));

      console.log(
        `[conflicts/route GET] Found ${conflictingBlocks.length} potential conflicts`,
      );

      // Process conflicts
      const conflicts = conflictingBlocks.map((block: any) => {
        let conflictType: &quot;overlap&quot; | &quot;adjacent&quot; | &quot;contained&quot; = &quot;overlap&quot;;

        const blockStart = new Date(block.start_date);
        const blockEnd = new Date(block.end_date);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        // Check if new block is entirely contained within existing block
        if (newStart >= blockStart && newEnd <= blockEnd) {
          conflictType = &quot;contained&quot;;
        }
        // Check if blocks are adjacent (might want to allow this)
        else if (
          Math.abs(newStart.getTime() - blockEnd.getTime()) < 1000 ||
          Math.abs(newEnd.getTime() - blockStart.getTime()) < 1000
        ) {
          conflictType = &quot;adjacent&quot;;
        }

        // Map to the expected DTO format
        return {
          existingBlock: {
            id: block.id,
            userId: block.user_id,
            title: block.title || "&quot;,
            startDate: block.start_date,
            endDate: block.end_date,
            status: block.status || &quot;available&quot;,
            isRecurring: block.is_recurring || false,
            recurrencePattern: block.recurrence_pattern,
            dayOfWeek: block.day_of_week,
            createdAt: block.created_at,
            updatedAt: block.updated_at,
          },
          conflictType,
        };
      });

      // Build a strongly-typed ConflictCheckResponse
      const response: ConflictCheckResponse = {
        success: true,
        data: {
          hasConflicts: conflicts.length > 0,
          conflicts: conflicts,
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (err) {
      console.error(&quot;Database error checking for conflicts:&quot;, err);
      const errorResponse: ConflictCheckResponse = {
        success: false,
        error: &quot;Database error checking for conflicts&quot;,
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
  } catch (error) {
    console.error(&quot;Error checking for conflicts:&quot;, error);
    const errorResponse: ConflictCheckResponse = {
      success: false,
      error: &quot;Failed to check for conflicts&quot;,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/availability/conflicts - Check if a proposed block conflicts with existing ones
 *
 * This endpoint allows for checking conflicts with more complex data structures
 * than what can be easily passed in a query string.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const { userId, startDate, endDate, excludeBlockId } = body;

    if (!userId || !startDate || !endDate) {
      const errorResponse: ConflictCheckResponse = {
        success: false,
        error: &quot;userId, startDate, and endDate are required&quot;,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    try {
      // Convert userId to number if it&apos;s a string
      const userIdString = typeof userId === &quot;string&quot; ? userId : userId;

      console.log(
        `[conflicts/route POST] Checking conflicts for userId=${userIdString}, startDate=${startDate}, endDate=${endDate}`,
      );

      // Build query filters with UUID agentId
      const baseFilters = [
        eq(availabilityBlocks.user_id, userId),
        sql`${availabilityBlocks.start_date} < ${new Date(endDate)}`,
        sql`${availabilityBlocks.end_date} > ${new Date(startDate)}`,
      ];

      // Add exclude filter if needed
      if (excludeBlockId) {
        baseFilters.push(sql`${availabilityBlocks.id} != ${excludeBlockId}`);
      }

      // Execute the query
      const conflictingBlocks = await db
        .select()
        .from(availabilityBlocks)
        .where(and(...baseFilters));

      console.log(
        `[conflicts/route POST] Found ${conflictingBlocks.length} potential conflicts`,
      );

      // Process conflicts
      const conflicts = conflictingBlocks.map((block: any) => {
        let conflictType: &quot;overlap&quot; | &quot;adjacent&quot; | &quot;contained&quot; = &quot;overlap&quot;;

        const blockStart = new Date(block.start_date);
        const blockEnd = new Date(block.end_date);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        // Check if new block is entirely contained within existing block
        if (newStart >= blockStart && newEnd <= blockEnd) {
          conflictType = &quot;contained&quot;;
        }
        // Check if blocks are adjacent (might want to allow this)
        else if (
          Math.abs(newStart.getTime() - blockEnd.getTime()) < 1000 ||
          Math.abs(newEnd.getTime() - blockStart.getTime()) < 1000
        ) {
          conflictType = &quot;adjacent&quot;;
        }

        // Map to the expected DTO format
        return {
          existingBlock: {
            id: block.id,
            userId: block.user_id,
            title: block.title || &quot;&quot;,
            startDate: block.start_date,
            endDate: block.end_date,
            status: block.status || &quot;available&quot;,
            isRecurring: block.is_recurring || false,
            recurrencePattern: block.recurrence_pattern,
            dayOfWeek: block.day_of_week,
            createdAt: block.created_at,
            updatedAt: block.updated_at,
          },
          conflictType,
        };
      });

      // Build a strongly-typed ConflictCheckResponse
      const response: ConflictCheckResponse = {
        success: true,
        data: {
          hasConflicts: conflicts.length > 0,
          conflicts: conflicts,
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (err) {
      console.error(&quot;Database error checking for conflicts:&quot;, err);
      const errorResponse: ConflictCheckResponse = {
        success: false,
        error: &quot;Database error checking for conflicts&quot;,
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
  } catch (error) {
    console.error(&quot;Error checking for conflicts:&quot;, error);
    const errorResponse: ConflictCheckResponse = {
      success: false,
      error: &quot;Failed to check for conflicts",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
