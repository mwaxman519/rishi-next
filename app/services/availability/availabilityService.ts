import { insertAvailabilityBlockSchema } from "../../../shared/schema";
import { availabilityRepository } from "./repository";
import {
  AvailabilityResponse,
  AvailabilitiesResponse,
  AvailabilityDTO,
  CreateAvailabilityRequest,
  UpdateAvailabilityRequest,
  AvailabilityQueryOptions,
  ConflictCheckResponse,
  ServiceResponse,
} from "./models";
import { distributedEventBus } from "../infrastructure/distributedEventBus";
// Remove event imports since they're causing issues
// We'll just type the events directly where needed

/**
 * AvailabilityService - Handles business logic for availability management
 */
class AvailabilityService {
  /**
   * Get all availability blocks for a user
   */
  async getAvailabilityBlocks(
    options: AvailabilityQueryOptions,
  ): Promise<AvailabilitiesResponse> {
    try {
      const blocks = await availabilityRepository.findAll(options);
      return {
        success: true,
        data: blocks,
      };
    } catch (error) {
      console.error("Error in getAvailabilityBlocks:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve availability blocks",
      };
    }
  }

  /**
   * Get a specific availability block by ID
   */
  async getAvailabilityBlockById(id: number): Promise<AvailabilityResponse> {
    try {
      const block = await availabilityRepository.findById(id);

      if (!block) {
        return {
          success: false,
          error: "Availability block not found",
        };
      }

      return {
        success: true,
        data: block,
      };
    } catch (error) {
      console.error(`Error in getAvailabilityBlockById for ID ${id}:`, error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve availability block",
      };
    }
  }

