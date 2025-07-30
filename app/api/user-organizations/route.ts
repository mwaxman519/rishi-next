import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;

import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/lib/db';
import { organizations, userOrganizations } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userOrgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
        status: organizations.status,
        tier: organizations.tier,
        created_at: organizations.created_at,
        updated_at: organizations.updated_at,
      })
      .from(userOrganizations)
      .leftJoin(organizations, eq(userOrganizations.organization_id, organizations.id))
      .where(eq(userOrganizations.user_id, user.id));

    return NextResponse.json(userOrgs);
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user organizations' },
      { status: 500 }
    );
  }
}