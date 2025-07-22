import { defineConfig } from "drizzle-kit";

// Use the correct production database URL for Replit deployments
const getDatabaseUrl = () => {
  // Check if we're in a production/staging environment
  if (process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1') {
    // Use the production database URL from environment variables
    return process.env.DATABASE_URL || 
           'postgresql://rishinext_owner:npg_okpv0Hhtfwu2@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext?sslmode=require&channel_binding=require';
  }
  
  // For development, use the environment variable
  return process.env.DATABASE_URL;
};

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error("DATABASE_URL not found, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
