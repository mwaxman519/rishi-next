&quot;use client&quot;;

import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from &quot;react&quot;;

type Theme = &quot;light&quot; | &quot;dark&quot;;

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage or default to light
  const [theme, setTheme] = useState<Theme>(&quot;light&quot;);
  const [isLoaded, setIsLoaded] = useState(false);

  // Effect to load theme from localStorage on mount
  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window !== &quot;undefined&quot;) {
      let savedTheme: Theme = &quot;light&quot;;
      
      try {
        // Try to get saved theme from localStorage
        const storedTheme = localStorage.getItem(&quot;theme&quot;);
        if (storedTheme === &quot;dark&quot; || storedTheme === &quot;light&quot;) {
          savedTheme = storedTheme as Theme;
        }
      } catch (error) {
        console.error(&quot;Failed to load theme from localStorage:&quot;, error);
      }

      // Set the theme state
      setTheme(savedTheme);
      
      // Apply theme to DOM immediately
      const root = window.document.documentElement;
      if (savedTheme === &quot;dark&quot;) {
        root.classList.add(&quot;dark&quot;);
      } else {
        root.classList.remove(&quot;dark&quot;);
      }
      
      setIsLoaded(true);
    }
  }, []);

  // Effect to update DOM when theme changes (only after initial load)
  useEffect(() => {
    // Only run this effect after the initial load to avoid hydration issues
    if (isLoaded && typeof window !== &quot;undefined&quot;) {
      const root = window.document.documentElement;

      // Remove old theme class and add new one
      if (theme === &quot;dark&quot;) {
        root.classList.add(&quot;dark&quot;);
        console.log(&quot;[Theme] Applied dark mode class to HTML element&quot;);
      } else {
        root.classList.remove(&quot;dark&quot;);
        console.log(&quot;[Theme] Removed dark mode class from HTML element&quot;);
      }

      // Save to localStorage (client-side only)
      try {
        localStorage.setItem(&quot;theme&quot;, theme);
        console.log(&quot;[Theme] Saved theme to localStorage:&quot;, theme);
      } catch (error) {
        console.error(&quot;Failed to save theme to localStorage:&quot;, error);
      }
    }
  }, [theme, isLoaded]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === &quot;light&quot; ? &quot;dark&quot; : &quot;light&quot;));
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
    throw new Error(&quot;useTheme must be used within a ThemeProvider&quot;);
  }
  return context;
}
