/**
 * Production Availability Service - Client-side only
 * Connects to Vercel serverless backend via API calls
 */

import { apiClient } from '../../lib/api-client';

export class AvailabilityService {
  async checkAvailability(userId: string, date: string) {
    return apiClient.get(`/api/availability/check?userId=${userId}&date=${date}`);
  }

  async getStaffAvailability(organizationId: string) {
    return apiClient.get(`/api/availability/staff?organizationId=${organizationId}`);
  }

  async updateAvailability(userId: string, availability: any) {
    return apiClient.put(`/api/availability/${userId}`, availability);
  }

  async getSchedule(userId: string, startDate: string, endDate: string) {
    return apiClient.get(`/api/schedule?userId=${userId}&start=${startDate}&end=${endDate}`);
  }

  async createAvailabilityWindow(data: any) {
    return apiClient.post('/api/availability/windows', data);
  }
}

export const availabilityService = new AvailabilityService();