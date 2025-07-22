"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

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
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebarCollapsed");
      if (savedState) {
        setSidebarCollapsed(savedState === "true");
      }
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
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
    throw new Error("useSidebarState must be used within a SidebarProvider");
  }
  return context;
}
