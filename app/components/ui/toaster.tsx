&quot;use client&quot;;

import * as React from &quot;react&quot;;
import { X } from &quot;lucide-react&quot;;
import { cn } from &quot;../../lib/utils&quot;;

// Create the toast context outside the component
export const ToastContext = React.createContext<{
  toast: (props: {
    title?: string;
    description?: React.ReactNode;
    variant?: &quot;default&quot; | &quot;destructive&quot;;
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
      variant?: &quot;default&quot; | &quot;destructive&quot;;
      open: boolean;
    }>
  >([]);

  // Define toast actions
  const toastActions = React.useMemo(
    () => ({
      toast: (props: {
        title?: string;
        description?: React.ReactNode;
        variant?: &quot;default&quot; | &quot;destructive&quot;;
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
    if (typeof window !== &quot;undefined&quot;) {
      (window as any).__toast = toastActions;
    }
  }, [toastActions]);

  return (
    <ToastContext.Provider value={toastActions}>
      <div className=&quot;fixed top-0 right-0 z-50 flex flex-col gap-2 px-4 py-6 sm:gap-4 md:max-w-[420px]&quot;>
        {toasts.map(({ id, title, description, variant, open }) => (
          <div
            key={id}
            className={cn(
              &quot;group pointer-events-auto relative flex w-full items-center justify-between overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all&quot;,
              open ? &quot;translate-x-0 opacity-100&quot; : &quot;translate-x-full opacity-0&quot;,
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
              onClick={() => toastActions.dismiss(id)}
            >
              <X className=&quot;h-4 w-4&quot; />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
