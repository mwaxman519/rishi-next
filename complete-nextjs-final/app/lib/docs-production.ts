// Production-safe documentation configuration
// This file provides production-optimized versions of docs functions

export const PRODUCTION_DOCS_CONFIG = {
  enableStaticGeneration: false,
  enableErrorLogging: false,
  fallbackToNotFound: true,
  skipMissingFiles: true
};

export function isProductionBuild() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

export function shouldSkipDocsGeneration() {
  return isProductionBuild() && process.env.SKIP_DOCS_GENERATION !== 'false';
}

// Export production-safe version of getAllDocs that never fails
export async function getAllDocsProduction() {
  try {
    // Dynamic import to avoid issues during build
    const docsModule = await import('./docs');
    if (docsModule && docsModule.getAllDocs) {
      return await docsModule.getAllDocs();
    }
    return [];
  } catch (error) {
    console.warn('[DOCS PRODUCTION] Error loading docs, returning empty array:', error?.message || 'No error message available');
    return [];
  }
}

// Production-safe document getter
export async function getDocumentByPathProduction(path: string) {
  try {
    const docsModule = await import('./docs');
    if (docsModule && docsModule.getDocumentByPath) {
      return await docsModule.getDocumentByPath(path);
    }
    return null;
  } catch (error) {
    console.warn('[DOCS PRODUCTION] Error loading document:', path, error?.message || 'No error message available');
    return null;
  }
}

// Production-safe doc tree getter
export async function getDocTreeProduction() {
  try {
    const docsModule = await import('./docs');
    if (docsModule && docsModule.getDocTree) {
      return await docsModule.getDocTree();
    }
    return {};
  } catch (error) {
    console.warn('[DOCS PRODUCTION] Error loading doc tree, returning empty object:', error?.message || 'No error message available');
    return {};
  }
}