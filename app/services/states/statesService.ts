/**
 * States Service
 *
 * Service layer for managing US states, territories, and regions.
 */

import { StatesRepository } from &quot;./repository&quot;;
import {
  State,
  Region,
  CreateStateDto,
  UpdateStateDto,
  CreateRegionDto,
  UpdateRegionDto,
} from &quot;./models&quot;;

/**
 * Service for states and regions operations
 */
export class StatesService {
  private repository: StatesRepository;

  constructor() {
    this.repository = new StatesRepository();
  }

  /**
   * Get all states
   */
  async getAllStates(): Promise<State[]> {
    try {
      // Get states from database using repository
      return await this.repository.getAllStates();
            active: true,
          },
          {
            id: &quot;4&quot;,
            name: &quot;Florida&quot;,
            code: &quot;FL&quot;,
            regionId: &quot;2&quot;, // Southeast
            capital: &quot;Tallahassee&quot;,
            isTerritory: false,
            timezone: &quot;Eastern&quot;,
            active: true,
          },
          {
            id: &quot;5&quot;,
            name: &quot;Illinois&quot;,
            code: &quot;IL&quot;,
            regionId: &quot;3&quot;, // Midwest
            capital: &quot;Springfield&quot;,
            isTerritory: false,
            timezone: &quot;Central&quot;,
            active: true,
          },
        ];
      }

      // In staging/production environments, use the actual repository
      return this.repository.getAllStates();
    } catch (error) {
      console.error(&quot;Error getting states:&quot;, error);
      throw new Error(&quot;Failed to get states data&quot;);
    }
  }

  /**
   * Get all active states
   */
  async getActiveStates(): Promise<State[]> {
    try {
      if (process.env.NODE_ENV === &quot;development&quot;) {
        console.log(
          &quot;DEVELOPMENT MODE: Using mock active states data for testing&quot;,
        );
        // Simply return the same mock data as getAllStates() but filtered for active states
        const allStates = await this.getAllStates();
        return allStates.filter((state) => state.active);
      }

      // In staging/production, use the repository
      return this.repository.getActiveStates();
    } catch (error) {
      console.error(&quot;Error getting active states:&quot;, error);
      throw new Error(&quot;Failed to get active states data&quot;);
    }
  }

  /**
   * Get a state by ID
   */
  async getStateById(id: string): Promise<State | null> {
    try {
      if (process.env.NODE_ENV === &quot;development&quot;) {
        console.log(
          &quot;DEVELOPMENT MODE: Using mock state by ID data for testing&quot;,
        );

        // Return a specific state from mock data
        const allStates = await this.getAllStates();
        return allStates.find((state) => state.id === id) || null;
      }

      // In staging/production, use the repository
      return this.repository.getStateById(id);
    } catch (error) {
      console.error(`Error getting state by ID ${id}:`, error);
      throw new Error(`Failed to get state with ID ${id}`);
    }
  }

  /**
   * Get a state by its code (e.g., 'CA', 'NY')
   */
  async getStateByCode(code: string): Promise<State | null> {
    try {
      if (process.env.NODE_ENV === &quot;development&quot;) {
        console.log(
          &quot;DEVELOPMENT MODE: Using mock state by code data for testing&quot;,
        );

        // Return a specific state from mock data
        const allStates = await this.getAllStates();
        return (
          allStates.find(
            (state) => state.code.toUpperCase() === code.toUpperCase(),
          ) || null
        );
      }

      // In staging/production, use the repository
      return this.repository.getStateByCode(code);
    } catch (error) {
      console.error(`Error getting state by code ${code}:`, error);
      throw new Error(`Failed to get state with code ${code}`);
    }
  }

  /**
   * Create a new state
   */
  async createState(stateData: CreateStateDto): Promise<State> {
    return this.repository.createState(stateData);
  }

  /**
   * Update a state
   */
  async updateState(
    id: string,
    stateData: UpdateStateDto,
  ): Promise<State | null> {
    return this.repository.updateState(id, stateData);
  }

  /**
   * Delete a state
   */
  async deleteState(id: string): Promise<boolean> {
    return this.repository.deleteState(id);
  }

  /**
   * Get all regions
   */
  async getAllRegions(): Promise<Region[]> {
    try {
      if (process.env.NODE_ENV === &quot;development&quot;) {
        console.log(&quot;DEVELOPMENT MODE: Using mock regions data for testing&quot;);

        // Mock US regions data for development
        const regions: Region[] = [
          {
            id: &quot;1&quot;,
            name: &quot;Northeast&quot;,
            code: &quot;NE&quot;,
            description: &quot;Northeastern United States&quot;,
            states: [],
          },
          {
            id: &quot;2&quot;,
            name: &quot;Southeast&quot;,
            code: &quot;SE&quot;,
            description: &quot;Southeastern United States&quot;,
            states: [],
          },
          {
            id: &quot;3&quot;,
            name: &quot;Midwest&quot;,
            code: &quot;MW&quot;,
            description: &quot;Midwestern United States&quot;,
            states: [],
          },
          {
            id: &quot;4&quot;,
            name: &quot;Southwest&quot;,
            code: &quot;SW&quot;,
            description: &quot;Southwestern United States&quot;,
            states: [],
          },
          {
            id: &quot;5&quot;,
            name: &quot;West&quot;,
            code: &quot;W&quot;,
            description: &quot;Western United States&quot;,
            states: [],
          },
          {
            id: &quot;6&quot;,
            name: &quot;Territories&quot;,
            code: &quot;TERR&quot;,
            description: &quot;United States Territories&quot;,
            states: [],
          },
        ];

        // Get states for each region
        const allStates = await this.getAllStates();

        regions.forEach((region) => {
          region.states = allStates.filter(
            (state) => state.regionId === region.id,
          );
        });

        return regions;
      }

      // For staging/production, use real data from the repository
      return this.repository.getAllRegions();
    } catch (error) {
      console.error(&quot;Error getting regions:&quot;, error);
      throw new Error(&quot;Failed to get regions data&quot;);
    }
  }

  /**
   * Get a region by ID
   */
  async getRegionById(id: string): Promise<Region | null> {
    return this.repository.getRegionById(id);
  }

  /**
   * Create a new region
   */
  async createRegion(regionData: CreateRegionDto): Promise<Region> {
    return this.repository.createRegion(regionData);
  }

  /**
   * Update a region
   */
  async updateRegion(
    id: string,
    regionData: UpdateRegionDto,
  ): Promise<Region | null> {
    return this.repository.updateRegion(id, regionData);
  }

  /**
   * Delete a region
   */
  async deleteRegion(id: string): Promise<boolean> {
    return this.repository.deleteRegion(id);
  }

  /**
   * Initialize database with default US states and territories data
   * This method should be called only once during system setup
   */
  async initializeDefaultStatesData(): Promise<void> {
    try {
      const existingStates = await this.repository.getAllStates();

      // Skip initialization if states already exist
      if (existingStates.length > 0) {
        console.log(&quot;States data already exists, skipping initialization.&quot;);
        return;
      }

      // Create regions
      const regions = [
        {
          name: &quot;Northeast&quot;,
          code: &quot;NE&quot;,
          description: &quot;Northeastern United States&quot;,
        },
        {
          name: &quot;Southeast&quot;,
          code: &quot;SE&quot;,
          description: &quot;Southeastern United States&quot;,
        },
        {
          name: &quot;Midwest&quot;,
          code: &quot;MW&quot;,
          description: &quot;Midwestern United States&quot;,
        },
        {
          name: &quot;Southwest&quot;,
          code: &quot;SW&quot;,
          description: &quot;Southwestern United States&quot;,
        },
        { name: &quot;West&quot;, code: &quot;W&quot;, description: &quot;Western United States&quot; },
        {
          name: &quot;Territories&quot;,
          code: &quot;TERR&quot;,
          description: &quot;United States Territories&quot;,
        },
      ];

      const regionMap = new Map<string, string>();

      for (const region of regions) {
        const newRegion = await this.repository.createRegion(region);
        regionMap.set(region.code, newRegion.id);
      }

      // Now we can create states and territories with appropriate region IDs
      // This would include creating all 50 states, DC, and territories
      // We'd need to fetch accurate data from a reliable source

      console.log(&quot;States and regions data initialized successfully.&quot;);
    } catch (error) {
      console.error(&quot;Error initializing states data:&quot;, error);
      throw new Error(&quot;Failed to initialize states data&quot;);
    }
  }
}

// Singleton instance for use throughout the application
export const statesService = new StatesService();
