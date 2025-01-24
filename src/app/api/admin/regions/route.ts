import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';
import { regionSchema } from '@/lib/validations/region';

// List all regions with pagination
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
    if (!permissions.includes('manage_regions')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await prisma.region.count();

    // Get regions with pagination
    const regions = await prisma.region.findMany({
      skip,
      take: pageSize,
      orderBy: {
        id: 'desc'
      }
    });

    return NextResponse.json({ regions, totalCount });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new region
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
    if (!permissions.includes('manage_regions')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = regionSchema.parse(await request.json());

    const region = await prisma.region.create({
      data: {
        name: data.name
      }
    });

    return NextResponse.json({ region });
  } catch (error) {
    console.error('Error creating region:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
