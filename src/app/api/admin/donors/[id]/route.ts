import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';
import { donorSchema } from '@/lib/validations/donor';

// Get a single donor
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

    // Verify admin has permission to view donors
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_donors')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const donor = await prisma.donor.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        category: true
      }
    });

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    return NextResponse.json({ donor });
  } catch (error) {
    console.error('Error fetching donor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a donor
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

    // Verify admin has permission to update donors
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_donors')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = donorSchema.parse(await request.json());

    const donor = await prisma.donor.update({
      where: { id: parseInt(params.id) },
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
    console.error('Error updating donor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a donor
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

    // Verify admin has permission to delete donors
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('manage_donors')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.donor.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting donor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
