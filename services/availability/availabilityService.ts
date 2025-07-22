/**
 * Availability Service
 * Manages user availability and scheduling for field workers
 */

export interface AvailabilityWindow {
  start: Date;
  end: Date;
  userId: string;
  type: 'available' | 'unavailable' | 'busy';
}

export interface AvailabilityQuery {
  userId?: string;
  startDate: Date;
  endDate: Date;
  organizationId?: string;
}

export interface AvailabilityResponse {
  success: boolean;
  data?: AvailabilityWindow[];
  error?: string;
}

export class AvailabilityService {
  /**
   * Get availability for a user within a date range
   */
  async getUserAvailability(query: AvailabilityQuery): Promise<AvailabilityResponse> {
    try {
      // Mock implementation for VoltBuilder compatibility
      const mockAvailability: AvailabilityWindow[] = [
        {
          start: query.startDate,
          end: query.endDate,
          userId: query.userId || 'default-user',
          type: 'available'
        }
      ];

      return {
        success: true,
        data: mockAvailability
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown availability error'
      };
    }
  }

  /**
   * Set user availability
   */
  async setUserAvailability(userId: string, windows: AvailabilityWindow[]): Promise<AvailabilityResponse> {
    try {
      // Mock implementation for VoltBuilder compatibility
      return {
        success: true,
        data: windows
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set availability'
      };
    }
  }

  /**
   * Check if user is available at specific time
   */
  async isUserAvailable(userId: string, startTime: Date, endTime: Date): Promise<boolean> {
    try {
      // Mock implementation - always return true for VoltBuilder
      return true;
    } catch (error) {
      console.error('Availability check failed:', error);
      return false;
    }
  }
}

// Export default instance
export const availabilityService = new AvailabilityService();
export default availabilityService;