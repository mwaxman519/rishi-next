module.exports = async function (context, req) {
  context.log("Health check endpoint called");

  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "rishi-platform",
    version: "1.0.0",
    environment: "azure-static-web-apps",
  };

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    body: healthData,
  };
};
