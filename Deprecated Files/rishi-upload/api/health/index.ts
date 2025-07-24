import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  if (req.method === "GET") {
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        status: "healthy",
        service: "Rishi Platform API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: "production",
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
