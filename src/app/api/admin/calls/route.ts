import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';
import { callSchema } from '@/lib/validations/call';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['id', 'name', 'startDate', 'endDate', 'insertDate']).default('id'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  donorId: z.coerce.number().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  endDateFrom: z.string().optional(),
  endDateTo: z.string().optional()
});

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
    if (!permissions.includes('manage_calls')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const { 
      page, 
      pageSize, 
      search, 
      sortBy, 
      sortOrder,
      donorId,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo
    } = querySchema.parse(searchParams);
    
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.name = { contains: search };
    }
    
    if (donorId) {
      where.donorsId = donorId;
    }
    
    if (startDateFrom || startDateTo) {
      where.startDate = {
        ...(startDateFrom && { gte: new Date(startDateFrom) }),
        ...(startDateTo && { lte: new Date(startDateTo) })
      };
    }
    
    if (endDateFrom || endDateTo) {
      where.endDate = {
        ...(endDateFrom && { gte: new Date(endDateFrom) }),
        ...(endDateTo && { lte: new Date(endDateTo) })
      };
    }

    // Get total count and calls with pagination in parallel
    const [totalCount, calls] = await Promise.all([
      prisma.call.count({ where }),
      prisma.call.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          donor: {
            select: {
              id: true,
              arabicName: true,
              englishName: true
            }
          },
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      })
    ]);

    const response = NextResponse.json({ 
      calls, 
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
    console.error('Error fetching calls:', error);
    
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
    if (!permissions.includes('manage_calls')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate request body
    const data = callSchema.parse(await request.json());

    // Create call
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
        donor: {
          select: {
            id: true,
            arabicName: true,
            englishName: true
          }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      call,
      message: 'Call created successfully' 
    }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error creating call:', error);
    
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
