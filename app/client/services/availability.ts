/**
 * Availability Service Client Adapter
 *
 * Client-side adapter for interacting with the availability service.
 */

import { ApiError } from &quot;@/lib/errors&quot;;

/**
 * Availability window model
 */
export interface AvailabilityWindow {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
  daysOfWeek?: number[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Availability time slot model
 */
export interface AvailabilityTimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  windowId?: string;
}

/**
 * Availability creation/update DTO
 */
export interface AvailabilityWindowDTO {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
  daysOfWeek?: number[];
  notes?: string;
}

/**
 * Availability query parameters
 */
export interface AvailabilityQueryParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
}

/**
 * User availability service client adapter
 */
export class AvailabilityServiceClient {
  /**
   * Get availability windows for a user
   * @param params Query parameters
   * @returns Array of availability windows
   */
  async getAvailabilityWindows(
    params: AvailabilityQueryParams,
  ): Promise<AvailabilityWindow[]> {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();

      if (params.userId) queryParams.append(&quot;userId&quot;, params.userId);
      if (params.startDate) queryParams.append(&quot;startDate&quot;, params.startDate);
      if (params.endDate) queryParams.append(&quot;endDate&quot;, params.endDate);
      if (params.isRecurring !== undefined)
        queryParams.append(&quot;isRecurring&quot;, params.isRecurring.toString());

      const queryString = queryParams.toString();
      const url = `/api/availability${queryString ? `?${queryString}` : "&quot;}`;

      const response = await fetch(url, {
        method: &quot;GET&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Failed to fetch availability windows&quot;,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.availabilityWindows;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to fetch availability windows&quot;, 500);
    }
  }

  /**
   * Get availability for a specific user in a date range
   * @param userId User ID
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Array of time slots showing availability
   */
  async getUserAvailability(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<AvailabilityTimeSlot[]> {
    try {
      const url = `/api/availability/${userId}?startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(url, {
        method: &quot;GET&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Failed to fetch user availability&quot;,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.timeSlots;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to fetch user availability&quot;, 500);
    }
  }

  /**
   * Get a specific availability window by ID
   * @param id Availability window ID
   * @returns Availability window
   */
  async getAvailabilityWindowById(id: string): Promise<AvailabilityWindow> {
    try {
      const response = await fetch(`/api/availability/window/${id}`, {
        method: &quot;GET&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || `Failed to fetch availability window with ID ${id}`,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.availabilityWindow;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Failed to fetch availability window with ID ${id}`,
        500,
      );
    }
  }

  /**
   * Create a new availability window
   * @param userId User ID
   * @param availabilityData Availability window data
   * @returns Created availability window
   */
  async createAvailabilityWindow(
    userId: string,
    availabilityData: AvailabilityWindowDTO,
  ): Promise<AvailabilityWindow> {
    try {
      const response = await fetch(&quot;/api/availability&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
        body: JSON.stringify({ userId, ...availabilityData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Failed to create availability window&quot;,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.availabilityWindow;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to create availability window&quot;, 500);
    }
  }

  /**
   * Update an availability window
   * @param id Availability window ID
   * @param availabilityData Updated availability window data
   * @returns Updated availability window
   */
  async updateAvailabilityWindow(
    id: string,
    availabilityData: Partial<AvailabilityWindowDTO>,
  ): Promise<AvailabilityWindow> {
    try {
      const response = await fetch(`/api/availability/window/${id}`, {
        method: &quot;PATCH&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
        body: JSON.stringify(availabilityData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || `Failed to update availability window with ID ${id}`,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.availabilityWindow;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Failed to update availability window with ID ${id}`,
        500,
      );
    }
  }

  /**
   * Delete an availability window
   * @param id Availability window ID
   * @returns Success status
   */
  async deleteAvailabilityWindow(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/availability/window/${id}`, {
        method: &quot;DELETE&quot;,
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || `Failed to delete availability window with ID ${id}`,
          response.status,
          error.details,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Failed to delete availability window with ID ${id}`,
        500,
      );
    }
  }

  /**
   * Check staff availability for a time period
   * @param userIds Array of user IDs to check
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Map of user IDs to availability status
   */
  async checkStaffAvailability(
    userIds: string[],
    startDate: string,
    endDate: string,
  ): Promise<Record<string, boolean>> {
    try {
      const response = await fetch(&quot;/api/availability/check&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
        body: JSON.stringify({ userIds, startDate, endDate }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Failed to check staff availability&quot;,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.availability;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to check staff availability", 500);
    }
  }
}

// Create singleton instance
export const availabilityService = new AvailabilityServiceClient();
