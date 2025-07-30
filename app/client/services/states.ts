/**
 * States Service Client Adapter
 *
 * Client-side adapter for interacting with the states service.
 */

import { ApiError } from &quot;@/lib/errors&quot;;
import { type State, type Region } from &quot;@/services/states/models&quot;;

/**
 * States service client adapter
 */
export class StatesServiceClient {
  /**
   * Get all states
   * @returns Array of all states
   */
  async getAllStates(): Promise<State[]> {
    try {
      const response = await fetch(&quot;/api/states&quot;, {
        method: &quot;GET&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Failed to fetch states&quot;,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.states;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to fetch states&quot;, 500);
    }
  }

  /**
   * Get all active states
   * @returns Array of active states
   */
  async getActiveStates(): Promise<State[]> {
    try {
      const response = await fetch(&quot;/api/states?active=true&quot;, {
        method: &quot;GET&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Failed to fetch active states&quot;,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.states;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to fetch active states&quot;, 500);
    }
  }

  /**
   * Get a state by ID
   * @param id State ID
   * @returns State data or null if not found
   */
  async getStateById(id: string): Promise<State | null> {
    try {
      const response = await fetch(`/api/states/${id}`, {
        method: &quot;GET&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || `Failed to fetch state with ID ${id}`,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.state;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch state with ID ${id}`, 500);
    }
  }

  /**
   * Get a state by code
   * @param code State code (e.g., 'CA', 'NY')
   * @returns State data or null if not found
   */
  async getStateByCode(code: string): Promise<State | null> {
    try {
      const response = await fetch(`/api/states/code/${code}`, {
        method: &quot;GET&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || `Failed to fetch state with code ${code}`,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.state;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch state with code ${code}`, 500);
    }
  }

  /**
   * Get all regions with states
   * @returns Array of regions with their associated states
   */
  async getAllRegions(): Promise<Region[]> {
    try {
      const response = await fetch(&quot;/api/states/regions&quot;, {
        method: &quot;GET&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Failed to fetch regions&quot;,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.regions;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to fetch regions&quot;, 500);
    }
  }

  /**
   * Get a specific region by ID
   * @param id Region ID
   * @returns Region data or null if not found
   */
  async getRegionById(id: string): Promise<Region | null> {
    try {
      const response = await fetch(`/api/states/regions/${id}`, {
        method: &quot;GET&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || `Failed to fetch region with ID ${id}`,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.region;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch region with ID ${id}`, 500);
    }
  }
}

// Create singleton instance
export const statesService = new StatesServiceClient();
