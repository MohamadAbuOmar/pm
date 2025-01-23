import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';
import { donorCategorySchema } from '@/lib/validations/donor';

// List all donor categories
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

    // Verify admin has permission to view donor categories
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_donors')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const categories = await prisma.donorCategory.findMany();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching donor categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new donor category
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

    // Verify admin has permission to create donor categories
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_donors')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = donorCategorySchema.parse(await request.json());
    const { arabicName, englishName } = data;

    const category = await prisma.donorCategory.create({
      data: {
        arabicName,
        englishName
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error creating donor category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
