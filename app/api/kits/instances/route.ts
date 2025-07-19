import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kitInstances, kitTemplates, brands, locations } from '@/shared/schema';
import { and, eq, or, ilike, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log("[Kit Instances API] Starting request - using real database data");
    // TODO: Re-enable authentication once cookie sharing is fixed

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let whereConditions = [];

    // Filter by organization if provided
    if (organizationId) {
      whereConditions.push(eq(kitInstances.organization_id, organizationId));
    }

    // Filter by status if provided
    if (status) {
      whereConditions.push(eq(kitInstances.status, status));
    }

    // Search functionality
    if (search) {
      whereConditions.push(
        or(
          ilike(kitInstances.name, `%${search}%`),
          ilike(kitInstances.description, `%${search}%`)
        )
      );
    }

    const instances = await db
      .select({
        id: kitInstances.id,
        name: kitInstances.name,
        description: kitInstances.description,
        template_id: kitInstances.template_id,
        location_id: kitInstances.location_id,
        organization_id: kitInstances.organization_id,
        status: kitInstances.status,
        active: kitInstances.active,
        created_at: kitInstances.created_at,
        updated_at: kitInstances.updated_at,
        template: {
          id: kitTemplates.id,
          name: kitTemplates.name,
          description: kitTemplates.description,
          brand: {
            id: brands.id,
            name: brands.name,
          },
        },
        location: {
          id: locations.id,
          name: locations.name,
          city: locations.city,
          state: locations.state,
        },
      })
      .from(kitInstances)
      .leftJoin(kitTemplates, eq(kitInstances.template_id, kitTemplates.id))
      .leftJoin(brands, eq(kitTemplates.brand_id, brands.id))
      .leftJoin(locations, eq(kitInstances.location_id, locations.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(kitInstances.created_at));

    return NextResponse.json(instances);
  } catch (error) {
    console.error('Error fetching kit instances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kit instances' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Re-enable authentication once cookie sharing is fixed
    console.log("[Kit Instances API] POST - Skipping authentication temporarily");

    const body = await request.json();
    const {
      name,
      description,
      template_id,
      location_id,
      organization_id,
      status = 'available',
      active = true,
    } = body;

    // Validate required fields
    if (!name || !organization_id) {
      return NextResponse.json(
        { error: 'Name and organization are required' },
        { status: 400 }
      );
    }

    // Create new kit instance
    const newInstance = await db
      .insert(kitInstances)
      .values({
        name,
        description: description || null,
        template_id: template_id || null,
        location_id: location_id || null,
        organization_id: organization_id,
        status,
        active,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return NextResponse.json(newInstance[0], { status: 201 });
  } catch (error) {
    console.error('Error creating kit instance:', error);
    return NextResponse.json(
      { error: 'Failed to create kit instance' },
      { status: 500 }
    );
  }
}