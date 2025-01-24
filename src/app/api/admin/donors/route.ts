import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getUserPermissions } from '@/lib/auth';
import { donorSchema } from '@/lib/validations/donor';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['id', 'englishName', 'arabicName', 'createdAt']).default('id'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  categoryId: z.coerce.number().optional(),
  regionId: z.coerce.number().optional(),
  isPartner: z.coerce.number().optional()
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
    if (!permissions.includes('manage_donors')) {
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
      categoryId,
      regionId,
      isPartner
    } = querySchema.parse(searchParams);
    
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { englishName: { contains: search } },
        { arabicName: { contains: search } },
        { email: { contains: search } }
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (regionId) {
      where.regionId = regionId;
    }
    
    if (typeof isPartner === 'number') {
      where.isPartner = isPartner;
    }

    // Get total count and donors with pagination in parallel
    const [totalCount, donors] = await Promise.all([
      prisma.donor.count({ where }),
      prisma.donor.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              arabicName: true,
              englishName: true
            }
          },
          region: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    ]);

    const response = NextResponse.json({ 
      donors, 
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
    console.error('Error fetching donors:', error);
    
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
    if (!permissions.includes('manage_donors')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate request body
    const data = donorSchema.parse(await request.json());

    // Create donor
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
        category: {
          select: {
            id: true,
            arabicName: true,
            englishName: true
          }
        },
        region: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ 
      donor,
      message: 'Donor created successfully' 
    }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error creating donor:', error);
    
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
