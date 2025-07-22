/**
 * Kit Management Repository - SIMPLIFIED for VoltBuilder
 * Using correct schema field names from shared/schema.ts
 */
import { db } from "../../../server/db";
import {
  kitTemplates,
  kits,
  brands,
  users,
  activityKits,
  activities,
} from "../../../shared/schema";
import { eq, and, or, desc, like, asc, sql } from "drizzle-orm";

import {
  KitTemplateDTO,
  KitDTO,
  ActivityKitDTO,
} from "./models";

export class KitRepository {
  async findAllTemplates(): Promise<KitTemplateDTO[]> {
    try {
      const templates = await db
        .select()
        .from(kitTemplates)
        .orderBy(desc(kitTemplates.created_at));

      return templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        organization_id: template.organization_id,
        brand_id: template.brand_id,
        image_url: template.image_url,
        thumbnail_url: template.thumbnail_url,
        image_alt_text: template.image_alt_text,
        active: template.active,
        created_at: template.created_at,
        updated_at: template.updated_at,
      }));
    } catch (error) {
      console.error('Error finding templates:', error);
      throw error;
    }
  }

  async findTemplateById(id: string): Promise<KitTemplateDTO | undefined> {
    try {
      const template = await db
        .select()
        .from(kitTemplates)
        .where(eq(kitTemplates.id, id))
        .limit(1);

      return template[0] ? {
        id: template[0].id,
        name: template[0].name,
        description: template[0].description,
        organization_id: template[0].organization_id,
        brand_id: template[0].brand_id,
        image_url: template[0].image_url,
        thumbnail_url: template[0].thumbnail_url,
        image_alt_text: template[0].image_alt_text,
        active: template[0].active,
        created_at: template[0].created_at,
        updated_at: template[0].updated_at,
      } : undefined;
    } catch (error) {
      console.error('Error finding template by ID:', error);
      throw error;
    }
  }

  async findAllActivityKits(): Promise<ActivityKitDTO[]> {
    try {
      const activityKitsData = await db
        .select()
        .from(activityKits)
        .leftJoin(activities, eq(activityKits.activityId, activities.id))
        .leftJoin(kitTemplates, eq(activityKits.kitTemplateId, kitTemplates.id))
        .leftJoin(kits, eq(activityKits.kitInstanceId, kits.id));

      return activityKitsData.map(row => ({
        id: row.activity_kits.id,
        activityId: row.activity_kits.activityId,
        kitTemplateId: row.activity_kits.kitTemplateId,
        kitInstanceId: row.activity_kits.kitInstanceId,
        assignedToId: row.activity_kits.assignedToId,
        status: row.activity_kits.status,
        assignedAt: row.activity_kits.assignedAt,
        checkedOutAt: row.activity_kits.checkedOutAt,
        checkedInAt: row.activity_kits.checkedInAt,
        notes: row.activity_kits.notes,
        createdAt: row.activity_kits.createdAt,
        updatedAt: row.activity_kits.updatedAt,
      }));
    } catch (error) {
      console.error('Error finding activity kits:', error);
      throw error;
    }
  }
}
