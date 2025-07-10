import { db } from "../app/lib/db.ts";
import { sql } from "drizzle-orm";

/**
 * Create Test Organizations Script
 *
 * This script creates two test organizations with different tier levels and associates users with them.
 * It's used for testing organization-aware RBAC functionality across production pages.
 */

async function createTestOrganizations() {
  console.log("Creating test organizations...");

  try {
    // Check if organizations already exist
    const existingOrgs = await db.execute(sql`
      SELECT id, name FROM organizations 
      WHERE name IN ('Agency Partners Inc.', 'Enterprise Solutions LLC')
    `);

    // Variables to store organization IDs
    const existingOrgMap = {};
    let org1Id, org2Id;

    existingOrgs.rows.forEach((org) => {
      existingOrgMap[org.name] = org.id;
    });

    // Create or get first organization
    if (existingOrgMap["Agency Partners Inc."]) {
      console.log(
        "Agency Partners Inc. already exists, using existing organization",
      );
      org1Id = existingOrgMap["Agency Partners Inc."];
    } else {
      // Create first organization
      const org1 = await db.execute(sql`
        INSERT INTO organizations 
          (name, type, status, subscription_tier, logo_url)
        VALUES 
          ('Agency Partners Inc.', 'client', 'active', 'tier1', '/logo-agency.png')
        RETURNING id
      `);
      org1Id = org1.rows[0].id;
    }

    // Create or get second organization
    if (existingOrgMap["Enterprise Solutions LLC"]) {
      console.log(
        "Enterprise Solutions LLC already exists, using existing organization",
      );
      org2Id = existingOrgMap["Enterprise Solutions LLC"];
    } else {
      // Create second organization
      const org2 = await db.execute(sql`
        INSERT INTO organizations 
          (name, type, status, subscription_tier, logo_url)
        VALUES 
          ('Enterprise Solutions LLC', 'client', 'active', 'tier3', '/logo-enterprise.png')
        RETURNING id
      `);
      org2Id = org2.rows[0].id;
    }

    console.log(
      `Created organizations: Agency Partners Inc. (ID: ${org1Id}), Enterprise Solutions LLC (ID: ${org2Id})`,
    );

    // Find or create admin users using the checkUser helper we'll use for managers
    const checkUser = async (username) => {
      const result = await db.execute(sql`
        SELECT id FROM users 
        WHERE username = ${username}
      `);
      return result.rows.length > 0 ? result.rows[0].id : null;
    };

    // Check for existing super admin
    let superAdminId = await checkUser("superadmin");
    if (!superAdminId) {
      try {
        const superAdmin = await db.execute(sql`
          INSERT INTO users 
            (username, password, role, full_name, email, active)
          VALUES 
            ('superadmin', '$2b$10$NxKXTWrBjMS9TwCups.XiOLRRpDQA/R1s/UCB5GBKaVHQrviJ3kLu', 'super_admin', 'Super Admin', 'superadmin@example.com', true)
          RETURNING id
        `);
        superAdminId = superAdmin.rows[0].id;
        console.log(`Created Super Admin user (ID: ${superAdminId})`);
      } catch (error) {
        // If insertion fails, try to retrieve the user again
        if (error.code === "23505") {
          // Unique constraint violation
          const retryQuery = await db.execute(
            sql`SELECT id FROM users WHERE username = 'superadmin'`,
          );
          if (retryQuery.rows.length > 0) {
            superAdminId = retryQuery.rows[0].id;
            console.log(
              `Found existing Super Admin user (ID: ${superAdminId})`,
            );
          } else {
            throw error; // Re-throw if we can't find the user
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
    } else {
      console.log(`Found existing Super Admin user (ID: ${superAdminId})`);
    }

    // Check for existing internal admin
    let internalAdminId = await checkUser("internal_admin");
    if (!internalAdminId) {
      try {
        const internalAdmin = await db.execute(sql`
          INSERT INTO users 
            (username, password, role, full_name, email, active)
          VALUES 
            ('internal_admin', '$2b$10$NxKXTWrBjMS9TwCups.XiOLRRpDQA/R1s/UCB5GBKaVHQrviJ3kLu', 'internal_admin', 'Internal Admin', 'internaladmin@example.com', true)
          RETURNING id
        `);
        internalAdminId = internalAdmin.rows[0].id;
        console.log(`Created Internal Admin user (ID: ${internalAdminId})`);
      } catch (error) {
        // If insertion fails, try to retrieve the user again
        if (error.code === "23505") {
          // Unique constraint violation
          const retryQuery = await db.execute(
            sql`SELECT id FROM users WHERE username = 'internal_admin'`,
          );
          if (retryQuery.rows.length > 0) {
            internalAdminId = retryQuery.rows[0].id;
            console.log(
              `Found existing Internal Admin user (ID: ${internalAdminId})`,
            );
          } else {
            throw error; // Re-throw if we can't find the user
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
    } else {
      console.log(
        `Found existing Internal Admin user (ID: ${internalAdminId})`,
      );
    }

    // Create client managers for each organization
    let clientManager1Id = await checkUser("agency_manager");
    if (!clientManager1Id) {
      // Create the first client manager
      const clientManager1 = await db.execute(sql`
        INSERT INTO users 
          (username, password, role, full_name, email, active)
        VALUES 
          ('agency_manager', '$2b$10$NxKXTWrBjMS9TwCups.XiOLRRpDQA/R1s/UCB5GBKaVHQrviJ3kLu', 'client_manager', 'Agency Manager', 'agency.manager@example.com', true)
        RETURNING id
      `);
      clientManager1Id = clientManager1.rows[0].id;
    } else {
      // Update existing user
      await db.execute(sql`
        UPDATE users
        SET role = 'client_manager', active = true
        WHERE id = ${clientManager1Id}
      `);
    }

    let clientManager2Id = await checkUser("enterprise_manager");
    if (!clientManager2Id) {
      // Create the second client manager
      const clientManager2 = await db.execute(sql`
        INSERT INTO users 
          (username, password, role, full_name, email, active)
        VALUES 
          ('enterprise_manager', '$2b$10$NxKXTWrBjMS9TwCups.XiOLRRpDQA/R1s/UCB5GBKaVHQrviJ3kLu', 'client_manager', 'Enterprise Manager', 'enterprise.manager@example.com', true)
        RETURNING id
      `);
      clientManager2Id = clientManager2.rows[0].id;
    } else {
      // Update existing user
      await db.execute(sql`
        UPDATE users
        SET role = 'client_manager', active = true
        WHERE id = ${clientManager2Id}
      `);
    }

    console.log(
      `Created client managers: Agency Manager (ID: ${clientManager1Id}), Enterprise Manager (ID: ${clientManager2Id})`,
    );

    // Check for existing organization user associations
    const checkOrgUsers = async (orgId, userId) => {
      const result = await db.execute(sql`
        SELECT 1 FROM organization_users 
        WHERE organization_id = ${orgId} AND user_id = ${userId}
      `);
      return result.rows.length > 0;
    };

    // Associate users with organizations
    // Super Admin with both organizations
    if (!(await checkOrgUsers(org1Id, superAdminId))) {
      await db.execute(sql`
        INSERT INTO organization_users
          (organization_id, user_id, role, is_primary)
        VALUES
          (${org1Id}, ${superAdminId}, 'super_admin', false)
      `);
    }

    if (!(await checkOrgUsers(org2Id, superAdminId))) {
      await db.execute(sql`
        INSERT INTO organization_users
          (organization_id, user_id, role, is_primary)
        VALUES
          (${org2Id}, ${superAdminId}, 'super_admin', false)
      `);
    }

    // Internal Admin with both organizations
    if (!(await checkOrgUsers(org1Id, internalAdminId))) {
      await db.execute(sql`
        INSERT INTO organization_users
          (organization_id, user_id, role, is_primary)
        VALUES
          (${org1Id}, ${internalAdminId}, 'internal_admin', true)
      `);
    }

    if (!(await checkOrgUsers(org2Id, internalAdminId))) {
      await db.execute(sql`
        INSERT INTO organization_users
          (organization_id, user_id, role, is_primary)
        VALUES
          (${org2Id}, ${internalAdminId}, 'internal_admin', false)
      `);
    }

    // Client managers with their respective organizations
    if (!(await checkOrgUsers(org1Id, clientManager1Id))) {
      await db.execute(sql`
        INSERT INTO organization_users
          (organization_id, user_id, role, is_primary)
        VALUES
          (${org1Id}, ${clientManager1Id}, 'client_manager', true)
      `);
    }

    if (!(await checkOrgUsers(org2Id, clientManager2Id))) {
      await db.execute(sql`
        INSERT INTO organization_users
          (organization_id, user_id, role, is_primary)
        VALUES
          (${org2Id}, ${clientManager2Id}, 'client_manager', true)
      `);
    }

    // Note: The userOrganizationPreferences table is defined in the schema
    // but hasn't been created in the database yet. We'll skip setting
    // user org preferences for now.

    // Check for existing regions
    const checkRegion = async (regionName, regionCode) => {
      const result = await db.execute(sql`
        SELECT id FROM regions 
        WHERE name = ${regionName} AND code = ${regionCode}
      `);
      return result.rows.length > 0 ? result.rows[0].id : null;
    };

    // Create regions if they don't exist
    let norcalRegionId = await checkRegion("Northern California", "CA-N");
    if (!norcalRegionId) {
      const norcalRegion = await db.execute(sql`
        INSERT INTO regions
          (name, type, code)
        VALUES
          ('Northern California', 'state', 'CA-N')
        RETURNING id
      `);
      norcalRegionId = norcalRegion.rows[0].id;
      console.log(
        `Created region: Northern California (ID: ${norcalRegionId})`,
      );
    } else {
      console.log(
        `Using existing region: Northern California (ID: ${norcalRegionId})`,
      );
    }

    let socalRegionId = await checkRegion("Southern California", "CA-S");
    if (!socalRegionId) {
      const socalRegion = await db.execute(sql`
        INSERT INTO regions
          (name, type, code)
        VALUES
          ('Southern California', 'state', 'CA-S')
        RETURNING id
      `);
      socalRegionId = socalRegion.rows[0].id;
      console.log(`Created region: Southern California (ID: ${socalRegionId})`);
    } else {
      console.log(
        `Using existing region: Southern California (ID: ${socalRegionId})`,
      );
    }

    let coloradoRegionId = await checkRegion("Colorado", "CO");
    if (!coloradoRegionId) {
      const coloradoRegion = await db.execute(sql`
        INSERT INTO regions
          (name, type, code)
        VALUES
          ('Colorado', 'state', 'CO')
        RETURNING id
      `);
      coloradoRegionId = coloradoRegion.rows[0].id;
      console.log(`Created region: Colorado (ID: ${coloradoRegionId})`);
    } else {
      console.log(`Using existing region: Colorado (ID: ${coloradoRegionId})`);
    }

    let washingtonRegionId = await checkRegion("Washington", "WA");
    if (!washingtonRegionId) {
      const washingtonRegion = await db.execute(sql`
        INSERT INTO regions
          (name, type, code)
        VALUES
          ('Washington', 'state', 'WA')
        RETURNING id
      `);
      washingtonRegionId = washingtonRegion.rows[0].id;
      console.log(`Created region: Washington (ID: ${washingtonRegionId})`);
    } else {
      console.log(
        `Using existing region: Washington (ID: ${washingtonRegionId})`,
      );
    }

    // Check for existing organization-region associations
    const checkOrgRegionAssoc = async (orgId, regionId) => {
      const result = await db.execute(sql`
        SELECT 1 FROM organization_regions 
        WHERE organization_id = ${orgId} AND region_id = ${regionId}
      `);
      return result.rows.length > 0;
    };

    // Associate regions with organizations
    if (!(await checkOrgRegionAssoc(org1Id, norcalRegionId))) {
      await db.execute(sql`
        INSERT INTO organization_regions
          (organization_id, region_id, is_primary)
        VALUES
          (${org1Id}, ${norcalRegionId}, true)
      `);
      console.log(`Associated Northern California region with Agency Partners`);
    }

    if (!(await checkOrgRegionAssoc(org1Id, socalRegionId))) {
      await db.execute(sql`
        INSERT INTO organization_regions
          (organization_id, region_id, is_primary)
        VALUES
          (${org1Id}, ${socalRegionId}, false)
      `);
      console.log(`Associated Southern California region with Agency Partners`);
    }

    if (!(await checkOrgRegionAssoc(org2Id, coloradoRegionId))) {
      await db.execute(sql`
        INSERT INTO organization_regions
          (organization_id, region_id, is_primary)
        VALUES
          (${org2Id}, ${coloradoRegionId}, true)
      `);
      console.log(`Associated Colorado region with Enterprise Solutions`);
    }

    if (!(await checkOrgRegionAssoc(org2Id, washingtonRegionId))) {
      await db.execute(sql`
        INSERT INTO organization_regions
          (organization_id, region_id, is_primary)
        VALUES
          (${org2Id}, ${washingtonRegionId}, false)
      `);
      console.log(`Associated Washington region with Enterprise Solutions`);
    }

    console.log("Organization associations created successfully");
    console.log("Test organizations setup complete!");

    // Return organization info for reference
    return [
      { id: org1Id, name: "Agency Partners Inc.", tier: "tier1" },
      { id: org2Id, name: "Enterprise Solutions LLC", tier: "tier3" },
    ];
  } catch (error) {
    console.error("Error creating test organizations:", error);
    throw error;
  }
}

// Execute the function
createTestOrganizations()
  .then((orgs) => {
    console.log("Created organizations:");
    console.table(orgs);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to create test organizations:", error);
    process.exit(1);
  });
