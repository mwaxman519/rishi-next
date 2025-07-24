/**
 * Azure Function: Cannabis Bookings API
 * Workforce Management Booking Operations
 */

module.exports = async function (context, req) {
  context.log("Cannabis bookings API accessed");

  try {
    // Mock cannabis workforce management bookings data
    const cannabisBookings = [
      {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        title: "Product Demo - Peak Extracts",
        client: "Mile High Dispensary",
        brand: "Peak Extracts",
        location: {
          name: "Denver Cannabis Dispensary",
          address: "1234 Colfax Ave, Denver, CO 80202",
          state: "CO",
        },
        date: "2025-06-25",
        time: "10:00-16:00",
        status: "confirmed",
        stage: "staff_assigned",
        activities: ["product_demo", "customer_education", "sales_support"],
        staffCount: 2,
        budget: 1200,
        assignedStaff: [
          { id: "staff-001", name: "Sarah Johnson", role: "Brand Agent" },
          { id: "staff-002", name: "Mike Chen", role: "Field Manager" },
        ],
      },
      {
        id: "e47bc20c-68dd-5483-b678-1f13c3d4e580",
        title: "Brand Activation - Green Valley",
        client: "Portland Cannabis Store",
        brand: "Green Valley Farms",
        location: {
          name: "Portland Cannabis Market",
          address: "567 SE Morrison St, Portland, OR 97214",
          state: "OR",
        },
        date: "2025-06-26",
        time: "12:00-18:00",
        status: "confirmed",
        stage: "in_progress",
        activities: ["brand_activation", "sampling", "customer_education"],
        staffCount: 3,
        budget: 1800,
        assignedStaff: [
          { id: "staff-003", name: "Alex Rivera", role: "Brand Agent" },
          { id: "staff-004", name: "Jamie Kim", role: "Brand Agent" },
          { id: "staff-005", name: "Taylor Brown", role: "Field Manager" },
        ],
      },
      {
        id: "d37ac30d-79ee-6594-c789-2g24d4e5f691",
        title: "Customer Education - Leafwell",
        client: "Seattle Cannabis Hub",
        brand: "Leafwell",
        location: {
          name: "Seattle Cannabis Market",
          address: "890 Pine St, Seattle, WA 98101",
          state: "WA",
        },
        date: "2025-06-27",
        time: "09:00-15:00",
        status: "pending",
        stage: "client_review",
        activities: [
          "customer_education",
          "product_knowledge",
          "compliance_training",
        ],
        staffCount: 1,
        budget: 800,
        assignedStaff: [
          { id: "staff-006", name: "Jordan Martinez", role: "Brand Agent" },
        ],
      },
    ];

    // Handle different HTTP methods
    switch (req.method) {
      case "GET":
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: cannabisBookings,
        };
        break;

      case "POST":
        // In production, this would create a new booking
        const newBooking = {
          id: `booking-${Date.now()}`,
          ...req.body,
          status: "pending",
          stage: "client_review",
          createdAt: new Date().toISOString(),
        };

        context.res = {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: newBooking,
        };
        break;

      default:
        context.res = {
          status: 405,
          headers: {
            "Content-Type": "application/json",
          },
          body: { error: "Method not allowed" },
        };
    }
  } catch (error) {
    context.log.error("Bookings API error:", error);

    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        error: "Internal server error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    };
  }
};
