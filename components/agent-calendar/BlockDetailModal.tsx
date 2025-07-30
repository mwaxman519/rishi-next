import React, { useState } from &quot;react&quot;;
import { format } from &quot;date-fns&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import SimpleDialog from &quot;@/components/ui/SimpleDialog&quot;;

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
    &quot;single&quot; | &quot;series&quot; | null
  >(null);
  const [isConfirmMergedDeleteOpen, setIsConfirmMergedDeleteOpen] =
    useState(false);
  const [confirmMergedDeleteText, setConfirmMergedDeleteText] = useState("&quot;);

  // Format dates for display
  const startDate = new Date(block.start);
  const endDate = new Date(block.end);
  const formattedDate = format(startDate, &quot;EEEE, MMMM d, yyyy&quot;);
  const formattedStartTime = format(startDate, &quot;h:mm a&quot;);
  const formattedEndTime = format(endDate, &quot;h:mm a&quot;);

  // Day of week names for recurring events
  const dayNames = [
    &quot;Sunday&quot;,
    &quot;Monday&quot;,
    &quot;Tuesday&quot;,
    &quot;Wednesday&quot;,
    &quot;Thursday&quot;,
    &quot;Friday&quot;,
    &quot;Saturday&quot;,
  ];
  const dayOfWeek =
    block.dayOfWeek !== undefined ? dayNames[block.dayOfWeek] : &quot;&quot;;

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
      setDeleteRecurringMode(&quot;single&quot;);
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
      console.error(&quot;Error deleting block:&quot;, error);
    } finally {
      setIsDeleting(false);
    }
  };

  const detailModalTitle = (
    <div className=&quot;flex items-center&quot;>
      <span>{block.title || &quot;Availability Block&quot;}</span>
      {block.isRecurring && (
        <span className=&quot;ml-2 text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full text-blue-600 dark:text-blue-300&quot;>
          Recurring 🔄
        </span>
      )}
    </div>
  );

  const detailModalFooter = (
    <div className=&quot;flex justify-between w-full&quot;>
      <Button variant=&quot;destructive&quot; onClick={handleDeleteClick}>
        Delete
      </Button>
      <div>
        <Button variant=&quot;outline&quot; onClick={onClose} className=&quot;mr-2&quot;>
          Cancel
        </Button>
        <Button
          variant=&quot;default&quot;
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
        title={block.title || &quot;Availability Block&quot;}
        footer={detailModalFooter}
      >
        <div className=&quot;space-y-4&quot;>
          {block.isRecurring && (
            <div className=&quot;rounded-md bg-blue-50 dark:bg-blue-900/30 p-2 text-blue-800 dark:text-blue-200 flex items-center mb-4&quot;>
              <span className=&quot;mr-2&quot;>🔄</span>
              <span>This is a recurring availability block</span>
            </div>
          )}

          {/* Show merged blocks info if this is a merged block */}
          {(block.isMerged ||
            (block.extendedProps?.mergedIds &&
              block.extendedProps.mergedIds.length > 1) ||
            (block.mergedIds && block.mergedIds.length > 1)) && (
            <div className=&quot;rounded-md bg-violet-50 dark:bg-violet-900/30 p-3 text-violet-800 dark:text-violet-200 mb-4&quot;>
              <div className=&quot;flex items-center font-medium mb-1&quot;>
                <span className=&quot;mr-2 text-lg&quot;>🔗</span>
                <span>Combined View of Multiple Time Blocks</span>
              </div>
              <p className=&quot;text-sm ml-6&quot;>
                This is a visual representation of{&quot; &quot;}
                {block.mergedIds?.length ||
                  block.extendedProps?.mergedIds?.length ||
                  0}{&quot; &quot;}
                adjacent unavailable time blocks combined into a single view.
                You can edit or delete individual blocks.
              </p>
            </div>
          )}

          <div className=&quot;grid grid-cols-2 gap-3&quot;>
            <div className=&quot;font-medium&quot;>Date:</div>
            <div>{formattedDate}</div>

            <div className=&quot;font-medium&quot;>Time:</div>
            <div>
              {formattedStartTime} - {formattedEndTime}
            </div>

            <div className=&quot;font-medium&quot;>Status:</div>
            <div>
              <span
                className={`px-2 py-0.5 rounded ${
                  block.status === &quot;available&quot;
                    ? &quot;bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300&quot;
                    : &quot;bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300&quot;
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
                <div className=&quot;font-medium&quot;>Contains blocks:</div>
                <div className=&quot;rounded-md bg-gray-50 dark:bg-gray-800 p-2 text-sm text-gray-600 dark:text-gray-300 mt-1 mb-2&quot;>
                  <ul className=&quot;list-disc pl-5 space-y-1&quot;>
                    {(block.extendedProps?.mergedBlockData || []).map(
                      (
                        subBlock: { id: number; start: Date; end: Date },
                        index: number,
                      ) => {
                        const subStart = new Date(
                          subBlock.start,
                        ).toLocaleTimeString([], {
                          hour: &quot;numeric&quot;,
                          minute: &quot;2-digit&quot;,
                        });
                        const subEnd = new Date(
                          subBlock.end,
                        ).toLocaleTimeString([], {
                          hour: &quot;numeric&quot;,
                          minute: &quot;2-digit&quot;,
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
                <div className=&quot;font-medium&quot;>Repeats:</div>
                <div>Weekly on {dayOfWeek}</div>

                {block.recurrencePattern && (
                  <>
                    <div className=&quot;font-medium&quot;>Pattern:</div>
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
        title=&quot;Confirm Deletion&quot;
        footer={
          <div className=&quot;flex justify-end space-x-3 w-full&quot;>
            <Button
              variant=&quot;outline&quot;
              onClick={() => setIsConfirmDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant=&quot;destructive&quot;
              disabled={
                isDeleting || (block.isRecurring && !deleteRecurringMode)
              }
              onClick={() =>
                handleConfirmDelete(deleteRecurringMode === &quot;series&quot;)
              }
            >
              {isDeleting ? &quot;Deleting...&quot; : &quot;Delete&quot;}
            </Button>
          </div>
        }
      >
        {block.isRecurring ? (
          <div className=&quot;space-y-4&quot;>
            <p>This is a recurring block. Would you like to delete:</p>
            <div className=&quot;flex flex-col space-y-3&quot;>
              <div
                className={`p-3 rounded-md cursor-pointer border ${
                  deleteRecurringMode === &quot;single&quot;
                    ? &quot;border-blue-500 bg-blue-50 dark:bg-blue-900/30&quot;
                    : &quot;border-gray-200 dark:border-gray-700&quot;
                }`}
                onClick={() => setDeleteRecurringMode(&quot;single&quot;)}
              >
                <div className=&quot;flex items-start&quot;>
                  <span className=&quot;bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0&quot;>
                    1
                  </span>
                  <div>
                    <div className=&quot;font-medium&quot;>Just this occurrence</div>
                    <div className=&quot;text-sm text-gray-600 dark:text-gray-300&quot;>
                      Only remove this specific date and time slot
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-md cursor-pointer border ${
                  deleteRecurringMode === &quot;series&quot;
                    ? &quot;border-blue-500 bg-blue-50 dark:bg-blue-900/30&quot;
                    : &quot;border-gray-200 dark:border-gray-700&quot;
                }`}
                onClick={() => setDeleteRecurringMode(&quot;series&quot;)}
              >
                <div className=&quot;flex items-start&quot;>
                  <span className=&quot;bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0&quot;>
                    ∞
                  </span>
                  <div>
                    <div className=&quot;font-medium&quot;>
                      The entire recurring series
                    </div>
                    <div className=&quot;text-sm text-gray-600 dark:text-gray-300&quot;>
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
        <p className=&quot;mt-4 text-sm text-red-600 dark:text-red-400&quot;>
          This action cannot be undone.
        </p>
      </SimpleDialog>

      {/* Merged Block Confirmation Dialog */}
      <SimpleDialog
        isOpen={isConfirmMergedDeleteOpen}
        onClose={() => setIsConfirmMergedDeleteOpen(false)}
        title=&quot;Multi-Block Edit&quot;
        footer={
          <div className=&quot;flex justify-end space-x-3 w-full&quot;>
            <Button
              variant=&quot;outline&quot;
              onClick={() => setIsConfirmMergedDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant=&quot;destructive&quot;
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
        <div className=&quot;space-y-4&quot;>
          <div className=&quot;rounded-md bg-amber-50 dark:bg-amber-900/30 p-3 text-amber-700 dark:text-amber-300 mb-2&quot;>
            <div className=&quot;flex items-start&quot;>
              <span className=&quot;mr-2 text-lg&quot;>⚠️</span>
              <div>
                <p className=&quot;font-medium&quot;>This is a combined time block</p>
                <p className=&quot;text-sm mt-1">{confirmMergedDeleteText}</p>
              </div>
            </div>
          </div>
        </div>
      </SimpleDialog>
    </>
  );
}
