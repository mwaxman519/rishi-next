/**
 * Production Health Monitor - Client-side connectivity checker
 */

import { apiClient } from '../lib/api-client';

export class HealthMonitorService {
  async checkServerHealth() {
    try {
      return await apiClient.get('/api/health');
    } catch (error) {
      console.warn('Server health check failed:', error);
      return { status: 'offline', error: error.message };
    }
  }

  async checkDatabaseConnection() {
    try {
      return await apiClient.get('/api/health/database');
    } catch (error) {
      console.warn('Database health check failed:', error);
      return { status: 'offline', error: error.message };
    }
  }

  getClientInfo() {
    return {
      buildType: 'mobile-static',
      backend: 'vercel-serverless',
      timestamp: new Date().toISOString(),
    };
  }
}

export const healthMonitorService = new HealthMonitorService();