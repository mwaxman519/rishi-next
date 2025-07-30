&quot;use client&quot;;

import React, { createContext, useContext, useState, useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;

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
        const response = await fetch(&quot;/api/organizations/user&quot;);
        if (!response.ok) {
          throw new Error(&quot;Failed to fetch organizations&quot;);
        }
        const data = await response.json();
        setOrganizations(data || []);

        // Set current organization if available
        const currentOrgResponse = await fetch(&quot;/api/organizations/context&quot;);
        if (currentOrgResponse.ok) {
          const currentOrgData = await currentOrgResponse.json();
          setCurrentOrganizationId(currentOrgData.currentOrganizationId);
        }
      } catch (err) {
        console.error(&quot;Error fetching organizations:&quot;, err);
        setError(&quot;Failed to load organizations&quot;);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const switchOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(&quot;/api/auth/switch-organization&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({ organizationId }),
      });

      if (!response.ok) {
        throw new Error(&quot;Failed to switch organization&quot;);
      }

      setCurrentOrganizationId(organizationId);
      router.refresh();
    } catch (err) {
      console.error(&quot;Error switching organization:&quot;, err);
      setError(&quot;Failed to switch organization&quot;);
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
