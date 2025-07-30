import {
  ServiceAdapter,
  LocalServiceAdapter,
  RemoteServiceAdapter,
  DefaultApiClient,
} from "./serviceAdapter";

/**
 * ServiceRegistry
 *
 * This registry manages the configuration for our services, determining whether
 * they should be accessed locally (in-process) or remotely (as microservices).
 * This enables a gradual migration path from modular monolith to microservices.
 */

// Service configuration type
export type ServiceConfig = {
  type: "local" | "remote";
  url?: string;
};

// Service registry configuration
// In a production environment, this would typically be loaded from environment
// variables or a configuration service
export const serviceConfigurations: Record<string, ServiceConfig> = {
  // All services are local by default in development
  auth: { type: "local" },
  user: { type: "local" },
  availability: { type: "local" },
  // Future configuration example:
  // 'auth': { type: 'remote', url: 'https://auth-service.example.com/api' }
};

// Shared API client instance
const apiClient = new DefaultApiClient();

/**
 * Get a service adapter for the specified service
 *
 * @param serviceId The identifier of the service
 * @param localInstance The local service instance to use if the service is configured as local
 * @returns A service adapter that provides access to the service
 */
export function getServiceAdapter<T extends object>(
  serviceId: string,
  localInstance: T,
): ServiceAdapter<T> {
  const config = serviceConfigurations[serviceId];

  if (!config) {
    console.warn(
      `No configuration found for service '${serviceId}'. Defaulting to local.`,
    );
    return new LocalServiceAdapter<T>(localInstance);
  }

  if (config.type === "local") {
    return new LocalServiceAdapter<T>(localInstance);
  } else {
    if (!config.url) {
      throw new Error(
        `Remote service '${serviceId}' is missing a URL configuration.`,
      );
    }
    return new RemoteServiceAdapter<T>(config.url, apiClient);
  }
}

/**
 * Get a service adapter for accessing the specified service,
 * with support for server-only dynamic imports
 *
 * @param serviceId The identifier of the service
 * @returns A service adapter that provides access to the service
 */
export function getAsyncServiceAdapter<T extends object>(
  serviceId: string,
): ServiceAdapter<T> {
  const config = serviceConfigurations[serviceId];

  if (!config) {
    console.warn(
      `No configuration found for service '${serviceId}'. Defaulting to remote.`,
    );
    throw new Error(`Service '${serviceId}' needs to be properly configured.`);
  }

  if (config.type === "remote") {
    if (!config.url) {
      throw new Error(
        `Remote service '${serviceId}' is missing a URL configuration.`,
      );
    }
    return new RemoteServiceAdapter<T>(config.url, apiClient);
  } else {
    // For local services that require server-only dynamic imports,
    // we return a special adapter that will be loaded asynchronously
    return {
      getService(): T {
        throw new Error(
          "This service must be accessed through an API route. Direct client access is not supported.",
        );
      },
    } as ServiceAdapter<T>;
  }
}

/**
 * Service provider function
 *
 * This is a higher-order function that creates a function to get a service instance,
 * abstracting away whether the service is local or remote.
 *
 * @param serviceId The identifier of the service
 * @param localInstance The local service instance to use if the service is configured as local
 * @returns A function that returns the service instance
 */
export function createServiceProvider<T extends object>(
  serviceId: string,
  localInstance: T,
): () => T {
  return () => getServiceAdapter(serviceId, localInstance).getService();
}

/**
 * Async service provider function
 *
 * Creates a function that asynchronously loads and returns a service instance.
 * This should be used for services that need server-side dynamic imports.
 *
 * @param serviceId The identifier of the service
 * @returns A function that asynchronously returns the service instance
 */
export function createAsyncServiceProvider<T extends object>(
  serviceId: string,
): () => Promise<T> {
  // We'll return an async provider function
  return async () => {
    const config = serviceConfigurations[serviceId];

    if (!config) {
      throw new Error(`No configuration found for service '${serviceId}'`);
    }

    // For remote services, create a remote adapter
    if (config.type === "remote") {
      if (!config.url) {
        throw new Error(
          `Remote service '${serviceId}' is missing a URL configuration`,
        );
      }

      return new RemoteServiceAdapter<T>(config.url, apiClient).getService();
    }

    // For local services, dynamically import
    // This pattern ensures the imports only happen on the server
    try {
      if (serviceId === "availability") {
        // Special handling for availability service
        // Import the adapter, not the service directly
        const { LocalAvailabilityServiceAdapter } = await import(
          "../availability/serviceAdapter"
        );
        const adapter = new LocalAvailabilityServiceAdapter();
        // Use the getServiceAsync method defined on this specific adapter
        return (adapter as any).getServiceAsync();
      }

      // This would be expanded for other services
      throw new Error(
        `No async import handler defined for service '${serviceId}'`,
      );
    } catch (error) {
      console.error(
        `Failed to asynchronously import service '${serviceId}':`,
        error,
      );
      throw error;
    }
  };
}
