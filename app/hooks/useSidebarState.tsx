&quot;use client&quot;;

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from &quot;react&quot;;

type SidebarContextType = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize sidebar state from localStorage if available
  useEffect(() => {
    if (typeof window !== &quot;undefined&quot;) {
      const savedState = localStorage.getItem(&quot;sidebarCollapsed&quot;);
      if (savedState) {
        setSidebarCollapsed(savedState === &quot;true&quot;);
      }
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== &quot;undefined&quot;) {
      localStorage.setItem(&quot;sidebarCollapsed&quot;, String(sidebarCollapsed));
    }
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <SidebarContext.Provider
      value={{ sidebarCollapsed, toggleSidebar, setSidebarCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarState() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error(&quot;useSidebarState must be used within a SidebarProvider&quot;);
  }
  return context;
}
