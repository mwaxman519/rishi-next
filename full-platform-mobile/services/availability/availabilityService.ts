// Availability Service for VoltBuilder compatibility
export class AvailabilityService {
  async getAvailability(params: any) {
    return {
      success: true,
      data: [],
      message: "Availability service placeholder for mobile build"
    };
  }

  async updateAvailability(id: string, data: any) {
    return {
      success: true,
      data: { id, ...data },
      message: "Availability updated"
    };
  }

  async createAvailability(data: any) {
    return {
      success: true,
      data: { id: "mobile-availability", ...data },
      message: "Availability created"
    };
  }
}

export const availabilityService = new AvailabilityService();
export default availabilityService;