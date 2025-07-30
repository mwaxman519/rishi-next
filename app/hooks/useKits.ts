import { useQuery, useMutation, useQueryClient } from &quot;@tanstack/react-query&quot;;
import { apiRequest } from &quot;../lib/queryClient&quot;;
import { Kit, KitTemplate, KitComponentInventory } from &quot;../lib/schema&quot;;

// Type for approval status updates
export interface ApprovalStatusUpdate {
  approvalStatus: &quot;approved&quot; | &quot;rejected&quot;;
  approvalNotes?: string;
}

// Queries for kits
export function useKits(filters?: Record<string, string>) {
  const queryParams = new URLSearchParams(filters);

  return useQuery<Kit[]>({
    queryKey: [&quot;/api/kits&quot;, filters],
    queryFn: async () => {
      const response = await apiRequest(
        &quot;GET&quot;,
        `/api/kits?${queryParams.toString()}`,
      );
      return response.json();
    },
  });
}

export function useKit(id: number | string | null) {
  return useQuery<Kit & { componentInventory: KitComponentInventory[] }>({
    queryKey: [&quot;/api/kits&quot;, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest(&quot;GET&quot;, `/api/kits/${id}`);
      return response.json();
    },
    enabled: !!id,
  });
}

// Queries for kit templates
export function useKitTemplates(filters?: Record<string, string>) {
  const queryParams = new URLSearchParams(filters);

  return useQuery<KitTemplate[]>({
    queryKey: [&quot;/api/kits/templates&quot;, filters],
    queryFn: async () => {
      const response = await apiRequest(
        &quot;GET&quot;,
        `/api/kits/templates?${queryParams.toString()}`,
      );
      return response.json();
    },
  });
}

export function useKitTemplate(id: number | string | null) {
  return useQuery<KitTemplate & { kitCount: number }>({
    queryKey: [&quot;/api/kits/templates&quot;, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest(&quot;GET&quot;, `/api/kits/templates/${id}`);
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
    queryKey: [&quot;/api/kits/inventory&quot;, kitId],
    queryFn: async () => {
      const response = await apiRequest(
        &quot;GET&quot;,
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
      const response = await apiRequest(&quot;POST&quot;, &quot;/api/kits&quot;, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits&quot;] });
    },
  });
}

export function useUpdateKit(id: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(&quot;PUT&quot;, `/api/kits/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits&quot;] });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits&quot;, id] });
    },
  });
}

export function useDeleteKit(id: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest(&quot;DELETE&quot;, `/api/kits/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits&quot;] });
    },
  });
}

// Mutations for kit templates
export function useCreateKitTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(&quot;POST&quot;, &quot;/api/kits/templates&quot;, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits/templates&quot;] });
    },
  });
}

export function useUpdateKitTemplate(id: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        &quot;PUT&quot;,
        `/api/kits/templates/${id}`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits/templates&quot;] });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits/templates&quot;, id] });
    },
  });
}

export function useDeleteKitTemplate(id: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest(&quot;DELETE&quot;, `/api/kits/templates/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits/templates&quot;] });
    },
  });
}

// Mutations for kit inventory
export function useUpdateKitInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(&quot;POST&quot;, &quot;/api/kits/inventory&quot;, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits/inventory&quot;] });
      queryClient.invalidateQueries({
        queryKey: [&quot;/api/kits/inventory&quot;, variables.kitId],
      });
      queryClient.invalidateQueries({
        queryKey: [&quot;/api/kits&quot;, variables.kitId],
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
        &quot;PATCH&quot;,
        `/api/kits/templates/${id}/approve`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits/templates&quot;] });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits/templates&quot;, id] });
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
        &quot;PATCH&quot;,
        `/api/kits/${id}/approve`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits&quot;] });
      queryClient.invalidateQueries({ queryKey: [&quot;/api/kits&quot;, id] });
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
      approvalStatus: &quot;pending&quot;,
    });

  // Get pending kits
  const { data: pendingKits, isLoading: isLoadingKits } = useKits({
    approvalStatus: &quot;pending&quot;,
  });

  return {
    pendingTemplates: pendingTemplates || [],
    pendingKits: pendingKits || [],
    isLoading: isLoadingTemplates || isLoadingKits,
    totalPending: (pendingTemplates?.length || 0) + (pendingKits?.length || 0),
  };
}
