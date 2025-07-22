"use client";

import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: Array<{
    existingBlock: {
      id: number;
      title: string;
      startDate: string | Date;
      endDate: string | Date;
      status: "available" | "unavailable" | "tentative";
      isRecurring: boolean;
    };
    conflictType: "overlap" | "adjacent" | "contained";
  }>;
  newBlockStatus: string;
  onProceed: (mergeStrategy: "override" | "merge") => void;
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
    const startDate = typeof start === "string" ? new Date(start) : start;
    const endDate = typeof end === "string" ? new Date(end) : end;

    return `${format(startDate, "MMM d, h:mm a")} - ${format(endDate, "h:mm a")}`;
  };

  // Get appropriate conflict message
  const getConflictTypeMessage = (type: string) => {
    switch (type) {
      case "overlap":
        return "partially overlaps with";
      case "contained":
        return "is contained within";
      case "adjacent":
        return "is adjacent to";
      default:
        return "conflicts with";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Availability Conflict Detected
        </h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            The time slot you selected conflicts with existing availability
            blocks:
          </p>

          <div className="mt-2 max-h-60 overflow-y-auto">
            <ul className="space-y-2">
              {conflicts.map((conflict, idx) => (
                <li
                  key={idx}
                  className="border-l-4 p-2 text-sm rounded-r bg-gray-50 dark:bg-gray-700 
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
                      : 'border-yellow-500'}"
                >
                  <div className="flex items-start">
                    <span
                      className={`flex h-2 w-2 rounded-full mt-1 mr-2 
                      ${
                        conflict.existingBlock.status === "available"
                          ? "bg-teal-500"
                          : conflict.existingBlock.status === "unavailable"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium">
                        {conflict.existingBlock.title ||
                          `${conflict.existingBlock.status.charAt(0).toUpperCase() + conflict.existingBlock.status.slice(1)} Block`}
                        {conflict.existingBlock.isRecurring && " (recurring)"}
                      </div>
                      <div>
                        {formatTimeRange(
                          conflict.existingBlock.startDate,
                          conflict.existingBlock.endDate,
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Your new {newBlockStatus} block{" "}
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

        <div className="border-t dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {hasSameStatusConflicts
              ? `Your new ${newBlockStatus} block will be merged with existing ${newBlockStatus} blocks.`
              : `Your new ${newBlockStatus} block will override existing blocks with different status.`}
          </p>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => {
                // Auto-select the appropriate strategy based on block status
                const strategy = hasSameStatusConflicts ? "merge" : "override";
                onProceed(strategy);
              }}
              variant="default"
              className="w-full justify-center"
            >
              {hasSameStatusConflicts
                ? `Merge with existing ${newBlockStatus} blocks`
                : `Override existing blocks`}
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full justify-center text-gray-500"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
