&quot;use client&quot;;

import * as React from &quot;react&quot;;
import { X } from &quot;lucide-react&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import { useClientOnly } from &quot;@/components/../hooks/useClientOnly&quot;;

// Define toast types
export type ToastProps = {
  id?: string;
  title?: string;
  description?: React.ReactNode;
  variant?: &quot;default&quot; | &quot;destructive&quot;;
};

// Define context type
type ToastContextType = {
  toasts: ToastProps[];
  toast: (props: Omit<ToastProps, &quot;id&quot;>) => string;
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
  const toast = React.useCallback((props: Omit<ToastProps, &quot;id&quot;>) => {
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
    if (typeof window !== &quot;undefined&quot;) {
      (window as any).__toast = { toast, dismiss };
    }

    return () => {
      if (typeof window !== &quot;undefined&quot;) {
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
        <div className=&quot;fixed top-0 right-0 z-50 flex flex-col gap-2 px-4 py-6 sm:gap-4 md:max-w-[420px]&quot;>
          {toasts.map(({ id, title, description, variant, open }) => (
            <div
              key={id}
              className={cn(
                &quot;group pointer-events-auto relative flex w-full items-center justify-between overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all&quot;,
                open
                  ? &quot;translate-x-0 opacity-100&quot;
                  : &quot;translate-x-full opacity-0&quot;,
                variant === &quot;destructive&quot;
                  ? &quot;border-red-600 bg-red-600 text-white&quot;
                  : &quot;border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800&quot;,
              )}
            >
              <div className=&quot;grid gap-1&quot;>
                {title && <div className=&quot;text-sm font-semibold&quot;>{title}</div>}
                {description && (
                  <div className=&quot;text-sm opacity-90&quot;>{description}</div>
                )}
              </div>
              <button
                className=&quot;absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:text-gray-400 dark:hover:text-gray-100&quot;
                onClick={() => id && dismiss(id)}
              >
                <X className=&quot;h-4 w-4&quot; />
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
    throw new Error(&quot;useToast must be used within a ToastProvider&quot;);
  }

  return context;
}

// Standalone function for non-component usage
export const toast = (props: Omit<ToastProps, &quot;id&quot;>) => {
  if (typeof window !== &quot;undefined&quot; && (window as any).__toast) {
    return (window as any).__toast.toast(props);
  }
  return "";
};
