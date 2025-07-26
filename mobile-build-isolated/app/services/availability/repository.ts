// Repository for availability data access
import { db } from "../../lib/db";
import {
  AvailabilityBlock,
  availabilityBlocks,
  InsertAvailabilityBlock,
} from "../../../shared/schema";
import { sql, eq, and, or, ne } from "drizzle-orm";
import {
  AvailabilityDTO,
  AvailabilityQueryOptions,
  AvailabilityConflict,
} from "./models";

/**
 * AvailabilityRepository - Manages data access for availability blocks
 */
export class AvailabilityRepository {
  /**
   * Maps a database availability block entity to a domain DTO
   */
  private mapToAvailabilityDTO(block: AvailabilityBlock): AvailabilityDTO {
    return {
      id: block.id,
      userId: block.userId,
      title: "Available",
      startDate: new Date(block.startDate),
      endDate: new Date(block.endDate),
      status: block.status as "available" | "unavailable" | "tentative",
      isRecurring: block.isRecurring || false,
      dayOfWeek: block.dayOfWeek !== null ? block.dayOfWeek : undefined,
      created_at: new Date(block.createdAt),
      updated_at: new Date(block.updatedAt),
    };
  }

  // Cache for days of week calculations to avoid redundant computation
  private daysOfWeekCache: Record<string, number[]> = {};

