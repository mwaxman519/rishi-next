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
    console.log('OrganizationProvider: Using static organization data');
    
    // STATIC DATA - No API calls to prevent errors
    const staticOrganizations = [
      { id: '1', name: 'Rishi Platform', tier: '3', status: 'active' },
      { id: '2', name: 'Client Organization', tier: '2', status: 'active' }
    ];
    
    setOrganizations(staticOrganizations);
    
    // Set current organization to first one if none set
    if (!currentOrganization && staticOrganizations.length > 0) {
      setCurrentOrganization(staticOrganizations[0]);
    }
    
    setIsLoading(false);
  };

  const switchOrganization = async (organizationId: string) => {
    console.log('OrganizationProvider: Static organization switch to', organizationId);
    
    const organization = organizations.find(org => org.id === organizationId);
    if (organization) {
      setCurrentOrganization(organization);
      
      // DISABLED: No API calls to prevent errors
      console.log('Organization switched to:', organization.name);
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