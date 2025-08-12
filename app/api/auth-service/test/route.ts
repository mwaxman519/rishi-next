
export async function GET() {
  console.log("[Auth Service Test] Test endpoint called");
  
  try {
    // Test environment variables
    const jwtSecret = process.env.JWT_SECRET;
    console.log("[Auth Service Test] JWT_SECRET available:", !!jwtSecret);
    console.log("[Auth Service Test] NODE_ENV:", process.env.NODE_ENV);
    
    const response = {
      success: true,
      data: {
        status: "Auth service is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        hasJwtSecret: !!jwtSecret,
        jwtSecretLength: jwtSecret?.length || 0
      },
      service: "auth-service",
      version: "1.0.0"
    };
    
    console.log("[Auth Service Test] Returning test response:", response);
    return Response.json(response);
  } catch (error) {
    console.error("[Auth Service Test] Test endpoint error:", error);
    return Response.json({
      success: false,
      error: {
        message: "Test endpoint failed",
        details: error.message
      },
      service: "auth-service",
      version: "1.0.0"
    }, { status: 500 });
  }
}
