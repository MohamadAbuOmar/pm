import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';
import { callSchema } from '@/lib/validations/call';

// Get a single call
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
    if (!permissions.includes('manage_calls')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const call = await prisma.call.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        donor: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    return NextResponse.json({ call });
  } catch (error) {
    console.error('Error fetching call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a call
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
    if (!permissions.includes('manage_calls')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = callSchema.parse(await request.json());

    const call = await prisma.call.update({
      where: { id: parseInt(params.id) },
      data: {
        name: data.name,
        focalPoint: data.focalPoint,
        budget: data.budget,
        currency: data.currency,
        donorContribution: data.donorContribution,
        uawcContribution: data.uawcContribution,
        startDate: data.startDate,
        endDate: data.endDate,
        donorsId: data.donorsId
      },
      include: {
        donor: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ call });
  } catch (error) {
    console.error('Error updating call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a call
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
    if (!permissions.includes('manage_calls')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.call.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
