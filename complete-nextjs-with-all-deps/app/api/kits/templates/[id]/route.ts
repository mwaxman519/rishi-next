import { generateStaticParams } from "./generateStaticParams";

export const dynamic = "force-static";
export const revalidate = false;


import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/lib/db';
import { kitTemplates } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const template = await db
      .select()
      .from(kitTemplates)
      .where(eq(kitTemplates.id, params.id))
      .limit(1);

    if (!template.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template[0]);
  } catch (error) {
    console.error('Error fetching kit template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kit template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      active,
    } = body;

    // Validate required fields
    if (!name || !organization_id) {
      return NextResponse.json(
        { error: 'Name and organization are required' },
        { status: 400 }
      );
    }

    // Update kit template
    const updatedTemplate = await db
      .update(kitTemplates)
      .set({
        name,
        description: description || null,
        organization_id: organization_id,
        brand_id: brand_id || null,
        image_url: image_url || null,
        thumbnail_url: thumbnail_url || null,
        image_alt_text: image_alt_text || null,
        active,
        updated_at: new Date(),
      })
      .where(eq(kitTemplates.id, params.id))
      .returning();

    if (!updatedTemplate.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTemplate[0]);
  } catch (error) {
    console.error('Error updating kit template:', error);
    return NextResponse.json(
      { error: 'Failed to update kit template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedTemplate = await db
      .delete(kitTemplates)
      .where(eq(kitTemplates.id, params.id))
      .returning();

    if (!deletedTemplate.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting kit template:', error);
    return NextResponse.json(
      { error: 'Failed to delete kit template' },
      { status: 500 }
    );
  }
}