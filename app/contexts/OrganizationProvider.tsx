import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";

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

      // Check if we're already on this organization
      if (currentOrganization?.id === orgId) {
        console.log("Already on this organization, no need to switch");
        return;
      }

      // Set the current organization in state
      setCurrentOrganization(organization);

      // Save the selected organization ID to localStorage
      localStorage.setItem("selectedOrganizationId", orgId);

      // Make an API call to update the server-side context and JWT token
      const response = await fetch("/api/auth/switch-organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          organizationRole: organization.role,
        }),
        credentials: "include", // Include cookies in the request
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

      console.log("Organization switched successfully:", data);

      // Refresh the page to ensure all components use the new context
      console.log(
        `Successfully switched to organization: ${organization.name}`,
      );

      // Use a timeout to allow the toast to show before reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      console.error("Error switching organization:", err);
      // Re-throw the error so it can be handled by the UI component
      throw err instanceof Error
        ? err
        : new Error("An unknown error occurred while switching organizations");
    }
  };

  // Fetch organizations on component mount - wait for authentication
  useEffect(() => {
    const initializeOrganizations = () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Authentication state:", { 
          user: user?.username, 
          role: user?.role, 
          isSuperAdmin, 
          authIsLoading 
        });

        // Only initialize if user is authenticated and is super admin
        if (user && isSuperAdmin) {
          const rishiInternal = {
            id: "00000000-0000-0000-0000-000000000001",
            name: "Rishi Internal",
            type: "internal",
            tier: "internal",
            role: "super_admin",
          };

          // Add sample organizations for testing dropdown functionality
          const sampleOrganizations = [
            rishiInternal,
            {
              id: "00000000-0000-0000-0000-000000000002",
              name: "Green Leaf Cannabis",
              type: "client",
              tier: "tier_2",
              role: "client_admin",
            },
            {
              id: "00000000-0000-0000-0000-000000000003",
              name: "MedTech Solutions",
              type: "client",
              tier: "tier_3",
              role: "client_admin",
            },
            {
              id: "00000000-0000-0000-0000-000000000004",
              name: "Cannabis Connect",
              type: "client",
              tier: "tier_1",
              role: "client_admin",
            },
            {
              id: "00000000-0000-0000-0000-000000000005",
              name: "Harvest Partners",
              type: "client",
              tier: "tier_2",
              role: "client_admin",
            },
          ];

          console.log("Initializing organizations for super admin user:", sampleOrganizations.length);
          setUserOrganizations(sampleOrganizations);

          // Check localStorage for saved organization preference or default to Rishi Internal
          const savedOrgId = localStorage.getItem("selectedOrganizationId");
          const selectedOrg = sampleOrganizations.find(org => org.id === savedOrgId) || rishiInternal;
          
          console.log("Setting current organization to:", selectedOrg.name);
          setCurrentOrganization(selectedOrg);
          localStorage.setItem("selectedOrganizationId", selectedOrg.id);
          
          console.log("Current organization set to:", selectedOrg.name);
          console.log("Organization initialization complete with", sampleOrganizations.length, "organizations");
        } else if (user && !isSuperAdmin) {
          console.log("User is not super admin, organizations will be loaded from API");
          // For non-super admin users, you would fetch organizations from API
          // For now, just set empty state
          setUserOrganizations([]);
          setCurrentOrganization(null);
        } else {
          console.log("User not authenticated yet, waiting... user=", user, "authIsLoading=", authIsLoading);
          // If authentication is complete but user is null/undefined, proceed with no authentication
          if (!authIsLoading && (user === null || user === undefined)) {
            console.log("Authentication complete with no user, proceeding with empty organizations");
            setUserOrganizations([]);
            setCurrentOrganization(null);
            setIsLoading(false); // Critical: Allow the app to proceed
          }
          // Otherwise, keep loading state if still waiting for auth
        }
      } catch (err) {
        console.error("Error initializing organizations:", err);
        // Ensure fallback always works for super admin users
        if (user && isSuperAdmin) {
          const defaultOrg = {
            id: "00000000-0000-0000-0000-000000000001",
            name: "Rishi Internal",
            type: "internal",
            tier: "internal",
            role: "super_admin",
          };
          const fallbackOrgs = [defaultOrg];
          console.log("Using fallback organization:", defaultOrg.name);
          setUserOrganizations(fallbackOrgs);
          setCurrentOrganization(defaultOrg);
          localStorage.setItem("selectedOrganizationId", defaultOrg.id);
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
      "useOrganizationContext must be used within an OrganizationProvider",
    );
  }
  return context;
}

// Also export with the name that the existing code is looking for
export const useOrganization = useOrganizationContext;
