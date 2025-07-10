import { db } from "../app/lib/db";
import { users } from "../shared/schema";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";

/**
 * This script migrates the database to use UUIDs for user IDs
 */
async function migrateToUUID() {
  console.log("Starting database migration to UUID user IDs...");

  try {
    // 1. Create a backup of existing users
    console.log("Fetching existing users...");
    const existingUsers = await db.select().from(users);
    console.log(`Found ${existingUsers.length} users to migrate`);

    if (existingUsers.length === 0) {
      console.log("No users found, nothing to migrate");
      return;
    }

    // 2. Create a mapping of old numeric IDs to new UUIDs
    const idMapping = existingUsers.map((user) => ({
      oldId: user.id,
      newId: uuidv4(),
      userData: { ...user },
    }));

    console.log(
      "ID mapping created:",
      idMapping.map((m) => ({ oldId: m.oldId, newId: m.newId })),
    );

    // 3. Backup users to JSON file
    console.log("Creating backup of users...");
    await fs.writeFile(
      "./user-backup.json",
      JSON.stringify({ users: existingUsers, idMapping }, null, 2),
    );
    console.log("Backup created at ./user-backup.json");

    // 4. Generate SQL for conversion
    console.log("Generating SQL migration steps...");

    let migrationSQL = `
-- Migration SQL for converting user IDs from serial to UUID
-- Generated: ${new Date().toISOString()}

-- 1. First, create a backup table
CREATE TABLE users_backup AS SELECT * FROM users;

-- 2. Create a new UUID column
ALTER TABLE users ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();

-- 3. Update the mapping for existing users
`;

    // Add UPDATE statements for each user
    idMapping.forEach((mapping) => {
      migrationSQL += `UPDATE users SET uuid_id = '${mapping.newId}' WHERE id = ${mapping.oldId};\n`;
    });

    migrationSQL += `
-- 4. Drop primary key constraint and rename columns
ALTER TABLE users DROP CONSTRAINT users_pkey;
ALTER TABLE users DROP COLUMN id;
ALTER TABLE users RENAME COLUMN uuid_id TO id;
ALTER TABLE users ADD PRIMARY KEY (id);

-- 5. Update foreign key references
-- The following tables have foreign keys to users.id:
-- account_manager_assignments (user_id)
-- availability_blocks (user_id)
-- certifications (verified_by)
-- employees (user_id)
-- facilities (manager_id)
-- organization_users (user_id)
-- organizations (primary_contact_id)
-- shifts (created_by)
-- time_entries (approved_by)
-- user_region_assignments (user_id)

-- Update account_manager_assignments
ALTER TABLE account_manager_assignments DROP CONSTRAINT account_manager_assignments_user_id_fkey;
ALTER TABLE account_manager_assignments ADD COLUMN uuid_user_id UUID;
`;

    // Add UPDATE statements for account_manager_assignments
    idMapping.forEach((mapping) => {
      migrationSQL += `UPDATE account_manager_assignments SET uuid_user_id = '${mapping.newId}' WHERE user_id = ${mapping.oldId};\n`;
    });

    migrationSQL += `
ALTER TABLE account_manager_assignments DROP COLUMN user_id;
ALTER TABLE account_manager_assignments RENAME COLUMN uuid_user_id TO user_id;
ALTER TABLE account_manager_assignments ADD CONSTRAINT account_manager_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Update availability_blocks
ALTER TABLE availability_blocks DROP CONSTRAINT availability_blocks_user_id_fkey;
ALTER TABLE availability_blocks ADD COLUMN uuid_user_id UUID;
`;

    // Add UPDATE statements for availability_blocks
    idMapping.forEach((mapping) => {
      migrationSQL += `UPDATE availability_blocks SET uuid_user_id = '${mapping.newId}' WHERE user_id = ${mapping.oldId};\n`;
    });

    migrationSQL += `
ALTER TABLE availability_blocks DROP COLUMN user_id;
ALTER TABLE availability_blocks RENAME COLUMN uuid_user_id TO user_id;
ALTER TABLE availability_blocks ADD CONSTRAINT availability_blocks_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Update certifications (verified_by)
ALTER TABLE certifications DROP CONSTRAINT certifications_verified_by_fkey;
ALTER TABLE certifications ADD COLUMN uuid_verified_by UUID;
`;

    // Add UPDATE statements for certifications
    idMapping.forEach((mapping) => {
      migrationSQL += `UPDATE certifications SET uuid_verified_by = '${mapping.newId}' WHERE verified_by = ${mapping.oldId};\n`;
    });

    migrationSQL += `
ALTER TABLE certifications DROP COLUMN verified_by;
ALTER TABLE certifications RENAME COLUMN uuid_verified_by TO verified_by;
ALTER TABLE certifications ADD CONSTRAINT certifications_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES users(id);

-- Update employees (user_id)
ALTER TABLE employees DROP CONSTRAINT employees_user_id_fkey;
ALTER TABLE employees ADD COLUMN uuid_user_id UUID;
`;

    // Add UPDATE statements for employees
    idMapping.forEach((mapping) => {
      migrationSQL += `UPDATE employees SET uuid_user_id = '${mapping.newId}' WHERE user_id = ${mapping.oldId};\n`;
    });

    migrationSQL += `
ALTER TABLE employees DROP COLUMN user_id;
ALTER TABLE employees RENAME COLUMN uuid_user_id TO user_id;
ALTER TABLE employees ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Update facilities (manager_id)
ALTER TABLE facilities DROP CONSTRAINT facilities_manager_id_fkey;
ALTER TABLE facilities ADD COLUMN uuid_manager_id UUID;
`;

    // Add UPDATE statements for facilities
    idMapping.forEach((mapping) => {
      migrationSQL += `UPDATE facilities SET uuid_manager_id = '${mapping.newId}' WHERE manager_id = ${mapping.oldId};\n`;
    });

    migrationSQL += `
ALTER TABLE facilities DROP COLUMN manager_id;
ALTER TABLE facilities RENAME COLUMN uuid_manager_id TO manager_id;
ALTER TABLE facilities ADD CONSTRAINT facilities_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES users(id);

-- Update organization_users (user_id)
ALTER TABLE organization_users DROP CONSTRAINT organization_users_user_id_fkey;
ALTER TABLE organization_users ADD COLUMN uuid_user_id UUID;
`;

    // Add UPDATE statements for organization_users
    idMapping.forEach((mapping) => {
      migrationSQL += `UPDATE organization_users SET uuid_user_id = '${mapping.newId}' WHERE user_id = ${mapping.oldId};\n`;
    });

    migrationSQL += `
ALTER TABLE organization_users DROP COLUMN user_id;
ALTER TABLE organization_users RENAME COLUMN uuid_user_id TO user_id;
ALTER TABLE organization_users ADD CONSTRAINT organization_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Update organizations (primary_contact_id)
ALTER TABLE organizations DROP CONSTRAINT organizations_primary_contact_id_fkey;
ALTER TABLE organizations ADD COLUMN uuid_primary_contact_id UUID;
`;

    // Add UPDATE statements for organizations
    idMapping.forEach((mapping) => {
      migrationSQL += `UPDATE organizations SET uuid_primary_contact_id = '${mapping.newId}' WHERE primary_contact_id = ${mapping.oldId};\n`;
    });

    migrationSQL += `
ALTER TABLE organizations DROP COLUMN primary_contact_id;
ALTER TABLE organizations RENAME COLUMN uuid_primary_contact_id TO primary_contact_id;
ALTER TABLE organizations ADD CONSTRAINT organizations_primary_contact_id_fkey FOREIGN KEY (primary_contact_id) REFERENCES users(id);

-- Update shifts (created_by)
ALTER TABLE shifts DROP CONSTRAINT shifts_created_by_fkey;
ALTER TABLE shifts ADD COLUMN uuid_created_by UUID;
`;

    // Add UPDATE statements for shifts
    idMapping.forEach((mapping) => {
      migrationSQL += `UPDATE shifts SET uuid_created_by = '${mapping.newId}' WHERE created_by = ${mapping.oldId};\n`;
    });

    migrationSQL += `
ALTER TABLE shifts DROP COLUMN created_by;
ALTER TABLE shifts RENAME COLUMN uuid_created_by TO created_by;
ALTER TABLE shifts ADD CONSTRAINT shifts_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);

-- Update time_entries (approved_by)
ALTER TABLE time_entries DROP CONSTRAINT time_entries_approved_by_fkey;
ALTER TABLE time_entries ADD COLUMN uuid_approved_by UUID;
`;

    // Add UPDATE statements for time_entries
    idMapping.forEach((mapping) => {
      migrationSQL += `UPDATE time_entries SET uuid_approved_by = '${mapping.newId}' WHERE approved_by = ${mapping.oldId};\n`;
    });

    migrationSQL += `
ALTER TABLE time_entries DROP COLUMN approved_by;
ALTER TABLE time_entries RENAME COLUMN uuid_approved_by TO approved_by;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id);

-- Update user_region_assignments (user_id)
ALTER TABLE user_region_assignments DROP CONSTRAINT user_region_assignments_user_id_fkey;
ALTER TABLE user_region_assignments ADD COLUMN uuid_user_id UUID;
`;

    // Add UPDATE statements for user_region_assignments
    idMapping.forEach((mapping) => {
      migrationSQL += `UPDATE user_region_assignments SET uuid_user_id = '${mapping.newId}' WHERE user_id = ${mapping.oldId};\n`;
    });

    migrationSQL += `
ALTER TABLE user_region_assignments DROP COLUMN user_id;
ALTER TABLE user_region_assignments RENAME COLUMN uuid_user_id TO user_id;
ALTER TABLE user_region_assignments ADD CONSTRAINT user_region_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
`;

    // Write the SQL file
    await fs.writeFile("./user-uuid-migration.sql", migrationSQL);
    console.log("Migration SQL generated at ./user-uuid-migration.sql");

    console.log(
      "Migration script completed. Review generated SQL before executing!",
    );
    console.log("To complete migration:");
    console.log("1. Backup your database");
    console.log("2. Execute the SQL migration script or push schema changes");
    console.log("3. Test that the application works with the new UUID IDs");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    console.log("Migration script completed");
  }
}

migrateToUUID()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
