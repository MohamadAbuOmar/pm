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

    // Verify admin has permission to manage permissions
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_permissions')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const { name } = await request.json();

    // Create permission
    const permission = await prisma.permission.create({
      data: { name }
    });

    return NextResponse.json({ permission });
  } catch (error) {
    console.error('Permission creation error:', error);
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

    // Verify admin has permission to manage permissions
    const userPermissions = await getUserPermissions(admin.id);
    if (!userPermissions.includes('manage_permissions')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const permissions = await prisma.permission.findMany();
    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
