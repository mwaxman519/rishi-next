/**
 * Deployment Configuration
 * Handles environment-specific configuration for deployment
 */

export const getDeploymentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';
  
  return {
    environment: env,
    appEnvironment: appEnv,
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isStaging: appEnv === 'staging',
    
    // Database configuration
    database: {
      url: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
      skipMigrations: process.env.SKIP_MIGRATIONS === 'true',
    },
    
    // Build configuration
    build: {
      skipTypeCheck: process.env.SKIP_TYPE_CHECK === 'true',
      skipLint: process.env.SKIP_LINT === 'true',
      telemetryDisabled: process.env.NEXT_TELEMETRY_DISABLED === '1',
    },
    
    // Feature flags
    features: {
      mockData: process.env.ENABLE_MOCK_DATA === 'true',
      debug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
    },
  };
};

export const validateDeploymentConfig = () => {
  const config = getDeploymentConfig();
  
  if (config.isProduction && !config.database.url) {
    throw new Error('DATABASE_URL is required for production deployment');
  }
  
  return config;
};