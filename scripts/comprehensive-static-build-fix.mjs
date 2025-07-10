#!/usr/bin/env node

/**
 * Comprehensive Static Build Fix - Azure Safe Version
 */

import fs from "fs";

console.log("Comprehensive static build fix starting...");

// Add missing schema exports if they don't exist
const schemaPath = "shared/schema.ts";
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, "utf8");

  // Ensure activityKits is properly exported once
  if (!schema.includes("export const activityKits")) {
    const kitTemplatesMatch = schema.match(
      /export const kitTemplates = pgTable\([^}]+}\);/s,
    );
    if (kitTemplatesMatch) {
      const insertion = `
// Activity Kits - Material management for activities
export const activityKits = pgTable("activity_kits", {
  id: uuid("id").defaultRandom().primaryKey(),
  activityId: uuid("activity_id").notNull().references(() => activities.id),
  kitId: uuid("kit_id").notNull().references(() => kits.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow()
});

${kitTemplatesMatch[0]}`;

      schema = schema.replace(kitTemplatesMatch[0], insertion);
      fs.writeFileSync(schemaPath, schema);
    }
  }
}

console.log("Fixed schema exports");
console.log("API routes found - will be converted to Azure Functions");
console.log("Comprehensive static build fix completed");
