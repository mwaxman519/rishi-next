/**
 * Centralized documentation path redirects
 * Map from incorrect/legacy paths to the correct paths
 */
export const DOC_PATH_REDIRECTS: Record<string, string> = {
  // Root level redirects
  requirements: "business/requirements",

  // Architecture redirects
  "architecture/overview": "architecture/system-architecture",
  "architecture/database-schema": "architecture/database",
  "database-schema": "architecture/database",
  "architecture/": "architecture/README",
  architecture: "architecture/README",

  // API redirects
  "api/overview": "api/endpoints/README",
  "api/endpoints/users": "api/endpoints/auth",
  "api/endpoints/items": "api/endpoints/calendar",
  "api/": "api/README",
  api: "api/README",
  "api/availability": "api/endpoints/availability",

  // Business redirects
  "business/": "business/README",
  business: "business/README",
  "business/business-model": "business/overview",
  "business-requirements": "business/requirements/business-requirements",

  // CSS and Design redirects
  "css/": "css/README",
  css: "css/README",
  "design/": "design/README",
  design: "design/README",
  "design/design-system": "design/ui",
  "design-system": "design/ui",
  "design/accessibility": "design/ui",
  "design/ui/component-showcase": "design/ui",

  // Development guides redirects
  "development-guides/": "development-guides/README",
  "development-guides": "development-guides/README",
  "development-guides/coding-standards": "development-guides/patterns",
  "development-guides/calendar-system/": "development-guides/calendar-system",
  "calendar-system/": "development-guides/calendar-system",
  "calendar-system": "development-guides/calendar-system",
  "development-guides/calendar-system/calendar-ui-components":
    "design/calendar-ui-components",
  "calendar-ui-components": "design/calendar-ui-components",

  // Architecture documents
  "authentication-architecture": "architecture/system-architecture",
  "authentication-architecture-v2": "architecture/system-architecture",
  "authentication-rbac-system": "features/rbac-system-documentation",
  "auth-rbac-system": "features/rbac-system-documentation",
  "calendar-architecture": "development-guides/calendar-system",
  "availability-service-architecture": "features/availability-service",

  // Deployment redirects
  "deployment/": "deployment/README",
  deployment: "deployment/README",
  "deployment-guide": "deployment/deployment-guide",
  "deployment-optimization-guide": "deployment/deployment-optimization-guide",

  // Build and optimization redirects
  "build-optimization/": "development-guides/build-optimization",
  "build-optimization": "development-guides/build-optimization",
  "chunk-error-fixes": "development-guides/chunk-error-fixes",

  // Database redirects
  "database/": "architecture/database",
  database: "architecture/database",
  "database/queries": "architecture/database",

  // Features redirects
  "features/": "features/README",
  features: "features/README",

  // Common paths that might be used
  "docs/faq": "getting-started/README",
  faq: "getting-started/README",
  overview: "architecture/overview",
  "project-overview": "architecture/overview",
  "0-Project-Overview": "architecture/overview",

  // Other utility docs
  "best-practices": "development-guides/patterns",
  "additional-guidelines": "development-guides/patterns",
  "common-fixes": "development-guides/recent-improvements",

  // Component related paths
  "client-booking": "features/client-interface-design",
  "custom-components": "css/custom-components",

  // Additional paths that might be accessed directly
  "getting-started/": "getting-started/README",
  "getting-started": "getting-started/README",
  "testing/": "testing/README",
  testing: "testing/README",
};
// Add additional redirects for user-requirements
Object.assign(DOC_PATH_REDIRECTS, {
  "business/user-requirements": "business/requirements/user-requirements",
  "user-requirements": "business/requirements/user-requirements",
});
