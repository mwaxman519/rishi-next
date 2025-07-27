/**
 * Documentation Path Redirects
 * Handles redirects for moved or renamed documentation pages
 */

export const DOC_PATH_REDIRECTS: Record<string, string> = {
  // Legacy redirects
  'setup': 'getting-started/setup',
  'installation': 'getting-started/installation',
  'configuration': 'getting-started/configuration',
  
  // API documentation redirects
  'api-reference': 'api/overview',
  'api-auth': 'api/authentication',
  'api-users': 'api/users',
  'api-organizations': 'api/organizations',
  'api-bookings': 'api/bookings',
  
  // Architecture redirects
  'architecture': 'architecture/overview',
  'microservices': 'architecture/microservices',
  'database-schema': 'architecture/database',
  'event-system': 'architecture/events',
  
  // Deployment redirects
  'deployment': 'deployment/overview',
  'azure-deployment': 'deployment/azure',
  'environment-config': 'deployment/environment',
  
  // User guide redirects
  'user-guide': 'guides/overview',
  'dashboard-guide': 'guides/dashboard',
  'booking-guide': 'guides/bookings',
  'team-management': 'guides/team-management',
  
  // Legacy file redirects
  'README': 'overview',
  'ROADMAP': 'roadmap',
  'CHANGELOG': 'changelog',
  'CONTRIBUTING': 'contributing',
  
  // Cannabis industry specific redirects
  'cannabis-operations': 'guides/cannabis-operations',
  'compliance-guide': 'guides/compliance',
  'state-regulations': 'guides/state-regulations',
  
  // Technical documentation redirects
  'rbac-system': 'architecture/rbac',
  'authentication-system': 'architecture/authentication',
  'multi-organization': 'architecture/multi-organization',
  'event-driven-architecture': 'architecture/event-driven',
  
  // Infrastructure redirects
  'monitoring': 'infrastructure/monitoring',
  'security': 'infrastructure/security',
  'performance': 'infrastructure/performance',
  'backup-recovery': 'infrastructure/backup-recovery',
  
  // Integration redirects
  'google-maps': 'integrations/google-maps',
  'email-service': 'integrations/email',
  'sms-service': 'integrations/sms',
  'payment-processing': 'integrations/payments',
  
  // Troubleshooting redirects
  'troubleshooting': 'troubleshooting/overview',
  'common-issues': 'troubleshooting/common-issues',
  'error-codes': 'troubleshooting/error-codes',
  'debugging': 'troubleshooting/debugging',
  
  // Development redirects
  'development': 'development/overview',
  'local-setup': 'development/local-setup',
  'testing': 'development/testing',
  'code-style': 'development/code-style',
  'git-workflow': 'development/git-workflow',
  
  // Migration redirects
  'migration-guide': 'migration/overview',
  'v1-to-v2': 'migration/v1-to-v2',
  'database-migration': 'migration/database',
  'api-migration': 'migration/api',
};

/**
 * Get redirect path for a given path
 */
export function getRedirectPath(path: string): string | null {
  return DOC_PATH_REDIRECTS[path] || null;
}

/**
 * Check if a path needs redirect
 */
export function needsRedirect(path: string): boolean {
  return path in DOC_PATH_REDIRECTS;
}

/**
 * Get all redirect entries
 */
export function getAllRedirects(): Array<{ from: string; to: string }> {
  return Object.entries(DOC_PATH_REDIRECTS).map(([from, to]) => ({
    from,
    to
  }));
}