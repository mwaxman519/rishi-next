/**
 * Database mock for SQL operations
 */

// Define a simple mock SQL execution engine
export const db = {
  // Mock implementation that simulates SQL execution
  execute: async (sql: any) => {
    console.log(&quot;Executing SQL:&quot;, sql);

    // Generate some dummy response based on the SQL operation
    if (sql.toString().toLowerCase().includes(&quot;select&quot;)) {
      console.log(&quot;Executing SELECT query&quot;);
      return {
        rows: [
          {
            id: &quot;mock-location-1&quot;,
            name: &quot;Location 1&quot;,
            address: &quot;123 Main St&quot;,
            city: &quot;Austin&quot;,
            state: &quot;TX&quot;,
          },
          {
            id: &quot;mock-location-2&quot;,
            name: &quot;Location 2&quot;,
            address: &quot;456 Oak St&quot;,
            city: &quot;Dallas&quot;,
            state: &quot;TX&quot;,
          },
        ],
      };
    } else if (sql.toString().toLowerCase().includes(&quot;insert&quot;)) {
      console.log(&quot;Executing INSERT query&quot;);
      return {
        rows: [
          {
            id: &quot;new-location-&quot; + Date.now(),
            name:
              sql.values.find((v: any) => typeof v === &quot;string&quot;) ||
              &quot;New Location&quot;,
            type: &quot;venue&quot;,
            address1: &quot;123 Main St&quot;,
            city: &quot;Austin&quot;,
            state_id: null,
            zipcode: &quot;78701&quot;,
            status: &quot;pending&quot;,
            geo_lat: 30.2672,
            geo_lng: -97.7431,
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };
    } else if (sql.toString().toLowerCase().includes(&quot;update&quot;)) {
      console.log(&quot;Executing UPDATE query&quot;);
      return {
        rows: [
          { id: &quot;mock-location-1&quot;, name: &quot;Updated Location&quot;, status: &quot;active&quot; },
        ],
      };
    } else if (sql.toString().toLowerCase().includes(&quot;delete&quot;)) {
      console.log(&quot;Executing DELETE query&quot;);
      return {
        rowCount: 1,
      };
    }

    // Default empty response
    return { rows: [] };
  },
};
