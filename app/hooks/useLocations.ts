&quot;use client&quot;;

import { useQuery, useMutation, useQueryClient } from &quot;@tanstack/react-query&quot;;
import { useToast } from &quot;./use-toast&quot;;
import { locationsClient } from &quot;../client/services/locations&quot;;
import type {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
} from &quot;../services/locations&quot;;

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
    queryKey: [&quot;/api/locations&quot;, filters],
    queryFn: () => locationsClient.getAllLocations(filters),
  });

  // Create location mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateLocationParams) =>
      locationsClient.createLocation(data),
    onSuccess: () => {
      toast({
        title: &quot;Success&quot;,
        description: &quot;Location created successfully&quot;,
      });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations&quot;] });
    },
    onError: (error: any) => {
      toast({
        title: &quot;Error&quot;,
        description: error.message || &quot;No error details available&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationParams }) =>
      locationsClient.updateLocation(id, data),
    onSuccess: () => {
      toast({
        title: &quot;Success&quot;,
        description: &quot;Location updated successfully&quot;,
      });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations&quot;] });
    },
    onError: (error: any) => {
      toast({
        title: &quot;Error&quot;,
        description: error.message || &quot;No error details available&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationsClient.deleteLocation(id),
    onSuccess: () => {
      toast({
        title: &quot;Success&quot;,
        description: &quot;Location deleted successfully&quot;,
      });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations&quot;] });
    },
    onError: (error: any) => {
      toast({
        title: &quot;Error&quot;,
        description: error.message || &quot;No error details available&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  // Approve location mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => locationsClient.approveLocation(id),
    onSuccess: () => {
      toast({
        title: &quot;Success&quot;,
        description: &quot;Location approved successfully&quot;,
      });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations&quot;] });
    },
    onError: (error: any) => {
      toast({
        title: &quot;Error&quot;,
        description: error.message || &quot;Failed to approve location&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  // Reject location mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string | undefined }) =>
      locationsClient.rejectLocation({ id, reason }),
    onSuccess: () => {
      toast({
        title: &quot;Success&quot;,
        description: &quot;Location rejected successfully&quot;,
      });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/locations&quot;] });
    },
    onError: (error: any) => {
      toast({
        title: &quot;Error&quot;,
        description: error.message || &quot;Failed to reject location&quot;,
        variant: &quot;destructive&quot;,
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
    queryKey: [&quot;/api/locations&quot;, id],
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
