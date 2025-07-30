/**
 * States Service Client Adapter
 *
 * Client-side adapter for interacting with the states service.
 */

import { ApiError } from "@/lib/errors";
import { type State, type Region } from "@/services/states/models";

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
      const response = await fetch("/api/states", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Failed to fetch states",
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
      throw new ApiError("Failed to fetch states", 500);
    }
  }

  /**
   * Get all active states
   * @returns Array of active states
   */
  async getActiveStates(): Promise<State[]> {
    try {
      const response = await fetch("/api/states?active=true", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Failed to fetch active states",
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
      throw new ApiError("Failed to fetch active states", 500);
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
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
      const response = await fetch("/api/states/regions", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Failed to fetch regions",
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
      throw new ApiError("Failed to fetch regions", 500);
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
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
