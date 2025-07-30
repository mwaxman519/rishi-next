&quot;use client&quot;;

import { useEffect, useState } from &quot;react&quot;;
import { X } from &quot;lucide-react&quot;;

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SimpleModal({
  isOpen,
  onClose,
  title,
  children,
}: SimpleModalProps) {
  const [mounted, setMounted] = useState(false);

  // Handle mounting/unmounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === &quot;Escape&quot;) onClose();
    };

    if (isOpen) {
      document.addEventListener(&quot;keydown&quot;, handleEsc);
    }

    return () => {
      document.removeEventListener(&quot;keydown&quot;, handleEsc);
    };
  }, [isOpen, onClose]);

  // Handle outside click to close modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = &quot;hidden&quot;;
    } else {
      document.body.style.overflow = &quot;auto&quot;;
    }

    return () => {
      document.body.style.overflow = &quot;auto&quot;;
    };
  }, [isOpen]);

  if (!mounted) return null;

  if (!isOpen) return null;

  return (
    <div className=&quot;fixed inset-0 z-50 flex items-center justify-center bg-black/50&quot;>
      <div className=&quot;w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden&quot;>
        <div className=&quot;flex items-center justify-between px-4 py-3 border-b dark:border-gray-700&quot;>
          <h3 className=&quot;text-lg font-medium&quot;>{title}</h3>
          <button
            onClick={onClose}
            className=&quot;text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1&quot;
          >
            <X className=&quot;h-5 w-5&quot; />
          </button>
        </div>
        <div className=&quot;p-4&quot;>{children}</div>
      </div>
    </div>
  );
}
