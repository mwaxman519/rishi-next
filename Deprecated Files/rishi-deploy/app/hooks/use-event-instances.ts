import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { queryClient } from "../lib/queryClient";

export interface EventInstance {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  preparationStatus?: string;
  notes?: string;
  specialInstructions?: string;
  checkInRequired?: boolean;
  createdAt?: string;
  updatedAt?: string;
  location?: {
    id: string;
    name: string;
    address?: string;
  };
  fieldManager?: {
    id: string;
    name: string;
    email?: string;
  };
}

/**
 * Hook to fetch event instances for a booking
 */
export function useEventInstances(bookingId: string) {
  return useQuery({
    queryKey: ["/api/bookings", bookingId, "events"],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingId}/events`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch event instances");
      }
      return (await response.json()) as EventInstance[];
    },
    enabled: !!bookingId,
  });
}

/**
 * Hook to assign a field manager to an event
 */
export function useAssignEventManager() {
  return useMutation({
    mutationFn: async ({
      eventId,
      managerId,
    }: {
      eventId: string;
      managerId: string;
    }) => {
      const response = await fetch(`/api/events/${eventId}/assign-manager`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ managerId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign manager");
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["/api/bookings", "*", "events"],
      });

      toast({
        title: "Manager Assigned",
        description:
          "Field manager has been assigned to the event successfully.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Assign Manager",
        description:
          error.message || "An error occurred while assigning the manager.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to start event preparation
 */
export function useStartEventPreparation() {
  return useMutation({
    mutationFn: async ({
      eventId,
      preparationTasks,
    }: {
      eventId: string;
      preparationTasks?: Array<{
        description: string;
        assignedTo?: string;
        dueDate: string;
      }>;
    }) => {
      const response = await fetch(`/api/events/${eventId}/prepare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preparationTasks }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start event preparation");
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["/api/bookings", "*", "events"],
      });

      toast({
        title: "Preparation Started",
        description: "Event preparation has been started successfully.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Start Preparation",
        description:
          error.message || "An error occurred while starting preparation.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to mark an event as ready
 */
export function useMarkEventReady() {
  return useMutation({
    mutationFn: async ({
      eventId,
      details,
    }: {
      eventId: string;
      details: {
        staffAssigned: boolean;
        kitsAssigned: boolean;
        logisticsConfirmed: boolean;
        venueConfirmed: boolean;
      };
    }) => {
      const response = await fetch(`/api/events/${eventId}/mark-ready`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark event as ready");
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["/api/bookings", "*", "events"],
      });

      toast({
        title: "Event Ready",
        description: "Event has been marked as ready for execution.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Mark as Ready",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    },
  });
}
