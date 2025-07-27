import { neon } from "@neondatabase/serverless";

export default async function (context, req) {
  try {
    // Check if we have the necessary data
    const { name, description } = req.body;

    if (!name || !description) {
      return {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Missing required fields: name and description are required",
        }),
      };
    }

    // Get the database URL from environment variables
    const sql = neon(process.env.DATABASE_URL || "");

    // Insert the item
    const result = await sql`
      INSERT INTO items (name, description)
      VALUES (${name}, ${description})
      RETURNING *
    `;

    // Return the created item
    return {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result[0]),
    };
  } catch (error) {
    // Handle errors
    context.log.error("Database insert error:", error);

    return {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Failed to create item in database",
        error: error.message,
      }),
    };
  }
}
