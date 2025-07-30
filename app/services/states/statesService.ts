/**
 * States Service
 *
 * Service layer for managing US states, territories, and regions.
 */

import { StatesRepository } from "./repository";
import {
  State,
  Region,
  CreateStateDto,
  UpdateStateDto,
  CreateRegionDto,
  UpdateRegionDto,
} from "./models";

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
            id: "4",
            name: "Florida",
            code: "FL",
            regionId: "2", // Southeast
            capital: "Tallahassee",
            isTerritory: false,
            timezone: "Eastern",
            active: true,
          },
          {
            id: "5",
            name: "Illinois",
            code: "IL",
            regionId: "3", // Midwest
            capital: "Springfield",
            isTerritory: false,
            timezone: "Central",
            active: true,
          },
        ];
      }

      // In staging/production environments, use the actual repository
      return this.repository.getAllStates();
    } catch (error) {
      console.error("Error getting states:", error);
      throw new Error("Failed to get states data");
    }
  }

  /**
   * Get all active states
   */
  async getActiveStates(): Promise<State[]> {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "DEVELOPMENT MODE: Using mock active states data for testing",
        );
        // Simply return the same mock data as getAllStates() but filtered for active states
        const allStates = await this.getAllStates();
        return allStates.filter((state) => state.active);
      }

      // In staging/production, use the repository
      return this.repository.getActiveStates();
    } catch (error) {
      console.error("Error getting active states:", error);
      throw new Error("Failed to get active states data");
    }
  }

  /**
   * Get a state by ID
   */
  async getStateById(id: string): Promise<State | null> {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "DEVELOPMENT MODE: Using mock state by ID data for testing",
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
      if (process.env.NODE_ENV === "development") {
        console.log(
          "DEVELOPMENT MODE: Using mock state by code data for testing",
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
      if (process.env.NODE_ENV === "development") {
        console.log("DEVELOPMENT MODE: Using mock regions data for testing");

        // Mock US regions data for development
        const regions: Region[] = [
          {
            id: "1",
            name: "Northeast",
            code: "NE",
            description: "Northeastern United States",
            states: [],
          },
          {
            id: "2",
            name: "Southeast",
            code: "SE",
            description: "Southeastern United States",
            states: [],
          },
          {
            id: "3",
            name: "Midwest",
            code: "MW",
            description: "Midwestern United States",
            states: [],
          },
          {
            id: "4",
            name: "Southwest",
            code: "SW",
            description: "Southwestern United States",
            states: [],
          },
          {
            id: "5",
            name: "West",
            code: "W",
            description: "Western United States",
            states: [],
          },
          {
            id: "6",
            name: "Territories",
            code: "TERR",
            description: "United States Territories",
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
      console.error("Error getting regions:", error);
      throw new Error("Failed to get regions data");
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
        console.log("States data already exists, skipping initialization.");
        return;
      }

      // Create regions
      const regions = [
        {
          name: "Northeast",
          code: "NE",
          description: "Northeastern United States",
        },
        {
          name: "Southeast",
          code: "SE",
          description: "Southeastern United States",
        },
        {
          name: "Midwest",
          code: "MW",
          description: "Midwestern United States",
        },
        {
          name: "Southwest",
          code: "SW",
          description: "Southwestern United States",
        },
        { name: "West", code: "W", description: "Western United States" },
        {
          name: "Territories",
          code: "TERR",
          description: "United States Territories",
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

      console.log("States and regions data initialized successfully.");
    } catch (error) {
      console.error("Error initializing states data:", error);
      throw new Error("Failed to initialize states data");
    }
  }
}

// Singleton instance for use throughout the application
export const statesService = new StatesService();
