import { NextRequest, NextResponse } from "next/server";
import { BOOKING_STATUS } from "../../../shared/schema";

// Mock booking statistics
const mockBookingStats = {
  total: 65,
  byStatus: {
    draft: 12,
    pending: 18,
    approved: 25,
    rejected: 3,
    canceled: 5,
    completed: 2,
  },
  byPriority: {
    low: 20,
    medium: 30,
    high: 10,
    urgent: 5,
  },
  byMonth: [
    { month: "Jan", count: 5 },
    { month: "Feb", count: 8 },
    { month: "Mar", count: 12 },
    { month: "Apr", count: 15 },
    { month: "May", count: 10 },
    { month: "Jun", count: 8 },
    { month: "Jul", count: 3 },
    { month: "Aug", count: 0 },
    { month: "Sep", count: 0 },
    { month: "Oct", count: 0 },
    { month: "Nov", count: 0 },
    { month: "Dec", count: 0 },
  ],
  recentActivity: {
    newBookings: 8,
    approvedBookings: 5,
    rejectedBookings: 1,
    canceledBookings: 2,
    completedBookings: 0,
  },
  topLocations: [
    { id: "loc-1", name: "Sydney Office", count: 15 },
    { id: "loc-2", name: "Melbourne HQ", count: 12 },
    { id: "loc-3", name: "Brisbane Store", count: 8 },
    { id: "loc-4", name: "Perth Warehouse", count: 6 },
  ],
  topActivityTypes: [
    { id: "act-1", name: "Training", count: 22 },
    { id: "act-3", name: "Sales Event", count: 18 },
    { id: "act-2", name: "Promotion", count: 15 },
    { id: "act-4", name: "Team Meeting", count: 10 },
  ],
};

export async function GET(request: NextRequest) {
  console.log("DEVELOPMENT MODE: Using mock booking stats");

  // Get query parameters for potential filtering
  const { searchParams } = new URL(request.url);

  // Filter by organization if provided
  const organizationId = ((searchParams.get("organizationId") || undefined) || undefined) || undefined;

  // Filter by date range if provided
  const startDate = ((searchParams.get("startDate") || undefined) || undefined) || undefined;
  const endDate = ((searchParams.get("endDate") || undefined) || undefined) || undefined;

  // In a real implementation, we would apply these filters
  // For now, just return the mock data

  return NextResponse.json(mockBookingStats);
}
