import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Kit, KitTemplate, KitComponentInventory } from "../lib/schema";

// Type for approval status updates
export interface ApprovalStatusUpdate {
  approvalStatus: "approved" | "rejected";
  approvalNotes?: string;
}

// Queries for kits
export function useKits(filters?: Record<string, string>) {
  const queryParams = new URLSearchParams(filters);

  return useQuery<Kit[]>({
    queryKey: ["/api/kits", filters],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/kits?${queryParams.toString()}`,
      );
      return response.json();
    },
  });
}

export function useKit(id: number | string | null) {
  return useQuery<Kit & { componentInventory: KitComponentInventory[] }>({
    queryKey: ["/api/kits", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest("GET", `/api/kits/${id}`);
      return response.json();
    },
    enabled: !!id,
  });
}

// Queries for kit templates
export function useKitTemplates(filters?: Record<string, string>) {
  const queryParams = new URLSearchParams(filters);

  return useQuery<KitTemplate[]>({
    queryKey: ["/api/kits/templates", filters],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/kits/templates?${queryParams.toString()}`,
      );
      return response.json();
    },
  });
}

export function useKitTemplate(id: number | string | null) {
  return useQuery<KitTemplate & { kitCount: number }>({
    queryKey: ["/api/kits/templates", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest("GET", `/api/kits/templates/${id}`);
      return response.json();
    },
    enabled: !!id,
  });
}

// Queries for kit inventory
export function useKitInventory(kitId?: number | string) {
  const queryParams = new URLSearchParams(
    kitId ? { kitId: kitId.toString() } : {},
  );

  return useQuery<KitComponentInventory[]>({
    queryKey: ["/api/kits/inventory", kitId],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/kits/inventory?${queryParams.toString()}`,
      );
      return response.json();
    },
    enabled: !!kitId,
  });
}

// Mutations for kits
export function useCreateKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/kits", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits"] });
    },
  });
}

export function useUpdateKit(id: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/kits/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kits", id] });
    },
  });
}

export function useDeleteKit(id: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/kits/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits"] });
    },
  });
}

// Mutations for kit templates
export function useCreateKitTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/kits/templates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits/templates"] });
    },
  });
}

export function useUpdateKitTemplate(id: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        "PUT",
        `/api/kits/templates/${id}`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits/templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kits/templates", id] });
    },
  });
}

export function useDeleteKitTemplate(id: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/kits/templates/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits/templates"] });
    },
  });
}

// Mutations for kit inventory
export function useUpdateKitInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/kits/inventory", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits/inventory"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/kits/inventory", variables.kitId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/kits", variables.kitId],
      });
    },
  });
}

// Mutations for approval workflows

/**
 * Hook for approving or rejecting a kit template
 */
export function useApproveKitTemplate(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApprovalStatusUpdate) => {
      const response = await apiRequest(
        "PATCH",
        `/api/kits/templates/${id}/approve`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits/templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kits/templates", id] });
    },
  });
}

/**
 * Hook for approving or rejecting a kit
 */
export function useApproveKit(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApprovalStatusUpdate) => {
      const response = await apiRequest(
        "PATCH",
        `/api/kits/${id}/approve`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kits", id] });
    },
  });
}

/**
 * Hook for fetching items pending approval
 */
export function usePendingApprovals() {
  // Get pending kit templates
  const { data: pendingTemplates, isLoading: isLoadingTemplates } =
    useKitTemplates({
      approvalStatus: "pending",
    });

  // Get pending kits
  const { data: pendingKits, isLoading: isLoadingKits } = useKits({
    approvalStatus: "pending",
  });

  return {
    pendingTemplates: pendingTemplates || [],
    pendingKits: pendingKits || [],
    isLoading: isLoadingTemplates || isLoadingKits,
    totalPending: (pendingTemplates?.length || 0) + (pendingKits?.length || 0),
  };
}
