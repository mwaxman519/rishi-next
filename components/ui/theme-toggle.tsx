"use client";

import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show the toggle after component has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10"></div>; // Placeholder with same dimensions
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary))] hover:bg-[rgba(var(--primary),0.2)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] cursor-pointer select-none"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon
          size={20}
          className="text-[rgb(var(--purple-primary))] pointer-events-none"
        />
      ) : (
        <Sun size={20} className="text-yellow-300 pointer-events-none" />
      )}
    </button>
  );
}
