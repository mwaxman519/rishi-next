import React from "react";
import { Button } from "./button";

interface SimpleAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  variant?: "info" | "warning" | "error" | "success";
}

export const SimpleAlertDialog: React.FC<SimpleAlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "info",
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  // Determine the icon and color based on the variant
  let icon = "💬";
  let bgColor = "bg-blue-50 dark:bg-blue-900/30";
  let textColor = "text-blue-800 dark:text-blue-200";

  switch (variant) {
    case "warning":
      icon = "⚠️";
      bgColor = "bg-amber-50 dark:bg-amber-900/30";
      textColor = "text-amber-800 dark:text-amber-200";
      break;
    case "error":
      icon = "❗";
      bgColor = "bg-red-50 dark:bg-red-900/30";
      textColor = "text-red-800 dark:text-red-200";
      break;
    case "success":
      icon = "✅";
      bgColor = "bg-green-50 dark:bg-green-900/30";
      textColor = "text-green-800 dark:text-green-200";
      break;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Dialog */}
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`${bgColor} ${textColor} px-4 py-3 flex items-center`}
          >
            <span className="text-xl mr-2">{icon}</span>
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-end space-x-2">
            {onConfirm && (
              <Button variant="outline" onClick={onClose}>
                {cancelLabel}
              </Button>
            )}
            <Button
              variant={variant === "error" ? "destructive" : "default"}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
