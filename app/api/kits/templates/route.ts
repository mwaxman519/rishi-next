import { NextRequest, NextResponse } from 'next/server';

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/lib/db';
import { kitTemplates, brands } from '@/shared/schema';
import { and, eq, or, ilike, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let whereConditions = [];

    // Filter by organization if provided
    if (organizationId) {
      whereConditions.push(eq(kitTemplates.organization_id, organizationId));
    }

    // Filter by status if provided
    if (status) {
      whereConditions.push(eq(kitTemplates.active, status === 'active'));
    }

    // Search functionality
    if (search) {
      whereConditions.push(
        or(
          ilike(kitTemplates.name, `%${search}%`),
          ilike(kitTemplates.description, `%${search}%`)
        )
      );
    }

    const templates = await db
      .select({
        id: kitTemplates.id,
        name: kitTemplates.name,
        description: kitTemplates.description,
        organization_id: kitTemplates.organization_id,
        brand_id: kitTemplates.brand_id,
        image_url: kitTemplates.image_url,
        thumbnail_url: kitTemplates.thumbnail_url,
        image_alt_text: kitTemplates.image_alt_text,
        active: kitTemplates.active,
        created_at: kitTemplates.created_at,
        updated_at: kitTemplates.updated_at,
        brand: {
          id: brands.id,
          name: brands.name,
          description: brands.description,
        },
      })
      .from(kitTemplates)
      .leftJoin(brands, eq(kitTemplates.brand_id, brands.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(kitTemplates.created_at));

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching kit templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kit templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      organization_id,
      brand_id,
      image_url,
      thumbnail_url,
      image_alt_text,
      active = true,
    } = body;

    // Validate required fields
    if (!name || !organization_id) {
      return NextResponse.json(
        { error: 'Name and organization are required' },
        { status: 400 }
      );
    }

    // Create new kit template
    const newTemplate = await db
      .insert(kitTemplates)
      .values({
        name,
        description: description || null,
        organization_id: organization_id,
        brand_id: brand_id || null,
        image_url: image_url || null,
        thumbnail_url: thumbnail_url || null,
        image_alt_text: image_alt_text || null,
        active,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    console.error('Error creating kit template:', error);
    return NextResponse.json(
      { error: 'Failed to create kit template' },
      { status: 500 }
    );
  }
}