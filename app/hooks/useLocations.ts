"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { locationsClient } from "../client/services/locations";
import type {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
} from "../services/locations";

interface LocationFilters {
  stateId?: string | undefined;
  status?: string | undefined;
  type?: string | undefined;
}

export function useLocations(filters: LocationFilters = {}): {
  locations: LocationDTO[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createLocation: (data: CreateLocationParams) => Promise<LocationDTO>;
  updateLocation: (params: {
    id: string;
    data: UpdateLocationParams;
  }) => Promise<LocationDTO>;
  deleteLocation: (id: string) => Promise<void>;
  approveLocation: (id: string) => Promise<LocationDTO>;
  rejectLocation: (params: {
    id: string;
    reason?: string | undefined;
  }) => Promise<LocationDTO>;
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
  approveMutation: any;
  rejectMutation: any;
} {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get locations using the client service
  const {
    data: locations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/locations", filters],
    queryFn: () => locationsClient.getAllLocations(filters),
  });

  // Create location mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateLocationParams) =>
      locationsClient.createLocation(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No error details available",
        variant: "destructive",
      });
    },
  });

  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationParams }) =>
      locationsClient.updateLocation(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No error details available",
        variant: "destructive",
      });
    },
  });

  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationsClient.deleteLocation(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No error details available",
        variant: "destructive",
      });
    },
  });

  // Approve location mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => locationsClient.approveLocation(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve location",
        variant: "destructive",
      });
    },
  });

  // Reject location mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string | undefined }) =>
      locationsClient.rejectLocation({ id, reason }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location rejected successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject location",
        variant: "destructive",
      });
    },
  });

  return {
    locations,
    isLoading,
    error,
    refetch,
    createLocation: createMutation.mutateAsync,
    updateLocation: updateMutation.mutateAsync,
    deleteLocation: deleteMutation.mutateAsync,
    approveLocation: approveMutation.mutateAsync,
    rejectLocation: rejectMutation.mutateAsync,
    createMutation,
    updateMutation,
    deleteMutation,
    approveMutation,
    rejectMutation,
  };
}

export function useLocation(id: string) {
  const {
    data: location,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/locations", id],
    queryFn: () => locationsClient.getLocationById(id),
    enabled: !!id,
  });

  return {
    location,
    isLoading,
    error,
    refetch,
  };
}
