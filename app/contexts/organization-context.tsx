"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type OrganizationContextType = {
  currentOrganizationId: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  organizations: any[];
  isLoading: boolean;
  error: string | null;
};

const OrganizationContext = createContext<OrganizationContextType>({
  currentOrganizationId: null,
  switchOrganization: async () => {},
  organizations: [],
  isLoading: false,
  error: null,
});

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentOrganizationId, setCurrentOrganizationId] = useState<
    string | null
  >(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/organizations/user");
        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }
        const data = await response.json();
        setOrganizations(data || []);

        // Set current organization if available
        const currentOrgResponse = await fetch("/api/organizations/context");
        if (currentOrgResponse.ok) {
          const currentOrgData = await currentOrgResponse.json();
          setCurrentOrganizationId(currentOrgData.currentOrganizationId);
        }
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError("Failed to load organizations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const switchOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/switch-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch organization");
      }

      setCurrentOrganizationId(organizationId);
      router.refresh();
    } catch (err) {
      console.error("Error switching organization:", err);
      setError("Failed to switch organization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganizationId,
        switchOrganization,
        organizations,
        isLoading,
        error,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContext;

export const useOrganizationContext = useOrganization;
