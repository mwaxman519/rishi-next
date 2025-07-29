/**
 * States Service Models
 *
 * These models represent the entities and data transfer objects
 * related to US states and territories.
 */

import { z } from "zod";

/**
 * State/Territory entity model
 */
export interface State {
  id: string;
  name: string;
  code: string;
  regionId?: string;
  capital?: string;
  isTerritory: boolean;
  timezone?: string;
  active: boolean;
}

/**
 * Region entity model
 */
export interface Region {
  id: string;
  name: string;
  code: string;
  description?: string;
  states: State[];
}

/**
 * State creation DTO schema
 */
export const createStateSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().length(2).toUpperCase(),
  regionId: z.string().uuid().optional(),
  capital: z.string().optional(),
  isTerritory: z.boolean().default(false),
  timezone: z.string().optional(),
  active: z.boolean().default(true),
});

export type CreateStateDto = z.infer<typeof createStateSchema>;

/**
 * State update DTO schema
 */
export const updateStateSchema = createStateSchema.partial();

export type UpdateStateDto = z.infer<typeof updateStateSchema>;

/**
 * Region creation DTO schema
 */
export const createRegionSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(10).toUpperCase(),
  description: z.string().optional(),
});

export type CreateRegionDto = z.infer<typeof createRegionSchema>;

/**
 * Region update DTO schema
 */
export const updateRegionSchema = createRegionSchema.partial();

export type UpdateRegionDto = z.infer<typeof updateRegionSchema>;
