import pg from "pg";
import crypto from "crypto";
import { promisify } from "util";
import { randomUUID } from "crypto";

const { Client } = pg;
const { scrypt, randomBytes } = crypto;

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function addSuperAdmins() {
  try {
    // Connect to the database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    console.log("Connected to the database");

    // Create super admin users (Mike, Matt and Ryan)
    const superAdmins = [
      {
        username: "mike",
        password: "wrench519",
        email: "mike@rishi.com",
        full_name: "Mike Waxman",
      },
      {
        username: "matt",
        password: "password",
        email: "matt@rishi.example",
        full_name: "Matt Admin",
      },
      {
        username: "ryan",
        password: "password",
        email: "ryan@rishi.example",
        full_name: "Ryan Admin",
      },
    ];

    for (const admin of superAdmins) {
      // Check if user already exists
      const userCheck = await client.query(
        "SELECT * FROM users WHERE username = $1",
        [admin.username],
      );

      if (userCheck.rows.length === 0) {
        const hashedPassword = await hashPassword(admin.password);
        const userId = randomUUID();

        // Insert the new user with a UUID
        await client.query(
          `
          INSERT INTO users (id, username, password, email, full_name, role, active)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            userId,
            admin.username,
            hashedPassword,
            admin.email,
            admin.full_name,
            "super_admin",
            true,
          ],
        );

        console.log(
          `Super admin user ${admin.username} created successfully with ID: ${userId}`,
        );
      } else {
        console.log(
          `Super admin user ${admin.username} already exists, updating role and password...`,
        );

        const hashedPassword = await hashPassword(admin.password);

        await client.query(
          `
          UPDATE users
          SET password = $1, email = $2, full_name = $3, role = 'super_admin', active = true
          WHERE username = $4
        `,
          [hashedPassword, admin.email, admin.full_name, admin.username],
        );

        console.log(`Super admin user ${admin.username} updated successfully`);
      }
    }

    // Add the new super admins to all organizations
    console.log("Connecting super admins to all organizations...");
    const organizations = await client.query("SELECT id FROM organizations");

    if (organizations.rows.length > 0) {
      // Get user IDs for Matt and Ryan
      const mattUser = await client.query(
        "SELECT id FROM users WHERE username = $1",
        ["matt"],
      );
      const ryanUser = await client.query(
        "SELECT id FROM users WHERE username = $1",
        ["ryan"],
      );

      if (mattUser.rows.length > 0 && ryanUser.rows.length > 0) {
        const mattId = mattUser.rows[0].id;
        const ryanId = ryanUser.rows[0].id;

        for (const org of organizations.rows) {
          // Check if user-organization mappings exist
          const orgId = org.id;

          // Use organization_users table instead of user_organizations
          // Connect Matt to organization
          const mattOrgCheck = await client.query(
            "SELECT * FROM organization_users WHERE user_id = $1 AND organization_id = $2",
            [mattId, orgId],
          );

          if (mattOrgCheck.rows.length === 0) {
            await client.query(
              `
              INSERT INTO organization_users (user_id, organization_id, role, is_primary)
              VALUES ($1, $2, $3, $4)
            `,
              [
                mattId,
                orgId,
                "super_admin",
                orgId === "00000000-0000-0000-0000-000000000001",
              ],
            );

            console.log(`Connected Matt to organization ${orgId}`);
          } else {
            await client.query(
              `
              UPDATE organization_users
              SET role = 'super_admin'
              WHERE user_id = $1 AND organization_id = $2
            `,
              [mattId, orgId],
            );

            console.log(`Updated Matt's role in organization ${orgId}`);
          }

          // Connect Ryan to organization
          const ryanOrgCheck = await client.query(
            "SELECT * FROM organization_users WHERE user_id = $1 AND organization_id = $2",
            [ryanId, orgId],
          );

          if (ryanOrgCheck.rows.length === 0) {
            await client.query(
              `
              INSERT INTO organization_users (user_id, organization_id, role, is_primary)
              VALUES ($1, $2, $3, $4)
            `,
              [
                ryanId,
                orgId,
                "super_admin",
                orgId === "00000000-0000-0000-0000-000000000001",
              ],
            );

            console.log(`Connected Ryan to organization ${orgId}`);
          } else {
            await client.query(
              `
              UPDATE organization_users
              SET role = 'super_admin'
              WHERE user_id = $1 AND organization_id = $2
            `,
              [ryanId, orgId],
            );

            console.log(`Updated Ryan's role in organization ${orgId}`);
          }
        }
      }
    }

    console.log("Super admin users added successfully");
    await client.end();
  } catch (error) {
    console.error("Adding super admins failed:", error);
    process.exit(1);
  }
}

addSuperAdmins();
