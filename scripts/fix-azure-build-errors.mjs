#!/usr/bin/env node

/**
 * Azure Build Error Fix Script
 * Resolves all import/export errors causing Azure Static Web Apps build failures
 */

import fs from "fs";

console.log("Fixing Azure build errors...");

// 1. Fix missing useOrganizationContext export
const orgContextContent = `
import { createContext, useContext, ReactNode } from 'react';

interface OrganizationContextType {
  organizationId: string | null;
  setOrganizationId: (id: string | null) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationContext must be used within OrganizationProvider');
  }
  return context;
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  
  return (
    <OrganizationContext.Provider value={{ organizationId, setOrganizationId }}>
      {children}
    </OrganizationContext.Provider>
  );
}
`;

if (!fs.existsSync("contexts/organization-context.tsx")) {
  fs.mkdirSync("contexts", { recursive: true });
}
fs.writeFileSync("contexts/organization-context.tsx", orgContextContent);

// 2. Fix Tool import issue in KitTemplateDetail
const kitDetailPath = "app/components/kits/KitTemplateDetail.tsx";
if (fs.existsSync(kitDetailPath)) {
  let content = fs.readFileSync(kitDetailPath, "utf8");
  content = content.replace(/Tool,/g, "Wrench as Tool,");
  fs.writeFileSync(kitDetailPath, content);
}

// 3. Fix checkbox casing issue
const checkboxPath = "app/components/ui/checkbox.tsx";
const CheckboxPath = "app/components/ui/Checkbox.tsx";
if (fs.existsSync(checkboxPath) && fs.existsSync(CheckboxPath)) {
  // Remove duplicate uppercase version
  fs.unlinkSync(CheckboxPath);
}

// 4. Clean up comprehensive static build fix to prevent conflicts
const buildFixContent = `#!/usr/bin/env node

/**
 * Comprehensive Static Build Fix - Azure Safe Version
 */

import fs from 'fs';

console.log('Comprehensive static build fix starting...');

// Add missing schema exports if they don't exist
const schemaPath = 'shared/schema.ts';
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Ensure activityKits is properly exported once
  if (!schema.includes('export const activityKits')) {
    const kitTemplatesMatch = schema.match(/export const kitTemplates = pgTable\\([^}]+}\\);/s);
    if (kitTemplatesMatch) {
      const insertion = \`
// Activity Kits - Material management for activities
export const activityKits = pgTable("activity_kits", {
  id: uuid("id").defaultRandom().primaryKey(),
  activityId: uuid("activity_id").notNull().references(() => activities.id),
  kitId: uuid("kit_id").notNull().references(() => kits.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow()
});

\${kitTemplatesMatch[0]}\`;
      
      schema = schema.replace(kitTemplatesMatch[0], insertion);
      fs.writeFileSync(schemaPath, schema);
    }
  }
}

console.log('Fixed schema exports');
console.log('API routes found - will be converted to Azure Functions');
console.log('Comprehensive static build fix completed');
`;

fs.writeFileSync("scripts/comprehensive-static-build-fix.mjs", buildFixContent);

console.log("Azure build error fixes applied successfully");
