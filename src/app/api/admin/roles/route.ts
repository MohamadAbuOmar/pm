import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await getUserFromToken(token);
    if (!admin) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin has permission to manage roles
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_roles')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const { name, permissions } = await request.json();

    // Create role with permissions
    const role = await prisma.role.create({
      data: {
        name,
        permissions: {
          create: permissions.map((permissionId: number) => ({
            permission: {
              connect: { id: permissionId }
            }
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Role creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await getUserFromToken(token);
    if (!admin) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin has permission to manage roles
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_roles')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
