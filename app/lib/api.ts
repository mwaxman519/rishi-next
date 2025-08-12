/**
 * Central API configuration and helper functions
 * Provides consistent API base URL and fetch utilities
 */

// API Base URL - defaults to local development server
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

/**
 * Enhanced fetch wrapper with API base URL and credentials
 * @param path - API endpoint path (e.g., '/api/users')
 * @param init - Standard fetch RequestInit options
 * @returns Promise<Response>
 */
export const apiFetch = (path: string, init?: RequestInit) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return fetch(`${API_BASE}${normalizedPath}`, {
    ...init,
    credentials: 'include', // Always include credentials for auth
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
};

/**
 * JSON API helper - automatically parses JSON responses
 * @param path - API endpoint path
 * @param init - Standard fetch RequestInit options
 * @returns Promise<T> - Parsed JSON response
 */
export async function apiJSON<T = any>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  
  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error (${response.status}): ${error}`);
  }
  
  return response.json();
}

/**
 * Helper to construct API URLs for non-fetch use cases
 * @param path - API endpoint path
 * @returns Full API URL
 */
export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};