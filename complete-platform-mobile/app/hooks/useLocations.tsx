"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

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
    if (value !== undefined && value !== "") {
      queryParams.append(key, value.toString());
    }
  });

  // Fetch locations
  const { data, isLoading, error } = useQuery<{ data: Location[] }>({
    queryKey: ["/api/locations", filters],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
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
    queryKey: ["/api/locations", id],
    queryFn: async () => {
      if (!id) throw new Error("Location ID is required");
      const response = await apiRequest("GET", `/api/locations/${id}`);
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
      const response = await apiRequest("POST", "/api/locations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
  });
}

// Hook for updating a location
export function useUpdateLocation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Location>) => {
      const response = await apiRequest("PATCH", `/api/locations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/locations", id] });
    },
  });
}

// Hook for deleting a location
export function useDeleteLocation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/locations/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
  });
}

// Hook for approving or rejecting a location
export interface ApprovalData {
  status: "approved" | "rejected";
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
        "PUT",
        `/api/locations/pending`,
        approvalData,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/locations", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/locations/pending"] });
    },
  });
}

// Hook for fetching pending locations
export function usePendingLocations() {
  return useQuery<{ pendingLocations: Location[] }>({
    queryKey: ["/api/locations/pending"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/locations/pending");
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
      const response = await apiRequest("POST", "/api/locations/geocode", {
        address,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to geocode address");
      }

      return data.result;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { geocodeAddress, isLoading, error };
}

// Hook for searching locations
export function useLocationSearch(query: string = "", limit: number = 10) {
  const queryParams = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  return useQuery<Location[]>({
    queryKey: ["/api/locations/search", query, limit],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const response = await apiRequest(
        "GET",
        `/api/locations/search?${queryParams.toString()}`,
      );
      return response.json();
    },
    enabled: query.length >= 2,
  });
}
