import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { EventBusService } from "../../../services/event-bus-service";

// Cannabis booking events data
const mockEvents = [
  {
    id: "1",
    title: "Product Launch Event",
    description:
      "Introducing new product line with demonstrations and staff training",
    organizationId: "00000000-0000-0000-0000-000000000001",
    locationId: "loc1",
    location: {
      id: "loc1",
      name: "Flagship Store - Downtown",
      address: "123 Main St, New York, NY",
    },
    startDateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endDateTime: new Date(Date.now() + 86400000 + 7200000).toISOString(), // Tomorrow + 2 hours
    status: "scheduled",
    staffCount: 4,
    expectedAttendees: 30,
    notes: "Bring full demo kit and product samples for all staff",
  },
  {
    id: "2",
    title: "Seasonal Display Setup",
    description:
      "Implementing the summer promotional display across target locations",
    organizationId: "00000000-0000-0000-0000-000000000001",
    locationId: "loc2",
    location: {
      id: "loc2",
      name: "Shopping Mall Location",
      address: "500 Mall Circle, Newark, NJ",
    },
    startDateTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    endDateTime: new Date(Date.now() + 172800000 + 14400000).toISOString(), // Day after tomorrow + 4 hours
    status: "scheduled",
    staffCount: 3,
    expectedAttendees: 0,
    notes: "Coordinate with store manager before setup",
  },
  {
    id: "3",
    title: "Staff Training Session",
    description: "Training session for new merchandising guidelines",
    organizationId: "00000000-0000-0000-0000-000000000002",
    locationId: "loc3",
    location: {
      id: "loc3",
      name: "Regional Office",
      address: "789 Business Pkwy, Boston, MA",
    },
    startDateTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    endDateTime: new Date(Date.now() - 86400000 + 10800000).toISOString(), // Yesterday + 3 hours
    status: "completed",
    staffCount: 8,
    expectedAttendees: 12,
    notes: "Follow up with performance metrics in one week",
  },
  {
    id: "4",
    title: "Weekly Merchandising Refresh",
    description:
      "Regular update of merchandising and restocking of promotional materials",
    organizationId: "00000000-0000-0000-0000-000000000001",
    locationId: "loc4",
    location: {
      id: "loc4",
      name: "Outlet Center",
      address: "200 Discount Dr, Philadelphia, PA",
    },
    startDateTime: new Date(Date.now()).toISOString(), // Today
    endDateTime: new Date(Date.now() + 10800000).toISOString(), // Today + 3 hours
    status: "in_progress",
    staffCount: 2,
    expectedAttendees: 0,
    notes: "Check inventory levels and reorder if needed",
  },
  {
    id: "5",
    title: "Promotional Giveaway Event",
    description:
      "Customer engagement event with product sampling and giveaways",
    organizationId: "00000000-0000-0000-0000-000000000002",
    locationId: "loc5",
    location: {
      id: "loc5",
      name: "City Center Plaza",
      address: "555 Market St, Chicago, IL",
    },
    startDateTime: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
    endDateTime: new Date(Date.now() + 432000000 + 18000000).toISOString(), // 5 days from now + 5 hours
    status: "scheduled",
    staffCount: 6,
    expectedAttendees: 150,
    notes:
      "High-visibility event, ensure premium promotional materials are available",
  },
];

// GET handler for retrieving events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    // If organizationId is provided, filter events by organization
    const events = organizationId
      ? mockEvents.filter((event) => event.organizationId === organizationId)
      : mockEvents;

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

// POST handler for creating a new event
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Here you would normally validate and save the event
    // For now, just return a success response with the data
    const newEvent = {
      id: Math.floor(Math.random() * 10000).toString(),
      ...data,
      status: "scheduled",
    };

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
