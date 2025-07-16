/**
 * Comprehensive documentation redirects to prevent 404/500 errors
 * Maps directory paths to their README files or first available document
 */

export const DOC_PATH_REDIRECTS: Record<string, string> = {
  // Main categories from home page
  "api": "api/README",
  "architecture": "architecture/README", 
  "Business": "Business/README",
  "deployment": "deployment/README",
  "Technical": "Technical/README",
  "Operations": "Operations/README",
  "ProductRoadmap": "ProductRoadmap/README",
  
  // Sub-directories with README files
  "api/endpoints": "api/endpoints/README",
  "architecture/integration/events": "architecture/integration/events/README",
  "architecture/integration/integration-plan": "architecture/integration/integration-plan/README",
  "architecture/system-design/booking-system": "architecture/system-design/booking-system/README",
  "deployment/configuration": "deployment/configuration/index",
  
  // Common navigation paths
  "getting-started": "README",
  "api-reference": "api-reference",
  "user-guide": "user-guide",
  
  // Legacy paths that might be bookmarked
  "guides": "guides/implementation",
  "infrastructure": "infrastructure/monitoring",
  "authentication": "api/authentication/authentication",
  
  // Handle common typos and variations
  "business": "Business/README",
  "technical": "Technical/README",
  "operations": "Operations/README",
  "product-roadmap": "ProductRoadmap/README",
  "productroadmap": "ProductRoadmap/README",
  
  // Specific endpoint documentation
  "api/integration": "api/integration/api-integration",
  "api/inventory": "api/inventory-kit-system",
  
  // Architecture specific redirects
  "architecture/database": "architecture/database",
  "architecture/integration": "architecture/integration/events/README",
  "architecture/microservices": "architecture/microservices",
  "architecture/system-design": "architecture/system-design/booking-system/README",
  
  // Deployment specific redirects  
  "deployment/azure": "deployment/azure",
  "deployment/guides": "deployment/guides",
  
  // Business specific redirects
  "Business/Models": "Business/Models",
  "Business/Plans": "Business/Plans", 
  "Business/Operations": "Business/Operations",
  "Business/Strategy": "Business/Strategy",
  "Business/Analytics": "Business/Analytics",
  
  // Technical specific redirects
  "Technical/Architecture": "Technical/Architecture",
  "Technical/Services": "Technical/Services",
  
  // ProductRoadmap specific redirects
  "ProductRoadmap/Review": "ProductRoadmap/Review",
  "ProductRoadmap/Roadmap": "ProductRoadmap/Roadmap",
  "ProductRoadmap/Environments": "ProductRoadmap/Environments",
  "ProductRoadmap/Mobile": "ProductRoadmap/Mobile",
  "ProductRoadmap/Architecture": "ProductRoadmap/Architecture",
  "ProductRoadmap/Deployment": "ProductRoadmap/Deployment",
};

/**
 * Get the appropriate redirect for a documentation path
 * @param path - The requested documentation path
 * @returns The redirect path if one exists, otherwise null
 */
export function getDocRedirect(path: string): string | null {
  // Remove leading/trailing slashes and normalize
  const normalizedPath = path.replace(/^\/+|\/+$/g, '').replace(/\.(md|mdx)$/i, '');
  
  // Check direct mapping
  if (DOC_PATH_REDIRECTS[normalizedPath]) {
    return DOC_PATH_REDIRECTS[normalizedPath];
  }
  
  // Check case-insensitive mapping
  const lowerPath = normalizedPath.toLowerCase();
  for (const [key, value] of Object.entries(DOC_PATH_REDIRECTS)) {
    if (key.toLowerCase() === lowerPath) {
      return value;
    }
  }
  
  return null;
}

/**
 * List of known documentation files that should exist
 * Used for validation and error prevention
 */
export const KNOWN_DOC_FILES = [
  "README",
  "api-reference", 
  "user-guide",
  "api/README",
  "api/authentication/authentication",
  "api/authentication/security",
  "api/endpoints/README",
  "api/endpoints/COMPLETE_API_REFERENCE",
  "architecture/README",
  "Business/README",
  "deployment/README",
  "deployment/configuration/index",
  "Technical/README",
  "Operations/README",
  "ProductRoadmap/README",
];

/**
 * Check if a documentation path is known to exist
 * @param path - The documentation path to check
 * @returns True if the path is known to exist
 */
export function isKnownDocPath(path: string): boolean {
  const normalizedPath = path.replace(/^\/+|\/+$/g, '').replace(/\.(md|mdx)$/i, '');
  return KNOWN_DOC_FILES.includes(normalizedPath);
}