  /**
   * Create a new availability block
   */
  async createAvailabilityBlock(
    data: CreateAvailabilityRequest,
  ): Promise<AvailabilityResponse> {
    try {
      console.log(
        "Creating availability block with data:",
        JSON.stringify(data, null, 2),
      );

      // Define blockData outside if-else to avoid scope issues
      let blockData;
      const createdBlockIds = [];

      // Handle recurring events
      if (data.isRecurring) {
        // Generate a unique ID for the recurrence group with timestamp and random component to ensure uniqueness
        const recurrenceGroupId = `${data.userId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        console.log(`Created new recurrence group ID: ${recurrenceGroupId}`);

        // Create normalized dates for calculations
        const startDate = new Date(data.startDate);
        const dayOfWeek = startDate.getDay(); // 0-6, Sunday-Saturday
        const endDate = new Date(data.endDate);

        // Duration between start and end for each occurrence
        const timeDurationMs = endDate.getTime() - startDate.getTime();

        // Set the date for the first occurrence
        const firstDate = new Date(startDate);

        // Get pattern and validate
        const pattern = data.recurrencePattern || "weekly";

        // Initialize tracking variables
        let occurrencesToCreate = 1; // Default to 1 if not specified
        let endDateLimit: Date | null = null;

        // CRITICAL: Create a set to track already created dates to prevent duplicates
        const createdDates = new Set<string>();

        // RECURRENCE END DETERMINATION - Calculate number of occurrences based on end type
        if (
          data.recurrenceEndType === "count" &&
          data.recurrenceCount &&
          data.recurrenceCount > 0
        ) {
          // Count-based recurrence: create a specific number of instances
          occurrencesToCreate = data.recurrenceCount;
          console.log(
            `Creating ${occurrencesToCreate} occurrences based on count`,
          );
        } else if (
          data.recurrenceEndType === "date" &&
          data.recurrenceEndDate
        ) {
          // Date-based recurrence: create until end date
          endDateLimit = new Date(data.recurrenceEndDate);

          // Calculate approximate occurrences based on pattern and end date
          const daysBetween = Math.ceil(
            (endDateLimit.getTime() - firstDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          if (pattern === "daily") {
            occurrencesToCreate = daysBetween + 1;
          } else if (pattern === "weekly") {
            occurrencesToCreate = Math.ceil(daysBetween / 7) + 1;
          } else if (pattern === "biweekly") {
            occurrencesToCreate = Math.ceil(daysBetween / 14) + 1;
          } else {
            occurrencesToCreate = Math.ceil(daysBetween / 7) + 1; // Default fallback
          }

          console.log(
            `Creating occurrences until date: ${endDateLimit.toISOString()} (estimated: ${occurrencesToCreate} occurrences)`,
          );
        } else if (data.recurrenceEndType === "never") {
          // If "never" is specified, limit based on pattern
          if (pattern === "daily") {
            occurrencesToCreate = 30; // About a month of daily occurrences
          } else if (pattern === "weekly") {
            occurrencesToCreate = 52; // About a year of weekly occurrences
          } else if (pattern === "biweekly") {
            occurrencesToCreate = 26; // About a year of biweekly occurrences
          } else {
            occurrencesToCreate = 52; // Default
          }
          console.log(
            `Creating ${occurrencesToCreate} occurrences for "never" end type (safety limit)`,
          );
        }

        // Safety limit to prevent excessive database writes
        const MAX_OCCURRENCES = 104; // Maximum of 2 years of weekly occurrences
        if (occurrencesToCreate > MAX_OCCURRENCES) {
          console.warn(
            `Limiting occurrences from ${occurrencesToCreate} to ${MAX_OCCURRENCES}`,
          );
          occurrencesToCreate = MAX_OCCURRENCES;
        }

        // BLOCK CREATION
        // Track successful block creation
        let actualOccurrencesCreated = 0;

        // Create all recurrence instances
        for (let i = 0; i < occurrencesToCreate; i++) {
          try {
            // Make a fresh copy of the first date for each iteration
            const currentDate = new Date(firstDate);

            // CRITICAL: Generate correct date offset based on pattern
            if (pattern === "weekly") {
              // For weekly, add 7 days for each iteration
              currentDate.setDate(currentDate.getDate() + i * 7);
            } else if (pattern === "daily") {
              // For daily, add 1 day for each iteration
              currentDate.setDate(currentDate.getDate() + i);
            } else if (pattern === "biweekly") {
              // For biweekly, add 14 days for each iteration
              currentDate.setDate(currentDate.getDate() + i * 14);
            }

            // Calculate end date based on original duration
            const currentEndDate = new Date(
              currentDate.getTime() + timeDurationMs,
            );

            // Create ISO date string for comparison - use only date part for uniqueness check
            const dateKey = currentDate.toISOString().split("T")[0];

            // CRITICAL: Skip if we already created a block for this date
            if (createdDates.has(dateKey)) {
              console.log(`⚠️ Skipping duplicate date: ${dateKey}`);
              continue;
            }

            // Add to tracking set to avoid duplicates
            createdDates.add(dateKey);

            // End date limit check - stop if we exceed the end date
            if (endDateLimit && currentDate > endDateLimit) {
              console.log(
                `Stopping at occurrence ${i + 1}/${occurrencesToCreate} - exceeds end date limit`,
              );
              break;
            }

            console.log(
              `Creating occurrence ${i + 1}/${occurrencesToCreate}: ${currentDate.toISOString()} to ${currentEndDate.toISOString()}`,
            );

            // Set up the block data for this occurrence
            const currentBlockData = {
              user_id: data.userId,
              title: data.title || "Available",
              start_date: currentDate,
              end_date: currentEndDate,
              status: data.status || "available",
              is_recurring: true,
              recurring: true,
              day_of_week: currentDate.getDay(), // Use actual day of week for this occurrence
              recurrence_pattern: pattern,
              recurrence_group: recurrenceGroupId,
              recurrence_end_type: data.recurrenceEndType || "never",
              recurrence_count: data.recurrenceCount || null,
              recurrence_end_date: data.recurrenceEndDate
                ? new Date(data.recurrenceEndDate)
                : null,
            };

            // Create this occurrence
            const newBlock =
              await availabilityRepository.create(currentBlockData);
            if (newBlock) {
              console.log(
                `✅ Successfully created occurrence ${i + 1} with ID ${newBlock.id} on ${dateKey}`,
              );
              createdBlockIds.push(newBlock.id);
              actualOccurrencesCreated++;
            }
          } catch (error) {
            console.error(`❌ Error creating occurrence ${i + 1}:`, error);
          }
        }

        console.log(
          `Successfully created ${actualOccurrencesCreated} of ${occurrencesToCreate} planned occurrences`,
        );

        // Return the first block created
        if (createdBlockIds.length > 0) {
          console.log(
            `Created ${createdBlockIds.length} blocks, returning the first one ID ${createdBlockIds[0]}`,
          );
          try {
            const firstBlock = await availabilityRepository.findById(
              createdBlockIds[0],
            );
            if (firstBlock) {
              // Publish event for the first block
              await distributedEventBus.publish("availability.created", {
                id: firstBlock.id,
                userId: firstBlock.userId,
                startDate: new Date(firstBlock.startDate),
                endDate: new Date(firstBlock.endDate),
              });

              return {
                success: true,
                data: firstBlock,
              };
            }
          } catch (error) {
            console.error("Error fetching first created block:", error);
          }
        }

        // If we made it here but have blocks, return success with the count
        if (createdBlockIds.length > 0) {
          console.log(
            `Created ${createdBlockIds.length} blocks but couldn't fetch the first one. Returning partial success.`,
          );
          return {
            success: true,
            data: {
              id: createdBlockIds[0],
              userId: data.userId,
              title: data.title || "Available",
              startDate: data.startDate,
              endDate: data.endDate,
              status: data.status || "available",
              isRecurring: true,
              recurrencePattern: pattern,
              recurrenceEndType: data.recurrenceEndType,
              recurrenceGroup: recurrenceGroupId,
              dayOfWeek: dayOfWeek,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as any, // Cast to any to satisfy the return type
          };
        }

        // If we couldn't create any blocks, return an error
        console.error("Failed to create any recurring blocks");
        return {
          success: false,
          error: "Failed to create recurring blocks",
        };
      } else {
        // Handle non-recurring events normally
        blockData = {
          user_id: data.userId,
          title: data.title || "Available",
          start_date: data.startDate,
          end_date: data.endDate,
          status: data.status || "available",
          is_recurring: false,
          recurring: false,
          day_of_week: null,
          recurrence_pattern: null,
          recurrence_group: null,
          recurrence_end_type: null,
          recurrence_count: null,
          recurrence_end_date: null,
        };
      }

      // Validate with schema
      const validationResult =
        insertAvailabilityBlockSchema.safeParse(blockData);

      if (!validationResult.success) {
        return {
          success: false,
          error: `Validation error: ${JSON.stringify(validationResult.error.format())}`,
        };
      }

      // Check for conflicts
      const conflicts = await availabilityRepository.findConflicts(
        data.userId,
        data.startDate,
        data.endDate,
      );

      // Handle conflicts based on block types
      if (
        conflicts.length > 0 &&
        conflicts.some((c) => c.conflictType !== "adjacent")
      ) {
        // We have real conflicts (not just adjacent blocks)

        // First, check if we need to handle a merge or override case
        const blocksThatNeedAction = conflicts.filter(
          (c) => c.conflictType !== "adjacent",
        );

        if (blocksThatNeedAction.length > 0) {
          // This block handles merging of same-type blocks or overriding different-type blocks

          // Step 1: Process each conflict
          for (const conflict of blocksThatNeedAction) {
            const existingBlock = conflict.existingBlock;

            // Check if blocks are of the same type (both available or both unavailable)
            if (existingBlock.status === data.status) {
              // Same type - merge by expanding the timeframe if needed

              // Get start and end time boundaries that encompass both blocks
              const newStart = new Date(data.startDate);
              const newEnd = new Date(data.endDate);
              const existingStart = new Date(existingBlock.startDate);
              const existingEnd = new Date(existingBlock.endDate);

              // Calculate merged time boundaries
              const mergedStart =
                newStart < existingStart ? newStart : existingStart;
              const mergedEnd = newEnd > existingEnd ? newEnd : existingEnd;

              // Update the existing block with the merged times
              await availabilityRepository.update(existingBlock.id, {
                start_date: mergedStart,
                end_date: mergedEnd,
                // Keep other properties from the existing block
                title: existingBlock.title,
                status: existingBlock.status,
                is_recurring: existingBlock.isRecurring,
                recurrence_pattern: existingBlock.recurrencePattern,
                day_of_week: existingBlock.dayOfWeek,
              });

              // Return the updated block
              const updatedBlock = await availabilityRepository.findById(
                existingBlock.id,
              );
              return {
                success: true,
                data: updatedBlock!,
              };
            } else {
              // Different type - override by updating the existing block
              await availabilityRepository.update(existingBlock.id, {
                title: data.title || "Available",
                status: data.status || "available",
                is_recurring: data.isRecurring || false,
                recurring: data.isRecurring || false, // Sync both fields
                day_of_week: data.dayOfWeek,
                recurrence_pattern: data.recurrencePattern,
                // Keep the same time bounds for the override
                start_date:
                  typeof existingBlock.startDate === "string"
                    ? new Date(existingBlock.startDate)
                    : existingBlock.startDate,
                end_date:
                  typeof existingBlock.endDate === "string"
                    ? new Date(existingBlock.endDate)
                    : existingBlock.endDate,
              });

              // Return the updated block
              const updatedBlock = await availabilityRepository.findById(
                existingBlock.id,
              );
              return {
                success: true,
                data: updatedBlock!,
              };
            }
          }
        }
      }

      // If we get here, no conflict handling was needed, so create a new block
      const newBlock = await availabilityRepository.create(
        validationResult.data,
      );

      // Publish event
      await distributedEventBus.publish("availability.created", {
        id: newBlock.id,
        userId: newBlock.userId,
        startDate: new Date(newBlock.startDate),
        endDate: new Date(newBlock.endDate),
      });

      return {
        success: true,
        data: newBlock,
      };
    } catch (error) {
      console.error("Error in createAvailabilityBlock:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create availability block",
      };
    }
  }

  /**
   * Update an existing availability block
   */
  async updateAvailabilityBlock(
    id: number,
    data: UpdateAvailabilityRequest,
  ): Promise<AvailabilityResponse> {
    try {
      // First check if block exists
      const existingBlock = await availabilityRepository.findById(id);

      if (!existingBlock) {
        return {
          success: false,
          error: "Availability block not found",
        };
      }

      // Check if this is part of a recurring group
      const isPartOfRecurringGroup =
        existingBlock.recurrenceGroup && existingBlock.isRecurring;

      // Convert DTO to database model
      const updateData: Record<string, any> = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.startDate !== undefined) updateData.start_date = data.startDate;
      if (data.endDate !== undefined) updateData.end_date = data.endDate;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.isRecurring !== undefined) {
        updateData.is_recurring = data.isRecurring;
        updateData.recurring = data.isRecurring; // Sync both fields
      }
      if (data.dayOfWeek !== undefined) updateData.day_of_week = data.dayOfWeek;
      if (data.recurrencePattern !== undefined)
        updateData.recurrence_pattern = data.recurrencePattern;

      // Add support for recurrence end options
      if (data.recurrenceEndType !== undefined)
        updateData.recurrence_end_type = data.recurrenceEndType;
      if (data.recurrenceCount !== undefined)
        updateData.recurrence_count = data.recurrenceCount;
      if (data.recurrenceEndDate !== undefined)
        updateData.recurrence_end_date = data.recurrenceEndDate;

      // Check for conflicts if time is being updated
      if (data.startDate || data.endDate) {
        const startDate = data.startDate || existingBlock.startDate;
        const endDate = data.endDate || existingBlock.endDate;

        const conflicts = await availabilityRepository.findConflicts(
          existingBlock.userId,
          startDate,
          endDate,
          id, // Exclude the current block
        );

        // Handle conflicts based on block types
        if (
          conflicts.length > 0 &&
          conflicts.some((c) => c.conflictType !== "adjacent")
        ) {
          // We have real conflicts (not just adjacent blocks)
          const blocksThatNeedAction = conflicts.filter(
            (c) => c.conflictType !== "adjacent",
          );

          if (blocksThatNeedAction.length > 0) {
            const currentStatus = data.status || existingBlock.status;

            for (const conflict of blocksThatNeedAction) {
              const conflictBlock = conflict.existingBlock;

              // Check if blocks are of the same type
              if (conflictBlock.status === currentStatus) {
                // Same type - merge by expanding the timeframe
                const newStart = new Date(startDate);
                const newEnd = new Date(endDate);
                const conflictStart = new Date(conflictBlock.startDate);
                const conflictEnd = new Date(conflictBlock.endDate);

                // Calculate merged boundaries
                const mergedStart =
                  newStart < conflictStart ? newStart : conflictStart;
                const mergedEnd = newEnd > conflictEnd ? newEnd : conflictEnd;

                // First, update the current block with the merged timeframe
                updateData.start_date = mergedStart;
                updateData.end_date = mergedEnd;

                // Then, delete the conflicting block since it's now merged
                await availabilityRepository.delete(conflictBlock.id);
              } else {
                // Different type - current block overrides the conflicting block within its timeframe
                // We need to potentially split the existing block if the updated block only covers part of it

                const newStart = new Date(startDate);
                const newEnd = new Date(endDate);
                const conflictStart = new Date(conflictBlock.startDate);
                const conflictEnd = new Date(conflictBlock.endDate);

                // Case 1: Current block completely covers conflict block - just delete conflict
                if (newStart <= conflictStart && newEnd >= conflictEnd) {
                  await availabilityRepository.delete(conflictBlock.id);
                }
                // Case 2: Current block is in the middle of conflict block - split into two blocks
                else if (newStart > conflictStart && newEnd < conflictEnd) {
                  // Update existing conflict block to end where new block starts
                  await availabilityRepository.update(conflictBlock.id, {
                    end_date: newStart,
                  });

                  // Create a new block after the new block
                  // Make sure we're creating with the right types expected by Drizzle
                  await availabilityRepository.create({
                    user_id: conflictBlock.userId,
                    title: conflictBlock.title || "",
                    start_date: newEnd,
                    end_date: conflictEnd,
                    status: conflictBlock.status || "available",
                    is_recurring: !!conflictBlock.isRecurring,
                    recurring: !!conflictBlock.isRecurring, // Sync with is_recurring
                    recurrence_pattern: conflictBlock.recurrencePattern,
                    day_of_week:
                      typeof conflictBlock.dayOfWeek === "number"
                        ? conflictBlock.dayOfWeek
                        : undefined,
                  });
                }
                // Case 3: Current block overlaps the beginning of conflict block
                else if (
                  newStart <= conflictStart &&
                  newEnd < conflictEnd &&
                  newEnd > conflictStart
                ) {
                  // Just update the conflict block's start time
                  await availabilityRepository.update(conflictBlock.id, {
                    start_date: newEnd,
                  });
                }
                // Case 4: Current block overlaps the end of conflict block
                else if (
                  newStart > conflictStart &&
                  newStart < conflictEnd &&
                  newEnd >= conflictEnd
                ) {
                  // Just update the conflict block's end time
                  await availabilityRepository.update(conflictBlock.id, {
                    end_date: newStart,
                  });
                }
              }
            }
          }
        }
      }

      // Update the block
      const updatedBlock = await availabilityRepository.update(id, updateData);

      if (!updatedBlock) {
        return {
          success: false,
          error: "Failed to update availability block",
        };
      }

      // Publish event
      await distributedEventBus.publish("availability.updated", {
        id: updatedBlock.id,
        userId: updatedBlock.userId,
        changes: updateData,
      });

      return {
        success: true,
        data: updatedBlock,
      };
    } catch (error) {
      console.error(`Error in updateAvailabilityBlock for ID ${id}:`, error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update availability block",
      };
    }
  }

  /**
   * Delete an availability block
   * If deleteSeries is true, delete all blocks in the same recurrence group
   */
  async deleteAvailabilityBlock(
    id: number,
    deleteSeries: boolean = false,
  ): Promise<ServiceResponse<{ success: boolean; count?: number }>> {
    try {
      console.log(
        `⏳ Starting deletion process for block ID ${id}, deleteSeries=${deleteSeries}`,
      );

      // First check if block exists
      const existingBlock = await availabilityRepository.findById(id);

      if (!existingBlock) {
        console.log(`⚠️ Block ID ${id} not found for deletion`);
        return {
          success: false,
          error: "Availability block not found",
        };
      }

      // Check if this is a recurring block - be more explicit to avoid silent failures
      const isRecurring =
        existingBlock.isRecurring === true &&
        existingBlock.recurrenceGroup !== null &&
        existingBlock.recurrenceGroup !== undefined;

      // Log all properties to help debug
      console.log(
        `Block ID ${id} properties: isRecurring=${existingBlock.isRecurring}, recurrenceGroup=${existingBlock.recurrenceGroup}`,
      );
      console.log(
        `Final determination: isRecurring=${isRecurring}, deleteSeries=${deleteSeries}`,
      );

      // CASE 1: Delete entire series
      if (deleteSeries && isRecurring) {
        console.log(
          `🗑️ Deleting entire recurrence series for block ID ${id} (group: ${existingBlock.recurrenceGroup})`,
        );

        // Delete all blocks in the series
        const seriesResult = await availabilityRepository.deleteSeries(id);

        if (!seriesResult.success) {
          console.error(
            `❌ Failed to delete recurring series for block ID ${id}`,
          );
          return {
            success: false,
            error: "Failed to delete recurring series",
          };
        }

        console.log(
          `✅ Successfully deleted ${seriesResult.count} blocks in recurrence series`,
        );

        // Publish event for the series deletion
        await distributedEventBus.publish("availability.deleted", {
          id,
          userId: existingBlock.userId,
        });

        return {
          success: true,
          data: {
            success: true,
            count: seriesResult.count,
          },
        };
      }
      // CASE 2: Delete single instance from recurring series
      else if (isRecurring) {
        console.log(
          `🗑️ Deleting single occurrence from recurring series, block ID ${id}, group ${existingBlock.recurrenceGroup}`,
        );

        // Delete the single block with recurrence handling
        const result = await availabilityRepository.delete(id);

        if (!result) {
          console.error(
            `❌ Failed to delete single occurrence from recurring series, block ID ${id}`,
          );
          return {
            success: false,
            error: "Failed to delete availability block",
          };
        }

        console.log(
          `✅ Successfully deleted single occurrence from recurring series, block ID ${id}`,
        );

        // Publish event
        await distributedEventBus.publish("availability.deleted", {
          id,
          userId: existingBlock.userId,
        });

        return {
          success: true,
          data: {
            success: true,
            count: 1,
          },
        };
      }
      // CASE 3: Delete regular non-recurring block
      else {
        console.log(
          `🗑️ Deleting single non-recurring block ID ${id} (isRecurring=${existingBlock.isRecurring})`,
        );

        // For non-recurring blocks, just delete normally
        const result = await availabilityRepository.delete(id);

        if (!result) {
          console.error(`❌ Failed to delete non-recurring block ID ${id}`);
          return {
            success: false,
            error: "Failed to delete availability block",
          };
        }

        console.log(`✅ Successfully deleted non-recurring block ID ${id}`);

        // Publish event
        await distributedEventBus.publish("availability.deleted", {
          id,
          userId: existingBlock.userId,
        });

        return {
          success: true,
          data: {
            success: true,
            count: 1,
          },
        };
      }
    } catch (error) {
      console.error(`Error in deleteAvailabilityBlock for ID ${id}:`, error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete availability block",
      };
    }
  }

  /**
   * Check for conflicts with existing availability blocks
   */
  async checkForConflicts(
    userId: number,
    startDate: Date | string,
    endDate: Date | string,
    excludeBlockId?: number,
  ): Promise<ConflictCheckResponse> {
    try {
      // Convert string dates to Date objects if needed
      const startDateObj =
        typeof startDate === "string" ? new Date(startDate) : startDate;
      const endDateObj =
        typeof endDate === "string" ? new Date(endDate) : endDate;

      const conflicts = await availabilityRepository.findConflicts(
        userId,
        startDateObj,
        endDateObj,
        excludeBlockId,
      );

      // Filter out adjacent blocks if needed
      const significantConflicts = conflicts.filter(
        (c) => c.conflictType !== "adjacent",
      );

      return {
        success: true,
        data: {
          hasConflicts: significantConflicts.length > 0,
          conflicts: significantConflicts.length > 0 ? conflicts : undefined,
        },
      };
    } catch (error) {
      console.error("Error in checkForConflicts:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check for conflicts",
      };
    }
  }
}

export const availabilityService = new AvailabilityService();
