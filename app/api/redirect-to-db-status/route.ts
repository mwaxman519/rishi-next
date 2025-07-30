import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.redirect(
    new URL("/debug/db-status", "http://localhost:5000"),
  );
}
