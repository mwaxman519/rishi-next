import { NextRequest, NextResponse } from "next/server";
import {
  AvailabilityConflict,
  AvailabilityDTO,
  ConflictCheckResponse,
} from "../../../services/availability/models";
import { db } from "../../../lib/db";
import { availabilityBlocks } from "@shared/schema";
import { and, eq, sql } from "drizzle-orm";

/**
 * GET /api/availability/conflicts - Check for conflicts with existing availability blocks
 *
 * This endpoint provides a way to check for conflicts without creating a block.
 * It's useful for client-side validation before submitting the full request.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const excludeBlockIdStr = searchParams.get("excludeBlockId");

    if (!userId || !startDate || !endDate) {
      const errorResponse: ConflictCheckResponse = {
        success: false,
        error: "userId, startDate, and endDate are required",
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
        error: "userId and excludeBlockId must be valid numbers",
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
        let conflictType: "overlap" | "adjacent" | "contained" = "overlap";

        const blockStart = new Date(block.start_date);
        const blockEnd = new Date(block.end_date);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        // Check if new block is entirely contained within existing block
        if (newStart >= blockStart && newEnd <= blockEnd) {
          conflictType = "contained";
        }
        // Check if blocks are adjacent (might want to allow this)
        else if (
          Math.abs(newStart.getTime() - blockEnd.getTime()) < 1000 ||
          Math.abs(newEnd.getTime() - blockStart.getTime()) < 1000
        ) {
          conflictType = "adjacent";
        }

        // Map to the expected DTO format
        return {
          existingBlock: {
            id: block.id,
            userId: block.user_id,
            title: block.title || "",
            startDate: block.start_date,
            endDate: block.end_date,
            status: block.status || "available",
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
      console.error("Database error checking for conflicts:", err);
      const errorResponse: ConflictCheckResponse = {
        success: false,
        error: "Database error checking for conflicts",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
  } catch (error) {
    console.error("Error checking for conflicts:", error);
    const errorResponse: ConflictCheckResponse = {
      success: false,
      error: "Failed to check for conflicts",
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
        error: "userId, startDate, and endDate are required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    try {
      // Convert userId to number if it's a string
      const userIdString = typeof userId === "string" ? userId : userId;

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
        let conflictType: "overlap" | "adjacent" | "contained" = "overlap";

        const blockStart = new Date(block.start_date);
        const blockEnd = new Date(block.end_date);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        // Check if new block is entirely contained within existing block
        if (newStart >= blockStart && newEnd <= blockEnd) {
          conflictType = "contained";
        }
        // Check if blocks are adjacent (might want to allow this)
        else if (
          Math.abs(newStart.getTime() - blockEnd.getTime()) < 1000 ||
          Math.abs(newEnd.getTime() - blockStart.getTime()) < 1000
        ) {
          conflictType = "adjacent";
        }

        // Map to the expected DTO format
        return {
          existingBlock: {
            id: block.id,
            userId: block.user_id,
            title: block.title || "",
            startDate: block.start_date,
            endDate: block.end_date,
            status: block.status || "available",
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
      console.error("Database error checking for conflicts:", err);
      const errorResponse: ConflictCheckResponse = {
        success: false,
        error: "Database error checking for conflicts",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
  } catch (error) {
    console.error("Error checking for conflicts:", error);
    const errorResponse: ConflictCheckResponse = {
      success: false,
      error: "Failed to check for conflicts",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