  /**
   * Get array of days of week (0-6) that fall within a date range
   * Uses caching to improve performance for repeated calls with the same date range
   */
  private async getDaysOfWeekInRange(
    startDate: Date | string,
    endDate: Date | string,
  ): Promise<number[]> {
    // Convert dates to standard format strings for cache key
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const cacheKey = `${start.toISOString().split("T")[0]}-${end.toISOString().split("T")[0]}`;

    // Return cached result if available
    if (this.daysOfWeekCache[cacheKey]) {
      return this.daysOfWeekCache[cacheKey];
    }

    // Calculate days of week
    const daysOfWeek = new Set<number>();
    const currentDate = new Date(start);

    while (currentDate <= end) {
      daysOfWeek.add(currentDate.getDay());
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Cache and return result
    const result = Array.from(daysOfWeek);
    this.daysOfWeekCache[cacheKey] = result;
    return result;
  }

  async findAll(options: AvailabilityQueryOptions): Promise<AvailabilityDTO[]> {
    try {
      console.log(
        "🔍 [AvailabilityRepository.findAll] Starting query with options:",
        JSON.stringify(options, (key, value) =>
          value instanceof Date ? value.toISOString() : value,
        ),
      );

      // Validate userId must be a number
      if (!options.userId || isNaN(options.userId)) {
        console.error(
          "❌ [AvailabilityRepository.findAll] Invalid userId:",
          options.userId,
        );
        return []; // Return empty array instead of throwing
      }

      // Handle potential database issues
      if (!db) {
        console.error(
          "❌ [AvailabilityRepository.findAll] Database instance is not available",
        );
        return []; // Return empty array rather than causing an error
      }

      // Removed database connection check for performance
      // We assume the database connection is working at this point
      // since it's already checked at application startup

      // Apply filters
      const filters = [];

      // Always filter by userId
      filters.push(eq(availabilityBlocks.user_id, options.userId));

      // Apply date range filter if provided
      if (options.startDate && options.endDate) {
        // Ensure dates are valid
        const startDate =
          options.startDate instanceof Date
            ? options.startDate
            : new Date(options.startDate);
        const endDate =
          options.endDate instanceof Date
            ? options.endDate
            : new Date(options.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error(
            "❌ [AvailabilityRepository.findAll] Invalid date range:",
            options.startDate,
            options.endDate,
          );
          return []; // Return empty array instead of throwing
        }

        try {
          // Get days of week that fall in the date range for recurring blocks
          const daysOfWeekInRange = await this.getDaysOfWeekInRange(
            startDate,
            endDate,
          );

          console.log(
            `✅ [AvailabilityRepository.findAll] Days of week in range: ${daysOfWeekInRange.join(", ")}`,
          );

          // Simplified filter strategy to prevent timeouts
          // First, get non-recurring blocks in the date range
          filters.push(
            or(
              // Regular (non-recurring) blocks that overlap with the range
              and(
                sql`${availabilityBlocks.start_date} <= ${endDate}`,
                sql`${availabilityBlocks.end_date} >= ${startDate}`,
                eq(availabilityBlocks.is_recurring, false),
              ),
              // Include ALL recurring blocks with an expanded query to ensure we don't miss any patterns
              daysOfWeekInRange.length > 0
                ? and(
                    eq(availabilityBlocks.is_recurring, true),
                    // We need to get ALL recurring events with matching day_of_week regardless of date range
                    // since they recur indefinitely according to their pattern
                    or(
                      ...daysOfWeekInRange.map((day) =>
                        eq(availabilityBlocks.day_of_week, day),
                      ),
                    ),
                  )
                : sql`FALSE`,
            ),
          );
        } catch (dateError) {
          console.error(
            "❌ [AvailabilityRepository.findAll] Error processing date range:",
            dateError,
          );
          // Use a simpler filter if date processing fails
          filters.push(
            or(
              sql`${availabilityBlocks.start_date} <= ${new Date(options.endDate)}`,
              sql`${availabilityBlocks.end_date} >= ${new Date(options.startDate)}`,
            ),
          );
        }
      }

      // Apply status filter if provided
      if (options.status) {
        filters.push(eq(availabilityBlocks.status, options.status));
      }

      // Log the number of filters being applied
      console.log(
        `ℹ️ [AvailabilityRepository.findAll] Applying ${filters.length} filters to query`,
      );

      try {
        // Execute the query with all applied filters and a timeout
        // Use a minimal select with only required fields to improve performance
        const queryPromise =
          filters.length > 0
            ? db
                .select({
                  id: availabilityBlocks.id,
                  user_id: availabilityBlocks.user_id,
                  title: availabilityBlocks.title,
                  start_date: availabilityBlocks.start_date,
                  end_date: availabilityBlocks.end_date,
                  status: availabilityBlocks.status,
                  is_recurring: availabilityBlocks.is_recurring,
                  recurrence_pattern: availabilityBlocks.recurrence_pattern,
                  day_of_week: availabilityBlocks.day_of_week,
                  recurrence_group: availabilityBlocks.recurrence_group,
                  recurrence_end_type: availabilityBlocks.recurrence_end_type,
                  recurrence_count: availabilityBlocks.recurrence_count,
                  recurrence_end_date: availabilityBlocks.recurrence_end_date,
                  created_at: availabilityBlocks.created_at,
                  updated_at: availabilityBlocks.updated_at,
                })
                .from(availabilityBlocks)
                .where(and(...filters))
                .orderBy(availabilityBlocks.start_date) // Add ordering to optimize rendering
                .limit(500) // Increased limit to ensure we get all recurring blocks
            : db
                .select({
                  id: availabilityBlocks.id,
                  user_id: availabilityBlocks.user_id,
                  title: availabilityBlocks.title,
                  start_date: availabilityBlocks.start_date,
                  end_date: availabilityBlocks.end_date,
                  status: availabilityBlocks.status,
                  is_recurring: availabilityBlocks.is_recurring,
                  recurrence_pattern: availabilityBlocks.recurrence_pattern,
                  day_of_week: availabilityBlocks.day_of_week,
                  recurrence_group: availabilityBlocks.recurrence_group,
                  recurrence_end_type: availabilityBlocks.recurrence_end_type,
                  recurrence_count: availabilityBlocks.recurrence_count,
                  recurrence_end_date: availabilityBlocks.recurrence_end_date,
                  created_at: availabilityBlocks.created_at,
                  updated_at: availabilityBlocks.updated_at,
                })
                .from(availabilityBlocks)
                .where(eq(availabilityBlocks.user_id, options.userId))
                .orderBy(availabilityBlocks.start_date)
                .limit(50);

        // Set a more generous timeout for the query (10 seconds)
        const timeoutPromise = new Promise<any[]>((_, reject) => {
          setTimeout(() => reject(new Error("Database query timeout")), 10000);
        });

        // Track query execution time
        const startTime = Date.now();

        // Race the query against the timeout
        const blocks = await Promise.race([queryPromise, timeoutPromise]);

        // Calculate and log query execution time
        const executionTime = Date.now() - startTime;

        // Map to DTOs and return
        console.log(
          `✅ [AvailabilityRepository.findAll] Query successful, found ${blocks.length} blocks in ${executionTime}ms`,
        );
        return blocks.map((block: AvailabilityBlock) =>
          this.mapToAvailabilityDTO(block),
        );
      } catch (dbError) {
        console.error(
          "❌ [AvailabilityRepository.findAll] Database query error:",
          dbError,
        );
        return []; // Return empty array instead of throwing
      }
    } catch (error) {
      console.error(
        "❌ [AvailabilityRepository.findAll] Unhandled error:",
        error,
      );
      return []; // Return empty array instead of throwing to make the API more resilient
    }
  }

  async findById(id: number): Promise<AvailabilityDTO | null> {
    try {
      const [block] = await db
        .select()
        .from(availabilityBlocks)
        .where(eq(availabilityBlocks.id, id));
      return block ? this.mapToAvailabilityDTO(block) : null;
    } catch (error) {
      console.error("Error in findById:", error);
      return null;
    }
  }

  async create(data: InsertAvailabilityBlock): Promise<AvailabilityDTO> {
    try {
      const [newBlock] = await db
        .insert(availabilityBlocks)
        .values(data)
        .returning();
      return this.mapToAvailabilityDTO(newBlock);
    } catch (error) {
      console.error("Error in create:", error);
      throw error;
    }
  }

  async update(
    id: number,
    data: Partial<InsertAvailabilityBlock>,
  ): Promise<AvailabilityDTO | null> {
    try {
      const [updatedBlock] = await db
        .update(availabilityBlocks)
        .set({ ...data, updated_at: new Date() })
        .where(eq(availabilityBlocks.id, id))
        .returning();
      return this.mapToAvailabilityDTO(updatedBlock);
    } catch (error) {
      console.error("Error in update:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      // First get the block information with all fields
      const [block] = await db
        .select()
        .from(availabilityBlocks)
        .where(eq(availabilityBlocks.id, id));

      // If block doesn't exist, just return true as it's already gone
      if (!block) {
        console.log(`Block ${id} not found, nothing to delete`);
        return true;
      }

      // Log block properties for debugging
      console.log(
        `Block to delete: ID=${id}, isRecurring=${block.is_recurring}, recurrenceGroup=${block.recurrence_group}, startDate=${new Date(block.start_date).toISOString()}`,
      );

      // More strict checking for recurring blocks to avoid bugs
      const isRecurringBlock =
        block.is_recurring === true &&
        block.recurrence_group !== null &&
        block.recurrence_group !== undefined &&
        block.recurrence_group !== "";

      // If this is not a recurring block, just delete it directly
      if (!isRecurringBlock) {
        console.log(`Deleting regular non-recurring block: ${id}`);
        const result = await db
          .delete(availabilityBlocks)
          .where(eq(availabilityBlocks.id, id));
        console.log(`Deleted non-recurring block ${id}`);
        return true;
      }

      // For a recurring block being individually deleted, we need special handling
      console.log(
        `📅 Deleting single occurrence of recurring block: ${id} in group ${block.recurrence_group}`,
      );

      // Step 1: Store the recurrence information before deleting
      const recurrenceGroup = block.recurrence_group;
      const recurrenceEndType = block.recurrence_end_type;
      const recurrenceCount = block.recurrence_count;
      const deletedDate = new Date(block.start_date);

      // Step 2: Check if there are other instances of this recurring event
      const otherInstances = await db
        .select()
        .from(availabilityBlocks)
        .where(
          and(
            eq(availabilityBlocks.recurrence_group, recurrenceGroup),
            ne(availabilityBlocks.id, id),
          ),
        )
        .orderBy(availabilityBlocks.start_date); // Ensure we get them in chronological order

      console.log(
        `🔎 Found ${otherInstances.length} other instances in the same recurrence group`,
      );

      if (otherInstances.length === 0) {
        // If this is the only instance, just delete it normally
        console.log(`No other instances found, deleting as a normal block`);
        await db
          .delete(availabilityBlocks)
          .where(eq(availabilityBlocks.id, id));
        return true;
      }

      // Step 3: Delete the specific occurrence first
      await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, id));

      // Step 4: Always update the recurrence count for recurring blocks with count-based recurrence
      // Regardless of which occurrence is being deleted, we need to reduce the count since there's one less occurrence
      if (
        recurrenceEndType === "count" &&
        recurrenceCount &&
        recurrenceCount > 1
      ) {
        // We're deleting one occurrence, so decrement the count
        const newCount = Math.max(1, recurrenceCount - 1);
        console.log(
          `Updating recurrence count from ${recurrenceCount} to ${newCount} after deleting occurrence`,
        );

        // Update all instances in this group
        const updateResult = await db
          .update(availabilityBlocks)
          .set({
            recurrence_count: newCount,
            updated_at: new Date(),
          })
          .where(eq(availabilityBlocks.recurrence_group, recurrenceGroup))
          .returning({ id: availabilityBlocks.id });

        console.log(
          `Updated ${updateResult.length} remaining blocks with new count: ${newCount}`,
        );
      }

      console.log(
        `✅ Successfully deleted single occurrence: ${id} from recurrence group ${recurrenceGroup}`,
      );
      console.log(`Instance date: ${deletedDate.toISOString()}`);

      // Verify remaining blocks in debug mode
      const remainingBlocks = await db
        .select({ count: sql`count(*)` })
        .from(availabilityBlocks)
        .where(eq(availabilityBlocks.recurrence_group, recurrenceGroup));

      console.log(
        `After deletion, ${remainingBlocks[0].count} blocks remain in recurrence group ${recurrenceGroup}`,
      );

      return true;
    } catch (error) {
      console.error("❌ Error in delete:", error);
      return false;
    }
  }

