# Environment Segregation

This document outlines the environment segregation strategy for the Rishi Enterprise Workforce Management Platform.

## Overview

The Rishi platform implements a strict environment segregation strategy to ensure:

1. Development is fast and efficient with mock data for rapid iterations
2. Staging provides a faithful replica of production with isolated real data
3. Production remains secure and stable with no test data

## Environment Definitions

### Development Environment

- **Purpose**: Active development and initial testing
- **Data Strategy**: Uses mock/simulated data to facilitate rapid development
- **Configuration**: Development-specific settings
- **Access**: Available to developers only
- **Deployment**: Automatic via development workflow
- **Data Source**: Mock repositories and simulated responses

```typescript
// Example of development environment detection
if (process.env.NODE_ENV === "development") {
  console.log("DEVELOPMENT MODE: Using mock data");
  // Use mock implementations
}
```

### Staging Environment

- **Purpose**: Integration testing, pre-production validation, client demos
- **Data Strategy**: Uses real data in an isolated staging database
- **Configuration**: Matches production settings
- **Access**: Available to internal team and selected clients
- **Deployment**: Via Replit or other staging platforms
- **Data Source**: Dedicated staging database (not shared with production)

```typescript
// Example of staging environment configuration
// No mock data should be used in staging
// Staging uses real database but isolated from production
```

### Production Environment

- **Purpose**: Live client usage and production workloads
- **Data Strategy**: Only real production data, no test data
- **Configuration**: Optimized for performance, security, and reliability
- **Access**: Available to authenticated clients and users
- **Deployment**: Via formal release process
- **Data Source**: Production database (protected and backed up)

## Implementation Guidelines

### Code Structure

All code that handles environment-specific behavior should:

1. Check the `NODE_ENV` environment variable to determine the current environment
2. Only use mock data in development environments
3. Throw clear error messages if implementation is missing for non-development environments
4. Log environment-specific messages for debugging

Example:

```typescript
async function getData() {
  if (process.env.NODE_ENV === "development") {
    console.log("DEVELOPMENT MODE: Using mock data");
    return mockData;
  }

  // For staging/production, use real data sources
  return realDataRepository.getData();
}
```

### Critical Systems

The following systems have been updated to implement proper environment segregation:

1. **Authentication System**

   - Development: Uses mock users and authentication
   - Staging/Production: Uses real authentication from database

2. **States Service**

   - Development: Uses mock state data for US states and regions
   - Staging/Production: Uses database for state and region data

3. **Registration Process**

   - All environments require the passcode "mattmikeryan" for registration
   - Staging/Production: Strict validation of registration data

4. **Organization Data**
   - Development: Attempts database access first, falls back to structured mock data
   - Staging/Production: Exclusively uses database data, no mock organizations
   - All environments: Clear separation between organization and location data

### Testing Considerations

- Unit tests should be able to run in any environment
- Integration tests should use a dedicated test database
- End-to-end tests should be able to run against any environment

## Environment Variables

Each environment has its own set of environment variables, stored in:

- Development: `.env.development` or `.env.local`
- Staging: `.env.staging`
- Production: `.env.production`

Critical variables include:

- `NODE_ENV`: The current environment (`development`, `staging`, or `production`)
- `DATABASE_URL`: Connection string to the appropriate database for the environment
- `SESSION_SECRET`: Secret for session encryption (unique per environment)

## Database Isolation

Each environment has its own isolated database:

- Development: Local or development database
- Staging: Staging database with real schema but isolated data
- Production: Production database with client data

Data should never be shared between staging and production environments.

## Migration Path

When new features are developed, they should follow this progression:

1. Development: Implement with mock data for rapid iteration
2. Staging: Test with real data in the staging environment
3. Production: Deploy to production after validation in staging

## Security Considerations

- Development environments may have reduced security for ease of development
- Staging and production environments must implement full security measures
- Authorization and authentication must be properly enforced in staging and production
- Sensitive information should be properly encrypted in all environments

## Monitoring and Logging

- Development: Verbose logging for debugging
- Staging: Production-like logging but with more details for testing
- Production: Optimized logging focusing on critical events and errors

## Troubleshooting

If you encounter issues with environment-specific code:

1. Verify the correct `NODE_ENV` value is set
2. Check that the code is properly checking the environment before using mock data
3. Ensure that proper implementation exists for staging and production environments

## References

- [NodeJS Environment Variables](https://nodejs.org/dist/latest/docs/api/process.html#process_process_env)
- [NextJS Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
