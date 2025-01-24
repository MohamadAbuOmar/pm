import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';
import { regionSchema } from '@/lib/validations/region';

// Get a single region
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await getUserFromToken(token);
    if (!admin) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_regions')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const region = await prisma.region.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!region) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }

    return NextResponse.json({ region });
  } catch (error) {
    console.error('Error fetching region:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a region
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await getUserFromToken(token);
    if (!admin) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_regions')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = regionSchema.parse(await request.json());

    const region = await prisma.region.update({
      where: { id: parseInt(params.id) },
      data: {
        name: data.name
      }
    });

    return NextResponse.json({ region });
  } catch (error) {
    console.error('Error updating region:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a region
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await getUserFromToken(token);
    if (!admin) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_regions')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.region.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting region:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
