import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  const method = req.method;

  if (method === "GET") {
    // Mock bookings data for cannabis workforce management
    const bookings = [
      {
        id: "00000000-0000-0000-0000-000000000001",
        title: "Denver Retail Demo Setup",
        client: "Green Valley Dispensary",
        brand: "Rishi Cannabis Solutions",
        location: "Denver, CO",
        date: "2025-06-25",
        status: "confirmed",
        staff_count: 3,
        budget: 2500,
        activities: ["product_demo", "staff_training"],
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        title: "Portland Brand Activation",
        client: "Oregon Cannabis Collective",
        brand: "Premium Hemp Co",
        location: "Portland, OR",
        date: "2025-06-28",
        status: "pending",
        staff_count: 5,
        budget: 4000,
        activities: ["brand_activation", "customer_education"],
      },
    ];

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        success: true,
        bookings: bookings,
        total: bookings.length,
      },
    };
  } else if (method === "POST") {
    // Handle booking creation
    const bookingData = req.body || {};

    context.res = {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: {
        success: true,
        booking: {
          id: `booking-${Date.now()}`,
          ...bookingData,
          status: "pending",
          created_at: new Date().toISOString(),
        },
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