  async deleteSeries(id: number): Promise<{ success: boolean; count: number }> {
    try {
      // First get the block to find series information
      const [block] = await db
        .select()
        .from(availabilityBlocks)
        .where(eq(availabilityBlocks.id, id));

      if (!block || !block.is_recurring || !block.recurrence_group) {
        console.warn(
          `Block ${id} is not recurring or has no recurrence_group, cannot delete series`,
        );
        return { success: false, count: 0 };
      }

      // Get the recurrence group to delete all related blocks
      const recurrenceGroup = block.recurrence_group;
      const userId = block.user_id;

      console.log(
        `Deleting all blocks in recurrence group ${recurrenceGroup} for user ${userId}`,
      );

      // Delete all blocks with the same recurrence group and user ID
      const result = await db
        .delete(availabilityBlocks)
        .where(
          and(
            eq(availabilityBlocks.recurrence_group, recurrenceGroup),
            eq(availabilityBlocks.user_id, userId),
          ),
        )
        .returning({ id: availabilityBlocks.id });

      console.log(
        `Deleted ${result.length} blocks from series with recurrence group ${recurrenceGroup}`,
      );

      return {
        success: true,
        count: result.length,
      };
    } catch (error) {
      console.error("Error in deleteSeries:", error);
      return { success: false, count: 0 };
    }
  }

