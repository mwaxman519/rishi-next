/**
 * Centralized documentation path redirects
 * Map from incorrect/legacy paths to the correct paths
 */
export const DOC_PATH_REDIRECTS: Record<string, string> = {
  // Root level redirects
  requirements: &quot;business/requirements&quot;,

  // Architecture redirects
  &quot;architecture/overview&quot;: &quot;architecture/system-architecture&quot;,
  &quot;architecture/database-schema&quot;: &quot;architecture/database&quot;,
  &quot;database-schema&quot;: &quot;architecture/database&quot;,
  &quot;architecture/&quot;: &quot;architecture/README&quot;,
  architecture: &quot;architecture/README&quot;,

  // API redirects
  &quot;api/overview&quot;: &quot;api/endpoints/README&quot;,
  &quot;api/endpoints/users&quot;: &quot;api/endpoints/auth&quot;,
  &quot;api/endpoints/items&quot;: &quot;api/endpoints/calendar&quot;,
  &quot;api/&quot;: &quot;api/README&quot;,
  api: &quot;api/README&quot;,
  &quot;api/availability&quot;: &quot;api/endpoints/availability&quot;,

  // Business redirects
  &quot;business/&quot;: &quot;business/README&quot;,
  business: &quot;business/README&quot;,
  &quot;business/business-model&quot;: &quot;business/overview&quot;,
  &quot;business-requirements&quot;: &quot;business/requirements/business-requirements&quot;,

  // CSS and Design redirects
  &quot;css/&quot;: &quot;css/README&quot;,
  css: &quot;css/README&quot;,
  &quot;design/&quot;: &quot;design/README&quot;,
  design: &quot;design/README&quot;,
  &quot;design/design-system&quot;: &quot;design/ui&quot;,
  &quot;design-system&quot;: &quot;design/ui&quot;,
  &quot;design/accessibility&quot;: &quot;design/ui&quot;,
  &quot;design/ui/component-showcase&quot;: &quot;design/ui&quot;,

  // Development guides redirects
  &quot;development-guides/&quot;: &quot;development-guides/README&quot;,
  &quot;development-guides&quot;: &quot;development-guides/README&quot;,
  &quot;development-guides/coding-standards&quot;: &quot;development-guides/patterns&quot;,
  &quot;development-guides/calendar-system/&quot;: &quot;development-guides/calendar-system&quot;,
  &quot;calendar-system/&quot;: &quot;development-guides/calendar-system&quot;,
  &quot;calendar-system&quot;: &quot;development-guides/calendar-system&quot;,
  &quot;development-guides/calendar-system/calendar-ui-components&quot;:
    &quot;design/calendar-ui-components&quot;,
  &quot;calendar-ui-components&quot;: &quot;design/calendar-ui-components&quot;,

  // Architecture documents
  &quot;authentication-architecture&quot;: &quot;architecture/system-architecture&quot;,
  &quot;authentication-architecture-v2&quot;: &quot;architecture/system-architecture&quot;,
  &quot;authentication-rbac-system&quot;: &quot;features/rbac-system-documentation&quot;,
  &quot;auth-rbac-system&quot;: &quot;features/rbac-system-documentation&quot;,
  &quot;calendar-architecture&quot;: &quot;development-guides/calendar-system&quot;,
  &quot;availability-service-architecture&quot;: &quot;features/availability-service&quot;,

  // Deployment redirects
  &quot;deployment/&quot;: &quot;deployment/README&quot;,
  deployment: &quot;deployment/README&quot;,
  &quot;deployment-guide&quot;: &quot;deployment/deployment-guide&quot;,
  &quot;deployment-optimization-guide&quot;: &quot;deployment/deployment-optimization-guide&quot;,

  // Build and optimization redirects
  &quot;build-optimization/&quot;: &quot;development-guides/build-optimization&quot;,
  &quot;build-optimization&quot;: &quot;development-guides/build-optimization&quot;,
  &quot;chunk-error-fixes&quot;: &quot;development-guides/chunk-error-fixes&quot;,

  // Database redirects
  &quot;database/&quot;: &quot;architecture/database&quot;,
  database: &quot;architecture/database&quot;,
  &quot;database/queries&quot;: &quot;architecture/database&quot;,

  // Features redirects
  &quot;features/&quot;: &quot;features/README&quot;,
  features: &quot;features/README&quot;,

  // Common paths that might be used
  &quot;docs/faq&quot;: &quot;getting-started/README&quot;,
  faq: &quot;getting-started/README&quot;,
  overview: &quot;architecture/overview&quot;,
  &quot;project-overview&quot;: &quot;architecture/overview&quot;,
  &quot;0-Project-Overview&quot;: &quot;architecture/overview&quot;,

  // Other utility docs
  &quot;best-practices&quot;: &quot;development-guides/patterns&quot;,
  &quot;additional-guidelines&quot;: &quot;development-guides/patterns&quot;,
  &quot;common-fixes&quot;: &quot;development-guides/recent-improvements&quot;,

  // Component related paths
  &quot;client-booking&quot;: &quot;features/client-interface-design&quot;,
  &quot;custom-components&quot;: &quot;css/custom-components&quot;,

  // Additional paths that might be accessed directly
  &quot;getting-started/&quot;: &quot;getting-started/README&quot;,
  &quot;getting-started&quot;: &quot;getting-started/README&quot;,
  &quot;testing/&quot;: &quot;testing/README&quot;,
  testing: &quot;testing/README&quot;,
};
// Add additional redirects for user-requirements
Object.assign(DOC_PATH_REDIRECTS, {
  &quot;business/user-requirements&quot;: &quot;business/requirements/user-requirements&quot;,
  &quot;user-requirements&quot;: &quot;business/requirements/user-requirements&quot;,
});
