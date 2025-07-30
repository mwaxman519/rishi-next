/**
 * States Repository
 *
 * Data access layer for US states and territories.
 */

import { sql } from "@vercel/postgres";
import { db } from "../../lib/db";
import { v4 as uuidv4 } from "uuid";
import {
  State,
  Region,
  CreateStateDto,
  UpdateStateDto,
  CreateRegionDto,
  UpdateRegionDto,
} from "./models";

/**
 * Repository for states and regions data
 */
export class StatesRepository {
  /**
   * Get all states
   */
  async getAllStates(): Promise<State[]> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM states ORDER BY name ASC`,
      );

      return result.rows.map(this.mapRowToState);
    } catch (error) {
      console.error("Error fetching states:", error);
      throw new Error("Failed to fetch states");
    }
  }

  /**
   * Get all active states
   */
  async getActiveStates(): Promise<State[]> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM states WHERE active = true ORDER BY name ASC`,
      );

      return result.rows.map(this.mapRowToState);
    } catch (error) {
      console.error("Error fetching active states:", error);
      throw new Error("Failed to fetch active states");
    }
  }

  /**
   * Get a state by ID
   */
  async getStateById(id: string): Promise<State | null> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM states WHERE id = ${id}`,
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToState(result.rows[0]);
    } catch (error) {
      console.error(`Error fetching state with ID ${id}:`, error);
      throw new Error(`Failed to fetch state with ID ${id}`);
    }
  }

  /**
   * Get a state by its code (e.g., 'CA', 'NY')
   */
  async getStateByCode(code: string): Promise<State | null> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM states WHERE code = ${code.toUpperCase()}`,
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToState(result.rows[0]);
    } catch (error) {
      console.error(`Error fetching state with code ${code}:`, error);
      throw new Error(`Failed to fetch state with code ${code}`);
    }
  }

  /**
   * Create a new state
   */
  async createState(stateData: CreateStateDto): Promise<State> {
    try {
      const id = uuidv4();
      const result = await db.execute(
        sql`INSERT INTO states (
          id, name, code, region_id, capital, is_territory, timezone, active
        ) VALUES (
          ${id}, ${stateData.name}, ${stateData.code}, ${stateData.regionId || null},
          ${stateData.capital || null}, ${stateData.isTerritory}, ${stateData.timezone || null}, 
          ${stateData.active}
        ) RETURNING *`,
      );

      return this.mapRowToState(result.rows[0]);
    } catch (error) {
      console.error("Error creating state:", error);
      throw new Error("Failed to create state");
    }
  }

  /**
   * Update a state
   */
  async updateState(
    id: string,
    stateData: UpdateStateDto,
  ): Promise<State | null> {
    try {
      // Build the SET clause for the SQL query
      const updates: string[] = [];
      const values: any[] = [];

      if (stateData.name !== undefined) {
        updates.push(`name = $${values.length + 1}`);
        values.push(stateData.name);
      }

      if (stateData.code !== undefined) {
        updates.push(`code = $${values.length + 1}`);
        values.push(stateData.code);
      }

      if (stateData.regionId !== undefined) {
        updates.push(`region_id = $${values.length + 1}`);
        values.push(stateData.regionId);
      }

      if (stateData.capital !== undefined) {
        updates.push(`capital = $${values.length + 1}`);
        values.push(stateData.capital);
      }

      if (stateData.isTerritory !== undefined) {
        updates.push(`is_territory = $${values.length + 1}`);
        values.push(stateData.isTerritory);
      }

      if (stateData.timezone !== undefined) {
        updates.push(`timezone = $${values.length + 1}`);
        values.push(stateData.timezone);
      }

      if (stateData.active !== undefined) {
        updates.push(`active = $${values.length + 1}`);
        values.push(stateData.active);
      }

      if (updates.length === 0) {
        // No fields to update
        const currentState = await this.getStateById(id);
        return currentState;
      }

      // Add id parameter
      values.push(id);

      const query = `
        UPDATE states 
        SET ${updates.join(", ")}, updated_at = now() 
        WHERE id = $${values.length} 
        RETURNING *
      `;

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToState(result.rows[0]);
    } catch (error) {
      console.error(`Error updating state with ID ${id}:`, error);
      throw new Error(`Failed to update state with ID ${id}`);
    }
  }

  /**
   * Delete a state
   */
  async deleteState(id: string): Promise<boolean> {
    try {
      const result = await db.execute(
        sql`DELETE FROM states WHERE id = ${id} RETURNING id`,
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error deleting state with ID ${id}:`, error);
      throw new Error(`Failed to delete state with ID ${id}`);
    }
  }

  /**
   * Get all regions
   */
  async getAllRegions(): Promise<Region[]> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM regions ORDER BY name ASC`,
      );

      const regions = result.rows.map(this.mapRowToRegion);

      // Get states for each region
      for (const region of regions) {
        const statesResult = await db.execute(
          sql`SELECT * FROM states WHERE region_id = ${region.id} ORDER BY name ASC`,
        );

        region.states = statesResult.rows.map(this.mapRowToState);
      }

      return regions;
    } catch (error) {
      console.error("Error fetching regions:", error);
      throw new Error("Failed to fetch regions");
    }
  }

  /**
   * Get a region by ID
   */
  async getRegionById(id: string): Promise<Region | null> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM regions WHERE id = ${id}`,
      );

      if (result.rows.length === 0) {
        return null;
      }

      const region = this.mapRowToRegion(result.rows[0]);

      // Get states for this region
      const statesResult = await db.execute(
        sql`SELECT * FROM states WHERE region_id = ${id} ORDER BY name ASC`,
      );

      region.states = statesResult.rows.map(this.mapRowToState);

      return region;
    } catch (error) {
      console.error(`Error fetching region with ID ${id}:`, error);
      throw new Error(`Failed to fetch region with ID ${id}`);
    }
  }

  /**
   * Create a new region
   */
  async createRegion(regionData: CreateRegionDto): Promise<Region> {
    try {
      const id = uuidv4();
      const result = await db.execute(
        sql`INSERT INTO regions (
          id, name, code, description
        ) VALUES (
          ${id}, ${regionData.name}, ${regionData.code}, ${regionData.description || null}
        ) RETURNING *`,
      );

      return {
        ...this.mapRowToRegion(result.rows[0]),
        states: [],
      };
    } catch (error) {
      console.error("Error creating region:", error);
      throw new Error("Failed to create region");
    }
  }

  /**
   * Update a region
   */
  async updateRegion(
    id: string,
    regionData: UpdateRegionDto,
  ): Promise<Region | null> {
    try {
      // Build the SET clause for the SQL query
      const updates: string[] = [];
      const values: any[] = [];

      if (regionData.name !== undefined) {
        updates.push(`name = $${values.length + 1}`);
        values.push(regionData.name);
      }

      if (regionData.code !== undefined) {
        updates.push(`code = $${values.length + 1}`);
        values.push(regionData.code);
      }

      if (regionData.description !== undefined) {
        updates.push(`description = $${values.length + 1}`);
        values.push(regionData.description);
      }

      if (updates.length === 0) {
        // No fields to update
        const currentRegion = await this.getRegionById(id);
        return currentRegion;
      }

      // Add id parameter
      values.push(id);

      const query = `
        UPDATE regions 
        SET ${updates.join(", ")}, updated_at = now() 
        WHERE id = $${values.length} 
        RETURNING *
      `;

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      const region = this.mapRowToRegion(result.rows[0]);

      // Get states for this region
      const statesResult = await db.execute(
        sql`SELECT * FROM states WHERE region_id = ${id} ORDER BY name ASC`,
      );

      region.states = statesResult.rows.map(this.mapRowToState);

      return region;
    } catch (error) {
      console.error(`Error updating region with ID ${id}:`, error);
      throw new Error(`Failed to update region with ID ${id}`);
    }
  }

  /**
   * Delete a region
   */
  async deleteRegion(id: string): Promise<boolean> {
    try {
      // First, update any states that reference this region to set region_id to null
      await db.execute(
        sql`UPDATE states SET region_id = NULL WHERE region_id = ${id}`,
      );

      // Then delete the region
      const result = await db.execute(
        sql`DELETE FROM regions WHERE id = ${id} RETURNING id`,
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error deleting region with ID ${id}:`, error);
      throw new Error(`Failed to delete region with ID ${id}`);
    }
  }

  /**
   * Map database row to State model
   */
  private mapRowToState(row: any): State {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      regionId: row.region_id,
      capital: row.capital,
      isTerritory: row.is_territory,
      timezone: row.timezone,
      active: row.active,
    };
  }

  /**
   * Map database row to Region model
   */
  private mapRowToRegion(row: any): Region {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      states: [],
    };
  }
}
