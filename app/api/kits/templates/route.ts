import { NextRequest, NextResponse } from "next/server";
import { KitService } from "@/services/kits/service";
import { KitRepository } from "@/services/kits/repository";
import { getCurrentUser } from "@/lib/auth";

const kitRepository = new KitRepository();
const kitService = new KitService(kitRepository);

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const brandId = searchParams.get("brandId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Create filters object
    const filters: Record<string, any> = {};
    if (organizationId) filters.organizationId = organizationId;
    if (brandId) filters.brandId = brandId;
    if (status) filters.status = status;
    if (search) filters.search = search;

    // Fetch templates
    const templates = await kitService.findAllTemplates(filters);

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching kit templates:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch kit templates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Create template
    const template = await kitService.createTemplate({
      ...body,
      created_by_id: user.id,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating kit template:", error);
    const message = error instanceof Error ? error.message : "Failed to create kit template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}