import { KitDTO, KitTemplateDTO } from "./types";
import { KitRepository } from "./repository";

/**
 * Kit Service - Business logic layer for kit management
 */
export class KitService {
  constructor(private repository: KitRepository) {}

  /**
   * Find all kits with optional filters
   */
  async findAllKits(filters?: Record<string, any>): Promise<KitDTO[]> {
    return this.repository.findAllKits(filters);
  }

  /**
   * Find kit by ID
   */
  async findKitById(id: string): Promise<KitDTO | null> {
    return this.repository.findKitById(id);
  }

  /**
   * Create a new kit instance
   */
  async createKit(data: Partial<KitDTO>): Promise<KitDTO> {
    return this.repository.createKit(data);
  }

  /**
   * Update an existing kit
   */
  async updateKit(id: string, data: Partial<KitDTO>): Promise<KitDTO> {
    return this.repository.updateKit(id, data);
  }

  /**
   * Delete a kit
   */
  async deleteKit(id: string): Promise<void> {
    return this.repository.deleteKit(id);
  }

  /**
   * Find all kit templates with optional filters
   */
  async findAllTemplates(filters?: Record<string, any>): Promise<KitTemplateDTO[]> {
    return this.repository.findAllTemplates(filters);
  }

  /**
   * Find kit template by ID
   */
  async findTemplateById(id: string): Promise<KitTemplateDTO | null> {
    return this.repository.findTemplateById(id);
  }

  /**
   * Create a new kit template
   */
  async createTemplate(data: Partial<KitTemplateDTO>): Promise<KitTemplateDTO> {
    return this.repository.createTemplate(data);
  }

  /**
   * Update an existing kit template
   */
  async updateTemplate(id: string, data: Partial<KitTemplateDTO>): Promise<KitTemplateDTO> {
    return this.repository.updateTemplate(id, data);
  }

  /**
   * Delete a kit template
   */
  async deleteTemplate(id: string): Promise<void> {
    return this.repository.deleteTemplate(id);
  }

  /**
   * Find all components for a kit
   */
  async findKitComponents(kitId: string): Promise<any[]> {
    return this.repository.findKitComponents(kitId);
  }

  /**
   * Add component to a kit
   */
  async addKitComponent(kitId: string, data: any): Promise<any> {
    return this.repository.addKitComponent(kitId, data);
  }

  /**
   * Update kit component
   */
  async updateKitComponent(id: string, data: any): Promise<any> {
    return this.repository.updateKitComponent(id, data);
  }

  /**
   * Remove component from kit
   */
  async removeKitComponent(id: string): Promise<void> {
    return this.repository.removeKitComponent(id);
  }

  /**
   * Update kit stock levels
   */
  async updateStockLevel(kitId: string, quantity: number): Promise<void> {
    const kit = await this.repository.findKitById(kitId);
    if (!kit) {
      throw new Error("Kit not found");
    }

    await this.repository.updateKit(kitId, {
      current_stock: quantity,
      updated_at: new Date(),
    });
  }

  /**
   * Request kit approval
   */
  async requestApproval(kitId: string, requestedById: string): Promise<KitDTO> {
    return this.repository.updateKit(kitId, {
      status: "pending_approval",
      requested_by_id: requestedById,
      requested_at: new Date(),
    });
  }

  /**
   * Approve kit
   */
  async approveKit(kitId: string, approvedById: string): Promise<KitDTO> {
    return this.repository.updateKit(kitId, {
      status: "active",
      approved_by_id: approvedById,
      approved_at: new Date(),
    });
  }

  /**
   * Reject kit
   */
  async rejectKit(kitId: string, rejectedById: string, reason?: string): Promise<KitDTO> {
    return this.repository.updateKit(kitId, {
      status: "inactive",
      approved_by_id: rejectedById,
      approved_at: new Date(),
      notes: reason,
    });
  }
}