  async findConflicts(
    userId: number,
    startDate: Date | string,
    endDate: Date | string,
    excludeBlockId?: number,
  ): Promise<AvailabilityConflict[]> {
    try {
      console.log(
        `[AvailabilityRepository.findConflicts] Checking conflicts for userId=${userId}, startDate=${startDate}, endDate=${endDate}, excludeBlockId=${excludeBlockId || "none"}`,
      );

      // Validate inputs
      if (!userId || isNaN(userId)) {
        console.error(
          `[AvailabilityRepository.findConflicts] Invalid userId: ${userId}`,
        );
        return []; // Return empty array instead of throwing
      }

      // Convert string dates to Date objects and normalize to UTC
      const startDateObj = new Date(
        typeof startDate === "string" ? startDate : startDate.toISOString(),
      );
      const endDateObj = new Date(
        typeof endDate === "string" ? endDate : endDate.toISOString(),
      );

      // Check if we're dealing with a recurring event
      const baseFilters = [
        eq(availabilityBlocks.user_id, userId),
        or(
          // Check non-recurring blocks
          and(
            sql`${availabilityBlocks.start_date} < ${endDateObj}`,
            sql`${availabilityBlocks.end_date} > ${startDateObj}`,
            eq(availabilityBlocks.is_recurring, false),
          ),
          // Check recurring blocks for the same day of week
          and(
            eq(availabilityBlocks.is_recurring, true),
            eq(availabilityBlocks.day_of_week, startDateObj.getUTCDay()),
          ),
        ),
      ];

      // Validate dates
      if (
        !startDateObj ||
        !endDateObj ||
        isNaN(startDateObj.getTime()) ||
        isNaN(endDateObj.getTime())
      ) {
        console.error(
          `[AvailabilityRepository.findConflicts] Invalid dates: startDate=${startDate}, endDate=${endDate}`,
        );
        return []; // Return empty array instead of throwing
      }

      try {
        // Add the exclude filter if needed
        if (excludeBlockId) {
          baseFilters.push(sql`${availabilityBlocks.id} != ${excludeBlockId}`);
        }

        console.log(
          `[AvailabilityRepository.findConflicts] Executing query with ${baseFilters.length} filters`,
        );

        // Execute the query with all filters - use a more optimized select with a limit
        const conflictingBlocks = await db
          .select({
            id: availabilityBlocks.id,
            user_id: availabilityBlocks.user_id,
            title: availabilityBlocks.title,
            start_date: availabilityBlocks.start_date,
            end_date: availabilityBlocks.end_date,
            status: availabilityBlocks.status,
            is_recurring: availabilityBlocks.is_recurring,
            recurrence_pattern: availabilityBlocks.recurrence_pattern,
            day_of_week: availabilityBlocks.day_of_week,
            recurrence_group: availabilityBlocks.recurrence_group,
            recurrence_end_type: availabilityBlocks.recurrence_end_type,
            recurrence_count: availabilityBlocks.recurrence_count,
            recurrence_end_date: availabilityBlocks.recurrence_end_date,
            created_at: availabilityBlocks.created_at,
            updated_at: availabilityBlocks.updated_at,
          })
          .from(availabilityBlocks)
          .where(and(...baseFilters))
          .orderBy(availabilityBlocks.start_date) // Add ordering for better performance
          .limit(5); // Reduce limit to improve performance

        console.log(
          `[AvailabilityRepository.findConflicts] Found ${conflictingBlocks.length} potential conflicts`,
        );

        return conflictingBlocks.map((block: AvailabilityBlock) => {
          let conflictType: "overlap" | "adjacent" | "contained" = "overlap";

          const blockStart = new Date(block.start_date);
          const blockEnd = new Date(block.end_date);

          // Check if new block is entirely contained within existing block
          if (startDateObj >= blockStart && endDateObj <= blockEnd) {
            conflictType = "contained";
          }
          // Check if blocks are adjacent (might want to allow this)
          else if (
            Math.abs(new Date(startDateObj).getTime() - blockEnd.getTime()) <
              1000 ||
            Math.abs(new Date(endDateObj).getTime() - blockStart.getTime()) <
              1000
          ) {
            conflictType = "adjacent";
          }

          const dto = this.mapToAvailabilityDTO(block);
          return {
            existingBlock: dto,
            conflictType,
          };
        });
      } catch (dbError) {
        console.error(
          "[AvailabilityRepository.findConflicts] Database error:",
          dbError,
        );
        return []; // Return empty array instead of throwing
      }
    } catch (error) {
      console.error(
        "[AvailabilityRepository.findConflicts] Unhandled error:",
        error,
      );
      return []; // Return empty array instead of throwing to make the API more resilient
    }
  }
}

export const availabilityRepository = new AvailabilityRepository();
