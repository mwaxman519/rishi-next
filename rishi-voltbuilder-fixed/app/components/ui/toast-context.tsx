"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useClientOnly } from "../../hooks/useClientOnly";

// Define toast types
export type ToastProps = {
  id?: string;
  title?: string;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
};

// Define context type
type ToastContextType = {
  toasts: ToastProps[];
  toast: (props: Omit<ToastProps, "id">) => string;
  dismiss: (id: string) => void;
};

// Create the context
export const ToastContext = React.createContext<ToastContextType | null>(null);

// Toast Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<
    Array<ToastProps & { open: boolean }>
  >([]);
  // Use our client-only hook for consistency
  const mounted = useClientOnly();

  // Add toast function
  const toast = React.useCallback((props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id, open: true }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);

    return id;
  }, []);

  // Dismiss toast function
  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, open: false } : t)),
    );

    // Remove from array after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  // Set global reference for non-React usage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__toast = { toast, dismiss };
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__toast;
      }
    };
  }, [toast, dismiss]);

  // Value to provide through context
  const contextValue = React.useMemo(
    () => ({
      toasts,
      toast,
      dismiss,
    }),
    [toasts, toast, dismiss],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast container - only render on client side */}
      {mounted && (
        <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 px-4 py-6 sm:gap-4 md:max-w-[420px]">
          {toasts.map(({ id, title, description, variant, open }) => (
            <div
              key={id}
              className={cn(
                "group pointer-events-auto relative flex w-full items-center justify-between overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
                open
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0",
                variant === "destructive"
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
              )}
            >
              <div className="grid gap-1">
                {title && <div className="text-sm font-semibold">{title}</div>}
                {description && (
                  <div className="text-sm opacity-90">{description}</div>
                )}
              </div>
              <button
                className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:text-gray-400 dark:hover:text-gray-100"
                onClick={() => id && dismiss(id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// Hook for accessing the toast context
export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

// Standalone function for non-component usage
export const toast = (props: Omit<ToastProps, "id">) => {
  if (typeof window !== "undefined" && (window as any).__toast) {
    return (window as any).__toast.toast(props);
  }
  return "";
};
