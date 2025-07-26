import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET(request?: NextRequest) {
  return NextResponse.json({
    message: "Mobile app will connect to backend at runtime",
    route: "organizations",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request?: NextRequest) {
  return NextResponse.json({
    message: "Mobile app will connect to backend at runtime",
    route: "organizations",
    timestamp: new Date().toISOString()
  });
}

export async function PUT(request?: NextRequest) {
  return NextResponse.json({
    message: "Mobile app will connect to backend at runtime",
    route: "organizations",
    timestamp: new Date().toISOString()
  });
}

export async function DELETE(request?: NextRequest) {
  return NextResponse.json({
    message: "Mobile app will connect to backend at runtime",
    route: "organizations",
    timestamp: new Date().toISOString()
  });
}
