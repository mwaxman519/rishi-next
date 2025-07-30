&quot;use client&quot;;

import { useState, useEffect, useMemo } from &quot;react&quot;;
import { useQuery, useMutation, useQueryClient } from &quot;@tanstack/react-query&quot;;
import { apiRequest } from &quot;../lib/queryClient&quot;;

// Export LocationFilters interface so it can be imported elsewhere
export interface LocationFilters {
  status?: string;
  type?: string;
  state?: string;
  city?: string;
  search?: string;
  active?: boolean;
}

// Type definitions
export interface Location {
  id: string;
  name: string;
  type: string;
  address1: string;
  address2?: string;
  city: string;
  stateId?: string;
  state?: string;
  zipcode: string;
  phone?: string;
  email?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  status: string;
  requestedBy?: string;
  reviewedBy?: string;
  reviewDate?: string;
  geoLat?: number;
  geoLng?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byState: Record<string, number>;
}

export interface LocationFilters {
  status?: string;
  type?: string;
  state?: string;
  city?: string;
  search?: string;
  active?: boolean;
}

// Hooks for fetching locations
export function useLocations(filters: LocationFilters = {}) {
  const queryParams = new URLSearchParams();

  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "&quot;) {
      queryParams.append(key, value.toString());
    }
  });

  // Fetch locations
  const { data, isLoading, error } = useQuery<{ data: Location[] }>({
    queryKey: [&quot;/api/locations&quot;, filters],
    queryFn: async () => {
      const response = await apiRequest(
        &quot;GET&quot;,
        `/api/locations?${queryParams.toString()}`,
      );
      return response.json();
    },
  });

  // Calculate statistics for locations
  const stats: LocationStats = useMemo(() => {
    const locations = data?.data || [];

    // Calculate counts by type, status, and state
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byState: Record<string, number> = {};

    locations.forEach((location) => {
      // Count by type
      if (location.type) {
        byType[location.type] = (byType[location.type] || 0) + 1;
      }

      // Count by status
      if (location.status) {
        byStatus[location.status] = (byStatus[location.status] || 0) + 1;
      }

      // Count by state
      if (location.state) {
        byState[location.state] = (byState[location.state] || 0) + 1;
      }
    });

    return {
      total: locations.length,
      byType,
      byStatus,
      byState,
    };
  }, [data]);

  return {
    locations: data?.data || [],
    isLoading,
    error,
    stats,
  };
}

// Hook for fetching a single location
export function useLocation(id: string | null) {
  return useQuery<Location>({
    queryKey: [&quot;/api/locations&quot;, id],
    queryFn: async () => {
      if (!id) throw new Error(&quot;Location ID is required&quot;);
      const response = await apiRequest(&quot;GET&quot;, `/api/locations/${id}`);
      return response.json();
    },
    enabled: !!id,
  });
}

// Hook for creating a new location
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Location>) => {
      const response = await apiRequest(&quot;POST&quot;, &quot;/api/locations&quot;, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations&quot;] });
    },
  });
}

// Hook for updating a location
export function useUpdateLocation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Location>) => {
      const response = await apiRequest(&quot;PATCH&quot;, `/api/locations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations&quot;] });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations&quot;, id] });
    },
  });
}

// Hook for deleting a location
export function useDeleteLocation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest(&quot;DELETE&quot;, `/api/locations/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations&quot;] });
    },
  });
}

// Hook for approving or rejecting a location
export interface ApprovalData {
  status: &quot;approved&quot; | &quot;rejected&quot;;
  notes?: string;
}

export function useApproveLocation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApprovalData) => {
      // Add the ID to the approval data for the pending locations endpoint
      const approvalData = {
        ...data,
        id,
      };
      const response = await apiRequest(
        &quot;PUT&quot;,
        `/api/locations/pending`,
        approvalData,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations&quot;] });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations&quot;, id] });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations/pending&quot;] });
    },
  });
}

// Hook for fetching pending locations
export function usePendingLocations() {
  return useQuery<{ pendingLocations: Location[] }>({
    queryKey: [&quot;/api/locations/pending&quot;],
    queryFn: async () => {
      const response = await apiRequest(&quot;GET&quot;, &quot;/api/locations/pending&quot;);
      return response.json();
    },
  });
}

// Geocoding hooks
export interface GeocodeResult {
  id?: string;
  placeId: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  addressComponents: {
    street_number?: string;
    route?: string;
    locality?: string; // city
    administrative_area_level_1?: string; // state
    postal_code?: string;
    country?: string;
    [key: string]: string | undefined;
  };
}

export function useGeocode() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const geocodeAddress = async (
    address: string,
  ): Promise<GeocodeResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest(&quot;POST&quot;, &quot;/api/locations/geocode&quot;, {
        address,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || &quot;Failed to geocode address&quot;);
      }

      return data.result;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error(&quot;Unknown error occurred&quot;),
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { geocodeAddress, isLoading, error };
}

// Hook for searching locations
export function useLocationSearch(query: string = &quot;&quot;, limit: number = 10) {
  const queryParams = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  return useQuery<Location[]>({
    queryKey: [&quot;/api/locations/search&quot;, query, limit],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const response = await apiRequest(
        &quot;GET",
        `/api/locations/search?${queryParams.toString()}`,
      );
      return response.json();
    },
    enabled: query.length >= 2,
  });
}
