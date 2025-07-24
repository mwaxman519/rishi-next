import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

  // Fetch organizations on component mount
  useEffect(() => {
    const initializeOrganizations = () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use direct initialization for development to avoid fetch conflicts
        const rishiInternal = {
          id: "00000000-0000-0000-0000-000000000001",
          name: "Rishi Internal",
          type: "internal",
          tier: "internal",
          role: "super_admin",
        };

        console.log("Initializing Rishi Internal organization directly");
        setUserOrganizations([rishiInternal]);

        // Check localStorage for saved organization preference
        const savedOrgId = localStorage.getItem("selectedOrganizationId");

        if (savedOrgId === rishiInternal.id || !savedOrgId) {
          setCurrentOrganization(rishiInternal);
          localStorage.setItem("selectedOrganizationId", rishiInternal.id);
        }
      } catch (err) {
        console.error("Error initializing organizations:", err);
        // Ensure fallback always works
        const defaultOrg = {
          id: "00000000-0000-0000-0000-000000000001",
          name: "Rishi Internal",
          type: "internal",
          tier: "internal",
          role: "super_admin",
        };
        setUserOrganizations([defaultOrg]);
        setCurrentOrganization(defaultOrg);
        localStorage.setItem("selectedOrganizationId", defaultOrg.id);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize immediately without API dependency
    initializeOrganizations();
  }, []);

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
