"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

// Create the toast context outside the component
export const ToastContext = React.createContext<{
  toast: (props: {
    title?: string;
    description?: React.ReactNode;
    variant?: "default" | "destructive";
  }) => void;
  dismiss: (id: string) => void;
} | null>(null);

// Basic toast implementation to avoid circular dependencies
export function Toaster() {
  const [toasts, setToasts] = React.useState<
    Array<{
      id: string;
      title?: string;
      description?: React.ReactNode;
      variant?: "default" | "destructive";
      open: boolean;
    }>
  >([]);

  // Define toast actions
  const toastActions = React.useMemo(
    () => ({
      toast: (props: {
        title?: string;
        description?: React.ReactNode;
        variant?: "default" | "destructive";
      }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, ...props, open: true }]);
        setTimeout(() => {
          setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, open: false } : t)),
          );
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
          }, 300);
        }, 3000);
        return id;
      },
      dismiss: (id: string) => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, open: false } : t)),
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      },
    }),
    [],
  );

  // Set in global for access
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__toast = toastActions;
    }
  }, [toastActions]);

  return (
    <ToastContext.Provider value={toastActions}>
      <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 px-4 py-6 sm:gap-4 md:max-w-[420px]">
        {toasts.map(({ id, title, description, variant, open }) => (
          <div
            key={id}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
              open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
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
              onClick={() => toastActions.dismiss(id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
