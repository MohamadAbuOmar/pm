import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';
import { regionSchema } from '@/lib/validations/region';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['id', 'name', 'createdAt']).default('id'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// List all regions with pagination
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
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

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const { page, pageSize, search, sortBy, sortOrder } = querySchema.parse(searchParams);
    const skip = (page - 1) * pageSize;

    // Build where clause for search
    const where = search ? {
      name: { contains: search }
    } : undefined;

    // Get total count and regions with pagination in parallel
    const [totalCount, regions] = await Promise.all([
      prisma.region.count({ where }),
      prisma.region.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder }
      })
    ]);

    const response = NextResponse.json({ 
      regions, 
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize)
    });

    // Add cache headers
    response.headers.set('Cache-Control', 'private, max-age=10');
    response.headers.set('Vary', 'Cookie, Authorization');

    return response;
  } catch (error) {
    console.error('Error fetching regions:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new region
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    // Validate request body
    const data = regionSchema.parse(await request.json());

    // Create region
    const region = await prisma.region.create({
      data: {
        name: data.name
      }
    });

    return NextResponse.json({ 
      region,
      message: 'Region created successfully' 
    }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error creating region:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
