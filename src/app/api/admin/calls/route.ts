import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';
import { callSchema } from '@/lib/validations/call';

// List all calls with pagination
export async function GET(request: NextRequest) {
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

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await prisma.call.count();

    // Get calls with pagination and related data
    const calls = await prisma.call.findMany({
      skip,
      take: pageSize,
      orderBy: {
        id: 'desc'
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

    return NextResponse.json({ calls, totalCount });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new call
export async function POST(request: NextRequest) {
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

    const call = await prisma.call.create({
      data: {
        name: data.name,
        focalPoint: data.focalPoint,
        budget: data.budget,
        currency: data.currency,
        donorContribution: data.donorContribution,
        uawcContribution: data.uawcContribution,
        startDate: data.startDate,
        endDate: data.endDate,
        insertUserId: admin.id,
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
    console.error('Error creating call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
