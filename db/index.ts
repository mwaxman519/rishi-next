/**
 * Database utilities and connection testing
 */

export async function testConnection(): Promise<boolean> {
  try {
    // Mock connection test for development
    console.log("Database connection test - DEVELOPMENT MODE");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Export missing testConnection for app/api/auth-service/route.ts


export async function getDatabaseStatus() {
  const isConnected = await testConnection();
  return {
    connected: isConnected,
    timestamp: new Date().toISOString(),
  };
}


