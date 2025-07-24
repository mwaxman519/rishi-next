"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Force light mode as default
  const [theme, setTheme] = useState<Theme>("light");

  // Effect to set the theme when component mounts
  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window !== "undefined") {
      // Always start with light mode - ignore system preference and stored theme
      setTheme("light");

      // Ensure the HTML element doesn't have dark class on load
      const root = window.document.documentElement;
      root.classList.remove("dark");

      // Clear any stored theme to force light mode
      try {
        localStorage.setItem("theme", "light");
      } catch (error) {
        console.error("Failed to save theme to localStorage:", error);
      }
    }
  }, []);

  // Effect to update DOM when theme changes
  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;

      // Remove old theme class and add new one
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // Save to localStorage (client-side only)
      try {
        localStorage.setItem("theme", theme);
      } catch (error) {
        console.error("Failed to save theme to localStorage:", error);
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
