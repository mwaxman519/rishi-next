&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useToast } from &quot;./use-toast&quot;;

/**
 * Mock US states data for development
 */
const MOCK_STATES = [
  {
    id: &quot;1&quot;,
    name: &quot;California&quot;,
    code: &quot;CA&quot;,
    regionId: &quot;5&quot;, // West
    capital: &quot;Sacramento&quot;,
    isTerritory: false,
    timezone: &quot;Pacific&quot;,
    active: true,
  },
  {
    id: &quot;2&quot;,
    name: &quot;New York&quot;,
    code: &quot;NY&quot;,
    regionId: &quot;1&quot;, // Northeast
    capital: &quot;Albany&quot;,
    isTerritory: false,
    timezone: &quot;Eastern&quot;,
    active: true,
  },
  {
    id: &quot;3&quot;,
    name: &quot;Texas&quot;,
    code: &quot;TX&quot;,
    regionId: &quot;4&quot;, // Southwest
    capital: &quot;Austin&quot;,
    isTerritory: false,
    timezone: &quot;Central&quot;,
    active: true,
  },
  {
    id: &quot;4&quot;,
    name: &quot;Florida&quot;,
    code: &quot;FL&quot;,
    regionId: &quot;2&quot;, // Southeast
    capital: &quot;Tallahassee&quot;,
    isTerritory: false,
    timezone: &quot;Eastern&quot;,
    active: true,
  },
  {
    id: &quot;5&quot;,
    name: &quot;Illinois&quot;,
    code: &quot;IL&quot;,
    regionId: &quot;3&quot;, // Midwest
    capital: &quot;Springfield&quot;,
    isTerritory: false,
    timezone: &quot;Central&quot;,
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

      const response = await fetch(&quot;/api/states&quot;, {
        method: &quot;GET&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      let data;
      try {
        data = await response.json();

        if (!data || !data.states || !Array.isArray(data.states)) {
          throw new Error(&quot;Invalid response format&quot;);
        }

        setStates(data.states);
      } catch (parseError) {
        console.warn(
          &quot;Error parsing API response, using mock data:&quot;,
          parseError,
        );
        setStates(MOCK_STATES);
      }
    } catch (error) {
      console.error(&quot;Error fetching states:&quot;, error);
      setError(
        error instanceof Error ? error : new Error(&quot;Failed to fetch states&quot;),
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
