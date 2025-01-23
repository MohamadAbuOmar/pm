import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';
import { donorCategorySchema } from '@/lib/validations/donor';

// Get a single donor category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify admin has permission to view donor categories
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_donors')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const category = await prisma.donorCategory.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error fetching donor category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a donor category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify admin has permission to update donor categories
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_donors')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = donorCategorySchema.parse(await request.json());
    const { arabicName, englishName } = data;

    const category = await prisma.donorCategory.update({
      where: { id: parseInt(params.id) },
      data: {
        arabicName,
        englishName
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating donor category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a donor category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify admin has permission to delete donor categories
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_donors')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.donorCategory.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting donor category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
