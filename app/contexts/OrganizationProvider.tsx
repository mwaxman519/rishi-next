import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from &quot;react&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;

// Define the organization type
export interface UserOrganization {
  id: string;
  name: string;
  type: string;
  tier?: string | null;
  role?: string;
}

// Define the context interface
interface OrganizationContextType {
  userOrganizations: UserOrganization[];
  currentOrganization: UserOrganization | null;
  switchOrganization: (orgId: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

// Default context values
const defaultContext: OrganizationContextType = {
  userOrganizations: [],
  currentOrganization: null,
  switchOrganization: async () => Promise.resolve(),
  isLoading: true,
  error: null,
};

// Create the context
const OrganizationContext =
  createContext<OrganizationContextType>(defaultContext);

// Provider component
interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [userOrganizations, setUserOrganizations] = useState<
    UserOrganization[]
  >([]);
  const [currentOrganization, setCurrentOrganization] =
    useState<UserOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get authentication state
  const { user, isLoading: authIsLoading, isSuperAdmin } = useAuth();

  // Function to switch between organizations
  const switchOrganization = async (orgId: string): Promise<void> => {
    try {
      // Find the organization in the user's available organizations
      const organization = userOrganizations.find((org) => org.id === orgId);

      // If organization not found, throw error
      if (!organization) {
        throw new Error(
          `Organization with ID ${orgId} not found in user's organizations`,
        );
      }

      // Check if we&apos;re already on this organization
      if (currentOrganization?.id === orgId) {
        console.log(&quot;Already on this organization, no need to switch&quot;);
        return;
      }

      // Set the current organization in state
      setCurrentOrganization(organization);

      // Save the selected organization ID to localStorage
      localStorage.setItem(&quot;selectedOrganizationId&quot;, orgId);

      // Make an API call to update the server-side context and JWT token
      const response = await fetch(&quot;/api/auth/switch-organization&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({
          organizationId: orgId,
          organizationRole: organization.role,
        }),
        credentials: &quot;include&quot;, // Include cookies in the request
      });

      // Check for errors in the response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to switch organization: ${response.status}`,
        );
      }

      // Get the response data
      const data = await response.json();

      console.log(&quot;Organization switched successfully:&quot;, data);

      // Refresh the page to ensure all components use the new context
      console.log(
        `Successfully switched to organization: ${organization.name}`,
      );

      // Use a timeout to allow the toast to show before reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      console.error(&quot;Error switching organization:&quot;, err);
      // Re-throw the error so it can be handled by the UI component
      throw err instanceof Error
        ? err
        : new Error(&quot;An unknown error occurred while switching organizations&quot;);
    }
  };

  // Fetch organizations on component mount - wait for authentication
  useEffect(() => {
    const initializeOrganizations = () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(&quot;Authentication state:&quot;, { 
          user: user?.username, 
          role: user?.role, 
          isSuperAdmin, 
          authIsLoading 
        });

        // Only initialize if user is authenticated and is super admin
        if (user && isSuperAdmin) {
          const rishiInternal = {
            id: &quot;00000000-0000-0000-0000-000000000001&quot;,
            name: &quot;Rishi Internal&quot;,
            type: &quot;internal&quot;,
            tier: &quot;internal&quot;,
            role: &quot;super_admin&quot;,
          };

          // Add sample organizations for testing dropdown functionality
          const sampleOrganizations = [
            rishiInternal,
            {
              id: &quot;00000000-0000-0000-0000-000000000002&quot;,
              name: &quot;Green Leaf Cannabis&quot;,
              type: &quot;client&quot;,
              tier: &quot;tier_2&quot;,
              role: &quot;client_admin&quot;,
            },
            {
              id: &quot;00000000-0000-0000-0000-000000000003&quot;,
              name: &quot;MedTech Solutions&quot;,
              type: &quot;client&quot;,
              tier: &quot;tier_3&quot;,
              role: &quot;client_admin&quot;,
            },
            {
              id: &quot;00000000-0000-0000-0000-000000000004&quot;,
              name: &quot;Cannabis Connect&quot;,
              type: &quot;client&quot;,
              tier: &quot;tier_1&quot;,
              role: &quot;client_admin&quot;,
            },
            {
              id: &quot;00000000-0000-0000-0000-000000000005&quot;,
              name: &quot;Harvest Partners&quot;,
              type: &quot;client&quot;,
              tier: &quot;tier_2&quot;,
              role: &quot;client_admin&quot;,
            },
          ];

          console.log(&quot;Initializing organizations for super admin user:&quot;, sampleOrganizations.length);
          setUserOrganizations(sampleOrganizations);

          // Check localStorage for saved organization preference or default to Rishi Internal
          const savedOrgId = localStorage.getItem(&quot;selectedOrganizationId&quot;);
          const selectedOrg = sampleOrganizations.find(org => org.id === savedOrgId) || rishiInternal;
          
          console.log(&quot;Setting current organization to:&quot;, selectedOrg.name);
          setCurrentOrganization(selectedOrg);
          localStorage.setItem(&quot;selectedOrganizationId&quot;, selectedOrg.id);
          
          console.log(&quot;Current organization set to:&quot;, selectedOrg.name);
          console.log(&quot;Organization initialization complete with&quot;, sampleOrganizations.length, &quot;organizations&quot;);
        } else if (user && !isSuperAdmin) {
          console.log(&quot;User is not super admin, organizations will be loaded from API&quot;);
          // For non-super admin users, you would fetch organizations from API
          // For now, just set empty state
          setUserOrganizations([]);
          setCurrentOrganization(null);
        } else {
          console.log(&quot;User not authenticated yet, waiting...&quot;);
          // User not authenticated yet, keep loading state
        }
      } catch (err) {
        console.error(&quot;Error initializing organizations:&quot;, err);
        // Ensure fallback always works for super admin users
        if (user && isSuperAdmin) {
          const defaultOrg = {
            id: &quot;00000000-0000-0000-0000-000000000001&quot;,
            name: &quot;Rishi Internal&quot;,
            type: &quot;internal&quot;,
            tier: &quot;internal&quot;,
            role: &quot;super_admin&quot;,
          };
          const fallbackOrgs = [defaultOrg];
          console.log(&quot;Using fallback organization:&quot;, defaultOrg.name);
          setUserOrganizations(fallbackOrgs);
          setCurrentOrganization(defaultOrg);
          localStorage.setItem(&quot;selectedOrganizationId&quot;, defaultOrg.id);
        }
        setError(null);
      } finally {
        // Only stop loading if authentication is complete
        if (!authIsLoading) {
          setIsLoading(false);
        }
      }
    };

    // Only initialize when authentication is complete
    if (!authIsLoading) {
      initializeOrganizations();
    }
  }, [user, isSuperAdmin, authIsLoading]);

  // Context value
  const value = {
    userOrganizations,
    currentOrganization,
    switchOrganization,
    isLoading,
    error,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

// Custom hook to use the organization context
export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      &quot;useOrganizationContext must be used within an OrganizationProvider&quot;,
    );
  }
  return context;
}

// Also export with the name that the existing code is looking for
export const useOrganization = useOrganizationContext;
