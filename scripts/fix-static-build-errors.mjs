#!/usr/bin/env node

/**
 * Comprehensive Static Build Error Fixes
 * This script fixes all import and export errors identified in the build logs
 */

import fs from "fs";
import path from "path";

console.log("🔧 Fixing static build errors...");

// 1. Fix missing exports in shared/schema.ts
const schemaPath = "shared/schema.ts";
if (fs.existsSync(schemaPath)) {
  let schemaContent = fs.readFileSync(schemaPath, "utf8");

  // Add missing activityKits export (referenced by kits/repository.ts)
  if (!schemaContent.includes("export const activityKits")) {
    const activityKitsTable = `
// Activity Kits table for kit-activity relationships
export const activityKits = pgTable("activity_kits", {
  id: uuid("id").defaultRandom().primaryKey(),
  activityId: uuid("activity_id").references(() => activities.id, { onDelete: "cascade" }),
  kitId: uuid("kit_id").references(() => kits.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow()
});
`;
    schemaContent += activityKitsTable;
  }

  // Add missing featureStatus export
  if (!schemaContent.includes("export const featureStatus")) {
    const featureStatusTable = `
// Feature Status table for feature flag management
export const featureStatus = pgTable("feature_status", {
  id: uuid("id").defaultRandom().primaryKey(),
  featureName: varchar("feature_name", { length: 100 }).notNull(),
  enabled: boolean("enabled").default(false),
  organizationId: uuid("organization_id").references(() => organizations.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
`;
    schemaContent += featureStatusTable;
  }

  fs.writeFileSync(schemaPath, schemaContent);
  console.log("✅ Fixed missing exports in shared/schema.ts");
}

// 2. Fix RBAC exports in app/lib/rbac/index.ts
const rbacPath = "app/lib/rbac/index.ts";
if (fs.existsSync(rbacPath)) {
  let rbacContent = fs.readFileSync(rbacPath, "utf8");

  // Add missing function exports
  const missingExports = `
// Route permissions mapping
export const routePermissions: Record<string, string[]> = {
  '/admin': ['manage:organizations'],
  '/users': ['read:users'],
  '/locations': ['read:locations'],
  '/bookings': ['read:bookings']
};

// Get all available permissions
export function getAllPermissions(): string[] {
  return [
    'create:users', 'read:users', 'update:users', 'delete:users',
    'create:organizations', 'read:organizations', 'update:organizations', 'delete:organizations',
    'create:locations', 'read:locations', 'update:locations', 'delete:locations',
    'create:bookings', 'read:bookings', 'update:bookings', 'delete:bookings',
    'manage:organizations', 'approve:bookings', 'reject:bookings'
  ];
}

// Check route permission
export function hasRoutePermission(route: string, userPermissions: string[]): boolean {
  const requiredPermissions = routePermissions[route] || [];
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}
`;

  if (!rbacContent.includes("getAllPermissions")) {
    rbacContent += missingExports;
    fs.writeFileSync(rbacPath, rbacContent);
    console.log("✅ Fixed missing RBAC exports");
  }
}

// 3. Fix organization context export
const orgContextPath = "app/contexts/organization-context.tsx";
if (fs.existsSync(orgContextPath)) {
  let orgContent = fs.readFileSync(orgContextPath, "utf8");

  // Add missing useOrganizationContext export
  if (!orgContent.includes("useOrganizationContext")) {
    const contextExport = `
// Export useOrganizationContext for backwards compatibility
export const useOrganizationContext = useOrganization;
`;
    orgContent += contextExport;
    fs.writeFileSync(orgContextPath, orgContent);
    console.log("✅ Fixed organization context export");
  }
}

// 4. Fix Checkbox casing issue
const checkboxPath = "app/components/ui/Checkbox.tsx";
const checkboxLowerPath = "app/components/ui/checkbox.tsx";

if (fs.existsSync(checkboxPath) && fs.existsSync(checkboxLowerPath)) {
  // Remove the uppercase version to fix casing conflict
  fs.unlinkSync(checkboxPath);
  console.log("✅ Fixed Checkbox casing conflict");
}

// 5. Create missing Tool icon export fix
const kitDetailPath = "app/components/kits/KitTemplateDetail.tsx";
if (fs.existsSync(kitDetailPath)) {
  let kitContent = fs.readFileSync(kitDetailPath, "utf8");

  // Replace Tool with Wrench (available icon)
  if (kitContent.includes("Tool")) {
    kitContent = kitContent.replace(/Tool/g, "Wrench");
    fs.writeFileSync(kitDetailPath, kitContent);
    console.log("✅ Fixed Tool icon import in KitTemplateDetail");
  }
}

console.log("🎉 Static build error fixes completed");
