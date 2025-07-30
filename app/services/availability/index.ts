&quot;use client&quot;;

import { createServiceProvider } from &quot;../infrastructure/serviceRegistry&quot;;
import { IAvailabilityService } from &quot;./serviceAdapter&quot;;
import {
  AvailabilityDTO,
  AvailabilityQueryOptions,
  AvailabilitiesResponse,
  AvailabilityResponse,
  ServiceResponse,
  ConflictCheckResponse,
  CreateAvailabilityRequest,
  UpdateAvailabilityRequest,
} from &quot;./models&quot;;

// Export all the service models and interfaces for use in other modules
export * from &quot;./models&quot;;

/**
 * ClientAvailabilityService
 *
 * This is a pure client-side implementation that uses fetch to call API endpoints
 * instead of directly accessing the database. This ensures proper separation of
 * client and server code.
 */
class ClientAvailabilityService implements IAvailabilityService {
  async getAvailabilityBlocks(
    options: AvailabilityQueryOptions,
  ): Promise<AvailabilitiesResponse> {
    try {
      // Build query string from options
      const queryParams = new URLSearchParams();
      queryParams.append(&quot;userId&quot;, options.userId.toString());

      if (options.startDate) {
        const startDate =
          options.startDate instanceof Date
            ? options.startDate.toISOString()
            : options.startDate;
        queryParams.append(&quot;startDate&quot;, startDate);
      }

      if (options.endDate) {
        const endDate =
          options.endDate instanceof Date
            ? options.endDate.toISOString()
            : options.endDate;
        queryParams.append(&quot;endDate&quot;, endDate);
      }

      if (options.status) {
        queryParams.append(&quot;status&quot;, options.status);
      }

      // Call API endpoint
      const response = await fetch(
        `/api/availability?${queryParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch availability blocks: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return {
        success: true,
        data:
          data.success && data.data
            ? data.data
            : Array.isArray(data)
              ? data
              : [],
      };
    } catch (error) {
      console.error(&quot;Error in getAvailabilityBlocks:&quot;, error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : &quot;Failed to fetch availability blocks&quot;,
      };
    }
  }

  async getAvailabilityBlockById(id: number): Promise<AvailabilityResponse> {
    try {
      const response = await fetch(`/api/availability/${id}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch availability block: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return {
        success: true,
        data: data.success && data.data ? data.data : data,
      };
    } catch (error) {
      console.error(`Error in getAvailabilityBlockById(${id}):`, error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : &quot;Failed to fetch availability block&quot;,
      };
    }
  }

  async createAvailabilityBlock(
    data: CreateAvailabilityRequest,
  ): Promise<AvailabilityResponse> {
    try {
      const response = await fetch(&quot;/api/availability&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to create availability block: ${response.status}`,
        );
      }

      const responseData = await response.json();
      return {
        success: true,
        data:
          responseData.success && responseData.data
            ? responseData.data
            : responseData,
      };
    } catch (error) {
      console.error(&quot;Error in createAvailabilityBlock:&quot;, error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : &quot;Failed to create availability block&quot;,
      };
    }
  }

  async updateAvailabilityBlock(
    id: number,
    data: UpdateAvailabilityRequest,
  ): Promise<AvailabilityResponse> {
    try {
      const response = await fetch(`/api/availability/${id}`, {
        method: &quot;PUT&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to update availability block: ${response.status}`,
        );
      }

      const responseData = await response.json();
      return {
        success: true,
        data:
          responseData.success && responseData.data
            ? responseData.data
            : responseData,
      };
    } catch (error) {
      console.error(`Error in updateAvailabilityBlock(${id}):`, error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : &quot;Failed to update availability block&quot;,
      };
    }
  }

  async deleteAvailabilityBlock(
    id: number,
    deleteSeries: boolean = false,
  ): Promise<ServiceResponse<{ success: boolean; count?: number }>> {
    try {
      const url = deleteSeries
        ? `/api/availability/${id}?deleteSeries=true`
        : `/api/availability/${id}`;

      const response = await fetch(url, {
        method: &quot;DELETE&quot;,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to delete availability block: ${response.status}`,
        );
      }

      // Parse the response to get deletion details
      const result = await response.json();
      console.log(&quot;Client received delete response:&quot;, JSON.stringify(result));

      // Normalize the result structure to ensure consistent format
      let responseData: { success: boolean; count?: number } = {
        success: true,
      };

      // Handle different response formats
      if (result?.data?.success !== undefined) {
        // Standard nested format from service
        responseData = result.data;
      } else if (result?.success !== undefined) {
        // Direct format from API
        responseData = {
          success: result.success,
          count: result.data?.count || result.count,
        };
      }

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error(
        `Error in deleteAvailabilityBlock(${id}, deleteSeries=${deleteSeries}):`,
        error,
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : &quot;Failed to delete availability block&quot;,
      };
    }
  }

  async checkForConflicts(
    userId: number,
    startDate: Date | string,
    endDate: Date | string,
    excludeBlockId?: number,
  ): Promise<ConflictCheckResponse> {
    try {
      // Format dates correctly
      const formattedStartDate =
        startDate instanceof Date ? startDate.toISOString() : startDate;
      const formattedEndDate =
        endDate instanceof Date ? endDate.toISOString() : endDate;

      const response = await fetch(&quot;/api/availability/conflicts&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({
          userId,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          excludeBlockId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to check for conflicts: ${response.status}`,
        );
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          hasConflicts: data.hasConflicts || false,
          conflicts: data.conflicts || [],
        },
      };
    } catch (error) {
      console.error(&quot;Error in checkForConflicts:&quot;, error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : &quot;Failed to check for conflicts&quot;,
      };
    }
  }
}

// This would normally use the adapter pattern to select between local and remote implementations
// Using a client implementation that accesses the API endpoints rather than the database directly
export const getAvailabilityService = () => new ClientAvailabilityService();
