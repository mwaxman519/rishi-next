"use client";

import { useState, useEffect } from "react";
import { useToast } from "./use-toast";

/**
 * Mock US states data for development
 */
const MOCK_STATES = [
  {
    id: "1",
    name: "California",
    code: "CA",
    regionId: "5", // West
    capital: "Sacramento",
    isTerritory: false,
    timezone: "Pacific",
    active: true,
  },
  {
    id: "2",
    name: "New York",
    code: "NY",
    regionId: "1", // Northeast
    capital: "Albany",
    isTerritory: false,
    timezone: "Eastern",
    active: true,
  },
  {
    id: "3",
    name: "Texas",
    code: "TX",
    regionId: "4", // Southwest
    capital: "Austin",
    isTerritory: false,
    timezone: "Central",
    active: true,
  },
  {
    id: "4",
    name: "Florida",
    code: "FL",
    regionId: "2", // Southeast
    capital: "Tallahassee",
    isTerritory: false,
    timezone: "Eastern",
    active: true,
  },
  {
    id: "5",
    name: "Illinois",
    code: "IL",
    regionId: "3", // Midwest
    capital: "Springfield",
    isTerritory: false,
    timezone: "Central",
    active: true,
  },
];

/**
 * Type definition for a US State
 */
export interface State {
  id: string;
  name: string;
  code: string;
  regionId?: string;
  capital?: string;
  isTerritory: boolean;
  timezone?: string;
  active: boolean;
}

/**
 * Hook for safely fetching and using US states data
 */
export function useStates() {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch states on mount
  useEffect(() => {
    fetchStates();
  }, []);

  /**
   * Fetch states from the API with fallback to mock data
   */
  const fetchStates = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/states", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      let data;
      try {
        data = await response.json();

        if (!data || !data.states || !Array.isArray(data.states)) {
          throw new Error("Invalid response format");
        }

        setStates(data.states);
      } catch (parseError) {
        console.warn(
          "Error parsing API response, using mock data:",
          parseError,
        );
        setStates(MOCK_STATES);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      setError(
        error instanceof Error ? error : new Error("Failed to fetch states"),
      );
      // Fallback to mock data on error
      setStates(MOCK_STATES);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Find a state by its abbreviation
   */
  const findStateByAbbreviation = (abbreviation: string): State | undefined => {
    return states.find(
      (state) => state.code.toLowerCase() === abbreviation.toLowerCase(),
    );
  };

  /**
   * Find a state by its ID
   */
  const findStateById = (id: string): State | undefined => {
    return states.find((state) => state.id === id);
  };

  /**
   * Find a state ID by its abbreviation
   */
  const findStateIdByAbbreviation = (abbreviation: string): string => {
    const state = findStateByAbbreviation(abbreviation);
    return state?.id || "";
  };

  return {
    states,
    loading,
    error,
    findStateByAbbreviation,
    findStateById,
    findStateIdByAbbreviation,
    refresh: fetchStates,
  };
}
