/**
 * Client-side adapter for the Locations service
 */
import { api } from &quot;@/lib/api&quot;;
import type {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
} from &quot;@/services/locations_core&quot;;

export class LocationsClientService {
  /**
   * Get all locations with optional filtering
   */
  async getAllLocations(filters = {}): Promise<LocationDTO[]> {
    try {
      const queryString = new URLSearchParams(filters as any).toString();
      const response = await api.get(
        `/api/locations${queryString ? `?${queryString}` : "&quot;}`,
      );
      return response.data.locations || response.data.data || [];
    } catch (error) {
      console.error(&quot;Error fetching locations:&quot;, error);
      throw error;
    }
  }

  /**
   * Get a single location by ID
   */
  async getLocationById(id: string): Promise<LocationDTO | null> {
    try {
      const response = await api.get(`/api/locations/${id}`);
      return response.data.location || response.data.data || null;
    } catch (error) {
      console.error(`Error fetching location with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new location
   */
  async createLocation(data: CreateLocationParams): Promise<LocationDTO> {
    try {
      const response = await api.post(&quot;/api/locations&quot;, data);

      // Add defensive checking for response structure
      if (!response.data || !response.data.location) {
        console.error(&quot;Invalid response structure:&quot;, response);
        throw new Error(&quot;Server returned an invalid response format&quot;);
      }

      return response.data.location || response.data.data;
    } catch (error) {
      console.error(&quot;Error creating location:&quot;, error);
      throw error;
    }
  }

  /**
   * Update an existing location
   */
  async updateLocation(
    id: string,
    data: UpdateLocationParams,
  ): Promise<LocationDTO> {
    try {
      const response = await api.patch(`/api/locations/${id}`, data);

      // Add defensive checking for response structure
      if (!response.data || !response.data.location) {
        console.error(&quot;Invalid response structure:&quot;, response);
        throw new Error(&quot;Server returned an invalid response format&quot;);
      }

      return response.data.location || response.data.data;
    } catch (error) {
      console.error(`Error updating location with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a location
   */
  async deleteLocation(id: string): Promise<void> {
    try {
      await api.delete(`/api/locations/${id}`);
    } catch (error) {
      console.error(`Error deleting location with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Approve a location
   */
  async approveLocation(id: string): Promise<LocationDTO> {
    try {
      const response = await api.patch(`/api/locations/${id}/approve`);

      // Add defensive checking for response structure
      if (!response.data || !response.data.location) {
        console.error(&quot;Invalid response structure:&quot;, response);
        throw new Error(&quot;Server returned an invalid response format&quot;);
      }

      return response.data.location || response.data.data;
    } catch (error) {
      console.error(`Error approving location with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reject a location
   */
  async rejectLocation({
    id,
    reason,
  }: {
    id: string;
    reason?: string | undefined;
  }): Promise<LocationDTO> {
    try {
      const response = await api.patch(`/api/locations/${id}/reject`, {
        reason,
      });

      // Add defensive checking for response structure
      if (!response.data || !response.data.location) {
        console.error(&quot;Invalid response structure:&quot;, response);
        throw new Error(&quot;Server returned an invalid response format");
      }

      return response.data.location || response.data.data;
    } catch (error) {
      console.error(`Error rejecting location with ID ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const locationsClient = new LocationsClientService();
