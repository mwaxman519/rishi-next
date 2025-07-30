&quot;use client&quot;;

import { useTheme } from &quot;@/hooks/useTheme&quot;;
import { Sun, Moon } from &quot;lucide-react&quot;;
import { useEffect, useState } from &quot;react&quot;;

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show the toggle after component has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className=&quot;w-10 h-10&quot;></div>; // Placeholder with same dimensions
  }

  return (
    <button
      onClick={toggleTheme}
      className=&quot;p-2 rounded-md bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary))] hover:bg-[rgba(var(--primary),0.2)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] cursor-pointer select-none&quot;
      aria-label={`Switch to ${theme === &quot;light&quot; ? &quot;dark&quot; : &quot;light&quot;} mode`}
    >
      {theme === &quot;light&quot; ? (
        <Moon
          size={20}
          className=&quot;text-[rgb(var(--purple-primary))] pointer-events-none&quot;
        />
      ) : (
        <Sun size={20} className=&quot;text-yellow-300 pointer-events-none&quot; />
      )}
    </button>
  );
}
