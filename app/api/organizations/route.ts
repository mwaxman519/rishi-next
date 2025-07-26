import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { organizations, users } from "@shared/schema";
import { db } from "../../../server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeUsers = searchParams.get('includeUsers') === 'true';

    if (includeUsers) {
      const result = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          tier: organizations.tier,
          status: organizations.status,
          createdAt: organizations.createdAt,
          users: {
            id: users.id,
            username: users.username,
            fullName: users.fullName,
            email: users.email,
            role: users.role,
          }
        })
        .from(organizations)
        .leftJoin(users, eq(organizations.id, users.organizationId))
        .orderBy(desc(organizations.createdAt));

      // Group users by organization
      const grouped = result.reduce((acc, row) => {
        const org = acc.find(o => o.id === row.id);
        if (org) {
          if (row.users.id) {
            org.users.push(row.users);
          }
        } else {
          acc.push({
            ...row,
            users: row.users.id ? [row.users] : []
          });
        }
        return acc;
      }, [] as any[]);

      return NextResponse.json(grouped);
    } else {
      const result = await db
        .select()
        .from(organizations)
        .orderBy(desc(organizations.createdAt));

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newOrganization = await db.insert(organizations).values({
      name: body.name,
      tier: body.tier || 'tier_1',
      industry: body.industry,
      status: body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(newOrganization[0], { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}