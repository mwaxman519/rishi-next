export const PERMISSIONS = {
  // System permissions
  "system.view": "View system health and metrics",

  // Staff permissions
  "staff.view": "View staff members",
  "staff.create": "Create staff members",
  "staff.request": "Request specific staff",

  // Client permissions
  "clients.view": "View clients",
  "clients.create": "Create client organizations",

  // Kit permissions
  "kits.view": "View kits",
  "kits.create": "Create kits",

  // Event permissions
  "events.view": "View events",
  "events.create": "Create events",

  // Location permissions
  "locations.view": "View locations",
  "locations.create": "Create locations",

  // Organization permissions
  "org.admin": "Administer organization",

  // Billing permissions
  "billing.view": "View billing information",

  // Analytics permissions
  "analytics.view": "View analytics",

  // Training permissions
  "training.create": "Create training materials",

  // Messaging permissions
  "messages.access": "Access messaging system",

  // Administration permissions
  "admin.access": "Access administration section",
} as const;

export type Permission = keyof typeof PERMISSIONS;
