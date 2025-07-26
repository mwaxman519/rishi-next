"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import {
  KitDTO,
  KitTemplateDTO,
  CreateKitInstanceRequest,
} from "../../services/kits/types";

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
    queryKey: ["/api/kits/instances"],
    queryFn: async () => {
      try {
        const response = await apiRequest(
          "GET",
          "/api/kits/instances",
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
            "Expected array for kit instances but got:",
            typeof data,
          );
          return [];
        }

        return data;
      } catch (error) {
        console.error("Error fetching kit instances:", error);
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
    queryKey: ["/api/kits/templates"],
    queryFn: async () => {
      try {
        const response = await apiRequest(
          "GET",
          "/api/kits/templates",
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
            "Expected array for kit templates but got:",
            typeof data,
          );
          return [];
        }

        return data;
      } catch (error) {
        console.error("Error fetching kit templates:", error);
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
          "POST",
          "/api/kits/instances",
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
        console.error("Error creating kit instance:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/kits/instances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kits/templates"] });
    },
    onError: (error) => {
      console.error("Kit instance creation failed:", error);
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
