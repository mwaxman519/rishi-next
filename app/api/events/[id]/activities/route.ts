import { NextRequest, NextResponse } from "next/server";

// Mock activities data
const mockActivities = {
  "1": [
    {
      id: "act1",
      eventId: "1",
      title: "Product Setup and Display",
      description:
        "Arrange promotional materials and set up product demonstration stations",
      status: "scheduled",
      startTime: new Date(Date.now() + 86400000).toISOString(), // Event start time
      endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // 1 hour later
      assignedTo: {
        id: "user3",
        name: "Emily Davis",
      },
    },
    {
      id: "act2",
      eventId: "1",
      title: "Staff Briefing",
      description:
        "Review promotional goals, product features, and staff assignments",
      status: "scheduled",
      startTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // 1 hour after setup
      endTime: new Date(Date.now() + 86400000 + 4500000).toISOString(), // 15 minutes later
      assignedTo: {
        id: "user1",
        name: "Jane Smith",
      },
    },
    {
      id: "act3",
      eventId: "1",
      title: "Customer Product Demonstrations",
      description: "Ongoing product demonstrations for customers",
      status: "scheduled",
      startTime: new Date(Date.now() + 86400000 + 4500000).toISOString(), // After briefing
      endTime: new Date(
        Date.now() + 86400000 + 7200000 - 1800000,
      ).toISOString(), // Until 30 min before end
      assignedTo: {
        id: "user2",
        name: "Michael Johnson",
      },
    },
    {
      id: "act4",
      eventId: "1",
      title: "Cleanup and Reporting",
      description: "Dismantle displays and complete event reporting",
      status: "scheduled",
      startTime: new Date(
        Date.now() + 86400000 + 7200000 - 1800000,
      ).toISOString(), // 30 min before end
      endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(), // Event end time
      assignedTo: {
        id: "user4",
        name: "Robert Wilson",
      },
    },
  ],
  "2": [
    {
      id: "act5",
      eventId: "2",
      title: "Initial Store Walk-through",
      description: "Assess current display conditions and take before photos",
      status: "scheduled",
      startTime: new Date(Date.now() + 172800000).toISOString(), // Event start
      endTime: new Date(Date.now() + 172800000 + 1800000).toISOString(), // 30 min later
      assignedTo: {
        id: "user5",
        name: "Sarah Thompson",
      },
    },
    {
      id: "act6",
      eventId: "2",
      title: "Display Removal and Preparation",
      description:
        "Remove old displays and prepare area for new seasonal setup",
      status: "scheduled",
      startTime: new Date(Date.now() + 172800000 + 1800000).toISOString(), // After walk-through
      endTime: new Date(Date.now() + 172800000 + 5400000).toISOString(), // 1 hour later
      assignedTo: {
        id: "user6",
        name: "David Brown",
      },
    },
    {
      id: "act7",
      eventId: "2",
      title: "New Display Installation",
      description:
        "Install and arrange new seasonal displays per brand guidelines",
      status: "scheduled",
      startTime: new Date(Date.now() + 172800000 + 5400000).toISOString(), // After preparation
      endTime: new Date(Date.now() + 172800000 + 12600000).toISOString(), // 2 hours later
      assignedTo: {
        id: "user7",
        name: "Amanda Garcia",
      },
    },
    {
      id: "act8",
      eventId: "2",
      title: "Quality Check and Documentation",
      description: "Verify installation quality and take after photos",
      status: "scheduled",
      startTime: new Date(Date.now() + 172800000 + 12600000).toISOString(), // After installation
      endTime: new Date(Date.now() + 172800000 + 14400000).toISOString(), // Event end
      assignedTo: {
        id: "user5",
        name: "Sarah Thompson",
      },
    },
  ],
  "3": [
    {
      id: "act9",
      eventId: "3",
      title: "Room Setup",
      description: "Prepare training room and materials",
      status: "completed",
      startTime: new Date(Date.now() - 86400000 - 3600000).toISOString(), // 1 hour before event
      endTime: new Date(Date.now() - 86400000).toISOString(), // Event start
      assignedTo: {
        id: "user8",
        name: "Thomas Martin",
      },
    },
    {
      id: "act10",
      eventId: "3",
      title: "Introduction and Overview",
      description: "Welcome and introduction to new merchandising guidelines",
      status: "completed",
      startTime: new Date(Date.now() - 86400000).toISOString(), // Event start
      endTime: new Date(Date.now() - 86400000 + 1800000).toISOString(), // 30 min later
      assignedTo: {
        id: "user9",
        name: "Jennifer Lewis",
      },
    },
    {
      id: "act11",
      eventId: "3",
      title: "Detailed Training Session",
      description:
        "In-depth training on merchandising techniques and standards",
      status: "completed",
      startTime: new Date(Date.now() - 86400000 + 1800000).toISOString(), // After intro
      endTime: new Date(Date.now() - 86400000 + 8100000).toISOString(), // 1.75 hours later
      assignedTo: {
        id: "user8",
        name: "Thomas Martin",
      },
    },
    {
      id: "act12",
      eventId: "3",
      title: "Q&A and Wrap-up",
      description: "Answer questions and distribute reference materials",
      status: "completed",
      startTime: new Date(Date.now() - 86400000 + 8100000).toISOString(), // After training
      endTime: new Date(Date.now() - 86400000 + 10800000).toISOString(), // Event end
      assignedTo: {
        id: "user9",
        name: "Jennifer Lewis",
      },
    },
  ],
  "4": [
    {
      id: "act13",
      eventId: "4",
      title: "Initial Stock Assessment",
      description: "Check current inventory and identify restocking needs",
      status: "completed",
      startTime: new Date(Date.now()).toISOString(), // Event start
      endTime: new Date(Date.now() + 2700000).toISOString(), // 45 min later
      assignedTo: {
        id: "user10",
        name: "Daniel Walker",
      },
    },
    {
      id: "act14",
      eventId: "4",
      title: "Display Adjustment",
      description:
        "Update and refresh product displays and promotional materials",
      status: "in_progress",
      startTime: new Date(Date.now() + 2700000).toISOString(), // After assessment
      endTime: new Date(Date.now() + 7200000).toISOString(), // 1.25 hours later
      assignedTo: {
        id: "user11",
        name: "Lisa Taylor",
      },
    },
    {
      id: "act15",
      eventId: "4",
      title: "Restocking",
      description: "Restock products and promotional materials from storage",
      status: "scheduled",
      startTime: new Date(Date.now() + 7200000).toISOString(), // After display adjustment
      endTime: new Date(Date.now() + 9900000).toISOString(), // 45 min later
      assignedTo: {
        id: "user10",
        name: "Daniel Walker",
      },
    },
    {
      id: "act16",
      eventId: "4",
      title: "Final Check and Reporting",
      description: "Final quality check and complete merchandising report",
      status: "scheduled",
      startTime: new Date(Date.now() + 9900000).toISOString(), // After restocking
      endTime: new Date(Date.now() + 10800000).toISOString(), // Event end
      assignedTo: {
        id: "user11",
        name: "Lisa Taylor",
      },
    },
  ],
  "5": [
    {
      id: "act17",
      eventId: "5",
      title: "Venue Setup",
      description:
        "Prepare venue with branding, displays, and sampling stations",
      status: "scheduled",
      startTime: new Date(Date.now() + 432000000 - 7200000).toISOString(), // 2 hours before event
      endTime: new Date(Date.now() + 432000000).toISOString(), // Event start
      assignedTo: {
        id: "user16",
        name: "William Young",
      },
    },
    {
      id: "act18",
      eventId: "5",
      title: "Staff Briefing and Positioning",
      description: "Brief all staff on roles and assign positions",
      status: "scheduled",
      startTime: new Date(Date.now() + 432000000 - 1800000).toISOString(), // 30 min before event
      endTime: new Date(Date.now() + 432000000).toISOString(), // Event start
      assignedTo: {
        id: "user12",
        name: "Christopher Harris",
      },
    },
    {
      id: "act19",
      eventId: "5",
      title: "Product Demonstrations",
      description: "Ongoing product demonstrations at multiple stations",
      status: "scheduled",
      startTime: new Date(Date.now() + 432000000).toISOString(), // Event start
      endTime: new Date(Date.now() + 432000000 + 16200000).toISOString(), // 4.5 hours later
      assignedTo: {
        id: "user13",
        name: "Michelle Robinson",
      },
    },
    {
      id: "act20",
      eventId: "5",
      title: "Promotional Giveaways",
      description: "Distribute promotional items to attendees",
      status: "scheduled",
      startTime: new Date(Date.now() + 432000000 + 3600000).toISOString(), // 1 hour after start
      endTime: new Date(Date.now() + 432000000 + 16200000).toISOString(), // Until demos end
      assignedTo: {
        id: "user15",
        name: "Jessica Lee",
      },
    },
    {
      id: "act21",
      eventId: "5",
      title: "Customer Feedback Collection",
      description: "Collect feedback from attendees through surveys",
      status: "scheduled",
      startTime: new Date(Date.now() + 432000000 + 7200000).toISOString(), // 2 hours after start
      endTime: new Date(Date.now() + 432000000 + 16200000).toISOString(), // Until demos end
      assignedTo: {
        id: "user17",
        name: "Patricia White",
      },
    },
    {
      id: "act22",
      eventId: "5",
      title: "Breakdown and Cleanup",
      description: "Dismantle displays and clean up venue",
      status: "scheduled",
      startTime: new Date(Date.now() + 432000000 + 16200000).toISOString(), // After demos
      endTime: new Date(Date.now() + 432000000 + 18000000).toISOString(), // Event end
      assignedTo: {
        id: "user16",
        name: "William Young",
      },
    },
  ],
};

// GET handler for retrieving activities for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await params;
    const activities = mockActivities[eventId] || [];

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}

// POST handler for adding an activity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await params;
    const data = await request.json();

    // Here you would normally validate and save the activity
    // For now, just return a success response with the data
    const newActivity = {
      id: `act${Math.floor(Math.random() * 10000)}`,
      eventId,
      ...data,
      status: data.status || "scheduled",
    };

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 },
    );
  }
}
