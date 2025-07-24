# Staging Deployment Guide (Replit)

This guide explains how to deploy and maintain the Rishi application in the staging environment using Replit.

## Database Configuration

The application uses the built-in PostgreSQL database provided by Replit for the staging environment. This database is automatically provisioned and its connection string is available in the `DATABASE_URL` environment variable.

### Database Migration

To update the database schema when changes are made to `shared/schema.ts`, run:

```bash
npx drizzle-kit push
```

This command synchronizes your database schema with the Drizzle schema definitions.

## Deployment Process

1. **Start the application**:

   - Use the "Start application" workflow which runs `npm run dev`
   - The application will be accessible via the Replit webview

2. **Deploy to Replit**:
   - Click the "Deploy" button in the Replit interface
   - Replit will build and deploy the application automatically
   - The deployed version will be available at your Replit domain

## Environment Variables

The following environment variables are used:

- `DATABASE_URL`: Connection string for the PostgreSQL database (automatically provided by Replit)
- `NODE_ENV`: Set to "development" by default in the staging environment

## Monitoring and Debugging

- Logs are visible in the console output of the "Start application" workflow
- Database queries can be monitored using the SQL tool within Replit

## Differences from Production

This staging environment differs from production in the following ways:

1. **Database**:

   - Staging: Uses Replit's built-in PostgreSQL database
   - Production: Uses external Neon database

2. **Hosting**:

   - Staging: Hosted on Replit
   - Production: Hosted on Azure Static Web Apps

3. **Environment Variables**:
   - Production requires additional environment variables that are not needed in staging

## Troubleshooting

If you encounter issues with the database connection:

1. Verify the database is running using:

   ```sql
   SELECT NOW();
   ```

2. If schema changes cause conflicts, you may need to reset the database and run migrations again:

   ```bash
   npx drizzle-kit push
   ```

3. For persistent connection issues, recreate the database using Replit's database management tools.
