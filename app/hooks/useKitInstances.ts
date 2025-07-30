&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useQuery, useMutation, useQueryClient } from &quot;@tanstack/react-query&quot;;
import { apiRequest } from &quot;../lib/queryClient&quot;;
import {
  KitDTO,
  KitTemplateDTO,
  CreateKitInstanceRequest,
} from &quot;../../services/kits/types&quot;;

/**
 * Custom hook for managing kit instances
 * Provides kit instances, templates, and related mutations
 */
export function useKitInstances() {
  const queryClient = useQueryClient();

  // Fetch kit instances
  const {
    data: kitInstances = [],
    isLoading: isLoadingInstances,
    error: instancesError,
  } = useQuery<KitDTO[]>({
    queryKey: [&quot;/api/kits/instances&quot;],
    queryFn: async () => {
      try {
        const response = await apiRequest(
          &quot;GET&quot;,
          &quot;/api/kits/instances&quot;,
          null,
          2,
        );
        if (!response.ok) {
          const errorText =
            response.statusText || `HTTP Error ${response.status}`;
          throw new Error(`Error fetching kit instances: ${errorText}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          console.warn(
            &quot;Expected array for kit instances but got:&quot;,
            typeof data,
          );
          return [];
        }

        return data;
      } catch (error) {
        console.error(&quot;Error fetching kit instances:&quot;, error);
        return [];
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
  });

  // Fetch kit templates
  const {
    data: kitTemplates = [],
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery<KitTemplateDTO[]>({
    queryKey: [&quot;/api/kits/templates&quot;],
    queryFn: async () => {
      try {
        const response = await apiRequest(
          &quot;GET&quot;,
          &quot;/api/kits/templates&quot;,
          null,
          2,
        );
        if (!response.ok) {
          const errorText =
            response.statusText || `HTTP Error ${response.status}`;
          throw new Error(`Error fetching kit templates: ${errorText}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          console.warn(
            &quot;Expected array for kit templates but got:&quot;,
            typeof data,
          );
          return [];
        }

        return data;
      } catch (error) {
        console.error(&quot;Error fetching kit templates:&quot;, error);
        return [];
      }
    },
    staleTime: 60000, // 1 minute
    refetchOnMount: true,
  });

  // Create kit instance mutation
  const createKitInstanceMutation = useMutation({
    mutationFn: async (data: CreateKitInstanceRequest) => {
      try {
        const response = await apiRequest(
          &quot;POST&quot;,
          &quot;/api/kits/instances&quot;,
          data,
          2,
        ); // Allow up to 2 retries
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.error ||
              `Failed to create kit instance: ${response.status} ${response.statusText}`,
          );
        }
        return response.json();
      } catch (error) {
        console.error(&quot;Error creating kit instance:&quot;, error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits/instances&quot;] });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits/templates&quot;] });
    },
    onError: (error) => {
      console.error(&quot;Kit instance creation failed:&quot;, error);
    },
  });

  // Wrapper function for creating a kit instance
  const createKitInstance = (data: CreateKitInstanceRequest) => {
    return createKitInstanceMutation.mutateAsync(data);
  };

  return {
    kitInstances,
    isLoadingInstances,
    instancesError,
    kitTemplates,
    isLoadingTemplates,
    templatesError,
    createKitInstance,
    isPendingCreate: createKitInstanceMutation.isPending,
  };
}
