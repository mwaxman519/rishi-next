/**
 * Database mock for SQL operations
 */

// Define a simple mock SQL execution engine
export const db = {
  // Mock implementation that simulates SQL execution
  execute: async (sql: any) => {
    console.log("Executing SQL:", sql);

    // Generate some dummy response based on the SQL operation
    if (sql.toString().toLowerCase().includes("select")) {
      console.log("Executing SELECT query");
      return {
        rows: [
          {
            id: "mock-location-1",
            name: "Location 1",
            address: "123 Main St",
            city: "Austin",
            state: "TX",
          },
          {
            id: "mock-location-2",
            name: "Location 2",
            address: "456 Oak St",
            city: "Dallas",
            state: "TX",
          },
        ],
      };
    } else if (sql.toString().toLowerCase().includes("insert")) {
      console.log("Executing INSERT query");
      return {
        rows: [
          {
            id: "new-location-" + Date.now(),
            name:
              sql.values.find((v: any) => typeof v === "string") ||
              "New Location",
            type: "venue",
            address1: "123 Main St",
            city: "Austin",
            state_id: null,
            zipcode: "78701",
            status: "pending",
            geo_lat: 30.2672,
            geo_lng: -97.7431,
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };
    } else if (sql.toString().toLowerCase().includes("update")) {
      console.log("Executing UPDATE query");
      return {
        rows: [
          { id: "mock-location-1", name: "Updated Location", status: "active" },
        ],
      };
    } else if (sql.toString().toLowerCase().includes("delete")) {
      console.log("Executing DELETE query");
      return {
        rowCount: 1,
      };
    }

    // Default empty response
    return { rows: [] };
  },
};
