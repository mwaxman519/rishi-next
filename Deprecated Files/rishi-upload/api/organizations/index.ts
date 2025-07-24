import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  const method = req.method;

  if (method === "GET") {
    // Mock organizations data
    const organizations = [
      {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Rishi Platform Demo",
        type: "cannabis_management",
        tier: "enterprise",
        is_default: true,
        user_role: "super_admin",
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Cannabis Corp",
        type: "cannabis_retail",
        tier: "professional",
        is_default: false,
        user_role: "client_manager",
      },
    ];

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        success: true,
        organizations: organizations,
      },
    };
  } else {
    context.res = {
      status: 405,
      headers: { "Content-Type": "application/json" },
      body: { error: "Method not allowed" },
    };
  }
};

export default httpTrigger;
