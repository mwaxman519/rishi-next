/**
 * Static Auth Client for Production Mobile Build
 * Connects to Vercel serverless auth endpoints
 */

import { apiClient } from './api-client';

export class StaticAuthClient {
  async login(credentials: { username: string; password: string }) {
    return apiClient.post('/api/auth/login', credentials);
  }

  async logout() {
    return apiClient.post('/api/auth/logout');
  }

  async getSession() {
    return apiClient.get('/api/auth/session');
  }

  async checkPermission(permission: string, organizationId?: string) {
    const params = new URLSearchParams({ permission });
    if (organizationId) params.append('organizationId', organizationId);
    
    return apiClient.get(`/api/auth/check-permission?${params}`);
  }

  async getCurrentUser() {
    return apiClient.get('/api/auth/user');
  }
}

export const authClient = new StaticAuthClient();