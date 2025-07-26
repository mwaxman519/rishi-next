"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Organization {
  id: string;
  name: string;
  tier: string;
  status: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations/');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
        
        // Set current organization to first one if none set
        if (!currentOrganization && data.organizations?.length > 0) {
          setCurrentOrganization(data.organizations[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = async (organizationId: string) => {
    try {
      const organization = organizations.find(org => org.id === organizationId);
      if (organization) {
        setCurrentOrganization(organization);
        
        // Save preference to backend
        await fetch('/api/user-organization-preferences/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ organizationId }),
        });
      }
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };

  useEffect(() => {
    refreshOrganizations();
  }, []);

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    switchOrganization,
    refreshOrganizations,
    isLoading,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextType {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}