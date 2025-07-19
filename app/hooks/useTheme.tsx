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
  // Initialize theme from localStorage or default to light
  const [theme, setTheme] = useState<Theme>("light");
  const [isLoaded, setIsLoaded] = useState(false);

  // Effect to load theme from localStorage on mount
  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window !== "undefined") {
      let savedTheme: Theme = "light";
      
      try {
        // Try to get saved theme from localStorage
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark" || storedTheme === "light") {
          savedTheme = storedTheme as Theme;
        }
      } catch (error) {
        console.error("Failed to load theme from localStorage:", error);
      }

      // Set the theme state
      setTheme(savedTheme);
      
      // Apply theme to DOM immediately
      const root = window.document.documentElement;
      if (savedTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      
      setIsLoaded(true);
    }
  }, []);

  // Effect to update DOM when theme changes (only after initial load)
  useEffect(() => {
    // Only run this effect after the initial load to avoid hydration issues
    if (isLoaded && typeof window !== "undefined") {
      const root = window.document.documentElement;

      // Remove old theme class and add new one
      if (theme === "dark") {
        root.classList.add("dark");
        console.log("[Theme] Applied dark mode class to HTML element");
      } else {
        root.classList.remove("dark");
        console.log("[Theme] Removed dark mode class from HTML element");
      }

      // Save to localStorage (client-side only)
      try {
        localStorage.setItem("theme", theme);
        console.log("[Theme] Saved theme to localStorage:", theme);
      } catch (error) {
        console.error("Failed to save theme to localStorage:", error);
      }
    }
  }, [theme, isLoaded]);

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
