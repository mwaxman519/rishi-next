#!/usr/bin/env node

/**
 * Restore Original API Routes
 * Restores original database-dependent routes after VoltBuilder compilation
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring original API routes...');

const backupDir = 'scripts/voltbuilder-route-backups';
if (!fs.existsSync(backupDir)) {
  console.log('❌ No backup directory found');
  process.exit(1);
}

// Route mappings
const routeMappings = {
  'bulk-original.ts': 'app/api/assignments/bulk/route.ts',
  'rbac-defaults-original.ts': 'app/api/admin/rbac-defaults/route.ts',
  'session-original.ts': 'app/api/auth-service/session/route.ts',
  'register-original.ts': 'app/api/auth-service/register/route.ts',
  'bookings-original.ts': 'app/api/bookings/route.ts',
  'locations-original.ts': 'app/api/locations/route.ts',
  'organizations-original.ts': 'app/api/organizations/route.ts',
  'users-original.ts': 'app/api/users/route.ts'
};

let routesRestored = 0;

Object.entries(routeMappings).forEach(([backupFile, originalPath]) => {
  const backupPath = path.join(backupDir, backupFile);
  
  if (fs.existsSync(backupPath) && fs.existsSync(originalPath)) {
    try {
      fs.copyFileSync(backupPath, originalPath);
      console.log(`✅ Restored ${originalPath}`);
      routesRestored++;
    } catch (error) {
      console.log(`⚠️ Could not restore ${originalPath}: ${error.message}`);
    }
  } else {
    console.log(`⏭️ Backup not found or route missing: ${backupFile} -> ${originalPath}`);
  }
});

console.log(`\n🎯 Restored ${routesRestored} original routes`);
console.log('✅ Development functionality restored');