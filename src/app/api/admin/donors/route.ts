import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';
import { donorSchema } from '@/lib/validations/donor';

// List all donors
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

    // Verify admin has permission to view donors
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_donors')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const donors = await prisma.donor.findMany({
      include: {
        category: true
      }
    });

    return NextResponse.json({ donors });
  } catch (error) {
    console.error('Error fetching donors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new donor
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

    // Verify admin has permission to create donors
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_donors')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = donorSchema.parse(await request.json());

    const donor = await prisma.donor.create({
      data: {
        arabicName: data.arabicName,
        englishName: data.englishName,
        regionId: data.regionId,
        categoryId: data.categoryId,
        isPartner: data.isPartner,
        fax: data.fax,
        address: data.address,
        website: data.website,
        workField: data.workField,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        notes: data.notes
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({ donor });
  } catch (error) {
    console.error('Error creating donor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
