import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  const method = req.method;

  if (method === "POST") {
    // Handle authentication
    const { email, password } = req.body || {};

    // Mock authentication for demo
    if (email && password) {
      context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          success: true,
          user: {
            id: "00000000-0000-0000-0000-000000000001",
            name: "Admin User",
            email: email,
            role: "super_admin",
            organizationId: "00000000-0000-0000-0000-000000000001",
          },
          token: "mock-jwt-token",
        },
      };
    } else {
      context.res = {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: { success: false, error: "Email and password required" },
      };
    }
  } else {
    context.res = {
      status: 405,
      headers: { "Content-Type": "application/json" },
      body: { error: "Method not allowed" },
    };
  }
};

export default httpTrigger;
