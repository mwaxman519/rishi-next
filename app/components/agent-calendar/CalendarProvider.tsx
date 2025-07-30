"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { AvailabilityDTO } from "../../models/availability";
import { useTheme } from "@/hooks/useTheme";
import { useSidebarState } from "@/hooks/useSidebarState";

// Define the shape of the context
interface CalendarContextType {
  isLoading: boolean;
  error: Error | null;
  availabilityBlocks: AvailabilityDTO[];
  refreshAvailability: () => Promise<void>;
  refreshKey: number;
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  setError: (error: Error | null) => void;
}

// Create the context with a default value
const CalendarContext = createContext<CalendarContextType>({
  isLoading: true,
  error: null,
  availabilityBlocks: [],
  refreshAvailability: async () => {},
  refreshKey: 0,
  theme: "light",
  sidebarCollapsed: false,
  setError: () => {},
});

// Provider props
interface CalendarProviderProps {
  children: ReactNode;
  userId: number;
}

// Calendar Provider Component
export function CalendarProvider({ children, userId }: CalendarProviderProps) {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<
    AvailabilityDTO[]
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get theme and sidebar state from hooks
  const { theme } = useTheme();
  const { sidebarCollapsed } = useSidebarState();

  // Function to refresh availability data
  const refreshAvailability = useCallback(async () => {
    if (!userId) {
      setError(new Error("No user ID provided"));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get date range for fetch (today to 90 days later)
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 90);

      const startDateStr = today.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      // Fetch availability data
      const response = await fetch(
        `/api/availability?userId=${userId}&startDate=${startDateStr}&endDate=${endDateStr}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Handle both direct array and wrapped responses
      if (Array.isArray(data)) {
        setAvailabilityBlocks(data);
      } else if (data.success && Array.isArray(data.data)) {
        setAvailabilityBlocks(data.data);
      } else if (data.data && Array.isArray(data.data)) {
        setAvailabilityBlocks(data.data);
      } else {
        setAvailabilityBlocks([]);
      }
    } catch (err) {
      console.error("Error fetching availability:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch availability data"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch data when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      refreshAvailability();
    }
  }, [userId, refreshAvailability, refreshKey]);

  // Create the context value
  const contextValue: CalendarContextType = {
    isLoading,
    error,
    availabilityBlocks,
    refreshAvailability,
    refreshKey,
    theme,
    sidebarCollapsed,
    setError,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
}

// Custom hook to use the calendar context
export function useCalendar() {
  const context = useContext(CalendarContext);

  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }

  return context;
}
