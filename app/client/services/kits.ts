/**
 * Kit Management Client Service
 * Client-side adapter for interacting with the kit management API endpoints
 */
import {
  KitTemplateDTO,
  KitDTO,
  ActivityKitDTO,
  CreateKitTemplateParams,
  UpdateKitTemplateParams,
  CreateKitParams,
  UpdateKitParams,
  CreateActivityKitParams,
  UpdateActivityKitParams,
  ApproveKitTemplateParams,
  RejectKitTemplateParams,
  ApproveKitParams,
  RejectKitParams,
} from &quot;@/services/kits&quot;;

class KitsClientService {
  // Base URL for kit API
  private apiUrl = &quot;/api/kits&quot;;

  /**
   * Fetch all kit templates with optional filtering
   */
  async getAllTemplates(
    filters: Record<string, any> = {},
  ): Promise<KitTemplateDTO[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "&quot;;
    const response = await fetch(`${this.apiUrl}/templates${query}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || &quot;Failed to fetch kit templates&quot;);
    }

    return response.json();
  }

  /**
   * Fetch a kit template by ID
   */
  async getTemplateById(id: number): Promise<KitTemplateDTO> {
    const response = await fetch(`${this.apiUrl}/templates/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to fetch kit template with ID ${id}`,
      );
    }

    return response.json();
  }

  /**
   * Create a new kit template
   */
  async createTemplate(data: CreateKitTemplateParams): Promise<KitTemplateDTO> {
    const response = await fetch(`${this.apiUrl}/templates`, {
      method: &quot;POST&quot;,
      headers: {
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || &quot;Failed to create kit template&quot;);
    }

    return response.json();
  }

  /**
   * Update an existing kit template
   */
  async updateTemplate(
    id: number,
    data: UpdateKitTemplateParams,
  ): Promise<KitTemplateDTO> {
    const response = await fetch(`${this.apiUrl}/templates/${id}`, {
      method: &quot;PATCH&quot;,
      headers: {
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to update kit template with ID ${id}`,
      );
    }

    return response.json();
  }

  /**
   * Approve a kit template
   */
  async approveTemplate(
    params: ApproveKitTemplateParams,
  ): Promise<KitTemplateDTO> {
    const { id, notes } = params;
    const response = await fetch(`${this.apiUrl}/templates/${id}/approve`, {
      method: &quot;POST&quot;,
      headers: {
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to approve kit template with ID ${id}`,
      );
    }

    return response.json();
  }

  /**
   * Reject a kit template
   */
  async rejectTemplate(
    params: RejectKitTemplateParams,
  ): Promise<KitTemplateDTO> {
    const { id, reason } = params;
    const response = await fetch(`${this.apiUrl}/templates/${id}/reject`, {
      method: &quot;POST&quot;,
      headers: {
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to reject kit template with ID ${id}`,
      );
    }

    return response.json();
  }

  /**
   * Fetch all kits with optional filtering
   */
  async getAllKits(filters: Record<string, any> = {}): Promise<KitDTO[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const query = queryParams.toString() ? `?${queryParams.toString()}` : &quot;&quot;;
    const response = await fetch(`${this.apiUrl}/instances${query}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || &quot;Failed to fetch kits&quot;);
    }

    return response.json();
  }

  /**
   * Fetch a kit by ID
   */
  async getKitById(id: number): Promise<KitDTO> {
    const response = await fetch(`${this.apiUrl}/instances/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to fetch kit with ID ${id}`);
    }

    return response.json();
  }

  /**
   * Create a new kit
   */
  async createKit(data: CreateKitParams): Promise<KitDTO> {
    const response = await fetch(`${this.apiUrl}/instances`, {
      method: &quot;POST&quot;,
      headers: {
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || &quot;Failed to create kit&quot;);
    }

    return response.json();
  }

  /**
   * Update an existing kit
   */
  async updateKit(id: number, data: UpdateKitParams): Promise<KitDTO> {
    const response = await fetch(`${this.apiUrl}/instances/${id}`, {
      method: &quot;PATCH&quot;,
      headers: {
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update kit with ID ${id}`);
    }

    return response.json();
  }

  /**
   * Approve a kit
   */
  async approveKit(params: ApproveKitParams): Promise<KitDTO> {
    const { id, notes } = params;
    const response = await fetch(`${this.apiUrl}/instances/${id}/approve`, {
      method: &quot;POST&quot;,
      headers: {
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to approve kit with ID ${id}`);
    }

    return response.json();
  }

  /**
   * Reject a kit
   */
  async rejectKit(params: RejectKitParams): Promise<KitDTO> {
    const { id, reason } = params;
    const response = await fetch(`${this.apiUrl}/instances/${id}/reject`, {
      method: &quot;POST&quot;,
      headers: {
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to reject kit with ID ${id}`);
    }

    return response.json();
  }

  /**
   * Fetch all activity kit assignments with optional filtering
   */
  async getActivityKits(
    filters: Record<string, any> = {},
  ): Promise<ActivityKitDTO[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const query = queryParams.toString() ? `?${queryParams.toString()}` : &quot;&quot;;
    const response = await fetch(`${this.apiUrl}/activity-kits${query}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || &quot;Failed to fetch activity kit assignments&quot;,
      );
    }

    return response.json();
  }

  /**
   * Fetch an activity kit assignment by ID
   */
  async getActivityKitById(id: string): Promise<ActivityKitDTO> {
    const response = await fetch(`${this.apiUrl}/activity-kits/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to fetch activity kit with ID ${id}`,
      );
    }

    return response.json();
  }

  /**
   * Create a new activity kit assignment
   */
  async createActivityKit(
    data: CreateActivityKitParams,
  ): Promise<ActivityKitDTO> {
    const response = await fetch(`${this.apiUrl}/activity-kits`, {
      method: &quot;POST&quot;,
      headers: {
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || &quot;Failed to create activity kit assignment&quot;,
      );
    }

    return response.json();
  }

  /**
   * Update an existing activity kit assignment
   */
  async updateActivityKit(
    id: string,
    data: UpdateActivityKitParams,
  ): Promise<ActivityKitDTO> {
    const response = await fetch(`${this.apiUrl}/activity-kits/${id}`, {
      method: &quot;PATCH&quot;,
      headers: {
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to update activity kit with ID ${id}`,
      );
    }

    return response.json();
  }

  /**
   * Delete an activity kit assignment
   */
  async deleteActivityKit(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/activity-kits/${id}`, {
      method: &quot;DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to delete activity kit with ID ${id}`,
      );
    }
  }
}

// Export singleton instance
export const kitsClient = new KitsClientService();
