import { NextRequest, NextResponse } from "next/server";

// Mock staff assignments data
const mockStaffAssignments = {
  "1": [
    {
      id: "sa1",
      eventId: "1",
      userId: "user1",
      user: {
        id: "user1",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "Field Specialist",
      },
      role: "Team Lead",
      status: "confirmed",
      notes: "Will bring demo materials",
    },
    {
      id: "sa2",
      eventId: "1",
      userId: "user2",
      user: {
        id: "user2",
        name: "Michael Johnson",
        email: "michael.johnson@example.com",
        role: "Brand Ambassador",
      },
      role: "Product Demonstrator",
      status: "confirmed",
      notes: "",
    },
    {
      id: "sa3",
      eventId: "1",
      userId: "user3",
      user: {
        id: "user3",
        name: "Emily Davis",
        email: "emily.davis@example.com",
        role: "Merchandiser",
      },
      role: "Setup Coordinator",
      status: "confirmed",
      notes: "Early arrival required",
    },
    {
      id: "sa4",
      eventId: "1",
      userId: "user4",
      user: {
        id: "user4",
        name: "Robert Wilson",
        email: "robert.wilson@example.com",
        role: "Field Specialist",
      },
      role: "Assistant",
      status: "pending",
      notes: "Pending confirmation",
    },
  ],
  "2": [
    {
      id: "sa5",
      eventId: "2",
      userId: "user5",
      user: {
        id: "user5",
        name: "Sarah Thompson",
        email: "sarah.thompson@example.com",
        role: "Merchandiser",
      },
      role: "Lead Merchandiser",
      status: "confirmed",
      notes: "",
    },
    {
      id: "sa6",
      eventId: "2",
      userId: "user6",
      user: {
        id: "user6",
        name: "David Brown",
        email: "david.brown@example.com",
        role: "Merchandiser",
      },
      role: "Assistant Merchandiser",
      status: "confirmed",
      notes: "",
    },
    {
      id: "sa7",
      eventId: "2",
      userId: "user7",
      user: {
        id: "user7",
        name: "Amanda Garcia",
        email: "amanda.garcia@example.com",
        role: "Merchandiser",
      },
      role: "Assistant Merchandiser",
      status: "confirmed",
      notes: "",
    },
  ],
  "3": [
    {
      id: "sa8",
      eventId: "3",
      userId: "user8",
      user: {
        id: "user8",
        name: "Thomas Martin",
        email: "thomas.martin@example.com",
        role: "Training Specialist",
      },
      role: "Trainer",
      status: "completed",
      notes: "Excellent presentation",
    },
    {
      id: "sa9",
      eventId: "3",
      userId: "user9",
      user: {
        id: "user9",
        name: "Jennifer Lewis",
        email: "jennifer.lewis@example.com",
        role: "Regional Manager",
      },
      role: "Co-presenter",
      status: "completed",
      notes: "",
    },
  ],
  "4": [
    {
      id: "sa10",
      eventId: "4",
      userId: "user10",
      user: {
        id: "user10",
        name: "Daniel Walker",
        email: "daniel.walker@example.com",
        role: "Merchandiser",
      },
      role: "Merchandiser",
      status: "in_progress",
      notes: "",
    },
    {
      id: "sa11",
      eventId: "4",
      userId: "user11",
      user: {
        id: "user11",
        name: "Lisa Taylor",
        email: "lisa.taylor@example.com",
        role: "Merchandiser",
      },
      role: "Merchandiser",
      status: "in_progress",
      notes: "",
    },
  ],
  "5": [
    {
      id: "sa12",
      eventId: "5",
      userId: "user12",
      user: {
        id: "user12",
        name: "Christopher Harris",
        email: "christopher.harris@example.com",
        role: "Event Coordinator",
      },
      role: "Event Lead",
      status: "confirmed",
      notes: "",
    },
    {
      id: "sa13",
      eventId: "5",
      userId: "user13",
      user: {
        id: "user13",
        name: "Michelle Robinson",
        email: "michelle.robinson@example.com",
        role: "Brand Ambassador",
      },
      role: "Demonstration Lead",
      status: "confirmed",
      notes: "",
    },
    {
      id: "sa14",
      eventId: "5",
      userId: "user14",
      user: {
        id: "user14",
        name: "Richard Clark",
        email: "richard.clark@example.com",
        role: "Brand Ambassador",
      },
      role: "Demonstration Staff",
      status: "confirmed",
      notes: "",
    },
    {
      id: "sa15",
      eventId: "5",
      userId: "user15",
      user: {
        id: "user15",
        name: "Jessica Lee",
        email: "jessica.lee@example.com",
        role: "Brand Ambassador",
      },
      role: "Demonstration Staff",
      status: "confirmed",
      notes: "",
    },
    {
      id: "sa16",
      eventId: "5",
      userId: "user16",
      user: {
        id: "user16",
        name: "William Young",
        email: "william.young@example.com",
        role: "Brand Ambassador",
      },
      role: "Setup and Teardown",
      status: "confirmed",
      notes: "",
    },
    {
      id: "sa17",
      eventId: "5",
      userId: "user17",
      user: {
        id: "user17",
        name: "Patricia White",
        email: "patricia.white@example.com",
        role: "Brand Ambassador",
      },
      role: "Client Relations",
      status: "pending",
      notes: "Waiting for confirmation",
    },
  ],
};

// GET handler for retrieving staff assignments for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const eventId = params.id;
    const staffAssignments = mockStaffAssignments[eventId] || [];

    return NextResponse.json(staffAssignments);
  } catch (error) {
    console.error("Error fetching staff assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff assignments" },
      { status: 500 },
    );
  }
}

// POST handler for adding a staff assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const eventId = params.id;
    const data = await request.json();

    // Here you would normally validate and save the staff assignment
    // For now, just return a success response with the data
    const newStaffAssignment = {
      id: `sa${Math.floor(Math.random() * 10000)}`,
      eventId,
      ...data,
      status: data.status || "pending",
    };

    return NextResponse.json(newStaffAssignment, { status: 201 });
  } catch (error) {
    console.error("Error creating staff assignment:", error);
    return NextResponse.json(
      { error: "Failed to create staff assignment" },
      { status: 500 },
    );
  }
}
