&quot;use client&quot;;

import { QueryClient } from &quot;@tanstack/react-query&quot;;

/**
 * Default fetch function for API requests
 * Automatically adds auth credentials and handles JSON conversions
 * Includes improved error handling and retry logic
 */
export async function apiRequest(
  method: &quot;GET&quot; | &quot;POST&quot; | &quot;PUT&quot; | &quot;PATCH&quot; | &quot;DELETE&quot;,
  url: string,
  data?: any,
  retries = 1,
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      &quot;Content-Type&quot;: &quot;application/json&quot;,
    },
    credentials: &quot;include&quot;, // Include cookies for auth
    // Add cache control for GET requests
    cache: method === &quot;GET&quot; ? &quot;default&quot; : &quot;no-cache&quot;,
  };

  if (data) {
    try {
      options.body = JSON.stringify(data);
    } catch (error) {
      console.error(&quot;Error serializing request data:&quot;, error);
      throw new Error(&quot;Invalid request data&quot;);
    }
  }

  try {
    const response = await fetch(url, options);

    // For server errors with retries left, retry the request
    if (!response.ok && response.status >= 500 && retries > 0) {
      console.warn(
        `Request to ${url} failed with status ${response.status}, retrying...`,
      );
      return apiRequest(method, url, data, retries - 1);
    }

    return response;
  } catch (error) {
    // For network errors with retries left, retry the request
    if (retries > 0) {
      console.warn(`Network error for ${url}, retrying...`, error);
      return apiRequest(method, url, data, retries - 1);
    }
    console.error(`Request to ${url} failed:`, error);
    throw error;
  }
}

// Default queryFn for all queries
async function defaultQueryFn({ queryKey }: { queryKey: readonly unknown[] }) {
  const key = queryKey[0] as string;
  
  // Only process API routes
  if (!key.startsWith('/api/')) {
    throw new Error('Query key must be an API route starting with /api/');
  }
  
  const response = await fetch(key, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

// Create a QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});
