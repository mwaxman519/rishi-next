// Kit Management Types
export interface KitTemplateDTO {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  components: ComponentType[];
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface KitDTO {
  id: string;
  templateId: string;
  template?: KitTemplateDTO;
  serialNumber?: string;
  currentLocationId?: string;
  assignedToActivityId?: string;
  status: "available" | "assigned" | "in_use" | "maintenance" | "retired";
  condition: "excellent" | "good" | "fair" | "poor";
  lastInspection?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
}

export interface ComponentType {
  id: string;
  name: string;
  type: string;
  quantity: number;
  required: boolean;
  specifications?: Record<string, any>;
}

export interface CreateKitInstanceRequest {
  name: string;
  description?: string;
  templateId: number;
  brandRegionId: number;
  notes?: string;
}

export interface KitInventoryItem {
  id: string;
  kitId: string;
  componentName: string;
  componentType?: string;
  quantity: number;
  condition: string;
  serialNumbers?: string[];
  lastChecked?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
