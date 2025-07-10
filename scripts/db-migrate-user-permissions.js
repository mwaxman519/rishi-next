import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });
const { Pool } = pg;

// Create a new PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Starting user_permissions table migration...");

    // Begin transaction
    await client.query("BEGIN");

    // Check if the table already exists
    const checkTableSql = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'user_permissions'
      )
    `;

    const tableExists = (await client.query(checkTableSql)).rows[0].exists;

    if (tableExists) {
      console.log("user_permissions table already exists, skipping creation");
    } else {
      // Create the user_permissions table
      const createTableSql = `
        CREATE TABLE user_permissions (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id),
          permission TEXT NOT NULL,
          granted BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;

      await client.query(createTableSql);
      console.log("user_permissions table created successfully");

      // Create index on user_id and permission for faster lookups
      const createIndexSql = `
        CREATE INDEX idx_user_permission ON user_permissions(user_id, permission)
      `;

      await client.query(createIndexSql);
      console.log("Index created on user_id and permission columns");
    }

    // Create function to check for permissions
    const createFunctionSql = `
      CREATE OR REPLACE FUNCTION check_user_permission(p_user_id UUID, p_permission TEXT)
      RETURNS BOOLEAN AS $$
      DECLARE
        v_granted BOOLEAN;
        v_role TEXT;
      BEGIN
        -- First check for custom permission override
        SELECT granted INTO v_granted
        FROM user_permissions
        WHERE user_id = p_user_id AND permission = p_permission;
        
        -- If a custom permission was found, return it
        IF FOUND THEN
          RETURN v_granted;
        END IF;
        
        -- Otherwise, use the role-based default (stub for now)
        -- In a real implementation, this would check the role's permissions
        SELECT role INTO v_role FROM users WHERE id = p_user_id;
        
        -- Default permissions logic would go here
        -- For now, just return false as a placeholder
        RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await client.query(createFunctionSql);
    console.log("check_user_permission function created or replaced");

    // Commit the transaction
    await client.query("COMMIT");
    console.log("Migration completed successfully");
  } catch (err) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    throw err;
  } finally {
    // Release the client back to the pool
    client.release();
    await pool.end();
  }
}

// Run the migration
migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
