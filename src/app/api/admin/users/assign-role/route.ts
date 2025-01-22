import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';

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
    const { userId, roleId } = await request.json();

    // Assign role to user
    const userRole = await prisma.userRole.create({
      data: {
        user: { connect: { id: userId } },
        role: { connect: { id: roleId } }
      },
      include: {
        role: true
      }
    });

    return NextResponse.json({ userRole });
  } catch (error) {
    console.error('Role assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
