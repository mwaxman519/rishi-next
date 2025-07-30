&quot;use client&quot;;

import React from &quot;react&quot;;
import { format } from &quot;date-fns&quot;;
import { Button } from &quot;@/components/ui/button&quot;;

interface ConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: Array<{
    existingBlock: {
      id: number;
      title: string;
      startDate: string | Date;
      endDate: string | Date;
      status: &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot;;
      isRecurring: boolean;
    };
    conflictType: &quot;overlap&quot; | &quot;adjacent&quot; | &quot;contained&quot;;
  }>;
  newBlockStatus: string;
  onProceed: (mergeStrategy: &quot;override&quot; | &quot;merge&quot;) => void;
}

export default function ConflictDialog({
  isOpen,
  onClose,
  conflicts,
  newBlockStatus,
  onProceed,
}: ConflictDialogProps) {
  if (!isOpen) return null;

  // Check if conflicts have same or different status compared to new block
  const hasSameStatusConflicts = conflicts.some(
    (conflict) => conflict.existingBlock.status === newBlockStatus,
  );
  const hasDifferentStatusConflicts = conflicts.some(
    (conflict) => conflict.existingBlock.status !== newBlockStatus,
  );

  // Format readable time
  const formatTimeRange = (start: Date | string, end: Date | string) => {
    const startDate = typeof start === &quot;string&quot; ? new Date(start) : start;
    const endDate = typeof end === &quot;string&quot; ? new Date(end) : end;

    return `${format(startDate, &quot;MMM d, h:mm a&quot;)} - ${format(endDate, &quot;h:mm a&quot;)}`;
  };

  // Get appropriate conflict message
  const getConflictTypeMessage = (type: string) => {
    switch (type) {
      case &quot;overlap&quot;:
        return &quot;partially overlaps with&quot;;
      case &quot;contained&quot;:
        return &quot;is contained within&quot;;
      case &quot;adjacent&quot;:
        return &quot;is adjacent to&quot;;
      default:
        return &quot;conflicts with&quot;;
    }
  };

  return (
    <div className=&quot;fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50&quot;>
      <div className=&quot;bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6&quot;>
        <h3 className=&quot;text-lg font-semibold text-gray-900 dark:text-white mb-4&quot;>
          Availability Conflict Detected
        </h3>

        <div className=&quot;mb-4&quot;>
          <p className=&quot;text-sm text-gray-600 dark:text-gray-300 mb-3&quot;>
            The time slot you selected conflicts with existing availability
            blocks:
          </p>

          <div className=&quot;mt-2 max-h-60 overflow-y-auto&quot;>
            <ul className=&quot;space-y-2&quot;>
              {conflicts.map((conflict, idx) => (
                <li
                  key={idx}
                  className=&quot;border-l-4 p-2 text-sm rounded-r bg-gray-50 dark:bg-gray-700 
                  border-l-4 
                  pl-3
                  mb-2
                  text-gray-700
                  dark:text-gray-300
                  border-l-4 
                  ${conflict.existingBlock.status === 'available' 
                    ? 'border-teal-500' 
                    : conflict.existingBlock.status === 'unavailable'
                      ? 'border-red-500'
                      : 'border-yellow-500'}&quot;
                >
                  <div className=&quot;flex items-start&quot;>
                    <span
                      className={`flex h-2 w-2 rounded-full mt-1 mr-2 
                      ${
                        conflict.existingBlock.status === &quot;available&quot;
                          ? &quot;bg-teal-500&quot;
                          : conflict.existingBlock.status === &quot;unavailable&quot;
                            ? &quot;bg-red-500&quot;
                            : &quot;bg-yellow-500&quot;
                      }`}
                    />
                    <div>
                      <div className=&quot;font-medium&quot;>
                        {conflict.existingBlock.title ||
                          `${conflict.existingBlock.status.charAt(0).toUpperCase() + conflict.existingBlock.status.slice(1)} Block`}
                        {conflict.existingBlock.isRecurring && &quot; (recurring)&quot;}
                      </div>
                      <div>
                        {formatTimeRange(
                          conflict.existingBlock.startDate,
                          conflict.existingBlock.endDate,
                        )}
                      </div>
                      <div className=&quot;text-xs text-gray-500 dark:text-gray-400 mt-1&quot;>
                        Your new {newBlockStatus} block{&quot; &quot;}
                        {getConflictTypeMessage(conflict.conflictType)} this
                        existing {conflict.existingBlock.status} block.
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className=&quot;border-t dark:border-gray-700 pt-4&quot;>
          <p className=&quot;text-sm text-gray-600 dark:text-gray-300 mb-4&quot;>
            {hasSameStatusConflicts
              ? `Your new ${newBlockStatus} block will be merged with existing ${newBlockStatus} blocks.`
              : `Your new ${newBlockStatus} block will override existing blocks with different status.`}
          </p>

          <div className=&quot;flex flex-col space-y-2&quot;>
            <Button
              onClick={() => {
                // Auto-select the appropriate strategy based on block status
                const strategy = hasSameStatusConflicts ? &quot;merge&quot; : &quot;override&quot;;
                onProceed(strategy);
              }}
              variant=&quot;default&quot;
              className=&quot;w-full justify-center&quot;
            >
              {hasSameStatusConflicts
                ? `Merge with existing ${newBlockStatus} blocks`
                : `Override existing blocks`}
            </Button>

            <Button
              onClick={onClose}
              variant=&quot;ghost&quot;
              className=&quot;w-full justify-center text-gray-500&quot;
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
