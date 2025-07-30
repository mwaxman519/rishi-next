/**
 * Block Merger
 * This module provides a function to merge adjacent or overlapping availability blocks
 * of the same status to make them appear as a single continuous block.
 */

interface Block {
  id: number;
  start: Date;
  end: Date;
  status: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  recurrenceGroup?: string;
  dayOfWeek?: number;
  title?: string;
  [key: string]: any; // Allow for other properties
}

interface MergedBlock extends Block {
  isMerged?: boolean;
  mergedIds?: number[];
  originalStart?: Date;
  originalEnd?: Date;
  displayStart?: Date;
  displayEnd?: Date;
  mergedBlockData?: Array<{
    id: number;
    start: Date;
    end: Date;
    title?: string;
  }>;
  // These properties will be used to force calendar visual rendering
  _forceId?: string; // Unique ID to avoid FullCalendar caching
  _forceTitleWithTime?: string; // Title with time info
}

/**
 * Merges adjacent or overlapping blocks of the same status
 * @param blocks Original availability blocks
 * @returns Array of blocks with adjacent blocks merged
 */
export function mergeAdjacentBlocks(blocks: Block[]): MergedBlock[] {
  // If there are 0 or 1 blocks, no merging is needed
  if (blocks.length <= 1) {
    return blocks as MergedBlock[];
  }

  console.log("Processing", blocks.length, "blocks to merge adjacent ones");

  // Group blocks by day and status
  const blocksByDayAndStatus: Record<string, Block[]> = {};

  blocks.forEach((block) => {
    const day = new Date(block.start).toDateString();
    const status = block.status || "available";
    const key = `${day}|${status}`;

    if (!blocksByDayAndStatus[key]) {
      blocksByDayAndStatus[key] = [];
    }

    blocksByDayAndStatus[key].push({ ...block });
  });

  // Result array to hold all merged blocks
  const result: MergedBlock[] = [];

  // Process each day/status group
  Object.entries(blocksByDayAndStatus).forEach(([key, blocksInGroup]) => {
    // If we only have one block in this group, no need to merge
    if (blocksInGroup.length === 1) {
      result.push({
        ...blocksInGroup[0],
        mergedIds: [blocksInGroup[0].id],
      } as MergedBlock);
      return;
    }

    const [day, status] = key.split("|");
    console.log(`Found ${blocksInGroup.length} '${status}' blocks on ${day}`);

    // If this is an 'unavailable' group with multiple blocks on the same day (the case in the screenshot),
    // merge them into a single visual block regardless of time gaps
    if (status === "unavailable" && blocksInGroup.length > 1) {
      console.log(
        `🔄 Merging ${blocksInGroup.length} unavailable blocks into one visual block for ${day}`,
      );

      // First sort the blocks by start time to ensure we process them in order
      blocksInGroup.sort((a, b) => {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });

      // Find the earliest start time and latest end time across all blocks
      let earliestStart = new Date(blocksInGroup[0].start);
      let latestEnd = new Date(blocksInGroup[0].end);
      const mergedIds = [blocksInGroup[0].id];

      // Log the first block
      console.log(
        `  📌 Initial block: ${new Date(earliestStart).toLocaleTimeString()} - ${new Date(latestEnd).toLocaleTimeString()} (ID: ${blocksInGroup[0].id})`,
      );

      for (let i = 1; i < blocksInGroup.length; i++) {
        const block = blocksInGroup[i];
        const blockStart = new Date(block.start);
        const blockEnd = new Date(block.end);

        console.log(
          `  📌 Block ${i}: ${blockStart.toLocaleTimeString()} - ${blockEnd.toLocaleTimeString()} (ID: ${block.id})`,
        );

        if (blockStart < earliestStart) {
          console.log(
            `    📊 New earliest start: ${blockStart.toLocaleTimeString()}`,
          );
          earliestStart = blockStart;
        }
        if (blockEnd > latestEnd) {
          console.log(
            `    📊 New latest end: ${blockEnd.toLocaleTimeString()}`,
          );
          latestEnd = blockEnd;
        }
        mergedIds.push(block.id);
      }

      console.log(
        `  🔄 Final merged block: ${earliestStart.toLocaleTimeString()} - ${latestEnd.toLocaleTimeString()}, containing ${mergedIds.length} blocks`,
      );

      // Store details of all blocks for reference
      const mergedBlockData = blocksInGroup.map((block) => ({
        id: block.id,
        start: new Date(block.start),
        end: new Date(block.end),
        title: block.title,
      }));

      // Format times for display
      const formattedStartTime = earliestStart.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      const formattedEndTime = latestEnd.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      // Create a force ID with timestamp to prevent caching issues
      const forceId = `merged-${mergedIds.join("-")}-${Date.now()}`;

      // Force title with time for better visual display
      const forceTitleWithTime = `Unavailable: ${formattedStartTime} - ${formattedEndTime}`;

      // Create a single merged block spanning the entire time range
      // But preserve the original start/end times as additional properties
      // that can be used for display purposes
      const mergedBlock: MergedBlock = {
        ...blocksInGroup[0],
        id: blocksInGroup[0].id,
        // Use explicit new Date objects to avoid reference issues
        start: new Date(earliestStart),
        end: new Date(latestEnd),
        // Store the original block data for reference
        originalStart: new Date(blocksInGroup[0].start),
        originalEnd: new Date(blocksInGroup[0].end),
        // These properties are used for visual rendering in the calendar
        displayStart: new Date(earliestStart),
        displayEnd: new Date(latestEnd),
        // Track which blocks are part of this merged group
        mergedIds: mergedIds,
        mergedBlockData: mergedBlockData,
        isMerged: true,
        // Add a clear title that shows the time span
        title: forceTitleWithTime,
        // Special properties to force calendar rendering
        _forceId: forceId,
        _forceTitleWithTime: forceTitleWithTime,
      };

      console.log(
        `Merged ${blocksInGroup.length} 'unavailable' blocks into one: IDs ${mergedIds.join(", ")}`,
      );
      result.push(mergedBlock);
      return;
    }

    // For other statuses or single blocks, sort by start time and merge adjacent ones
    blocksInGroup.sort((a, b) => {
      const aStart = new Date(a.start).getTime();
      const bStart = new Date(b.start).getTime();
      return aStart - bStart;
    });

    let currentMergedBlock: MergedBlock = {
      ...blocksInGroup[0],
      mergedIds: [blocksInGroup[0].id],
    };

    for (let i = 1; i < blocksInGroup.length; i++) {
      const nextBlock = blocksInGroup[i];
      const nextBlockStart = new Date(nextBlock.start).getTime();
      const currentBlockEnd = new Date(currentMergedBlock.end).getTime();
      const timeDifference = nextBlockStart - currentBlockEnd;

      // Consider blocks adjacent if they start within 5 minutes of each other
      const isAdjacent = Math.abs(timeDifference) <= 5 * 60 * 1000; // 5 minutes

      // Check if blocks overlap
      const isOverlapping = nextBlockStart <= currentBlockEnd;

      if (isAdjacent || isOverlapping) {
        // Extend the end time if needed
        const nextBlockEnd = new Date(nextBlock.end).getTime();
        const currentMergedBlockEnd = new Date(
          currentMergedBlock.end,
        ).getTime();

        if (nextBlockEnd > currentMergedBlockEnd) {
          currentMergedBlock.end = new Date(nextBlock.end);
        }

        // Add this block's ID to the merged IDs
        currentMergedBlock.mergedIds?.push(nextBlock.id);
        currentMergedBlock.isMerged = true;
      } else {
        // If not adjacent, add the current merged block and start a new one
        result.push(currentMergedBlock);
        currentMergedBlock = {
          ...nextBlock,
          mergedIds: [nextBlock.id],
        };
      }
    }

    // Add the final merged block from this group
    result.push(currentMergedBlock);
  });

  console.log(
    `Merged blocks: ${blocks.length} original → ${result.length} merged`,
  );
  return result;
}
