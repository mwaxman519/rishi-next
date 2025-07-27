import { neon } from "@neondatabase/serverless";

export default async function (context, req) {
  try {
    // Get the database URL from environment variables
    const sql = neon(process.env.DATABASE_URL || "");

    // Execute the query
    const items = await sql`
      SELECT * FROM items
      ORDER BY created_at DESC
    `;

    // Return the results
    return {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    };
  } catch (error) {
    // Handle errors
    context.log.error("Database query error:", error);

    return {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Failed to fetch items from database",
        error: error.message,
      }),
    };
  }
}
