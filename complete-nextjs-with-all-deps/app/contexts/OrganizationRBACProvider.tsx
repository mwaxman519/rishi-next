"use client";

import React, { ReactNode } from "react";
import { OrganizationProvider } from "./OrganizationProvider";
import { RBACProvider } from "./RBACProvider";
import { useQuery } from "@tanstack/react-query";
import { getUserPermissions } from "@/client/services/rbac";
import { useOrganization } from "./OrganizationProvider";
import type { Permission } from "../services/rbac/models";

/**
 * Combined Organization and RBAC Provider Component
 */
export function OrganizationRBACProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OrganizationProvider>
      <RBACProviderWithOrganization>{children}</RBACProviderWithOrganization>
    </OrganizationProvider>
  );
}

/**
 * RBAC Provider that uses the current organization context
 */
function RBACProviderWithOrganization({ children }: { children: ReactNode }) {
  const { currentOrganization, isLoading: isLoadingOrg } = useOrganization();
  const organizationId = currentOrganization?.id;

  // Fetch permissions based on the current organization
  const { data: permissions = [], isLoading: isLoadingPerms } = useQuery<Permission[]>({
    queryKey: ["/api/auth/permissions", organizationId],
    queryFn: () => getUserPermissions(organizationId),
    // Don't fetch if we're still loading the organization
    enabled: !isLoadingOrg && !!organizationId,
    // Keep cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  // Get role from current organization if available
  const roles = currentOrganization?.roleId ? [currentOrganization.roleId] : [];

  return (
    <RBACProvider initialRoles={roles} initialPermissions={permissions}>
      {children}
    </RBACProvider>
  );
}
