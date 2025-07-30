import React from &quot;react&quot;;
import { Button } from &quot;./button&quot;;

interface SimpleAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  variant?: &quot;info&quot; | &quot;warning&quot; | &quot;error&quot; | &quot;success&quot;;
}

export const SimpleAlertDialog: React.FC<SimpleAlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = &quot;OK&quot;,
  cancelLabel = &quot;Cancel&quot;,
  onConfirm,
  variant = &quot;info&quot;,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  // Determine the icon and color based on the variant
  let icon = &quot;💬&quot;;
  let bgColor = &quot;bg-blue-50 dark:bg-blue-900/30&quot;;
  let textColor = &quot;text-blue-800 dark:text-blue-200&quot;;

  switch (variant) {
    case &quot;warning&quot;:
      icon = &quot;⚠️&quot;;
      bgColor = &quot;bg-amber-50 dark:bg-amber-900/30&quot;;
      textColor = &quot;text-amber-800 dark:text-amber-200&quot;;
      break;
    case &quot;error&quot;:
      icon = &quot;❗&quot;;
      bgColor = &quot;bg-red-50 dark:bg-red-900/30&quot;;
      textColor = &quot;text-red-800 dark:text-red-200&quot;;
      break;
    case &quot;success&quot;:
      icon = &quot;✅&quot;;
      bgColor = &quot;bg-green-50 dark:bg-green-900/30&quot;;
      textColor = &quot;text-green-800 dark:text-green-200&quot;;
      break;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className=&quot;fixed inset-0 bg-black bg-opacity-25 z-50 flex items-center justify-center p-4&quot;
        onClick={onClose}
      >
        {/* Dialog */}
        <div
          className=&quot;bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden&quot;
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`${bgColor} ${textColor} px-4 py-3 flex items-center`}
          >
            <span className=&quot;text-xl mr-2&quot;>{icon}</span>
            <h3 className=&quot;font-semibold text-lg&quot;>{title}</h3>
          </div>

          {/* Content */}
          <div className=&quot;p-4&quot;>
            <p className=&quot;text-gray-700 dark:text-gray-300 whitespace-pre-line&quot;>
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className=&quot;border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-end space-x-2&quot;>
            {onConfirm && (
              <Button variant=&quot;outline&quot; onClick={onClose}>
                {cancelLabel}
              </Button>
            )}
            <Button
              variant={variant === &quot;error&quot; ? &quot;destructive&quot; : &quot;default&quot;}
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
