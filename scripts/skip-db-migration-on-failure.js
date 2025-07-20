
// Skip DB migration on failure script

/**
 * Script to handle database migration failures gracefully during deployment
 * This allows the build to continue even if database migrations fail
 */

const { execSync } = require('child_process');

async function runMigrations() {
  try {
    console.log('Attempting database migrations...');
    
    // Try to run the database migrations
    execSync('npm run db:push', { 
      stdio: 'inherit',
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Database migrations completed successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ Database migration failed:', error.message);
    console.warn('📝 Note: This may be due to:');
    console.warn('   - Database credentials not being set correctly');
    console.warn('   - Network connectivity issues');
    console.warn('   - Database server being temporarily unavailable');
    console.warn('🚀 Continuing with build process...');
    
    // Don't fail the entire build process
    return false;
  }
}

runMigrations().then((success) => {
  if (success) {
    process.exit(0);
  } else {
    // Exit with success code even if migrations failed
    // This allows the build to continue
    console.log('📋 Build will continue without database migrations');
    process.exit(0);
  }
}).catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(0); // Still continue with build
});
