import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "../ui/button";
import SimpleDialog from "../ui/SimpleDialog";

interface BlockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: {
    id: number;
    title: string;
    start: string;
    end: string;
    status: string;
    isRecurring: boolean;
    recurrencePattern?: string;
    dayOfWeek?: number;
    recurrenceGroup?: string;
    // Additional merged blocks info
    mergedIds?: number[];
    isMerged?: boolean;
    extendedProps?: {
      mergedIds?: number[];
      mergedBlockData?: Array<{
        id: number;
        start: Date;
        end: Date;
        title?: string;
      }>;
    };
  };
  onDelete: (blockId: number, deleteEntireSeries: boolean) => Promise<void>;
  onEdit: (block: any) => void;
}

export default function BlockDetailModal({
  isOpen,
  onClose,
  block,
  onDelete,
  onEdit,
}: BlockDetailModalProps) {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteRecurringMode, setDeleteRecurringMode] = useState<
    "single" | "series" | null
  >(null);
  const [isConfirmMergedDeleteOpen, setIsConfirmMergedDeleteOpen] =
    useState(false);
  const [confirmMergedDeleteText, setConfirmMergedDeleteText] = useState("");

  // Format dates for display
  const startDate = new Date(block.start);
  const endDate = new Date(block.end);
  const formattedDate = format(startDate, "EEEE, MMMM d, yyyy");
  const formattedStartTime = format(startDate, "h:mm a");
  const formattedEndTime = format(endDate, "h:mm a");

  // Day of week names for recurring events
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek =
    block.dayOfWeek !== undefined ? dayNames[block.dayOfWeek] : "";

  // Status display with nicer formatting
  const statusDisplay =
    block.status.charAt(0).toUpperCase() + block.status.slice(1);

  // Handle beginning delete process
  const handleDeleteClick = () => {
    if (block.isRecurring) {
      // For recurring blocks, we need to ask which mode
      setDeleteRecurringMode(null); // Reset
      setIsConfirmDeleteOpen(true);
    } else {
      // For non-recurring blocks, go straight to confirmation
      setDeleteRecurringMode("single");
      setIsConfirmDeleteOpen(true);
    }
  };

  // Handle actual delete
  const handleConfirmDelete = async (deleteEntireSeries: boolean) => {
    try {
      setIsDeleting(true);

      // If this is a merged block, delete all blocks within it
      const mergedIds = block.mergedIds || block.extendedProps?.mergedIds;

      if (mergedIds && mergedIds.length > 1) {
        console.log(`Deleting all ${mergedIds.length} blocks in merged block`);
        // Delete each block in the merged set
        for (const id of mergedIds) {
          try {
            await onDelete(id, deleteEntireSeries);
          } catch (err) {
            console.error(`Error deleting merged block with ID ${id}:`, err);
          }
        }
      } else {
        // Just delete the single block
        await onDelete(block.id, deleteEntireSeries);
      }

      setIsConfirmDeleteOpen(false);
      onClose();
    } catch (error) {
      console.error("Error deleting block:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const detailModalTitle = (
    <div className="flex items-center">
      <span>{block.title || "Availability Block"}</span>
      {block.isRecurring && (
        <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full text-blue-600 dark:text-blue-300">
          Recurring 🔄
        </span>
      )}
    </div>
  );

  const detailModalFooter = (
    <div className="flex justify-between w-full">
      <Button variant="destructive" onClick={handleDeleteClick}>
        Delete
      </Button>
      <div>
        <Button variant="outline" onClick={onClose} className="mr-2">
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={() => {
            // Check if this is a merged block
            const isMergedBlock =
              block.isMerged ||
              (block.mergedIds && block.mergedIds.length > 1) ||
              (block.extendedProps?.mergedIds &&
                block.extendedProps.mergedIds.length > 1);

            if (isMergedBlock) {
              // For merged blocks, show a more informative dialog
              const mergedCount =
                block.mergedIds?.length ||
                block.extendedProps?.mergedIds?.length ||
                0;
              const mergedText = `This is a visual representation of ${mergedCount} consecutive blocks.

To modify parts of this time range:
1. Delete this availability block
2. Create new blocks for the specific times you need

Would you like to delete this block now?`;

              // Use styled confirmation dialog instead of browser confirm
              setConfirmMergedDeleteText(mergedText);
              setIsConfirmMergedDeleteOpen(true);
            } else {
              // Standard edit for non-merged blocks
              onEdit(block);
            }
          }}
        >
          Edit
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Main Detail Modal */}
      <SimpleDialog
        isOpen={isOpen}
        onClose={onClose}
        title={block.title || "Availability Block"}
        footer={detailModalFooter}
      >
        <div className="space-y-4">
          {block.isRecurring && (
            <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 p-2 text-blue-800 dark:text-blue-200 flex items-center mb-4">
              <span className="mr-2">🔄</span>
              <span>This is a recurring availability block</span>
            </div>
          )}

          {/* Show merged blocks info if this is a merged block */}
          {(block.isMerged ||
            (block.extendedProps?.mergedIds &&
              block.extendedProps.mergedIds.length > 1) ||
            (block.mergedIds && block.mergedIds.length > 1)) && (
            <div className="rounded-md bg-violet-50 dark:bg-violet-900/30 p-3 text-violet-800 dark:text-violet-200 mb-4">
              <div className="flex items-center font-medium mb-1">
                <span className="mr-2 text-lg">🔗</span>
                <span>Combined View of Multiple Time Blocks</span>
              </div>
              <p className="text-sm ml-6">
                This is a visual representation of{" "}
                {block.mergedIds?.length ||
                  block.extendedProps?.mergedIds?.length ||
                  0}{" "}
                adjacent unavailable time blocks combined into a single view.
                You can edit or delete individual blocks.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="font-medium">Date:</div>
            <div>{formattedDate}</div>

            <div className="font-medium">Time:</div>
            <div>
              {formattedStartTime} - {formattedEndTime}
            </div>

            <div className="font-medium">Status:</div>
            <div>
              <span
                className={`px-2 py-0.5 rounded ${
                  block.status === "available"
                    ? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {statusDisplay}
              </span>
            </div>

            {/* Display merged IDs if available */}
            {((block.mergedIds && block.mergedIds.length > 1) ||
              (block.extendedProps?.mergedIds &&
                block.extendedProps.mergedIds.length > 1)) && (
              <>
                <div className="font-medium">Contains blocks:</div>
                <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-2 text-sm text-gray-600 dark:text-gray-300 mt-1 mb-2">
                  <ul className="list-disc pl-5 space-y-1">
                    {(block.extendedProps?.mergedBlockData || []).map(
                      (
                        subBlock: { id: number; start: Date; end: Date },
                        index: number,
                      ) => {
                        const subStart = new Date(
                          subBlock.start,
                        ).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        });
                        const subEnd = new Date(
                          subBlock.end,
                        ).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        });
                        return (
                          <li key={`sub-block-${index}`}>
                            Block #{subBlock.id}: {subStart} - {subEnd}
                          </li>
                        );
                      },
                    )}
                    {(!block.extendedProps?.mergedBlockData ||
                      block.extendedProps.mergedBlockData.length === 0) &&
                      (
                        block.mergedIds ||
                        block.extendedProps?.mergedIds ||
                        []
                      ).map((id: number, index: number) => (
                        <li key={`block-id-${index}`}>Block #{id}</li>
                      ))}
                  </ul>
                </div>
              </>
            )}

            {block.isRecurring && (
              <>
                <div className="font-medium">Repeats:</div>
                <div>Weekly on {dayOfWeek}</div>

                {block.recurrencePattern && (
                  <>
                    <div className="font-medium">Pattern:</div>
                    <div>{block.recurrencePattern}</div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </SimpleDialog>

      {/* Delete Confirmation Modal */}
      <SimpleDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        title="Confirm Deletion"
        footer={
          <div className="flex justify-end space-x-3 w-full">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={
                isDeleting || (block.isRecurring && !deleteRecurringMode)
              }
              onClick={() =>
                handleConfirmDelete(deleteRecurringMode === "series")
              }
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        }
      >
        {block.isRecurring ? (
          <div className="space-y-4">
            <p>This is a recurring block. Would you like to delete:</p>
            <div className="flex flex-col space-y-3">
              <div
                className={`p-3 rounded-md cursor-pointer border ${
                  deleteRecurringMode === "single"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => setDeleteRecurringMode("single")}
              >
                <div className="flex items-start">
                  <span className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">
                    1
                  </span>
                  <div>
                    <div className="font-medium">Just this occurrence</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Only remove this specific date and time slot
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-md cursor-pointer border ${
                  deleteRecurringMode === "series"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => setDeleteRecurringMode("series")}
              >
                <div className="flex items-start">
                  <span className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">
                    ∞
                  </span>
                  <div>
                    <div className="font-medium">
                      The entire recurring series
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Remove all instances of this recurring block
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>Are you sure you want to delete this availability block?</p>
        )}
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          This action cannot be undone.
        </p>
      </SimpleDialog>

      {/* Merged Block Confirmation Dialog */}
      <SimpleDialog
        isOpen={isConfirmMergedDeleteOpen}
        onClose={() => setIsConfirmMergedDeleteOpen(false)}
        title="Multi-Block Edit"
        footer={
          <div className="flex justify-end space-x-3 w-full">
            <Button
              variant="outline"
              onClick={() => setIsConfirmMergedDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsConfirmMergedDeleteOpen(false);
                handleDeleteClick();
              }}
            >
              Delete All Blocks
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-md bg-amber-50 dark:bg-amber-900/30 p-3 text-amber-700 dark:text-amber-300 mb-2">
            <div className="flex items-start">
              <span className="mr-2 text-lg">⚠️</span>
              <div>
                <p className="font-medium">This is a combined time block</p>
                <p className="text-sm mt-1">{confirmMergedDeleteText}</p>
              </div>
            </div>
          </div>
        </div>
      </SimpleDialog>
    </>
  );
}
