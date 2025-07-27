#!/usr/bin/env node

/**
 * Database Schema Synchronization Script
 * Compares staging and production schemas and syncs them
 */

import pkg from 'pg';
const { Client } = pkg;

const STAGING_URL = "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_staging?sslmode=require&channel_binding=require";
const PRODUCTION_URL = "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require";

async function getTableSchema(client, environment) {
  const query = `
    SELECT 
      t.table_name,
      t.table_type,
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name, c.ordinal_position;
  `;
  
  const result = await client.query(query);
  
  const tables = {};
  result.rows.forEach(row => {
    if (!tables[row.table_name]) {
      tables[row.table_name] = {
        type: row.table_type,
        columns: []
      };
    }
    
    if (row.column_name) {
      tables[row.table_name].columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable,
        default: row.column_default
      });
    }
  });
  
  return tables;
}

async function compareSchemas() {
  const stagingClient = new Client({ connectionString: STAGING_URL });
  const productionClient = new Client({ connectionString: PRODUCTION_URL });
  
  try {
    console.log('🔍 DATABASE SCHEMA COMPARISON');
    console.log('=============================\n');
    
    await stagingClient.connect();
    await productionClient.connect();
    
    console.log('📋 Analyzing schemas...');
    const stagingSchema = await getTableSchema(stagingClient, 'staging');
    const productionSchema = await getTableSchema(productionClient, 'production');
    
    const stagingTables = Object.keys(stagingSchema);
    const productionTables = Object.keys(productionSchema);
    
    console.log(`Staging tables: ${stagingTables.length}`);
    console.log(`Production tables: ${productionTables.length}\n`);
    
    // Find missing tables
    const missingInProduction = stagingTables.filter(table => !productionTables.includes(table));
    const missingInStaging = productionTables.filter(table => !stagingTables.includes(table));
    
    if (missingInProduction.length > 0) {
      console.log('❌ TABLES MISSING IN PRODUCTION:');
      missingInProduction.forEach(table => {
        console.log(`   • ${table}`);
      });
      console.log('');
    }
    
    if (missingInStaging.length > 0) {
      console.log('❌ TABLES MISSING IN STAGING:');
      missingInStaging.forEach(table => {
        console.log(`   • ${table}`);
      });
      console.log('');
    }
    
    // Check common tables for differences
    const commonTables = stagingTables.filter(table => productionTables.includes(table));
    let schemaDifferences = [];
    
    for (const tableName of commonTables) {
      const stagingCols = stagingSchema[tableName].columns;
      const productionCols = productionSchema[tableName].columns;
      
      const stagingColNames = stagingCols.map(c => c.name);
      const productionColNames = productionCols.map(c => c.name);
      
      const missingInProdCols = stagingColNames.filter(col => !productionColNames.includes(col));
      const missingInStagingCols = productionColNames.filter(col => !stagingColNames.includes(col));
      
      if (missingInProdCols.length > 0 || missingInStagingCols.length > 0) {
        schemaDifferences.push({
          table: tableName,
          missingInProduction: missingInProdCols,
          missingInStaging: missingInStagingCols
        });
      }
    }
    
    if (schemaDifferences.length > 0) {
      console.log('⚠️  COLUMN DIFFERENCES FOUND:');
      schemaDifferences.forEach(diff => {
        console.log(`   Table: ${diff.table}`);
        if (diff.missingInProduction.length > 0) {
          console.log(`     Missing in production: ${diff.missingInProduction.join(', ')}`);
        }
        if (diff.missingInStaging.length > 0) {
          console.log(`     Missing in staging: ${diff.missingInStaging.join(', ')}`);
        }
      });
      console.log('');
    }
    
    // Summary
    console.log('📊 SCHEMA SYNC RECOMMENDATIONS:');
    console.log('================================');
    
    if (missingInProduction.length === 0 && missingInStaging.length === 0 && schemaDifferences.length === 0) {
      console.log('✅ Schemas are in sync!');
    } else {
      console.log('🔧 Actions needed:');
      
      if (missingInProduction.length > 0) {
        console.log('   1. Run database migration on production');
        console.log('      npm run db:push (targeting production)');
      }
      
      if (missingInStaging.length > 0) {
        console.log('   2. Run database migration on staging');
        console.log('      npm run db:push (targeting staging)');
      }
      
      if (schemaDifferences.length > 0) {
        console.log('   3. Resolve column differences with schema updates');
      }
      
      console.log('\n🎯 RECOMMENDED APPROACH:');
      console.log('   • Use shared/schema.ts as single source of truth');
      console.log('   • Run db:push on both environments');
      console.log('   • Verify schemas match after migration');
    }
    
    return {
      stagingTables: stagingTables.length,
      productionTables: productionTables.length,
      missingInProduction,
      missingInStaging,
      schemaDifferences
    };
    
  } finally {
    await stagingClient.end();
    await productionClient.end();
  }
}

async function main() {
  try {
    const result = await compareSchemas();
    
    // Exit with error code if schemas don't match
    const hasIssues = result.missingInProduction.length > 0 || 
                     result.missingInStaging.length > 0 || 
                     result.schemaDifferences.length > 0;
    
    process.exit(hasIssues ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Schema comparison failed:', error.message);
    process.exit(1);
  }
}

main();