// API configuration for mobile app
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://rishi-platform.vercel.app';

export const createApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Mobile-specific API client
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(createApiUrl(endpoint), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(createApiUrl(endpoint), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  put: async (endpoint: string, data: any) => {
    const response = await fetch(createApiUrl(endpoint), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (endpoint: string) => {
    const response = await fetch(createApiUrl(endpoint), {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};
