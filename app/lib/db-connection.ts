/**
 * Database Connection Management for Multi-Platform Architecture
 * 
 * This module provides environment-aware database connection management
 * for the Rishi Platform's 3-tier deployment architecture:
 * 
 * 1. Development (Replit): Development database with hot reload
 * 2. Web Production (Vercel): Full serverless functions with production database
 * 3. Mobile Production (VoltBuilder): Static export with remote API calls
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

/**
 * Environment Detection for Multi-Platform Architecture
 * 
 * Determines the current deployment environment to apply appropriate
 * database connection strategy based on platform capabilities.
 */
export function detectEnvironment(): 'development' | 'web-production' | 'mobile-production' {
  // Mobile production build (static export)
  if (process.env.MOBILE_BUILD === 'true' || process.env.VOLTBUILDER_BUILD === 'true') {
    return 'mobile-production';
  }
  
  // Web production (Vercel serverless)
  if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
    return 'web-production';
  }
  
  // Development (Replit workspace)
  return 'development';
}

/**
 * Database URL Resolution with Environment Separation
 * 
 * Ensures strict environment separation to prevent development data
 * from contaminating production environments and vice versa.
 */
export function getDatabaseUrl(): string {
  const environment = detectEnvironment();
  
  switch (environment) {
    case 'development':
      return process.env.DEV_DATABASE_URL || process.env.DATABASE_URL || '';
      
    case 'web-production':
      return process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL || '';
      
    case 'mobile-production':
      // Mobile builds use static export - no direct database access
      // API calls go to Vercel deployment
      return process.env.DATABASE_URL || '';
      
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}

/**
 * Database Connection Factory
 * 
 * Creates appropriate database connection based on deployment environment.
 * Mobile production builds should not use this directly - they use API calls.
 */
export function createDatabaseConnection() {
  const environment = detectEnvironment();
  const databaseUrl = getDatabaseUrl();
  
  if (!databaseUrl) {
    throw new Error(`DATABASE_URL not configured for environment: ${environment}`);
  }
  
  // Log connection environment (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DB Connection] Environment: ${environment}`);
    console.log(`[DB Connection] URL prefix: ${databaseUrl.substring(0, 20)}...`);
  }
  
  const sql = neon(databaseUrl);
  return drizzle(sql);
}

/**
 * Environment Configuration Validation
 * 
 * Validates that the current environment has proper configuration
 * for database connectivity and deployment requirements.
 */
export function validateEnvironmentConfiguration(): {
  environment: string;
  hasDatabase: boolean;
  isValid: boolean;
  warnings: string[];
} {
  const environment = detectEnvironment();
  const databaseUrl = getDatabaseUrl();
  const warnings: string[] = [];
  
  // Check database configuration
  const hasDatabase = !!databaseUrl;
  if (!hasDatabase) {
    warnings.push(`Missing DATABASE_URL for ${environment} environment`);
  }
  
  // Environment-specific validations
  switch (environment) {
    case 'development':
      if (!process.env.DEV_DATABASE_URL && !process.env.DATABASE_URL) {
        warnings.push('Development should use DEV_DATABASE_URL or DATABASE_URL');
      }
      break;
      
    case 'web-production':
      if (!process.env.PRODUCTION_DATABASE_URL && !process.env.DATABASE_URL) {
        warnings.push('Web production should use PRODUCTION_DATABASE_URL');
      }
      break;
      
    case 'mobile-production':
      if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        warnings.push('Mobile production should use NEXT_PUBLIC_API_BASE_URL');
      }
      break;
  }
  
  return {
    environment,
    hasDatabase,
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * Get API Base URL for Mobile Applications
 * 
 * Mobile applications use API calls to the web production deployment
 * instead of direct database connections.
 */
export function getApiBaseUrl(): string {
  const environment = detectEnvironment();
  
  if (environment === 'mobile-production') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://rishi-platform.vercel.app';
  }
  
  // Development and web production use relative URLs
  return '';
}