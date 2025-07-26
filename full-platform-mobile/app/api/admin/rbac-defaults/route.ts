import { NextRequest, NextResponse } from "next/server";

// VoltBuilder Build-Safe Route: admin/rbac-defaults
// This route is replaced during VoltBuilder builds to prevent database import failures
// Original route functionality will work in the deployed mobile app

export const dynamic = "force-static";
export const revalidate = false;

export async function GET(request?: NextRequest) {
  return NextResponse.json({
    message: "VoltBuilder build-time route - functionality available in deployed app",
    route: "admin/rbac-defaults",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request?: NextRequest) {
  return NextResponse.json({
    message: "VoltBuilder build-time route - functionality available in deployed app", 
    route: "admin/rbac-defaults",
    timestamp: new Date().toISOString()
  });
}

export async function PUT(request?: NextRequest) {
  return NextResponse.json({
    message: "VoltBuilder build-time route - functionality available in deployed app",
    route: "admin/rbac-defaults", 
    timestamp: new Date().toISOString()
  });
}

export async function DELETE(request?: NextRequest) {
  return NextResponse.json({
    message: "VoltBuilder build-time route - functionality available in deployed app",
    route: "admin/rbac-defaults",
    timestamp: new Date().toISOString()
  });
}
