/**
 * Service Adapter Pattern
 *
 * This pattern allows us to abstract away whether a service is local (in-process)
 * or remote (as a separate microservice). This enables a gradual migration path
 * from a modular monolith to true microservices.
 */

// Interface for all service adapters
export interface ServiceAdapter<T> {
  getService(): T;
}

// API client interface for making HTTP requests to remote services
export interface ApiClient {
  get<T>(url: string, options?: any): Promise<T>;
  post<T>(url: string, data: any, options?: any): Promise<T>;
  put<T>(url: string, data: any, options?: any): Promise<T>;
  delete<T>(url: string, options?: any): Promise<T>;
}

// Local service adapter for in-process services
export class LocalServiceAdapter<T> implements ServiceAdapter<T> {
  constructor(private serviceInstance: T) {}

  getService(): T {
    return this.serviceInstance;
  }
}

// Remote service adapter for HTTP-based microservices
export class RemoteServiceAdapter<T extends object>
  implements ServiceAdapter<T>
{
  constructor(
    private serviceUrl: string,
    private apiClient: ApiClient,
  ) {}

  getService(): T {
    // Creates a proxy that forwards method calls to the remote service
    const handler: ProxyHandler<any> = {
      get: (_target, prop) => {
        return async (...args: any[]) => {
          return this.apiClient.post(`${this.serviceUrl}/${String(prop)}`, {
            args,
          });
        };
      },
    };

    // Using unknown as intermediate step to satisfy TypeScript
    return new Proxy(Object.create(null), handler) as unknown as T;
  }
}

// Simple API client implementation
export class DefaultApiClient implements ApiClient {
  async get<T>(url: string, options?: any): Promise<T> {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    return response.json();
  }

  async post<T>(url: string, data: any, options?: any): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async put<T>(url: string, data: any, options?: any): Promise<T> {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async delete<T>(url: string, options?: any): Promise<T> {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    return response.json();
  }
}
